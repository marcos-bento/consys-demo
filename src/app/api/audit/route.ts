import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const isAdminRole = (role?: string | null) => (role ?? "").toLowerCase() === "admin";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const actorId = cookieStore.get("auth_user")?.value;
    if (!actorId) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { role: { select: { name: true } } },
    });
    if (!isAdminRole(actor?.role?.name)) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const entityType = searchParams.get("entityType") || undefined;
    const entityId = searchParams.get("entityId") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 200);

    const logs = await prisma.auditLog.findMany({
      where: {
        userId,
        entityType,
        entityId,
      },
      include: {
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(
      logs.map((log) => ({
        id: log.id,
        user: log.user ? { id: log.user.id, username: log.user.username } : null,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        message: log.message,
        metadata: log.metadata,
        ip: log.ip,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
    );
  } catch (error) {
    console.error("[AUDIT_LOG_GET]", error);
    return NextResponse.json({ error: "Erro ao buscar logs." }, { status: 500 });
  }
}
