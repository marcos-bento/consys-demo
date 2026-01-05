import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const pipelines = await prisma.pipeline.findMany({
      include: {
        stages: {
          orderBy: { position: "asc" },
          select: { id: true, name: true, position: true },
        },
        lossReasons: {
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, active: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      pipelines: pipelines.map((pipeline) => ({
        id: pipeline.id,
        name: pipeline.name,
        stages: pipeline.stages,
        lossReasons: pipeline.lossReasons,
      })),
    });
  } catch (error) {
    console.error("[PIPELINES_GET]", error);
    return NextResponse.json(
      { error: "Erro ao carregar funis." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as { name?: string };
    const name = payload.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Nome do funil e obrigatorio.' }, { status: 400 });
    }

    const existing = await prisma.pipeline.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ja existe um funil com esse nome.' }, { status: 400 });
    }

    const created = await prisma.pipeline.create({
      data: { name },
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

    return NextResponse.json({
      pipeline: {
        id: created.id,
        name: created.name,
        stages: created.stages,
        lossReasons: created.lossReasons,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[PIPELINES_POST]', error);
    return NextResponse.json({ error: 'Erro ao criar funil.' }, { status: 500 });
  }
}
