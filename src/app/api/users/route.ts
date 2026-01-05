import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        role: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      users.map((user) => ({
        id: user.id,
        username: user.username,
        role: user.role?.name ?? "",
        createdAt: user.createdAt,
      })),
    );
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json({ error: "Erro ao listar usuários." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "username, password e role são obrigatórios." }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json({ error: "Usuário já existe." }, { status: 409 });
    }

    const roleRecord = await prisma.role.findFirst({
      where: { name: { equals: role, mode: "insensitive" } },
    });
    if (!roleRecord) {
      return NextResponse.json({ error: "Role inválida." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        username,
        passwordHash,
        roleId: roleRecord.id,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        username: created.username,
        role: created.role?.name ?? "",
        createdAt: created.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[USERS_POST]", error);
    return NextResponse.json({ error: "Erro ao criar usuário." }, { status: 500 });
  }
}
