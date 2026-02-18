import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

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
    if (actorId) {
      const recent = await prisma.auditLog.findFirst({
        where: {
          userId: actorId,
          entityType: "Negocio",
          entityId: id,
          action: "VIEW",
          createdAt: { gte: new Date(Date.now() - 30000) },
        },
        select: { id: true },
      });
      if (!recent) {
        await writeAuditLog({
          userId: actorId,
          entityType: "Negocio",
          entityId: id,
          action: "VIEW",
          message: "Negocio visualizado",
          url,
          ip,
          userAgent,
        });
      }
    }

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

export async function PATCH(
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

    const payload = (await req.json()) as { message?: string };
    const message = payload.message?.trim();
    if (!message) {
      return NextResponse.json(
        { error: "Mensagem obrigatoria." },
        { status: 400 },
      );
    }

    const activity = await prisma.dealActivity.findFirst({
      where: { id: activityId, dealId: id },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Interacao nao encontrada." },
        { status: 404 },
      );
    }

    if (activity.type !== "REGISTRO") {
      return NextResponse.json(
        { error: "Tipo de interacao nao editavel." },
        { status: 400 },
      );
    }

    const updated = await prisma.dealActivity.update({
      where: { id: activityId },
      data: { message },
      include: { createdBy: true },
    });

    return NextResponse.json({
      id: updated.id,
      type: updated.type,
      message: updated.message ?? "",
      createdAt: updated.createdAt,
      createdBy: updated.createdBy?.username ?? "Sistema",
    });
  } catch (error) {
    console.error("[NEGOCIOS_ACTIVITIES_PATCH]", error);
    return NextResponse.json(
      { error: "Erro ao editar interacao." },
      { status: 500 },
    );
  }
}
