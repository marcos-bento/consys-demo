export interface Assistencia {
  id: string;
  protocolo: string;
  cliente: string;
  clienteId: string;
  tipo: 'Montagem' | 'Manutenção' | 'Garantia' | 'Ajuste' | 'Outros';
  prioridade: 'Baixa' | 'Média' | 'Alta';
  etapa: 'Nova' | 'Em análise' | 'Agendada' | 'Em execução' | 'Concluída' | 'Cancelada';
  responsavel: string;
  responsavelId: string;
  descricao: string;
  endereco?: string;
  dataAbertura: string;
  dataAgendamento?: string;
  dataConclusao?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoricoAssistencia {
  id: string;
  assistenciaId: string;
  tipo: 'Criada' | 'Agendada' | 'Iniciada' | 'Concluída' | 'Cancelada' | 'Observação';
  descricao: string;
  usuario: string;
  data: string;
}

export interface AnexoAssistencia {
  id: string;
  assistenciaId: string;
  nome: string;
  tipo: string;
  tamanho: number;
  dataUpload: string;
}

export const mockAssistencias: Assistencia[] = [
  {
    id: '1',
    protocolo: 'AST-000001',
    cliente: 'Empresa A',
    clienteId: '1',
    tipo: 'Manutenção',
    prioridade: 'Alta',
    etapa: 'Nova',
    responsavel: 'Carlos Lima',
    responsavelId: '2',
    descricao: 'Equipamento apresentando falha no sistema de refrigeração',
    endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    dataAbertura: '2024-12-20',
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
  {
    id: '2',
    protocolo: 'AST-000002',
    cliente: 'Tech Solutions',
    clienteId: '2',
    tipo: 'Montagem',
    prioridade: 'Média',
    etapa: 'Em análise',
    responsavel: 'Ana Costa',
    responsavelId: '1',
    descricao: 'Instalação de novo sistema de climatização',
    endereco: 'Av. Paulista, 456 - Bela Vista, São Paulo - SP',
    dataAbertura: '2024-12-19',
    dataAgendamento: '2024-12-25',
    createdAt: '2024-12-19T14:30:00Z',
    updatedAt: '2024-12-21T09:15:00Z',
  },
  {
    id: '3',
    protocolo: 'AST-000003',
    cliente: 'Inovação Ltda',
    clienteId: '3',
    tipo: 'Garantia',
    prioridade: 'Baixa',
    etapa: 'Agendada',
    responsavel: 'Carlos Lima',
    responsavelId: '2',
    descricao: 'Verificação de garantia - equipamento com 6 meses de uso',
    endereco: 'Rua do Comércio, 789 - Vila Madalena, São Paulo - SP',
    dataAbertura: '2024-12-18',
    dataAgendamento: '2024-12-24',
    createdAt: '2024-12-18T16:45:00Z',
    updatedAt: '2024-12-22T11:20:00Z',
  },
  {
    id: '4',
    protocolo: 'AST-000004',
    cliente: 'Global Corp',
    clienteId: '4',
    tipo: 'Ajuste',
    prioridade: 'Média',
    etapa: 'Em execução',
    responsavel: 'Ana Costa',
    responsavelId: '1',
    descricao: 'Calibração de sensores de temperatura',
    endereco: 'Rua dos Pinheiros, 321 - Pinheiros, São Paulo - SP',
    dataAbertura: '2024-12-17',
    dataAgendamento: '2024-12-23',
    createdAt: '2024-12-17T08:15:00Z',
    updatedAt: '2024-12-23T13:45:00Z',
  },
  {
    id: '5',
    protocolo: 'AST-000005',
    cliente: 'StartUp XYZ',
    clienteId: '5',
    tipo: 'Manutenção',
    prioridade: 'Alta',
    etapa: 'Concluída',
    responsavel: 'Carlos Lima',
    responsavelId: '2',
    descricao: 'Reparo emergencial no sistema elétrico',
    endereco: 'Av. Brigadeiro Faria Lima, 654 - Itaim Bibi, São Paulo - SP',
    dataAbertura: '2024-12-15',
    dataAgendamento: '2024-12-20',
    dataConclusao: '2024-12-22',
    createdAt: '2024-12-15T12:00:00Z',
    updatedAt: '2024-12-22T17:30:00Z',
  },
  {
    id: '6',
    protocolo: 'AST-000006',
    cliente: 'Mega Industries',
    clienteId: '6',
    tipo: 'Outros',
    prioridade: 'Baixa',
    etapa: 'Cancelada',
    responsavel: 'Ana Costa',
    responsavelId: '1',
    descricao: 'Consulta técnica sobre compatibilidade de equipamentos',
    endereco: 'Rua da Consolação, 987 - Consolação, São Paulo - SP',
    dataAbertura: '2024-12-14',
    createdAt: '2024-12-14T09:30:00Z',
    updatedAt: '2024-12-21T15:20:00Z',
  },
  {
    id: '7',
    protocolo: 'AST-000007',
    cliente: 'Future Tech',
    clienteId: '7',
    tipo: 'Montagem',
    prioridade: 'Média',
    etapa: 'Nova',
    responsavel: 'Carlos Lima',
    responsavelId: '2',
    descricao: 'Instalação de sistema de monitoramento',
    endereco: 'Rua Augusta, 147 - Jardins, São Paulo - SP',
    dataAbertura: '2024-12-21',
    createdAt: '2024-12-21T11:15:00Z',
    updatedAt: '2024-12-21T11:15:00Z',
  },
  {
    id: '8',
    protocolo: 'AST-000008',
    cliente: 'Alpha Beta',
    clienteId: '8',
    tipo: 'Manutenção',
    prioridade: 'Alta',
    etapa: 'Em análise',
    responsavel: 'Ana Costa',
    responsavelId: '1',
    descricao: 'Falha crítica no sistema de backup',
    endereco: 'Av. Rebouças, 258 - Pinheiros, São Paulo - SP',
    dataAbertura: '2024-12-20',
    createdAt: '2024-12-20T15:45:00Z',
    updatedAt: '2024-12-22T08:30:00Z',
  },
];

export const mockHistoricoAssistencias: HistoricoAssistencia[] = [
  {
    id: '1',
    assistenciaId: '1',
    tipo: 'Criada',
    descricao: 'Assistência criada',
    usuario: 'Sistema',
    data: '2024-12-20T10:00:00Z',
  },
  {
    id: '2',
    assistenciaId: '2',
    tipo: 'Criada',
    descricao: 'Assistência criada',
    usuario: 'Sistema',
    data: '2024-12-19T14:30:00Z',
  },
  {
    id: '3',
    assistenciaId: '2',
    tipo: 'Agendada',
    descricao: 'Agendamento definido para 25/12/2024',
    usuario: 'Ana Costa',
    data: '2024-12-21T09:15:00Z',
  },
  {
    id: '4',
    assistenciaId: '3',
    tipo: 'Criada',
    descricao: 'Assistência criada',
    usuario: 'Sistema',
    data: '2024-12-18T16:45:00Z',
  },
  {
    id: '5',
    assistenciaId: '3',
    tipo: 'Agendada',
    descricao: 'Agendamento definido para 24/12/2024',
    usuario: 'Carlos Lima',
    data: '2024-12-22T11:20:00Z',
  },
  {
    id: '6',
    assistenciaId: '4',
    tipo: 'Criada',
    descricao: 'Assistência criada',
    usuario: 'Sistema',
    data: '2024-12-17T08:15:00Z',
  },
  {
    id: '7',
    assistenciaId: '4',
    tipo: 'Agendada',
    descricao: 'Agendamento definido para 23/12/2024',
    usuario: 'Ana Costa',
    data: '2024-12-20T10:30:00Z',
  },
  {
    id: '8',
    assistenciaId: '4',
    tipo: 'Iniciada',
    descricao: 'Serviço iniciado',
    usuario: 'Ana Costa',
    data: '2024-12-23T13:45:00Z',
  },
  {
    id: '9',
    assistenciaId: '5',
    tipo: 'Criada',
    descricao: 'Assistência criada',
    usuario: 'Sistema',
    data: '2024-12-15T12:00:00Z',
  },
  {
    id: '10',
    assistenciaId: '5',
    tipo: 'Agendada',
    descricao: 'Agendamento definido para 20/12/2024',
    usuario: 'Carlos Lima',
    data: '2024-12-18T14:20:00Z',
  },
  {
    id: '11',
    assistenciaId: '5',
    tipo: 'Iniciada',
    descricao: 'Serviço iniciado',
    usuario: 'Carlos Lima',
    data: '2024-12-20T08:00:00Z',
  },
  {
    id: '12',
    assistenciaId: '5',
    tipo: 'Concluída',
    descricao: 'Serviço concluído com sucesso',
    usuario: 'Carlos Lima',
    data: '2024-12-22T17:30:00Z',
  },
  {
    id: '13',
    assistenciaId: '6',
    tipo: 'Criada',
    descricao: 'Assistência criada',
    usuario: 'Sistema',
    data: '2024-12-14T09:30:00Z',
  },
  {
    id: '14',
    assistenciaId: '6',
    tipo: 'Cancelada',
    descricao: 'Cancelada por solicitação do cliente',
    usuario: 'Ana Costa',
    data: '2024-12-21T15:20:00Z',
  },
];

export const mockAnexosAssistencias: AnexoAssistencia[] = [
  {
    id: '1',
    assistenciaId: '2',
    nome: 'foto_equipamento.jpg',
    tipo: 'image/jpeg',
    tamanho: 2048576,
    dataUpload: '2024-12-21T09:15:00Z',
  },
  {
    id: '2',
    assistenciaId: '4',
    nome: 'manual_calibracao.pdf',
    tipo: 'application/pdf',
    tamanho: 1572864,
    dataUpload: '2024-12-23T13:45:00Z',
  },
  {
    id: '3',
    assistenciaId: '5',
    nome: 'relatorio_reparo.pdf',
    tipo: 'application/pdf',
    tamanho: 1048576,
    dataUpload: '2024-12-22T17:30:00Z',
  },
];