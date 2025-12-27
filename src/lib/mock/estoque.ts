export interface Produto {
  id: string;
  nome: string;
  codigo: string;
  categoria: 'Mesas' | 'Cadeiras' | 'Armários' | 'Acessórios' | 'Frota';
  estoque: number;
  minimo?: number;
  controladoEstoque: boolean;
}

export interface Movimentacao {
  id: string;
  data: string;
  tipo: 'Entrada' | 'Saída' | 'Ajuste';
  quantidade: number;
  observacao: string;
  usuario: string;
}

export const mockProdutos: Produto[] = [
  { id: '1', nome: 'Mesa Escritório', codigo: 'MES-001', categoria: 'Mesas', estoque: 15, minimo: 5, controladoEstoque: true },
  { id: '2', nome: 'Cadeira Ergonômica', codigo: 'CAD-001', categoria: 'Cadeiras', estoque: 8, minimo: 3, controladoEstoque: true },
  { id: '3', nome: 'Armário Arquivo', codigo: 'ARM-001', categoria: 'Armários', estoque: 5, minimo: 2, controladoEstoque: true },
  { id: '4', nome: 'Mesa Reunião', codigo: 'MES-002', categoria: 'Mesas', estoque: 3, minimo: 1, controladoEstoque: true },
  { id: '5', nome: 'Cadeira Visitante', codigo: 'CAD-002', categoria: 'Cadeiras', estoque: 12, minimo: 4, controladoEstoque: true },
  { id: '6', nome: 'Armário Cozinha', codigo: 'ARM-002', categoria: 'Armários', estoque: 0, minimo: 1, controladoEstoque: true },
  { id: '7', nome: 'Mesa Lateral', codigo: 'MES-003', categoria: 'Mesas', estoque: 7, minimo: 2, controladoEstoque: true },
  { id: '8', nome: 'Cadeira Giratória', codigo: 'CAD-003', categoria: 'Cadeiras', estoque: 20, minimo: 5, controladoEstoque: true },
  { id: '9', nome: 'Armário Ferramentas', codigo: 'ARM-003', categoria: 'Armários', estoque: 2, minimo: 1, controladoEstoque: true },
  { id: '10', nome: 'Apoio de Livros', codigo: 'ACE-001', categoria: 'Acessórios', estoque: 25, minimo: 5, controladoEstoque: true },
  { id: '11', nome: 'Suporte Monitor', codigo: 'ACE-002', categoria: 'Acessórios', estoque: 10, minimo: 3, controladoEstoque: true },
  { id: '12', nome: 'Cabo HDMI', codigo: 'ACE-003', categoria: 'Acessórios', estoque: 50, minimo: 10, controladoEstoque: true },
  { id: '13', nome: 'Van de Entregas', codigo: 'FRO-001', categoria: 'Frota', estoque: 2, minimo: 1, controladoEstoque: true },
];

export const mockMovimentacoes: Record<string, Movimentacao[]> = {
  '1': [
    { id: '1', data: '2025-12-15', tipo: 'Entrada', quantidade: 10, observacao: 'Compra inicial', usuario: 'João Silva' },
    { id: '2', data: '2025-12-16', tipo: 'Saída', quantidade: 2, observacao: 'Venda para cliente X', usuario: 'Maria Santos' },
  ],
  '2': [
    { id: '3', data: '2025-12-14', tipo: 'Entrada', quantidade: 5, observacao: 'Reabastecimento', usuario: 'Carlos Lima' },
    { id: '4', data: '2025-12-17', tipo: 'Saída', quantidade: 2, observacao: 'Uso interno', usuario: 'Ana Costa' },
  ],
  '3': [
    { id: '5', data: '2025-12-10', tipo: 'Entrada', quantidade: 5, observacao: 'Compra', usuario: 'João Silva' },
  ],
  '4': [
    { id: '6', data: '2025-12-12', tipo: 'Entrada', quantidade: 3, observacao: 'Compra', usuario: 'Maria Santos' },
  ],
  '5': [
    { id: '7', data: '2025-12-13', tipo: 'Entrada', quantidade: 12, observacao: 'Compra', usuario: 'Carlos Lima' },
  ],
  '6': [
    { id: '8', data: '2025-12-11', tipo: 'Entrada', quantidade: 5, observacao: 'Compra', usuario: 'Ana Costa' },
    { id: '9', data: '2025-12-18', tipo: 'Saída', quantidade: 5, observacao: 'Uso em projeto', usuario: 'João Silva' },
  ],
  '7': [
    { id: '10', data: '2025-12-09', tipo: 'Entrada', quantidade: 7, observacao: 'Compra', usuario: 'Maria Santos' },
  ],
  '8': [
    { id: '11', data: '2025-12-08', tipo: 'Entrada', quantidade: 20, observacao: 'Compra', usuario: 'Carlos Lima' },
  ],
  '9': [
    { id: '12', data: '2025-12-07', tipo: 'Entrada', quantidade: 2, observacao: 'Compra', usuario: 'Ana Costa' },
  ],
  '10': [
    { id: '13', data: '2025-12-06', tipo: 'Entrada', quantidade: 25, observacao: 'Compra', usuario: 'João Silva' },
  ],
  '11': [
    { id: '14', data: '2025-12-05', tipo: 'Entrada', quantidade: 10, observacao: 'Compra', usuario: 'Maria Santos' },
  ],
  '12': [
    { id: '15', data: '2025-12-04', tipo: 'Entrada', quantidade: 50, observacao: 'Compra', usuario: 'Carlos Lima' },
  ],
  '13': [
    { id: '16', data: '2025-12-03', tipo: 'Entrada', quantidade: 2, observacao: 'Aquisição frota', usuario: 'Ana Costa' },
    { id: '17', data: '2025-12-18', tipo: 'Saída', quantidade: 1, observacao: 'Manutenção programada', usuario: 'João Silva' },
  ],
};
