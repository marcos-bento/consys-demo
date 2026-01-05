import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const toNumber = (value: unknown) => {
  if (value == null) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  const maybeDecimal = value as { toNumber?: () => number };
  if (typeof maybeDecimal.toNumber === "function") {
    return maybeDecimal.toNumber();
  }
  return Number(value);
};

const normalize = (value?: string | null) => (value ?? "").toLowerCase();

const mapProposalStatus = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("rascunho")) return "Rascunho";
  if (status.includes("emit") || status.includes("envi")) return "Enviada";
  if (status.includes("assin") || status.includes("aprov")) return "Aprovada";
  if (status.includes("cancel") || status.includes("reprov")) return "Reprovada";
  return "Rascunho";
};

const isProposal = (typeName?: string | null) =>
  normalize(typeName).includes("proposta");

const calcVariation = (current: number, previous: number) => {
  if (previous === 0) {
    return 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

const calcBuckets = (values: { amount: number; date: Date }[], days: number) => {
  const buckets = Array.from({ length: 8 }, () => 0);
  if (!values.length) {
    return buckets;
  }
  const bucketSize = days / 8;
  values.forEach((item) => {
    const diffDays = Math.max(0, (Date.now() - item.date.getTime()) / 86400000);
    const index = Math.min(7, Math.floor(diffDays / bucketSize));
    buckets[7 - index] += item.amount;
  });
  return buckets;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = Number(searchParams.get("period") ?? "30");
    const periodDays = [7, 30, 90].includes(period) ? period : 30;

    const now = new Date();
    const currentStart = new Date(now.getTime() - periodDays * 86400000);
    const previousStart = new Date(now.getTime() - periodDays * 2 * 86400000);

    const [currentDocs, previousDocs] = await Promise.all([
      prisma.document.findMany({
        where: { createdAt: { gte: currentStart } },
        include: {
          client: true,
          type: true,
          status: true,
          items: { include: { product: true } },
        },
      }),
      prisma.document.findMany({
        where: { createdAt: { gte: previousStart, lt: currentStart } },
        include: {
          client: true,
          type: true,
          status: true,
          items: { include: { product: true } },
        },
      }),
    ]);

    const buildReport = (docs: typeof currentDocs) => {
      const salesValues = docs.map((doc) => ({
        amount: toNumber(doc.total),
        date: doc.createdAt,
      }));
      const vendas = salesValues.reduce((sum, item) => sum + item.amount, 0);
      const ticketMedio =
        docs.length > 0 ? Math.round(vendas / docs.length) : 0;

      const propostas = docs.filter((doc) => isProposal(doc.type?.name));
      const propostasPorStatus = {
        Rascunho: 0,
        Enviada: 0,
        Aprovada: 0,
        Reprovada: 0,
      };
      propostas.forEach((doc) => {
        const status = mapProposalStatus(doc.status?.name);
        propostasPorStatus[status] += 1;
      });
      const propostasEnviadas = propostasPorStatus.Enviada;
      const totalPropostas = propostas.length;
      const aprovadas = propostasPorStatus.Aprovada;
      const taxaConversao =
        totalPropostas > 0 ? Math.round((aprovadas / totalPropostas) * 100) : 0;

      const topClientesMap = new Map<string, number>();
      docs.forEach((doc) => {
        const name = doc.client?.name ?? "Sem cliente";
        topClientesMap.set(name, (topClientesMap.get(name) ?? 0) + toNumber(doc.total));
      });
      const topClientes = [...topClientesMap.entries()]
        .map(([cliente, valor]) => ({ cliente, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      const topProdutosMap = new Map<
        string,
        { qtd: number; valor: number }
      >();
      docs.forEach((doc) => {
        doc.items.forEach((item) => {
          const name = item.product?.name ?? item.description ?? "Item";
          const qtd = toNumber(item.quantity);
          const valor =
            item.total != null ? toNumber(item.total) : qtd * toNumber(item.unitPrice);
          const current = topProdutosMap.get(name) ?? { qtd: 0, valor: 0 };
          topProdutosMap.set(name, {
            qtd: current.qtd + qtd,
            valor: current.valor + valor,
          });
        });
      });
      const topProdutos = [...topProdutosMap.entries()]
        .map(([produto, info]) => ({
          produto,
          qtd: Math.round(info.qtd),
          valor: info.valor,
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      return {
        kpis: {
          vendas,
          propostasEnviadas,
          taxaConversao,
          ticketMedio,
          variacaoVendas: 0,
          variacaoPropostas: 0,
          variacaoConversao: 0,
          variacaoTicket: 0,
        },
        vendasSemanais: calcBuckets(salesValues, periodDays),
        propostasPorStatus,
        topClientes,
        topProdutos,
      };
    };

    const currentReport = buildReport(currentDocs);
    const previousReport = buildReport(previousDocs);

    currentReport.kpis.variacaoVendas = calcVariation(
      currentReport.kpis.vendas,
      previousReport.kpis.vendas,
    );
    currentReport.kpis.variacaoPropostas = calcVariation(
      currentReport.kpis.propostasEnviadas,
      previousReport.kpis.propostasEnviadas,
    );
    currentReport.kpis.variacaoConversao = calcVariation(
      currentReport.kpis.taxaConversao,
      previousReport.kpis.taxaConversao,
    );
    currentReport.kpis.variacaoTicket = calcVariation(
      currentReport.kpis.ticketMedio,
      previousReport.kpis.ticketMedio,
    );

    return NextResponse.json(currentReport);
  } catch (error) {
    console.error("[REPORTS_GET]", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatórios." },
      { status: 500 },
    );
  }
}
