import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BarChart3, Gauge, Layers, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ConSYS | Operação conectada",
  description:
    "Centralize vendas, financeiro e operações em um só lugar. Acesse o ConSYS e comece pelo login.",
};

const highlights = [
  {
    title: "Visão em tempo real",
    description: "Painéis e relatórios conectados para enxergar receita, pipeline e estoque.",
    icon: BarChart3,
  },
  {
    title: "Fluxos alinhados",
    description: "Negócios, documentos, financeiro e cadastros operando no mesmo ritmo e linguagem.",
    icon: Layers,
  },
  {
    title: "Governança e segurança",
    description: "Perfis, auditoria e trilhas claras para proteger dados e decisões.",
    icon: ShieldCheck,
  },
];

const modules = [
  { name: "Dashboard", detail: "Panorama consolidado da operação" },
  { name: "Negócios", detail: "Evolução de leads, propostas e conversões" },
  { name: "Documentos", detail: "Propostas geradas para clientes" },
  { name: "Cadastros", detail: "Catálogo único de produtos, clientes e parceiros" },
  { name: "Estoque", detail: "Movimentação, reservas e disponibilidade" },
  { name: "Financeiro", detail: "Entradas, saídas e previsões de caixa" },
  { name: "Relatórios", detail: "Indicadores prontos para a diretoria" },
];

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_35%)]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:py-24">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/15">
              <Gauge className="size-4 text-cyan-300" />
              Plataforma ConSYS
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
                Operação conectada, equipes alinhadas.
              </h1>
              <p className="max-w-2xl text-lg text-slate-200/90">
                Centralize Negócios, estoque e financeiro em um só lugar. Acesse o ConSYS para
                acompanhar indicadores, priorizar ações e entregar resultados previsíveis.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                <Link href="/login">
                  Ir para Login
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <span className="text-sm text-slate-200/80">
                Acesso seguro para times de vendas, operações e diretoria.
              </span>
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between text-sm text-slate-200/70">
              <span>Módulos ativos</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-200">
                Integração total
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {modules.map((module) => (
                <div
                  key={module.name}
                  className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{module.name}</p>
                    <p className="text-xs text-slate-200/70">{module.detail}</p>
                  </div>
                  <ArrowRight className="mt-1 size-4 text-cyan-300/80" />
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-white/10"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
                <item.icon className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="text-sm text-slate-200/80">{item.description}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
