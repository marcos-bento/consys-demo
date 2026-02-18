import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ConSYS | Operacao conectada",
  description:
    "Centralize vendas, financeiro e operacoes em um so lugar. Acesse o ConSYS e comece pelo login.",
};

export default function HomePage() {
  return (
    <main className="relative isolate h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_35%)]" />
      </div>

      <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center gap-8 px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/15">
          <Gauge className="size-4 text-cyan-300" />
          Plataforma ConSYS
        </span>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Operacao conectada, equipe alinhada.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-200/90 sm:text-lg">
            Tudo o que importa em um unico lugar para decidir rapido e agir com clareza.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
            <Link href="/login">
              Ir para Login
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <span className="text-xs text-slate-200/70 sm:text-sm">
            Acesso seguro para vendas, operacoes e diretoria.
          </span>
        </div>
      </div>
    </main>
  );
}
