import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const normalize = (value?: string | null) => (value ?? "").toLowerCase().trim();

const mapEtapaToStage = (value?: string | null) => {
  const etapa = normalize(value);
  if (etapa.includes("contat")) return "Contato";
  if (etapa.includes("propost")) return "Proposta";
  if (etapa.includes("negoci")) return "Negociacao";
  if (etapa.includes("fech")) return "Fechado";
  return "Novo";
};

const mapPrioridadeToDb = (value?: string | null) => {
  const prioridade = normalize(value);
  if (prioridade.includes("alta") || prioridade.includes("high")) return "HIGH";
  if (prioridade.includes("baixa") || prioridade.includes("low")) return "LOW";
  return "MEDIUM";
};

const mapStatusToDb = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("ganh") || status.includes("won")) return "WON";
  if (status.includes("perd") || status.includes("lost")) return "LOST";
  return "OPEN";
};

const createDefaultStages = (pipelineId: string) =>
  prisma.pipelineStage.createMany({
    data: [
      { pipelineId, name: "Novo", position: 1 },
      { pipelineId, name: "Contato", position: 2 },
      { pipelineId, name: "Proposta", position: 3 },
      { pipelineId, name: "Negociacao", position: 4 },
      { pipelineId, name: "Fechado", position: 5 },
    ],
  });

const getOrCreatePipeline = async (name: string) => {
  const pipeline = await prisma.pipeline.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    include: { stages: true },
  });
  if (pipeline) {
    if (pipeline.stages.length === 0) {
      await createDefaultStages(pipeline.id);
    }
    return prisma.pipeline.findUniqueOrThrow({
      where: { id: pipeline.id },
      include: { stages: true },
    });
  }
  return prisma.pipeline.create({
    data: {
      name,
      stages: {
        create: [
          { name: "Novo", position: 1 },
          { name: "Contato", position: 2 },
          { name: "Proposta", position: 3 },
          { name: "Negociacao", position: 4 },
          { name: "Fechado", position: 5 },
        ],
      },
    },
    include: { stages: true },
  });
};

const getOrCreateStage = async (pipelineId: string, name: string) => {
  const stage = await prisma.pipelineStage.findFirst({
    where: {
      pipelineId,
      name: { equals: name, mode: "insensitive" },
    },
  });
  if (stage) {
    return stage;
  }
  const lastPosition =
    (await prisma.pipelineStage.aggregate({
      where: { pipelineId },
      _max: { position: true },
    }))._max.position ?? 0;
  return prisma.pipelineStage.create({
    data: {
      pipelineId,
      name,
      position: lastPosition + 1,
    },
  });
};

const createDealCode = () => {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `NEG-${time}-${rand}`;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as {
      empresa?: string;
      contato?: string;
      telefone?: string;
      valor?: number;
      responsavel?: string;
      etapa?: string;
      prioridade?: string;
      funil?: string;
      status?: string;
      origem?: string;
      observacao?: string;
    };

    const empresa = payload.empresa?.trim();
    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa obrigatoria." },
        { status: 400 },
      );
    }

    const pipelineName = payload.funil?.trim() || "Vendas";
    const pipeline = await getOrCreatePipeline(pipelineName);
    const stageName = mapEtapaToStage(payload.etapa);
    const stage = await getOrCreateStage(pipeline.id, stageName);

    let client = await prisma.client.findFirst({
      where: { name: { equals: empresa, mode: "insensitive" } },
    });
    if (!client) {
      client = await prisma.client.create({
        data: {
          type: "PJ",
          name: empresa,
          document: `AUTO-${Date.now()}`,
          phone: payload.telefone ?? null,
          notes: "Criado automaticamente via negocios.",
        },
      });
    }

    const responsavel = payload.responsavel?.trim();
    const owner = responsavel
      ? await prisma.user.findFirst({
          where: {
            OR: [
              { fullName: { equals: responsavel, mode: "insensitive" } },
              { username: { equals: responsavel, mode: "insensitive" } },
            ],
          },
        })
      : null;

    let dealCode = createDealCode();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const existing = await prisma.deal.findUnique({
        where: { code: dealCode },
        select: { id: true },
      });
      if (!existing) break;
      dealCode = createDealCode();
    }

    const created = await prisma.deal.create({
      data: {
        code: dealCode,
        pipelineId: pipeline.id,
        stageId: stage.id,
        clientId: client.id,
        title: payload.observacao?.trim() || `Negocio - ${empresa}`,
        contactName: payload.contato?.trim() || null,
        contactPhone: payload.telefone?.trim() || null,
        estimatedValue: payload.valor ?? 0,
        priority: mapPrioridadeToDb(payload.prioridade),
        status: mapStatusToDb(payload.status),
        ownerId: owner?.id ?? null,
        source: payload.origem ?? "Manual",
      },
    });

    await prisma.dealActivity.create({
      data: {
        dealId: created.id,
        type: "CREATED",
        message: `Negocio criado em ${stage.name}.`,
        createdById: owner?.id ?? null,
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("[NEGOCIOS_POST]", error);
    return NextResponse.json(
      { error: "Erro ao criar negocio." },
      { status: 500 },
    );
  }
}
