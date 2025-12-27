'use client';

import { createContext, useCallback, useContext, useState } from 'react';

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
import {
  getInitialLeads,
  getInitialPropostas,
  getInitialProdutos,
  getInitialMovimentacoes,
  getInitialLancamentos,
  getInitialNegocios,
  getInitialDocumentos,
  getInitialCompras,
  getInitialClientes,
  getInitialFornecedores,
  getInitialProdutosCadastro,
  getInitialUsuarios,
  getInitialCategorias,
  getInitialAssistencias,
  getInitialHistoricoAssistencias,
  getInitialAnexosAssistencias,
  getInitialVeiculos,
  getInitialAgendamentos,
  getInitialOrdensServico,
  getInitialCandidatos,
  getInitialNotasCandidatos,
  getInitialColaboradores,
  getInitialFerias,
  getInitialRegistrosPonto,
  getInitialImportacoesPonto,
} from './mock/initial-data';

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
  const [leads, setLeads] = useState<Lead[]>(() => getInitialLeads());
  const [propostas, setPropostas] = useState<Proposta[]>(() => getInitialPropostas());
  const [produtos, setProdutos] = useState<Produto[]>(() => getInitialProdutos());
  const [movimentacoes, setMovimentacoes] = useState<Record<string, Movimentacao[]>>(
    () => getInitialMovimentacoes(),
  );
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() => getInitialLancamentos());
  const [negocios, setNegocios] = useState<Negocio[]>(() => getInitialNegocios());
  const [documentos, setDocumentos] = useState<Documento[]>(() => getInitialDocumentos());
  const [compras, setCompras] = useState<Compra[]>(() => getInitialCompras());
  const [clientes, setClientes] = useState<Cliente[]>(() => getInitialClientes());
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => getInitialFornecedores());
  const [produtosCadastro, setProdutosCadastro] = useState<ProdutoCadastro[]>(() => getInitialProdutosCadastro());
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => getInitialUsuarios());
  const [categorias, setCategorias] = useState<Categoria[]>(() => getInitialCategorias());
  const [assistencias, setAssistencias] = useState<Assistencia[]>(() => getInitialAssistencias());
  const [historicoAssistencias, setHistoricoAssistencias] = useState<HistoricoAssistencia[]>(() => getInitialHistoricoAssistencias());
  const [anexosAssistencias, setAnexosAssistencias] = useState<AnexoAssistencia[]>(() => getInitialAnexosAssistencias());
  const [veiculos, setVeiculos] = useState<Veiculo[]>(() => getInitialVeiculos());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => getInitialAgendamentos());
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>(() => getInitialOrdensServico());
  const [candidatos, setCandidatos] = useState<Candidato[]>(() => getInitialCandidatos());
  const [notasCandidatos, setNotasCandidatos] = useState<NotaCandidato[]>(() => getInitialNotasCandidatos());
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(() => getInitialColaboradores());
  const [ferias, setFerias] = useState<Ferias[]>(() => getInitialFerias());
  const [registrosPonto, setRegistrosPonto] = useState<RegistroPonto[]>(() => getInitialRegistrosPonto());
  const [importacoesPonto, setImportacoesPonto] = useState<ImportacaoPonto[]>(() => getInitialImportacoesPonto());

  const resetDemo = useCallback(() => {
    setLeads(getInitialLeads());
    setPropostas(getInitialPropostas());
    setProdutos(getInitialProdutos());
    setMovimentacoes(getInitialMovimentacoes());
    setLancamentos(getInitialLancamentos());
    setNegocios(getInitialNegocios());
    setDocumentos(getInitialDocumentos());
    setCompras(getInitialCompras());
    setClientes(getInitialClientes());
    setFornecedores(getInitialFornecedores());
    setProdutosCadastro(getInitialProdutosCadastro());
    setUsuarios(getInitialUsuarios());
    setCategorias(getInitialCategorias());
    setAssistencias(getInitialAssistencias());
    setHistoricoAssistencias(getInitialHistoricoAssistencias());
    setAnexosAssistencias(getInitialAnexosAssistencias());
    setVeiculos(getInitialVeiculos());
    setAgendamentos(getInitialAgendamentos());
    setOrdensServico(getInitialOrdensServico());
    setCandidatos(getInitialCandidatos());
    setNotasCandidatos(getInitialNotasCandidatos());
    setColaboradores(getInitialColaboradores());
    setFerias(getInitialFerias());
    setRegistrosPonto(getInitialRegistrosPonto());
    setImportacoesPonto(getInitialImportacoesPonto());
  }, []);

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
