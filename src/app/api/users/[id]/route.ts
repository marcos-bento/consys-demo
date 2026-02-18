import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const isAdminRole = (role?: string | null) => (role ?? "").toLowerCase() === "admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      role: user.role?.name ?? "",
    });
  } catch (error) {
    console.error("[USER_GET]", error);
    return NextResponse.json({ error: "Erro ao buscar usuario." }, { status: 500 });
  }
}
