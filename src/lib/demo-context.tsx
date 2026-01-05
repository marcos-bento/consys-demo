'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { Lead } from './mock/crm';
import type { Proposta } from './mock/comercial';
import type { Movimentacao, Produto } from './mock/estoque';
import type { Lancamento } from './mock/financeiro';
import type { Negocio } from './mock/negocios';
import type { Documento } from './mock/documentos';
import type { Compra } from './mock/compras';
import type { Cliente, Fornecedor, Produto as ProdutoCadastro, Usuario, Categoria } from './mock/cadastros';
import type { Assistencia, HistoricoAssistencia, AnexoAssistencia } from './mock/assistencias';
import type { Veiculo, Agendamento, OrdemServico } from './mock/frota';
import type { Candidato, NotaCandidato, Colaborador, Ferias, RegistroPonto, ImportacaoPonto } from './mock/dep-pessoal';

type DemoContextValue = {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  propostas: Proposta[];
  setPropostas: React.Dispatch<React.SetStateAction<Proposta[]>>;
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  movimentacoes: Record<string, Movimentacao[]>;
  setMovimentacoes: React.Dispatch<
    React.SetStateAction<Record<string, Movimentacao[]>>
  >;
  lancamentos: Lancamento[];
  setLancamentos: React.Dispatch<React.SetStateAction<Lancamento[]>>;
  negocios: Negocio[];
  setNegocios: React.Dispatch<React.SetStateAction<Negocio[]>>;
  documentos: Documento[];
  setDocumentos: React.Dispatch<React.SetStateAction<Documento[]>>;
  compras: Compra[];
  setCompras: React.Dispatch<React.SetStateAction<Compra[]>>;
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  fornecedores: Fornecedor[];
  setFornecedores: React.Dispatch<React.SetStateAction<Fornecedor[]>>;
  produtosCadastro: ProdutoCadastro[];
  setProdutosCadastro: React.Dispatch<React.SetStateAction<ProdutoCadastro[]>>;
  usuarios: Usuario[];
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
  categorias: Categoria[];
  setCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
  assistencias: Assistencia[];
  setAssistencias: React.Dispatch<React.SetStateAction<Assistencia[]>>;
  historicoAssistencias: HistoricoAssistencia[];
  setHistoricoAssistencias: React.Dispatch<React.SetStateAction<HistoricoAssistencia[]>>;
  anexosAssistencias: AnexoAssistencia[];
  setAnexosAssistencias: React.Dispatch<React.SetStateAction<AnexoAssistencia[]>>;
  veiculos: Veiculo[];
  setVeiculos: React.Dispatch<React.SetStateAction<Veiculo[]>>;
  agendamentos: Agendamento[];
  setAgendamentos: React.Dispatch<React.SetStateAction<Agendamento[]>>;
  ordensServico: OrdemServico[];
  setOrdensServico: React.Dispatch<React.SetStateAction<OrdemServico[]>>;
  candidatos: Candidato[];
  setCandidatos: React.Dispatch<React.SetStateAction<Candidato[]>>;
  notasCandidatos: NotaCandidato[];
  setNotasCandidatos: React.Dispatch<React.SetStateAction<NotaCandidato[]>>;
  colaboradores: Colaborador[];
  setColaboradores: React.Dispatch<React.SetStateAction<Colaborador[]>>;
  ferias: Ferias[];
  setFerias: React.Dispatch<React.SetStateAction<Ferias[]>>;
  registrosPonto: RegistroPonto[];
  setRegistrosPonto: React.Dispatch<React.SetStateAction<RegistroPonto[]>>;
  importacoesPonto: ImportacaoPonto[];
  setImportacoesPonto: React.Dispatch<React.SetStateAction<ImportacaoPonto[]>>;
  resetDemo: () => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Record<string, Movimentacao[]>>({});
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtosCadastro, setProdutosCadastro] = useState<ProdutoCadastro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [assistencias, setAssistencias] = useState<Assistencia[]>([]);
  const [historicoAssistencias, setHistoricoAssistencias] = useState<HistoricoAssistencia[]>([]);
  const [anexosAssistencias, setAnexosAssistencias] = useState<AnexoAssistencia[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [notasCandidatos, setNotasCandidatos] = useState<NotaCandidato[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [registrosPonto, setRegistrosPonto] = useState<RegistroPonto[]>([]);
  const [importacoesPonto, setImportacoesPonto] = useState<ImportacaoPonto[]>([]);

  const loadFromApi = useCallback(async () => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Falha ao carregar dados');
      }
      const data = await res.json();
      setLeads(data.leads ?? []);
      setPropostas(data.propostas ?? []);
      setProdutos(data.produtos ?? []);
      setMovimentacoes(data.movimentacoes ?? {});
      setLancamentos(data.lancamentos ?? []);
      setNegocios(data.negocios ?? []);
      setDocumentos(data.documentos ?? []);
      setCompras(data.compras ?? []);
      setClientes(data.clientes ?? []);
      setFornecedores(data.fornecedores ?? []);
      setProdutosCadastro(data.produtosCadastro ?? []);
      setUsuarios(data.usuarios ?? []);
      setCategorias(data.categorias ?? []);
      setAssistencias(data.assistencias ?? []);
      setHistoricoAssistencias(data.historicoAssistencias ?? []);
      setAnexosAssistencias(data.anexosAssistencias ?? []);
      setVeiculos(data.veiculos ?? []);
      setAgendamentos(data.agendamentos ?? []);
      setOrdensServico(data.ordensServico ?? []);
      setCandidatos(data.candidatos ?? []);
      setNotasCandidatos(data.notasCandidatos ?? []);
      setColaboradores(data.colaboradores ?? []);
      setFerias(data.ferias ?? []);
      setRegistrosPonto(data.registrosPonto ?? []);
      setImportacoesPonto(data.importacoesPonto ?? []);
    } catch (error) {
      console.error('[DEMO_DATA_LOAD]', error);
    }
  }, []);

  const resetDemo = useCallback(() => {
    void loadFromApi();
  }, [loadFromApi]);

  useEffect(() => {
    void loadFromApi();
  }, [loadFromApi]);

  return (
    <DemoContext.Provider
      value={{
        leads,
        setLeads,
        propostas,
        setPropostas,
        produtos,
        setProdutos,
        movimentacoes,
        setMovimentacoes,
        lancamentos,
        setLancamentos,
        negocios,
        setNegocios,
        documentos,
        setDocumentos,
        compras,
        setCompras,
        clientes,
        setClientes,
        fornecedores,
        setFornecedores,
        produtosCadastro,
        setProdutosCadastro,
        usuarios,
        setUsuarios,
        categorias,
        setCategorias,
        assistencias,
        setAssistencias,
        historicoAssistencias,
        setHistoricoAssistencias,
        anexosAssistencias,
        setAnexosAssistencias,
        veiculos,
        setVeiculos,
        agendamentos,
        setAgendamentos,
        ordensServico,
        setOrdensServico,
        candidatos,
        setCandidatos,
        notasCandidatos,
        setNotasCandidatos,
        colaboradores,
        setColaboradores,
        ferias,
        setFerias,
        registrosPonto,
        setRegistrosPonto,
        importacoesPonto,
        setImportacoesPonto,
        resetDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoData() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoData must be used within DemoProvider');
  }
  return context;
}
