import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role?.name ?? "",
      },
    });

    response.cookies.set("auth_user", user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    response.cookies.set("auth_role", user.role?.name ?? "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN_POST]", error);
    return NextResponse.json(
      { error: "Erro interno ao tentar fazer login." },
      { status: 500 },
    );
  }
}
