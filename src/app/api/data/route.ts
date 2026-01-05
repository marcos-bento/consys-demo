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

const toDateOnly = (value?: Date | string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const toIso = (value?: Date | string | null) =>
  value ? new Date(value).toISOString() : "";

const toTime = (value?: Date | string | null) =>
  value ? new Date(value).toISOString().slice(11, 16) : "";

const normalize = (value?: string | null) => (value ?? "").toLowerCase();

const mapStatusCadastro = (value?: string | null) =>
  normalize(value) === "active" ? "Ativo" : "Inativo";

const mapTipoPessoa = (value?: string | null) =>
  normalize(value) === "pf" ? "PF" : "PJ";

const mapDealStage = (value?: string | null) => {
  if (!value) return "Novo";
  return value;
};
const mapDealStatus = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("won") || status.includes("ganh")) return "Ganho";
  if (status.includes("lost") || status.includes("perd")) return "Perdido";
  return "Ativo";
};

const mapDealPriority = (value?: string | null) => {
  const priority = normalize(value);
  if (priority.includes("high") || priority.includes("alta")) return "Alta";
  if (priority.includes("low") || priority.includes("baixa")) return "Baixa";
  return "Média";
};

const mapLeadStatus = (status: string, stage: string) => {
  const statusValue = normalize(status);
  if (statusValue.includes("lost") || statusValue.includes("perd")) return "Perdido";
  const stageValue = normalize(stage);
  if (stageValue.includes("contat")) return "Em contato";
  if (stageValue.includes("propost")) return "Qualificado";
  return "Novo";
};

const mapDocumentType = (value?: string | null) => {
  const type = normalize(value);
  if (type.includes("proposta")) return "Proposta";
  if (type.includes("custo")) return "Documento de custo";
  if (type.includes("contrato")) return "Contrato";
  return "Outros";
};

const mapDocumentStatus = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("rascunho")) return "Rascunho";
  if (status.includes("emit")) return "Emitido";
  if (status.includes("envi")) return "Enviado";
  if (status.includes("assin") || status.includes("aprov")) return "Assinado";
  if (status.includes("cancel") || status.includes("reprov")) return "Cancelado";
  return "Rascunho";
};

const mapProposalStatus = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("rascunho")) return "Rascunho";
  if (status.includes("emit") || status.includes("envi")) return "Enviada";
  if (status.includes("assin") || status.includes("aprov")) return "Aprovada";
  if (status.includes("cancel") || status.includes("reprov")) return "Reprovada";
  return "Rascunho";
};

const mapPurchaseStatus = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("cot")) return "Cotação";
  if (status.includes("order") || status.includes("pedido")) return "Pedido";
  if (status.includes("receiv") || status.includes("receb")) return "Recebido";
  if (status.includes("cancel")) return "Cancelado";
  return "Requisição";
};

const mapPurchaseType = (value?: string | null) => {
  const type = normalize(value);
  return type.includes("order") || type.includes("pedido") ? "Pedido" : "Requisição";
};

const mapStockMovementType = (value?: string | null) => {
  const type = normalize(value);
  if (type.includes("in") || type.includes("entrada")) return "Entrada";
  if (type.includes("out") || type.includes("saida")) return "Saída";
  return "Ajuste";
};

const mapFinancialType = (value?: string | null) => {
  const type = normalize(value);
  return type.includes("rece") || type.includes("in") ? "Receber" : "Pagar";
};

const mapAssistanceStage = (value?: string | null) => {
  const stage = normalize(value);
  if (stage.includes("new") || stage.includes("nova")) return "Nova";
  if (stage.includes("anal") || stage.includes("review")) return "Em análise";
  if (stage.includes("sched") || stage.includes("agend")) return "Agendada";
  if (stage.includes("exec") || stage.includes("progress")) return "Em execução";
  if (stage.includes("finish") || stage.includes("conclu")) return "Concluída";
  if (stage.includes("cancel")) return "Cancelada";
  return "Nova";
};

const mapAssistancePriority = (value?: string | null) => {
  const priority = normalize(value);
  if (priority.includes("high") || priority.includes("alta")) return "Alta";
  if (priority.includes("low") || priority.includes("baixa")) return "Baixa";
  return "Média";
};

const mapAssistanceType = (value?: string | null) => {
  const type = normalize(value);
  if (type.includes("mont") || type.includes("assembly")) return "Montagem";
  if (type.includes("manut") || type.includes("maint")) return "Manutenção";
  if (type.includes("garan")) return "Garantia";
  if (type.includes("ajust")) return "Ajuste";
  return "Outros";
};

const mapAssistanceEventType = (value?: string | null) => {
  const type = normalize(value);
  if (type.includes("create") || type.includes("criad")) return "Criada";
  if (type.includes("sched") || type.includes("agend")) return "Agendada";
  if (type.includes("start") || type.includes("inici")) return "Iniciada";
  if (type.includes("finish") || type.includes("conclu")) return "Concluída";
  if (type.includes("cancel")) return "Cancelada";
  return "Observação";
};

const mapVehicleType = (value?: string | null) => {
  const type = normalize(value);
  if (type.includes("van")) return "Van";
  if (type.includes("caminh") || type.includes("truck")) return "Caminhão";
  if (type.includes("carro") || type.includes("car")) return "Carro";
  return "Utilitário";
};

const mapVehicleStatus = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("maint") || status.includes("manut")) return "Em manutenção";
  if (status.includes("inativ") || status.includes("inactive")) return "Inativo";
  return "Ativo";
};

const mapScheduleType = (value?: string | null) => {
  const type = normalize(value);
  if (type.includes("entreg")) return "Entrega";
  if (type.includes("colet")) return "Coleta";
  if (type.includes("visita")) return "Visita técnica";
  return "Outro";
};

const mapScheduleStatus = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("route") || status.includes("rota")) return "Em rota";
  if (status.includes("done") || status.includes("conclu")) return "Concluído";
  if (status.includes("cancel")) return "Cancelado";
  return "Programado";
};

const mapServiceOrderStatus = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("andamento") || status.includes("progress")) return "Em andamento";
  if (status.includes("conclu") || status.includes("done")) return "Concluída";
  if (status.includes("cancel")) return "Cancelada";
  return "Gerada";
};

const mapUserProfile = (value?: string | null) => {
  const role = normalize(value);
  if (role.includes("admin")) return "Admin";
  if (role.includes("comercial")) return "Comercial";
  if (role.includes("finan")) return "Financeiro";
  return "Operacional";
};

const formatAddress = (address?: {
  street: string;
  number?: string | null;
  district?: string | null;
  city: string;
  state: string;
}) => {
  if (!address) {
    return "";
  }
  const parts = [
    address.street,
    address.number,
    address.district,
    address.city,
    address.state,
  ].filter(Boolean);
  return parts.join(" - ");
};

export async function GET() {
  try {
    const [
      clients,
      suppliers,
      products,
      productCategories,
      supplierCategories,
      financialCategories,
      users,
      documents,
      purchases,
      deals,
      stockMovements,
      financialEntries,
      assistances,
      assistanceEvents,
      assistanceFiles,
      vehicles,
      schedules,
      serviceOrders,
    ] = await Promise.all([
      prisma.client.findMany({ include: { addresses: true } }),
      prisma.supplier.findMany({
        include: { category: true, contacts: true },
      }),
      prisma.product.findMany({
        include: { category: true, stockBalance: true },
      }),
      prisma.productCategory.findMany(),
      prisma.supplierCategory.findMany(),
      prisma.financialCategory.findMany(),
      prisma.user.findMany({ include: { role: true } }),
      prisma.document.findMany({
        include: {
          type: true,
          status: true,
          client: true,
          supplier: true,
          createdBy: true,
          items: { include: { product: true } },
        },
      }),
      prisma.purchase.findMany({
        include: {
          supplier: true,
          requestedBy: true,
          items: { include: { product: true } },
          events: true,
        },
      }),
      prisma.deal.findMany({
        include: {
          client: true,
          owner: true,
          pipeline: true,
          stage: true,
          lossReason: true,
        },
      }),
      prisma.stockMovement.findMany(),
      prisma.financialEntry.findMany({
        include: { category: true, client: true, supplier: true },
      }),
      prisma.assistance.findMany({
        include: { client: true, address: true, responsible: true },
      }),
      prisma.assistanceEvent.findMany({
        include: { createdBy: true },
      }),
      prisma.assistanceFile.findMany(),
      prisma.vehicle.findMany({ include: { driver: true } }),
      prisma.vehicleSchedule.findMany({
        include: { address: true, client: true, createdBy: true },
      }),
      prisma.serviceOrder.findMany(),
    ]);

    const clientes = clients.map((client) => {
      const primaryAddress = client.addresses[0];
      return {
        id: client.id,
        tipo: mapTipoPessoa(client.type),
        razaoSocial: mapTipoPessoa(client.type) === "PJ" ? client.name : undefined,
        nome: mapTipoPessoa(client.type) === "PF" ? client.name : undefined,
        nomeFantasia: client.tradeName ?? undefined,
        cnpj: mapTipoPessoa(client.type) === "PJ" ? client.document : undefined,
        cpf: mapTipoPessoa(client.type) === "PF" ? client.document : undefined,
        email: client.email ?? "",
        telefone: client.phone ?? "",
        cidade: primaryAddress?.city ?? "",
        uf: primaryAddress?.state ?? "",
        status: mapStatusCadastro(client.status),
        dataCriacao: toDateOnly(client.createdAt),
      };
    });

    const fornecedores = suppliers.map((supplier) => {
      const primaryContact = supplier.contacts[0];
      return {
        id: supplier.id,
        razaoSocial: supplier.name,
        cnpj: supplier.document,
        categoria: supplier.category?.name ?? "",
        contato: primaryContact?.name ?? "",
        email: supplier.email ?? primaryContact?.email ?? "",
        telefone: supplier.phone ?? primaryContact?.phone ?? "",
        status: mapStatusCadastro(supplier.status),
        dataCriacao: toDateOnly(supplier.createdAt),
      };
    });

    const produtosCadastro = products.map((product) => ({
      id: product.id,
      nome: product.name,
      codigo: product.sku,
      categoria: product.category?.name ?? "",
      unidade: product.unit,
      precoBase: toNumber(product.basePrice),
      controladoEstoque: product.isStockControlled,
      status: product.active ? "Ativo" : "Inativo",
      dataCriacao: toDateOnly(product.createdAt),
    }));

    const usuarios = users.map((user) => ({
      id: user.id,
      nome: user.fullName ?? user.username,
      email: user.email ?? "",
      perfil: mapUserProfile(user.role?.name),
      status: mapStatusCadastro(user.status),
      dataCriacao: toDateOnly(user.createdAt),
    }));

    const categorias = [
      ...productCategories.map((category) => ({
        id: category.id,
        nome: category.name,
        tipo: "Produto",
        status: category.active ? "Ativo" : "Inativo",
        dataCriacao: toDateOnly(category.createdAt),
      })),
      ...supplierCategories.map((category) => ({
        id: category.id,
        nome: category.name,
        tipo: "Fornecedor",
        status: category.active ? "Ativo" : "Inativo",
        dataCriacao: toDateOnly(category.createdAt),
      })),
      ...financialCategories.map((category) => ({
        id: category.id,
        nome: category.name,
        tipo: "CentroCusto",
        status: category.active ? "Ativo" : "Inativo",
        dataCriacao: toDateOnly(category.createdAt),
      })),
    ];

    const produtos = products.map((product) => ({
      id: product.id,
      nome: product.name,
      codigo: product.sku,
      categoria: product.category?.name ?? "Outros",
      estoque: product.stockBalance?.quantity ?? 0,
      minimo: product.minStock ?? undefined,
      controladoEstoque: product.isStockControlled,
    }));

    const movimentacoes = stockMovements.reduce<Record<string, any[]>>(
      (acc, movement) => {
        const entry = {
          id: movement.id,
          data: toDateOnly(movement.createdAt),
          tipo: mapStockMovementType(movement.type),
          quantidade: movement.quantity,
          observacao: movement.note ?? "",
          usuario: "Sistema",
        };
        acc[movement.productId] = acc[movement.productId] ?? [];
        acc[movement.productId].push(entry);
        return acc;
      },
      {},
    );

    const lancamentos = financialEntries.map((entry) => ({
      id: entry.id,
      tipo: mapFinancialType(entry.type),
      descricao: entry.description,
      parte: entry.client?.name ?? entry.supplier?.name ?? "",
      vencimento: toDateOnly(entry.dueDate),
      valor: toNumber(entry.amount),
      pago: normalize(entry.status) === "paid" || !!entry.paymentDate,
      categoria: entry.category?.name,
      observacao: entry.status ?? undefined,
    }));

    const documentos = documents.map((document) => ({
      id: document.id,
      codigo: document.code,
      cliente: document.client?.name ?? document.supplier?.name ?? "",
      tipo: mapDocumentType(document.type?.name),
      titulo: document.title ?? `Documento ${document.code}`,
      descricao: document.description ?? undefined,
      data: toDateOnly(document.createdAt),
      status: mapDocumentStatus(document.status?.name),
      responsavel: document.createdBy?.fullName ?? document.createdBy?.username ?? "",
      itens: document.items.map((item) => ({
        descricao: item.description ?? item.product?.name ?? "Item",
        qtd: toNumber(item.quantity),
        valorUnit: toNumber(item.unitPrice),
      })),
      observacoes: undefined,
      origem: document.type?.name ?? undefined,
      createdAt: toIso(document.createdAt),
      updatedAt: toIso(document.updatedAt),
    }));

    const propostas = documents
      .filter((document) => normalize(document.type?.name).includes("proposta"))
      .map((document) => ({
        id: document.id,
        codigo: document.code,
        cliente: document.client?.name ?? document.supplier?.name ?? "",
        status: mapProposalStatus(document.status?.name),
        data: toDateOnly(document.createdAt),
        itens: document.items.map((item) => ({
          produto: item.product?.name ?? item.description ?? "Item",
          qtd: toNumber(item.quantity),
          valorUnit: toNumber(item.unitPrice),
        })),
        desconto: toNumber(document.discount),
      }));

    const compras = purchases.map((purchase) => ({
      id: purchase.id,
      codigo: purchase.code,
      tipo: mapPurchaseType(purchase.type),
      status: mapPurchaseStatus(purchase.status),
      fornecedor: purchase.supplier?.name ?? "Sem fornecedor",
      solicitante: purchase.requestedBy?.fullName ?? purchase.requestedBy?.username ?? "",
      data: toDateOnly(purchase.requestedAt),
      valorEstimado: toNumber(purchase.estimatedTotal),
      centroCusto: undefined,
      itens: purchase.items.map((item) => ({
        produto: item.product?.name ?? item.description ?? "Item",
        quantidade: toNumber(item.quantity),
        valorUnit: item.unitPrice != null ? toNumber(item.unitPrice) : undefined,
        observacao: item.description ?? undefined,
        fornecedorSugerido: purchase.supplier?.name ?? undefined,
      })),
      historico: purchase.events.map((event) => ({
        data: toDateOnly(event.createdAt),
        descricao: event.message ?? event.type,
      })),
    }));

    const negocios = deals.map((deal) => ({
      id: deal.id,
      codigo: deal.code,
      empresa: deal.client?.name ?? "",
      contato: deal.contactName ?? deal.client?.tradeName ?? "",
      telefone: deal.contactPhone ?? deal.client?.phone ?? undefined,
      valor: toNumber(deal.estimatedValue),
      responsavel: deal.owner?.fullName ?? deal.owner?.username ?? "",
      etapa: mapDealStage(deal.stage?.name),
      status: mapDealStatus(deal.status),
      prioridade: mapDealPriority(deal.priority),
      funil: deal.pipeline?.name ?? "Vendas",
      diasNoFunil: Math.max(
        0,
        Math.floor((Date.now() - deal.createdAt.getTime()) / 86400000),
      ),
      origem: deal.source ?? undefined,
      motivoPerda: deal.lossReason?.name ?? undefined,
      tags: [],
    }));

    const leads = deals.map((deal) => ({
      id: deal.id,
      empresa: deal.client?.name ?? "",
      contato: deal.contactName ?? "",
      status: mapLeadStatus(deal.status, deal.stage?.name ?? ""),
      responsavel: deal.owner?.fullName ?? deal.owner?.username ?? "",
    }));

    const assistencias = assistances.map((assistance) => ({
      id: assistance.id,
      protocolo: assistance.code,
      cliente: assistance.client?.name ?? "",
      clienteId: assistance.clientId,
      tipo: mapAssistanceType(assistance.type),
      prioridade: mapAssistancePriority(assistance.priority),
      etapa: mapAssistanceStage(assistance.stage),
      responsavel: assistance.responsible?.fullName ?? assistance.responsible?.username ?? "",
      responsavelId: assistance.responsibleId ?? "",
      descricao: assistance.description,
      endereco: formatAddress(assistance.address),
      dataAbertura: toDateOnly(assistance.createdAt),
      dataAgendamento: toDateOnly(assistance.scheduledAt),
      dataConclusao: toDateOnly(assistance.finishedAt),
      observacoes: undefined,
      createdAt: toIso(assistance.createdAt),
      updatedAt: toIso(assistance.updatedAt),
    }));

    const historicoAssistencias = assistanceEvents.map((event) => ({
      id: event.id,
      assistenciaId: event.assistanceId,
      tipo: mapAssistanceEventType(event.type),
      descricao: event.message ?? event.type,
      usuario: event.createdBy?.fullName ?? event.createdBy?.username ?? "Sistema",
      data: toIso(event.createdAt),
    }));

    const anexosAssistencias = assistanceFiles.map((file) => ({
      id: file.id,
      assistenciaId: file.assistanceId,
      nome: file.fileName,
      tipo: file.mimeType ?? "",
      tamanho: file.sizeBytes ?? 0,
      dataUpload: toIso(file.createdAt),
    }));

    const veiculos = vehicles.map((vehicle) => ({
      id: vehicle.id,
      apelido: vehicle.name,
      placa: vehicle.plate,
      tipo: mapVehicleType(vehicle.type),
      modelo: vehicle.name,
      capacidade: vehicle.capacity ?? undefined,
      status: mapVehicleStatus(vehicle.status),
      responsavelId: vehicle.driverId ?? "",
      observacoes: vehicle.notes ?? undefined,
      createdAt: toIso(vehicle.createdAt),
      updatedAt: toIso(vehicle.updatedAt),
    }));

    const agendamentos = schedules.map((schedule) => ({
      id: schedule.id,
      veiculoId: schedule.vehicleId,
      data: toDateOnly(schedule.startAt),
      horaInicio: toTime(schedule.startAt),
      horaFim: toTime(schedule.endAt),
      tipo: mapScheduleType(schedule.type),
      clienteId: schedule.clientId ?? "",
      endereco: formatAddress(schedule.address),
      documentoVinculado: undefined,
      observacao: schedule.description ?? undefined,
      responsavelId: schedule.createdById ?? "",
      status: mapScheduleStatus(schedule.status),
      createdAt: toIso(schedule.createdAt),
      updatedAt: toIso(schedule.updatedAt),
    }));

    const ordensServico = serviceOrders.map((order) => ({
      id: order.id,
      codigo: order.code,
      veiculoId: order.vehicleId,
      motoristaId: order.driverId ?? "",
      data: toDateOnly(order.date),
      agendamentos: order.scheduleId ? [order.scheduleId] : [],
      status: mapServiceOrderStatus(order.status),
      createdAt: toIso(order.createdAt),
      updatedAt: toIso(order.updatedAt),
    }));

    return NextResponse.json({
      leads,
      propostas,
      produtos,
      movimentacoes,
      lancamentos,
      negocios,
      documentos,
      compras,
      clientes,
      fornecedores,
      produtosCadastro,
      usuarios,
      categorias,
      assistencias,
      historicoAssistencias,
      anexosAssistencias,
      veiculos,
      agendamentos,
      ordensServico,
      candidatos: [],
      notasCandidatos: [],
      colaboradores: [],
      ferias: [],
      registrosPonto: [],
      importacoesPonto: [],
    });
  } catch (error) {
    console.error("[DATA_GET]", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados do banco." },
      { status: 500 },
    );
  }
}
