export interface ItemProposta {
  produto: string;
  qtd: number;
  valorUnit: number;
}

export interface Proposta {
  id: string;
  codigo: string;
  cliente: string;
  status: 'Rascunho' | 'Enviada' | 'Aprovada' | 'Reprovada';
  data: string;
  itens: ItemProposta[];
  desconto: number;
}

export const mockPropostas: Proposta[] = [
  {
    id: '1',
    codigo: 'PROP-001',
    cliente: 'Empresa A',
    status: 'Aprovada',
    data: '2025-12-15',
    itens: [
      { produto: 'Serviço de Consultoria', qtd: 10, valorUnit: 500 },
      { produto: 'Licença Software', qtd: 5, valorUnit: 1000 },
    ],
    desconto: 500,
  },
  {
    id: '2',
    codigo: 'PROP-002',
    cliente: 'Tech Solutions',
    status: 'Enviada',
    data: '2025-12-16',
    itens: [
      { produto: 'Desenvolvimento Web', qtd: 1, valorUnit: 15000 },
    ],
    desconto: 0,
  },
  {
    id: '3',
    codigo: 'PROP-003',
    cliente: 'Inovação Ltda',
    status: 'Rascunho',
    data: '2025-12-17',
    itens: [
      { produto: 'Treinamento', qtd: 20, valorUnit: 200 },
      { produto: 'Suporte Técnico', qtd: 12, valorUnit: 300 },
    ],
    desconto: 1000,
  },
  {
    id: '4',
    codigo: 'PROP-004',
    cliente: 'Global Corp',
    status: 'Reprovada',
    data: '2025-12-18',
    itens: [
      { produto: 'Consultoria Estratégica', qtd: 5, valorUnit: 2000 },
    ],
    desconto: 200,
  },
  {
    id: '5',
    codigo: 'PROP-005',
    cliente: 'StartUp XYZ',
    status: 'Aprovada',
    data: '2025-12-19',
    itens: [
      { produto: 'Marketing Digital', qtd: 3, valorUnit: 5000 },
      { produto: 'SEO', qtd: 1, valorUnit: 8000 },
    ],
    desconto: 1500,
  },
  {
    id: '6',
    codigo: 'PROP-006',
    cliente: 'Mega Industries',
    status: 'Enviada',
    data: '2025-12-20',
    itens: [
      { produto: 'Sistema ERP', qtd: 1, valorUnit: 50000 },
    ],
    desconto: 2500,
  },
  {
    id: '7',
    codigo: 'PROP-007',
    cliente: 'Future Tech',
    status: 'Rascunho',
    data: '2025-12-21',
    itens: [
      { produto: 'App Mobile', qtd: 2, valorUnit: 25000 },
    ],
    desconto: 0,
  },
  {
    id: '8',
    codigo: 'PROP-008',
    cliente: 'Alpha Beta',
    status: 'Aprovada',
    data: '2025-12-22',
    itens: [
      { produto: 'Auditoria de Segurança', qtd: 1, valorUnit: 12000 },
      { produto: 'Certificação', qtd: 5, valorUnit: 800 },
    ],
    desconto: 800,
  },
];