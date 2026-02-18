import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignedToId = searchParams.get("assignedToId") ?? userId;
    const dealId = searchParams.get("dealId");
    const status = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId,
        ...(dealId ? { dealId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        deal: { include: { client: true } },
        assignedTo: true,
        createdBy: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({
      tasks: tasks.map((task) => ({
        id: task.id,
        message: task.message,
        scheduledAt: task.scheduledAt,
        createdAt: task.createdAt,
        status: task.status,
        assignedTo: task.assignedTo
          ? { id: task.assignedTo.id, username: task.assignedTo.username, fullName: task.assignedTo.fullName ?? "" }
          : null,
        createdBy: task.createdBy
          ? { id: task.createdBy.id, username: task.createdBy.username, fullName: task.createdBy.fullName ?? "" }
          : null,
        deal: task.deal
          ? {
              id: task.deal.id,
              code: task.deal.code,
              title: task.deal.title ?? "",
              clientName: task.deal.client?.tradeName ?? task.deal.client?.name ?? "",
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return NextResponse.json({ error: "Erro ao carregar tarefas." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user")?.value ?? null;

    const payload = (await req.json()) as {
      message?: string;
      scheduledAt?: string;
      assignedToId?: string;
      dealId?: string;
    };

    const message = payload.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Mensagem obrigatoria." }, { status: 400 });
    }

    if (!payload.scheduledAt) {
      return NextResponse.json({ error: "Data e horario obrigatorios." }, { status: 400 });
    }

    if (!payload.assignedToId) {
      return NextResponse.json({ error: "Usuario obrigatorio." }, { status: 400 });
    }

    const scheduledAt = new Date(payload.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Data invalida." }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        message,
        scheduledAt,
        assignedToId: payload.assignedToId,
        createdById: userId,
        dealId: payload.dealId ?? null,
      },
      include: {
        deal: { include: { client: true } },
        assignedTo: true,
        createdBy: true,
      },
    });

    return NextResponse.json(
      {
        id: task.id,
        message: task.message,
        scheduledAt: task.scheduledAt,
        createdAt: task.createdAt,
        status: task.status,
        assignedTo: task.assignedTo
          ? { id: task.assignedTo.id, username: task.assignedTo.username, fullName: task.assignedTo.fullName ?? "" }
          : null,
        createdBy: task.createdBy
          ? { id: task.createdBy.id, username: task.createdBy.username, fullName: task.createdBy.fullName ?? "" }
          : null,
        deal: task.deal
          ? {
              id: task.deal.id,
              code: task.deal.code,
              title: task.deal.title ?? "",
              clientName: task.deal.client?.tradeName ?? task.deal.client?.name ?? "",
            }
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[TASKS_POST]", error);
    return NextResponse.json({ error: "Erro ao criar tarefa." }, { status: 500 });
  }
}
