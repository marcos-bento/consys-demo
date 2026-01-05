export type EtapaNegocio = 'Novo' | 'Contato' | 'Proposta' | 'Negociação' | 'Fechado';
export type StatusNegocio = 'Ativo' | 'Ganho' | 'Perdido';
export type PrioridadeNegocio = 'Alta' | 'Média' | 'Baixa';

export interface Negocio {
  id: string;
  codigo: string;
  empresa: string;
  contato: string;
  telefone?: string;
  valor: number;
  responsavel: string;
  etapa: EtapaNegocio;
  status: StatusNegocio;
  prioridade: PrioridadeNegocio;
  funil: 'Vendas' | 'Pós-venda' | 'Parcerias';
  diasNoFunil: number;
  origem?: string;
  tags?: string[];
  motivoPerda?: string;
}

export const mockNegocios: Negocio[] = [
  {
    id: '1',
    codigo: 'NEG-001',
    empresa: 'Empresa A',
    contato: 'João Silva',
    telefone: '(11) 99999-0001',
    valor: 120000,
    responsavel: 'Ana Costa',
    etapa: 'Novo',
    status: 'Ativo',
    prioridade: 'Alta',
    funil: 'Vendas',
    diasNoFunil: 2,
    origem: 'Inbound',
    tags: ['ERP', 'Indústria'],
  },
  {
    id: '2',
    codigo: 'NEG-002',
    empresa: 'Tech Solutions',
    contato: 'Maria Santos',
    telefone: '(11) 98888-0002',
    valor: 85000,
    responsavel: 'Carlos Lima',
    etapa: 'Contato',
    status: 'Ativo',
    prioridade: 'Média',
    funil: 'Vendas',
    diasNoFunil: 5,
    origem: 'Outbound',
    tags: ['Software'],
  },
  {
    id: '3',
    codigo: 'NEG-003',
    empresa: 'Inovação Ltda',
    contato: 'Pedro Oliveira',
    telefone: '(21) 97777-0003',
    valor: 56000,
    responsavel: 'Ana Costa',
    etapa: 'Proposta',
    status: 'Ativo',
    prioridade: 'Alta',
    funil: 'Vendas',
    diasNoFunil: 8,
    origem: 'Indicação',
  },
  {
    id: '4',
    codigo: 'NEG-004',
    empresa: 'Global Corp',
    contato: 'Lucas Ferreira',
    telefone: '(31) 96666-0004',
    valor: 210000,
    responsavel: 'Carlos Lima',
    etapa: 'Negociação',
    status: 'Ativo',
    prioridade: 'Alta',
    funil: 'Vendas',
    diasNoFunil: 12,
    origem: 'Evento',
    tags: ['Key account'],
  },
  {
    id: '5',
    codigo: 'NEG-005',
    empresa: 'StartUp XYZ',
    contato: 'Fernanda Alves',
    telefone: '(41) 95555-0005',
    valor: 32000,
    responsavel: 'Ana Costa',
    etapa: 'Fechado',
    status: 'Ganho',
    prioridade: 'Média',
    funil: 'Vendas',
    diasNoFunil: 18,
  },
  {
    id: '6',
    codigo: 'NEG-006',
    empresa: 'Mega Industries',
    contato: 'Roberto Gomes',
    telefone: '(61) 94444-0006',
    valor: 47000,
    responsavel: 'Carlos Lima',
    etapa: 'Contato',
    status: 'Ativo',
    prioridade: 'Baixa',
    funil: 'Vendas',
    diasNoFunil: 3,
    tags: ['Follow-up'],
  },
  {
    id: '7',
    codigo: 'NEG-007',
    empresa: 'Future Tech',
    contato: 'Carla Mendes',
    telefone: '(51) 93333-0007',
    valor: 99000,
    responsavel: 'Ana Costa',
    etapa: 'Proposta',
    status: 'Ativo',
    prioridade: 'Alta',
    funil: 'Vendas',
    diasNoFunil: 9,
  },
  {
    id: '8',
    codigo: 'NEG-008',
    empresa: 'Alpha Beta',
    contato: 'Thiago Rocha',
    telefone: '(71) 92222-0008',
    valor: 150000,
    responsavel: 'Carlos Lima',
    etapa: 'Negociação',
    status: 'Ativo',
    prioridade: 'Média',
    funil: 'Vendas',
    diasNoFunil: 15,
  },
];
