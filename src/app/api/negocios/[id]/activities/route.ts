import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const activities = await prisma.dealActivity.findMany({
      where: { dealId: id },
      include: { createdBy: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      activities: activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        message: activity.message ?? "",
        createdAt: activity.createdAt,
        createdBy: activity.createdBy?.username ?? "Sistema",
      })),
    });
  } catch (error) {
    console.error("[NEGOCIOS_ACTIVITIES_GET]", error);
    return NextResponse.json(
      { error: "Erro ao carregar interacoes." },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await req.json()) as {
      message?: string;
      type?: string;
    };

    const message = payload.message?.trim();
    if (!message) {
      return NextResponse.json(
        { error: "Mensagem obrigatoria." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user")?.value ?? null;

    const activity = await prisma.dealActivity.create({
      data: {
        dealId: id,
        type: payload.type ?? "REGISTRO",
        message,
        createdById: userId,
      },
      include: { createdBy: true },
    });

    return NextResponse.json(
      {
        id: activity.id,
        type: activity.type,
        message: activity.message ?? "",
        createdAt: activity.createdAt,
        createdBy: activity.createdBy?.username ?? "Sistema",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[NEGOCIOS_ACTIVITIES_POST]", error);
    return NextResponse.json(
      { error: "Erro ao salvar interacao." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get("activityId");
    if (!activityId) {
      return NextResponse.json(
        { error: "activityId obrigatorio." },
        { status: 400 },
      );
    }

    const result = await prisma.dealActivity.deleteMany({
      where: { id: activityId, dealId: id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Interacao nao encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[NEGOCIOS_ACTIVITIES_DELETE]", error);
    return NextResponse.json(
      { error: "Erro ao excluir interacao." },
      { status: 500 },
    );
  }
}
