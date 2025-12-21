export interface Kpis {
  vendas: number;
  propostasEnviadas: number;
  taxaConversao: number;
  ticketMedio: number;
  variacaoVendas: number;
  variacaoPropostas: number;
  variacaoConversao: number;
  variacaoTicket: number;
}

export interface TopCliente {
  cliente: string;
  valor: number;
}

export interface TopProduto {
  produto: string;
  qtd: number;
  valor: number;
}

export interface DadosRelatorio {
  kpis: Kpis;
  vendasSemanais: number[];
  propostasPorStatus: {
    Rascunho: number;
    Enviada: number;
    Aprovada: number;
    Reprovada: number;
  };
  topClientes: TopCliente[];
  topProdutos: TopProduto[];
}

export const mockRelatorios: Record<string, DadosRelatorio> = {
  '7': {
    kpis: {
      vendas: 45000,
      propostasEnviadas: 12,
      taxaConversao: 25,
      ticketMedio: 3750,
      variacaoVendas: 8,
      variacaoPropostas: -5,
      variacaoConversao: 3,
      variacaoTicket: 12,
    },
    vendasSemanais: [5200, 4800, 6100, 5500, 4900, 5800, 6200, 5300],
    propostasPorStatus: {
      Rascunho: 3,
      Enviada: 5,
      Aprovada: 3,
      Reprovada: 1,
    },
    topClientes: [
      { cliente: 'Empresa A', valor: 15000 },
      { cliente: 'Cliente B', valor: 12000 },
      { cliente: 'Empresa C', valor: 9000 },
      { cliente: 'Cliente D', valor: 6000 },
      { cliente: 'Empresa E', valor: 3000 },
    ],
    topProdutos: [
      { produto: 'Mesa Escritório', qtd: 8, valor: 12000 },
      { produto: 'Cadeira Ergonômica', qtd: 5, valor: 8000 },
      { produto: 'Armário Arquivo', qtd: 3, valor: 4500 },
      { produto: 'Mesa Reunião', qtd: 2, valor: 6000 },
      { produto: 'Cadeira Visitante', qtd: 4, valor: 4000 },
    ],
  },
  '30': {
    kpis: {
      vendas: 185000,
      propostasEnviadas: 48,
      taxaConversao: 28,
      ticketMedio: 3854,
      variacaoVendas: 15,
      variacaoPropostas: 10,
      variacaoConversao: 5,
      variacaoTicket: 8,
    },
    vendasSemanais: [22000, 25000, 28000, 24000, 26000, 27000, 23000, 21000],
    propostasPorStatus: {
      Rascunho: 8,
      Enviada: 20,
      Aprovada: 14,
      Reprovada: 6,
    },
    topClientes: [
      { cliente: 'Empresa A', valor: 45000 },
      { cliente: 'Cliente B', valor: 38000 },
      { cliente: 'Empresa C', valor: 32000 },
      { cliente: 'Cliente D', valor: 28000 },
      { cliente: 'Empresa E', valor: 22000 },
    ],
    topProdutos: [
      { produto: 'Mesa Escritório', qtd: 25, valor: 37500 },
      { produto: 'Cadeira Ergonômica', qtd: 18, valor: 28800 },
      { produto: 'Armário Arquivo', qtd: 12, valor: 18000 },
      { produto: 'Mesa Reunião', qtd: 8, valor: 24000 },
      { produto: 'Cadeira Visitante', qtd: 15, valor: 15000 },
    ],
  },
  '90': {
    kpis: {
      vendas: 520000,
      propostasEnviadas: 135,
      taxaConversao: 32,
      ticketMedio: 4063,
      variacaoVendas: 22,
      variacaoPropostas: 18,
      variacaoConversao: 7,
      variacaoTicket: 15,
    },
    vendasSemanais: [58000, 62000, 55000, 60000, 57000, 59000, 61000, 63000],
    propostasPorStatus: {
      Rascunho: 20,
      Enviada: 55,
      Aprovada: 43,
      Reprovada: 17,
    },
    topClientes: [
      { cliente: 'Empresa A', valor: 120000 },
      { cliente: 'Cliente B', valor: 95000 },
      { cliente: 'Empresa C', valor: 85000 },
      { cliente: 'Cliente D', valor: 75000 },
      { cliente: 'Empresa E', valor: 65000 },
    ],
    topProdutos: [
      { produto: 'Mesa Escritório', qtd: 70, valor: 105000 },
      { produto: 'Cadeira Ergonômica', qtd: 50, valor: 80000 },
      { produto: 'Armário Arquivo', qtd: 35, valor: 52500 },
      { produto: 'Mesa Reunião', qtd: 25, valor: 75000 },
      { produto: 'Cadeira Visitante', qtd: 40, valor: 40000 },
    ],
  },
};