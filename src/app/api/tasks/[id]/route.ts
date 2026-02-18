import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const payload = (await req.json()) as { status?: string };

    if (!payload.status) {
      return NextResponse.json({ error: "Status obrigatorio." }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Tarefa nao encontrada." }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status: payload.status },
      include: { assignedTo: true, createdBy: true, deal: { include: { client: true } } },
    });

    return NextResponse.json({
      id: updated.id,
      message: updated.message,
      scheduledAt: updated.scheduledAt,
      createdAt: updated.createdAt,
      status: updated.status,
      assignedTo: updated.assignedTo
        ? { id: updated.assignedTo.id, username: updated.assignedTo.username, fullName: updated.assignedTo.fullName ?? "" }
        : null,
      createdBy: updated.createdBy
        ? { id: updated.createdBy.id, username: updated.createdBy.username, fullName: updated.createdBy.fullName ?? "" }
        : null,
      deal: updated.deal
        ? {
            id: updated.deal.id,
            code: updated.deal.code,
            title: updated.deal.title ?? "",
            clientName: updated.deal.client?.tradeName ?? updated.deal.client?.name ?? "",
          }
        : null,
    });
  } catch (error) {
    console.error("[TASKS_PATCH]", error);
    return NextResponse.json({ error: "Erro ao atualizar tarefa." }, { status: 500 });
  }
}
