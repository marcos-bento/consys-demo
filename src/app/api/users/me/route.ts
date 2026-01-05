import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_user")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role?.name ?? "",
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("[USERS_ME_GET]", error);
    return NextResponse.json({ error: "Erro ao buscar usuário atual." }, { status: 500 });
  }
}
