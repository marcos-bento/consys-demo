export type StatusCompra = 'Requisição' | 'Cotação' | 'Pedido' | 'Recebido' | 'Cancelado';
export type TipoCompra = 'Requisição' | 'Pedido';

export interface ItemCompra {
  produto: string;
  quantidade: number;
  valorUnit?: number;
  observacao?: string;
  fornecedorSugerido?: string;
}

export interface EventoCompra {
  data: string;
  descricao: string;
}

export interface Compra {
  id: string;
  codigo: string;
  tipo: TipoCompra;
  status: StatusCompra;
  fornecedor: string;
  solicitante: string;
  data: string; // ISO
  valorEstimado: number;
  centroCusto?: string;
  itens: ItemCompra[];
  historico: EventoCompra[];
}

export const mockCompras: Compra[] = [
  {
    id: 'c1',
    codigo: 'COMP-001',
    tipo: 'Pedido',
    status: 'Pedido',
    fornecedor: 'Alpha Supplies',
    solicitante: 'Ana Costa',
    data: '2025-12-18',
    valorEstimado: 12500,
    centroCusto: 'Operações',
    itens: [
      { produto: 'Cadeiras ergonômicas', quantidade: 20, valorUnit: 350, fornecedorSugerido: 'Alpha Supplies' },
      { produto: 'Mesas retangulares', quantidade: 10, valorUnit: 750 },
    ],
    historico: [
      { data: '2025-12-15', descricao: 'Requisição criada' },
      { data: '2025-12-16', descricao: 'Enviado para cotação' },
      { data: '2025-12-18', descricao: 'Pedido gerado' },
    ],
  },
  {
    id: 'c2',
    codigo: 'COMP-002',
    tipo: 'Requisição',
    status: 'Cotação',
    fornecedor: 'Fornecedor TBD',
    solicitante: 'Carlos Lima',
    data: '2025-12-20',
    valorEstimado: 5800,
    centroCusto: 'TI',
    itens: [
      { produto: 'Monitores 27"', quantidade: 5, observacao: 'IPS', fornecedorSugerido: 'TechParts' },
      { produto: 'Dock stations', quantidade: 5 },
    ],
    historico: [
      { data: '2025-12-20', descricao: 'Requisição criada' },
      { data: '2025-12-21', descricao: 'Enviado para cotação' },
    ],
  },
  {
    id: 'c3',
    codigo: 'COMP-003',
    tipo: 'Pedido',
    status: 'Recebido',
    fornecedor: 'OfficeMax',
    solicitante: 'Ana Costa',
    data: '2025-12-08',
    valorEstimado: 3200,
    centroCusto: 'Financeiro',
    itens: [
      { produto: 'Cartuchos de tinta', quantidade: 15, valorUnit: 80 },
      { produto: 'Papel A4', quantidade: 30, valorUnit: 25 },
    ],
    historico: [
      { data: '2025-12-05', descricao: 'Requisição criada' },
      { data: '2025-12-06', descricao: 'Pedido gerado' },
      { data: '2025-12-08', descricao: 'Recebido' },
    ],
  },
];
