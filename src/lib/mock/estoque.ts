export interface Produto {
  id: string;
  nome: string;
  codigo: string;
  categoria: 'Mesas' | 'Cadeiras' | 'Armários' | 'Acessórios' | 'Frota';
  estoque: number;
}

export interface Movimentacao {
  data: string;
  tipo: 'Entrada' | 'Saída';
  quantidade: number;
  observacao: string;
}

export const mockProdutos: Produto[] = [
  { id: '1', nome: 'Mesa Escritório', codigo: 'MES-001', categoria: 'Mesas', estoque: 15 },
  { id: '2', nome: 'Cadeira Ergonômica', codigo: 'CAD-001', categoria: 'Cadeiras', estoque: 8 },
  { id: '3', nome: 'Armário Arquivo', codigo: 'ARM-001', categoria: 'Armários', estoque: 5 },
  { id: '4', nome: 'Mesa Reunião', codigo: 'MES-002', categoria: 'Mesas', estoque: 3 },
  { id: '5', nome: 'Cadeira Visitante', codigo: 'CAD-002', categoria: 'Cadeiras', estoque: 12 },
  { id: '6', nome: 'Armário Cozinha', codigo: 'ARM-002', categoria: 'Armários', estoque: 0 },
  { id: '7', nome: 'Mesa Lateral', codigo: 'MES-003', categoria: 'Mesas', estoque: 7 },
  { id: '8', nome: 'Cadeira Giratória', codigo: 'CAD-003', categoria: 'Cadeiras', estoque: 20 },
  { id: '9', nome: 'Armário Ferramentas', codigo: 'ARM-003', categoria: 'Armários', estoque: 2 },
  { id: '10', nome: 'Apoio de Livros', codigo: 'ACE-001', categoria: 'Acessórios', estoque: 25 },
  { id: '11', nome: 'Suporte Monitor', codigo: 'ACE-002', categoria: 'Acessórios', estoque: 10 },
  { id: '12', nome: 'Cabo HDMI', codigo: 'ACE-003', categoria: 'Acessórios', estoque: 50 },
  { id: '13', nome: 'Van de Entregas', codigo: 'FRO-001', categoria: 'Frota', estoque: 2 },
];

export const mockMovimentacoes: Record<string, Movimentacao[]> = {
  '1': [
    { data: '2025-12-15', tipo: 'Entrada', quantidade: 10, observacao: 'Compra inicial' },
    { data: '2025-12-16', tipo: 'Saída', quantidade: 2, observacao: 'Venda para cliente X' },
  ],
  '2': [
    { data: '2025-12-14', tipo: 'Entrada', quantidade: 5, observacao: 'Reabastecimento' },
    { data: '2025-12-17', tipo: 'Saída', quantidade: 2, observacao: 'Uso interno' },
  ],
  '3': [
    { data: '2025-12-10', tipo: 'Entrada', quantidade: 5, observacao: 'Compra' },
  ],
  '4': [
    { data: '2025-12-12', tipo: 'Entrada', quantidade: 3, observacao: 'Compra' },
  ],
  '5': [
    { data: '2025-12-13', tipo: 'Entrada', quantidade: 12, observacao: 'Compra' },
  ],
  '6': [
    { data: '2025-12-11', tipo: 'Entrada', quantidade: 5, observacao: 'Compra' },
    { data: '2025-12-18', tipo: 'Saída', quantidade: 5, observacao: 'Uso em projeto' },
  ],
  '7': [
    { data: '2025-12-09', tipo: 'Entrada', quantidade: 7, observacao: 'Compra' },
  ],
  '8': [
    { data: '2025-12-08', tipo: 'Entrada', quantidade: 20, observacao: 'Compra' },
  ],
  '9': [
    { data: '2025-12-07', tipo: 'Entrada', quantidade: 2, observacao: 'Compra' },
  ],
  '10': [
    { data: '2025-12-06', tipo: 'Entrada', quantidade: 25, observacao: 'Compra' },
  ],
  '11': [
    { data: '2025-12-05', tipo: 'Entrada', quantidade: 10, observacao: 'Compra' },
  ],
  '12': [
    { data: '2025-12-04', tipo: 'Entrada', quantidade: 50, observacao: 'Compra' },
  ],
  '13': [
    { data: '2025-12-03', tipo: 'Entrada', quantidade: 2, observacao: 'Aquisição frota' },
    { data: '2025-12-18', tipo: 'Saída', quantidade: 1, observacao: 'Manutenção programada' },
  ],
};
