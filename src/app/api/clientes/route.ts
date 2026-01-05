import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as {
      tipo?: "PJ" | "PF";
      razaoSocial?: string;
      nome?: string;
      nomeFantasia?: string;
      cnpj?: string;
      cpf?: string;
      email?: string;
      telefone?: string;
      cidade?: string;
      uf?: string;
    };

    const tipo = payload.tipo === "PF" ? "PF" : "PJ";
    const nome = tipo === "PF" ? payload.nome?.trim() : payload.razaoSocial?.trim();
    const document = tipo === "PF" ? payload.cpf?.trim() : payload.cnpj?.trim();

    if (!nome || !document) {
      return NextResponse.json(
        { error: "Nome e documento sao obrigatorios." },
        { status: 400 },
      );
    }

    const created = await prisma.client.create({
      data: {
        type: tipo,
        name: nome,
        tradeName: payload.nomeFantasia?.trim() || null,
        document,
        email: payload.email?.trim() || null,
        phone: payload.telefone?.trim() || null,
        addresses:
          payload.cidade || payload.uf
            ? {
                create: {
                  label: "Principal",
                  street: "Nao informado",
                  city: payload.cidade?.trim() || "Nao informado",
                  state: payload.uf?.trim() || "NA",
                },
              }
            : undefined,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("[CLIENTES_POST]", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente." },
      { status: 500 },
    );
  }
}
