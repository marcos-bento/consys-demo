import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const normalize = (value?: string | null) => (value ?? "").toLowerCase().trim();

const mapEtapaToStage = (value?: string | null) => {
  const etapa = normalize(value);
  if (etapa.includes("contat")) return "Contato";
  if (etapa.includes("propost")) return "Proposta";
  if (etapa.includes("negoci")) return "Negociacao";
  if (etapa.includes("fech")) return "Fechado";
  return "Novo";
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

const mapPrioridadeToDb = (value?: string | null) => {
  const prioridade = normalize(value);
  if (prioridade.includes("alta") || prioridade.includes("high")) return "HIGH";
  if (prioridade.includes("baixa") || prioridade.includes("low")) return "LOW";
  return "MEDIUM";
};

const getOrCreateStage = async (pipelineId: string, name: string) => {
  const stage = await prisma.pipelineStage.findFirst({
    where: { pipelineId, name: { equals: name, mode: "insensitive" } },
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
    data: { pipelineId, name, position: lastPosition + 1 },
  });
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await req.json()) as {
      etapa?: string;
      status?: string;
      lossReasonId?: string | null;
      titulo?: string;
      empresa?: string;
      contato?: string;
      telefone?: string;
      responsavel?: string;
      prioridade?: string;
      origem?: string;
      funil?: string;
    };

    const deal = await prisma.deal.findUnique({
      where: { id },
    });
    if (!deal) {
      return NextResponse.json({ error: "Negocio nao encontrado." }, { status: 404 });
    }

    const updateData: {
      stageId?: string;
      status?: string;
      lossReasonId?: string | null;
      title?: string | null;
      contactName?: string | null;
      contactPhone?: string | null;
      priority?: string;
      ownerId?: string | null;
      source?: string | null;
      pipelineId?: string;
    } = {};

    const currentStage = await prisma.pipelineStage.findUnique({
      where: { id: deal.stageId },
      select: { name: true },
    });
    const currentPipeline = await prisma.pipeline.findUnique({
      where: { id: deal.pipelineId },
      select: { name: true },
    });
    let targetPipelineId = deal.pipelineId;
    let targetPipelineName = currentPipeline?.name ?? "Funil";
    const previousPipelineName = currentPipeline?.name ?? "Funil";

    if (payload.funil) {
      const pipeline = await getOrCreatePipeline(payload.funil.trim());
      targetPipelineId = pipeline.id;
      targetPipelineName = pipeline.name;
      updateData.pipelineId = pipeline.id;
    }

    let stageName: string | null = null;
    if (payload.etapa) {
      stageName = mapEtapaToStage(payload.etapa);
      const stage = await getOrCreateStage(targetPipelineId, stageName);
      updateData.stageId = stage.id;
    } else if (payload.funil) {
      const pipeline = await prisma.pipeline.findUnique({
        where: { id: targetPipelineId },
        include: { stages: true },
      });
      const sortedStages = (pipeline?.stages ?? []).sort((a, b) => a.position - b.position);
      const firstStage = sortedStages[0];
      if (firstStage) {
        stageName = firstStage.name;
        updateData.stageId = firstStage.id;
      }
    }

    let statusMessage: string | null = null;
    if (payload.status) {
      updateData.status = mapStatusToDb(payload.status);
      statusMessage = payload.status;
    }

    if (payload.status && updateData.status !== "LOST") {
      updateData.lossReasonId = null;
    }

    if (updateData.status === "LOST") {
      updateData.lossReasonId = payload.lossReasonId ?? null;
    }

    if (!payload.etapa && payload.status && updateData.status === "WON") {
      stageName = "Fechado";
      const stage = await getOrCreateStage(targetPipelineId, stageName);
      updateData.stageId = stage.id;
    }

    if (payload.titulo !== undefined) {
      updateData.title = payload.titulo?.trim() || null;
    }
    if (payload.contato !== undefined) {
      updateData.contactName = payload.contato?.trim() || null;
    }
    if (payload.telefone !== undefined) {
      updateData.contactPhone = payload.telefone?.trim() || null;
    }
    if (payload.prioridade) {
      updateData.priority = mapPrioridadeToDb(payload.prioridade);
    }
    if (payload.origem !== undefined) {
      updateData.source = payload.origem?.trim() || null;
    }
    if (payload.responsavel !== undefined) {
      const responsavel = payload.responsavel?.trim();
      if (!responsavel) {
        updateData.ownerId = null;
      } else {
        const owner = await prisma.user.findFirst({
          where: {
            OR: [
              { fullName: { equals: responsavel, mode: "insensitive" } },
              { username: { equals: responsavel, mode: "insensitive" } },
            ],
          },
        });
        updateData.ownerId = owner?.id ?? null;
      }
    }
    if (payload.empresa) {
      await prisma.client.update({
        where: { id: deal.clientId },
        data: { name: payload.empresa.trim() },
      });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhuma atualizacao informada." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const actorId = cookieStore.get("auth_user")?.value ?? null;
    const requestHeaders = await headers();
    const userAgent = requestHeaders.get("user-agent");
    const ip =
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      requestHeaders.get("x-real-ip");
    const url =
      requestHeaders.get("referer") ??
      requestHeaders.get("origin") ??
      req.url;

    const updated = await prisma.deal.update({
      where: { id: deal.id },
      data: updateData,
    });

    if (stageName) {
      const previousStage = currentStage?.name ?? "Etapa anterior";
      const pipelineName = targetPipelineName;
      await prisma.dealActivity.create({
        data: {
          dealId: updated.id,
          type: "STAGE_CHANGE",
          message: `Etapa atualizada de ${previousStage} para ${stageName} no funil ${pipelineName}.`,
          createdById: actorId,
        },
      });
    }
    if (payload.funil && previousPipelineName !== targetPipelineName) {
      await prisma.dealActivity.create({
        data: {
          dealId: updated.id,
          type: "STAGE_CHANGE",
          message: `Funil remanejado de ${previousPipelineName} para ${targetPipelineName}.`,
          createdById: actorId,
        },
      });
    }
    if (statusMessage) {
      const lossReason = updateData.lossReasonId
        ? await prisma.pipelineLossReason.findUnique({
            where: { id: updateData.lossReasonId },
            select: { name: true },
          })
        : null;
      const statusLabel = normalize(statusMessage).includes("perd") ? "Negocio marcado como perdido" : `Status atualizado para ${statusMessage}.`;
      const reasonSuffix = lossReason?.name ? ` Motivo: ${lossReason.name}.` : "";
      await prisma.dealActivity.create({
        data: {
          dealId: updated.id,
          type: "STATUS_CHANGE",
          message: `${statusLabel}${reasonSuffix}`,
          createdById: actorId,
        },
      });
    }

    const isMove = Boolean(payload.etapa || payload.funil);
    await writeAuditLog({
      userId: actorId,
      entityType: "Negocio",
      entityId: updated.id,
      action: isMove ? "MOVE" : "UPDATE",
      message: isMove
        ? `Negocio movido para ${stageName ?? currentStage?.name ?? "Etapa"} (${targetPipelineName}).`
        : `Negocio atualizado: ${updated.code}`,
      metadata: {
        etapa: stageName ?? undefined,
        funil: targetPipelineName ?? undefined,
        fields: Object.keys(updateData),
      },
      url,
      ip,
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[NEGOCIOS_PATCH]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar negocio." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deal = await prisma.deal.findUnique({ where: { id }, select: { id: true } });
    if (!deal) {
      return NextResponse.json({ error: "Negocio nao encontrado." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.dealActivity.deleteMany({ where: { dealId: id } }),
      prisma.dealDocument.deleteMany({ where: { dealId: id } }),
      prisma.deal.delete({ where: { id } }),
    ]);

    const cookieStore = await cookies();
    const actorId = cookieStore.get("auth_user")?.value ?? null;
    const requestHeaders = await headers();
    const userAgent = requestHeaders.get("user-agent");
    const ip =
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      requestHeaders.get("x-real-ip");
    const url =
      requestHeaders.get("referer") ??
      requestHeaders.get("origin") ??
      _req.url;
    await writeAuditLog({
      userId: actorId,
      entityType: "Negocio",
      entityId: id,
      action: "DELETE",
      message: "Negocio deletado",
      url,
      ip,
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[NEGOCIOS_DELETE]", error);
    return NextResponse.json(
      { error: "Erro ao deletar negocio." },
      { status: 500 },
    );
  }
}
