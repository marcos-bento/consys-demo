import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

type BootstrapPayload = {
  username?: string;
  password?: string;
  role?: string;
};

export async function POST(req: Request) {
  try {
    let payload: BootstrapPayload = {};
    try {
      payload = (await req.json()) as BootstrapPayload;
    } catch {
      payload = {};
    }

    const username = payload.username ?? process.env.ADMIN_USERNAME;
    const password = payload.password ?? process.env.ADMIN_PASSWORD;
    const roleName = payload.role ?? process.env.ADMIN_ROLE ?? "Admin";

    if (!username || !password) {
      return NextResponse.json(
        {
          error:
            "Missing username/password. Set ADMIN_USERNAME and ADMIN_PASSWORD or send them in the request body.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.user.count();
    if (existing > 0) {
      return NextResponse.json(
        { error: "Users already exist. Bootstrap not allowed." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let roleRecord = await prisma.role.findFirst({
      where: { name: { equals: roleName, mode: "insensitive" } },
    });
    if (!roleRecord) {
      roleRecord = await prisma.role.create({
        data: { name: roleName, active: true },
      });
    }
    const created = await prisma.user.create({
      data: {
        username,
        passwordHash,
        roleId: roleRecord.id,
      },
      select: {
        id: true,
        username: true,
        role: { select: { name: true } },
        createdAt: true,
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
    console.error("[BOOTSTRAP_POST]", error);
    return NextResponse.json(
      { error: "Failed to bootstrap admin user." },
      { status: 500 },
    );
  }
}
