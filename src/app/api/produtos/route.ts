import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as {
      nome?: string;
      codigo?: string;
      categoria?: string;
      unidade?: string;
      precoBase?: number;
      controladoEstoque?: boolean;
    };

    const nome = payload.nome?.trim();
    const codigo = payload.codigo?.trim();
    if (!nome || !codigo) {
      return NextResponse.json(
        { error: "Nome e codigo sao obrigatorios." },
        { status: 400 },
      );
    }

    const existing = await prisma.product.findUnique({
      where: { sku: codigo },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Codigo ja cadastrado." },
        { status: 409 },
      );
    }

    const categoriaNome = payload.categoria?.trim();
    const category = categoriaNome
      ? await prisma.productCategory.findFirst({
          where: { name: { equals: categoriaNome, mode: "insensitive" } },
        })
      : null;

    const categoryId = category
      ? category.id
      : categoriaNome
        ? (
            await prisma.productCategory.create({
              data: { name: categoriaNome, active: true },
            })
          ).id
        : null;

    const created = await prisma.product.create({
      data: {
        sku: codigo,
        name: nome,
        categoryId,
        unit: payload.unidade?.trim() || "un",
        basePrice: payload.precoBase ?? 0,
        isStockControlled: payload.controladoEstoque ?? true,
      },
      select: { id: true },
    });

    await prisma.stockBalance.create({
      data: {
        productId: created.id,
        quantity: 0,
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("[PRODUTOS_POST]", error);
    return NextResponse.json(
      { error: "Erro ao criar produto." },
      { status: 500 },
    );
  }
}
