export type StatusCandidato = 'Novo' | 'Triagem' | 'Entrevista' | 'Teste' | 'Aprovado' | 'Reprovado';

export type StatusFerias = 'Planejada' | 'Em gozo' | 'Finalizada' | 'Cancelada';

export type TipoArquivoPonto = 'CSV' | 'XLSX';

export interface Candidato {
  id: string;
  nome: string;
  vaga: string;
  telefone: string;
  email: string;
  cidade: string;
  pretensaoSalarial?: number;
  observacoes?: string;
  curriculoUrl?: string;
  status: StatusCandidato;
  responsavelId: string;
  dataInscricao: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotaCandidato {
  id: string;
  candidatoId: string;
  texto: string;
  data: string;
  responsavelId: string;
}

export interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  dataAdmissao: string;
  valorHora: number;
  jornadaDiaria: number; // horas
  status: 'Ativo' | 'Inativo' | 'Férias' | 'Licença';
  createdAt: string;
  updatedAt: string;
}

export interface Ferias {
  id: string;
  colaboradorId: string;
  dataInicio: string;
  dias: number;
  periodoAquisitivoInicio: string;
  periodoAquisitivoFim: string;
  periodoConcessivoInicio: string;
  periodoConcessivoFim: string;
  dataLimiteGozo: string;
  dataRetorno: string;
  abonoPecuniario: boolean;
  decimoTerceiro: boolean;
  status: StatusFerias;
  createdAt: string;
  updatedAt: string;
}

export interface RegistroPonto {
  id: string;
  colaboradorId: string;
  data: string;
  entrada?: string; // HH:MM
  saida?: string; // HH:MM
  intervalo?: number; // minutos
  totalHoras?: number; // horas trabalhadas no dia
  horasExtras?: number; // positivas ou negativas
  observacoes?: string;
}

export interface ImportacaoPonto {
  id: string;
  colaboradorId: string;
  arquivoNome: string;
  tipoArquivo: TipoArquivoPonto;
  periodoInicio: string;
  periodoFim: string;
  registros: RegistroPonto[];
  jornadaPadrao: number; // horas diárias
  intervaloPadrao: number; // minutos
  bancoHoras: boolean;
  totalHorasTrabalhadas: number;
  totalHorasExtras: number;
  totalFaltas: number;
  createdAt: string;
}

// Dados mock
export const mockColaboradores: Colaborador[] = [
  {
    id: '1',
    nome: 'João Silva',
    cargo: 'Desenvolvedor Full Stack',
    dataAdmissao: '2023-01-15',
    valorHora: 25.00,
    jornadaDiaria: 8,
    status: 'Ativo',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-01-15T10:00:00Z',
  },
  {
    id: '2',
    nome: 'Maria Santos',
    cargo: 'Analista de RH',
    dataAdmissao: '2022-06-01',
    valorHora: 22.00,
    jornadaDiaria: 8,
    status: 'Ativo',
    createdAt: '2022-06-01T10:00:00Z',
    updatedAt: '2022-06-01T10:00:00Z',
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    cargo: 'Designer UX/UI',
    dataAdmissao: '2023-03-10',
    valorHora: 28.00,
    jornadaDiaria: 8,
    status: 'Ativo',
    createdAt: '2023-03-10T10:00:00Z',
    updatedAt: '2023-03-10T10:00:00Z',
  },
];

export const mockCandidatos: Candidato[] = [
  {
    id: '1',
    nome: 'Ana Oliveira',
    vaga: 'Desenvolvedor Frontend',
    telefone: '(11) 99999-1111',
    email: 'ana.oliveira@email.com',
    cidade: 'São Paulo',
    pretensaoSalarial: 4500,
    observacoes: 'Experiência sólida em React e TypeScript',
    curriculoUrl: 'curriculo-ana.pdf',
    status: 'Entrevista',
    responsavelId: '2', // Maria Santos (RH)
    dataInscricao: '2024-12-20',
    createdAt: '2024-12-20T14:00:00Z',
    updatedAt: '2024-12-25T10:00:00Z',
  },
  {
    id: '2',
    nome: 'Carlos Mendes',
    vaga: 'Analista de Sistemas',
    telefone: '(11) 88888-2222',
    email: 'carlos.mendes@email.com',
    cidade: 'São Paulo',
    pretensaoSalarial: 3800,
    observacoes: 'Formado em Sistemas de Informação, experiência em Java',
    status: 'Triagem',
    responsavelId: '2',
    dataInscricao: '2024-12-22',
    createdAt: '2024-12-22T09:00:00Z',
    updatedAt: '2024-12-22T09:00:00Z',
  },
  {
    id: '3',
    nome: 'Fernanda Lima',
    vaga: 'Designer UX/UI',
    telefone: '(11) 77777-3333',
    email: 'fernanda.lima@email.com',
    cidade: 'São Paulo',
    pretensaoSalarial: 4200,
    observacoes: 'Portfólio impressionante, experiência em Figma e Adobe XD',
    curriculoUrl: 'curriculo-fernanda.pdf',
    status: 'Teste',
    responsavelId: '2',
    dataInscricao: '2024-12-18',
    createdAt: '2024-12-18T16:00:00Z',
    updatedAt: '2024-12-24T11:00:00Z',
  },
];

export const mockNotasCandidatos: NotaCandidato[] = [
  {
    id: '1',
    candidatoId: '1',
    texto: 'Entrevista realizada - Excelente conhecimento técnico, boa comunicação',
    data: '2024-12-25T10:00:00Z',
    responsavelId: '2',
  },
  {
    id: '2',
    candidatoId: '3',
    texto: 'Teste prático enviado - Aguardando entrega',
    data: '2024-12-24T11:00:00Z',
    responsavelId: '2',
  },
];

export const mockFerias: Ferias[] = [
  {
    id: '1',
    colaboradorId: '1',
    dataInicio: '2025-01-15',
    dias: 15,
    periodoAquisitivoInicio: '2024-01-15',
    periodoAquisitivoFim: '2025-01-14',
    periodoConcessivoInicio: '2024-07-15',
    periodoConcessivoFim: '2025-07-14',
    dataLimiteGozo: '2025-07-14',
    dataRetorno: '2025-01-30',
    abonoPecuniario: false,
    decimoTerceiro: false,
    status: 'Planejada',
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
];

export const mockRegistrosPonto: RegistroPonto[] = [
  {
    id: '1',
    colaboradorId: '1',
    data: '2024-12-20',
    entrada: '08:00',
    saida: '18:00',
    intervalo: 60,
    totalHoras: 9,
    horasExtras: 1,
  },
  {
    id: '2',
    colaboradorId: '1',
    data: '2024-12-21',
    entrada: '08:30',
    saida: '17:30',
    intervalo: 60,
    totalHoras: 8,
    horasExtras: 0,
  },
];

export const mockImportacoesPonto: ImportacaoPonto[] = [
  {
    id: '1',
    colaboradorId: '1',
    arquivoNome: 'ponto_dezembro_2024.csv',
    tipoArquivo: 'CSV',
    periodoInicio: '2024-12-01',
    periodoFim: '2024-12-31',
    registros: mockRegistrosPonto,
    jornadaPadrao: 8,
    intervaloPadrao: 60,
    bancoHoras: true,
    totalHorasTrabalhadas: 17,
    totalHorasExtras: 1,
    totalFaltas: 0,
    createdAt: '2024-12-26T14:00:00Z',
  },
];