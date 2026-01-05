import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

const mapStatusToDb = (value?: string | null) => {
  const status = normalize(value);
  if (status.includes("ganh") || status.includes("won")) return "WON";
  if (status.includes("perd") || status.includes("lost")) return "LOST";
  return "OPEN";
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
    } = {};

    const currentStage = await prisma.pipelineStage.findUnique({
      where: { id: deal.stageId },
      select: { name: true },
    });
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: deal.pipelineId },
      select: { name: true },
    });

    let stageName: string | null = null;
    if (payload.etapa) {
      stageName = mapEtapaToStage(payload.etapa);
      const stage = await getOrCreateStage(deal.pipelineId, stageName);
      updateData.stageId = stage.id;
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
      const stage = await getOrCreateStage(deal.pipelineId, stageName);
      updateData.stageId = stage.id;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhuma atualizacao informada." },
        { status: 400 },
      );
    }

    const updated = await prisma.deal.update({
      where: { id: deal.id },
      data: updateData,
    });

    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user")?.value ?? null;

    if (stageName) {
      const previousStage = currentStage?.name ?? "Etapa anterior";
      const pipelineName = pipeline?.name ?? "Funil";
      await prisma.dealActivity.create({
        data: {
          dealId: updated.id,
          type: "STAGE_CHANGE",
          message: `Etapa atualizada de ${previousStage} para ${stageName} no funil ${pipelineName}.`,
          createdById: userId,
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
          createdById: userId,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[NEGOCIOS_PATCH]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar negocio." },
      { status: 500 },
    );
  }
}
