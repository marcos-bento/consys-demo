import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

type StagePayload = {
  id?: string;
  name?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Funil invalido.' },
        { status: 400 },
      );
    }
    const payload = (await req.json()) as { stages?: StagePayload[]; name?: string; lossReasons?: StagePayload[] };
    const hasStages = payload.stages !== undefined;
    const hasName = typeof payload.name === 'string';
    const hasLossReasons = payload.lossReasons !== undefined;

    if (!hasStages && !hasName && !hasLossReasons) {
      return NextResponse.json(
        { error: 'Nenhuma alteracao enviada.' },
        { status: 400 },
      );
    }

    if (hasStages && !Array.isArray(payload.stages)) {
      return NextResponse.json(
        { error: 'Etapas invalidas.' },
        { status: 400 },
      );
    }
    if (hasLossReasons && !Array.isArray(payload.lossReasons)) {
      return NextResponse.json(
        { error: 'Motivos invalidos.' },
        { status: 400 },
      );
    }

    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: { stages: true, lossReasons: true },
    });

    if (!pipeline) {
      return NextResponse.json(
        { error: 'Funil nao encontrado.' },
        { status: 404 },
      );
    }

    if (hasName) {
      const nextName = payload.name?.trim() ?? '';
      if (!nextName) {
        return NextResponse.json({ error: 'Nome do funil e obrigatorio.' }, { status: 400 });
      }
      const duplicate = await prisma.pipeline.findFirst({
        where: {
          name: { equals: nextName, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'Ja existe um funil com esse nome.' }, { status: 400 });
      }
      await prisma.pipeline.update({
        where: { id },
        data: { name: nextName },
      });
    }

    if (hasStages) {
      const cleaned = (payload.stages ?? [])
        .map((stage) => ({
          id: stage.id,
          name: stage.name?.trim() ?? '',
        }))
        .filter((stage) => stage.name.length > 0);

      if (cleaned.length === 0) {
        return NextResponse.json(
          { error: 'Inclua ao menos uma etapa.' },
          { status: 400 },
        );
      }

      const existingIds = new Set(pipeline.stages.map((stage) => stage.id));
      const incomingIds = new Set(
        cleaned.map((stage) => stage.id).filter(Boolean) as string[],
      );

      for (const stageId of incomingIds) {
        if (!existingIds.has(stageId)) {
          return NextResponse.json(
            { error: 'Etapa invalida.' },
            { status: 400 },
          );
        }
      }

      const deleteIds = pipeline.stages
        .map((stage) => stage.id)
        .filter((stageId) => !incomingIds.has(stageId));

      if (deleteIds.length > 0) {
        const linkedDeals = await prisma.deal.count({
          where: { stageId: { in: deleteIds } },
        });
        if (linkedDeals > 0) {
          return NextResponse.json(
            { error: 'Existem negocios vinculados a etapas removidas.' },
            { status: 400 },
          );
        }
      }

      await prisma.$transaction(async (tx) => {
        for (const [index, stage] of cleaned.entries()) {
          const position = index + 1;
          if (stage.id) {
            await tx.pipelineStage.update({
              where: { id: stage.id },
              data: { name: stage.name, position },
            });
          } else {
            await tx.pipelineStage.create({
              data: { pipelineId: id, name: stage.name, position },
            });
          }
        }

        if (deleteIds.length > 0) {
          await tx.pipelineStage.deleteMany({
            where: { id: { in: deleteIds } },
          });
        }
      });
    }

    if (hasLossReasons) {
      const cleanedReasons = (payload.lossReasons ?? [])
        .map((reason) => ({
          id: reason.id,
          name: reason.name?.trim() ?? '',
        }))
        .filter((reason) => reason.name.length > 0);

      const existingReasonIds = new Set(pipeline.lossReasons.map((reason) => reason.id));
      const incomingReasonIds = new Set(
        cleanedReasons.map((reason) => reason.id).filter(Boolean) as string[],
      );

      for (const reasonId of incomingReasonIds) {
        if (!existingReasonIds.has(reasonId)) {
          return NextResponse.json(
            { error: 'Motivo invalido.' },
            { status: 400 },
          );
        }
      }

      const deleteReasonIds = pipeline.lossReasons
        .map((reason) => reason.id)
        .filter((reasonId) => !incomingReasonIds.has(reasonId));

      await prisma.$transaction(async (tx) => {
        for (const reason of cleanedReasons) {
          if (reason.id) {
            await tx.pipelineLossReason.update({
              where: { id: reason.id },
              data: { name: reason.name },
            });
          } else {
            await tx.pipelineLossReason.create({
              data: { pipelineId: id, name: reason.name },
            });
          }
        }

        if (deleteReasonIds.length > 0) {
          await tx.pipelineLossReason.deleteMany({
            where: { id: { in: deleteReasonIds } },
          });
        }
      });
    }

    const refreshed = await prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { position: 'asc' },
          select: { id: true, name: true, position: true },
        },
        lossReasons: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, name: true, active: true },
        },
      },
    });

    return NextResponse.json({ pipeline: refreshed });
  } catch (error) {
    console.error('[PIPELINES_PATCH]', error);
    const message = error instanceof Error ? error.message : 'Erro ao salvar etapas.';
    return NextResponse.json(
      { error: message },
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
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Funil invalido.' },
        { status: 400 },
      );
    }
    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: { stages: true },
    });
    if (!pipeline) {
      return NextResponse.json({ error: 'Funil nao encontrado.' }, { status: 404 });
    }
    if (pipeline.name.toLowerCase() === 'vendas') {
      return NextResponse.json(
        { error: 'O funil Vendas nao pode ser excluido.' },
        { status: 400 },
      );
    }

    const linkedDeals = await prisma.deal.count({
      where: { pipelineId: id },
    });
    if (linkedDeals > 0) {
      return NextResponse.json(
        { error: 'Existem negocios vinculados a este funil.' },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.pipelineStage.deleteMany({ where: { pipelineId: id } }),
      prisma.pipeline.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[PIPELINES_DELETE]', error);
    return NextResponse.json({ error: 'Erro ao excluir funil.' }, { status: 500 });
  }
}
