export type DocumentoTipo = 'Proposta' | 'Documento de custo' | 'Contrato' | 'Outros';
export type DocumentoStatus = 'Rascunho' | 'Emitido' | 'Enviado' | 'Assinado' | 'Cancelado';

export interface DocumentoItem {
  descricao: string;
  qtd: number;
  valorUnit: number;
}

export interface Documento {
  id: string;
  codigo: string;
  cliente: string;
  tipo: DocumentoTipo;
  titulo: string;
  descricao?: string;
  data: string; // ISO
  status: DocumentoStatus;
  responsavel: string;
  itens?: DocumentoItem[];
  observacoes?: string;
  origem?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const mockDocumentosBase: Documento[] = [
  {
    id: 'd1',
    codigo: 'DOC-001',
    cliente: 'Global Corp',
    tipo: 'Documento de custo',
    titulo: 'Estimativa de implantação',
    descricao: 'Custos de serviços e licenças',
    data: '2025-12-10',
    status: 'Emitido',
    responsavel: 'Carlos Lima',
    itens: [
      { descricao: 'Serviços profissionais', qtd: 1, valorUnit: 45000 },
      { descricao: 'Licenças anuais', qtd: 1, valorUnit: 28000 },
    ],
    observacoes: 'Valores em BRL, válidos por 30 dias.',
    origem: 'Financeiro',
    createdAt: '2025-12-10',
    updatedAt: '2025-12-11',
  },
  {
    id: 'd2',
    codigo: 'DOC-002',
    cliente: 'Alpha Beta',
    tipo: 'Contrato',
    titulo: 'Contrato de prestação de serviços',
    descricao: 'Contrato padrão 12 meses',
    data: '2025-12-15',
    status: 'Enviado',
    responsavel: 'Ana Costa',
    observacoes: 'Aguardando assinatura digital.',
    origem: 'Jurídico',
    createdAt: '2025-12-15',
    updatedAt: '2025-12-16',
  },
  {
    id: 'd3',
    codigo: 'DOC-003',
    cliente: 'Tech Solutions',
    tipo: 'Outros',
    titulo: 'NDA',
    descricao: 'Acordo de confidencialidade',
    data: '2025-12-05',
    status: 'Assinado',
    responsavel: 'Ana Costa',
    origem: 'Comercial',
    createdAt: '2025-12-05',
    updatedAt: '2025-12-05',
  },
];
