export type TipoVeiculo = 'Van' | 'Caminhão' | 'Utilitário' | 'Carro';

export type StatusVeiculo = 'Ativo' | 'Em manutenção' | 'Inativo';

export type TipoAgendamento = 'Entrega' | 'Coleta' | 'Visita técnica' | 'Outro';

export type StatusAgendamento = 'Programado' | 'Em rota' | 'Concluído' | 'Cancelado';

export type StatusOS = 'Gerada' | 'Em andamento' | 'Concluída' | 'Cancelada';

export interface Veiculo {
  id: string;
  apelido: string;
  placa: string;
  tipo: TipoVeiculo;
  modelo: string;
  capacidade?: string; // ex: "10 m³" ou "2.500 kg"
  status: StatusVeiculo;
  responsavelId: string; // ID do motorista/responsável
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agendamento {
  id: string;
  veiculoId: string;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFim?: string; // HH:MM
  tipo: TipoAgendamento;
  clienteId: string;
  endereco: string;
  documentoVinculado?: string; // ID do documento/projeto
  observacao?: string;
  responsavelId: string;
  status: StatusAgendamento;
  createdAt: string;
  updatedAt: string;
}

export interface OrdemServico {
  id: string;
  codigo: string; // OS-000123
  veiculoId: string;
  motoristaId: string;
  data: string; // YYYY-MM-DD
  agendamentos: string[]; // IDs dos agendamentos incluídos
  status: StatusOS;
  createdAt: string;
  updatedAt: string;
}

// Dados mock
export const mockVeiculos: Veiculo[] = [
  {
    id: '1',
    apelido: 'Van 01',
    placa: 'ABC-1234',
    tipo: 'Van',
    modelo: 'Fiat Ducato',
    capacidade: '10 m³',
    status: 'Ativo',
    responsavelId: '1', // João Silva
    observacoes: 'Veículo principal para entregas na região metropolitana',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    apelido: 'Caminhão 01',
    placa: 'DEF-5678',
    tipo: 'Caminhão',
    modelo: 'Mercedes-Benz Actros',
    capacidade: '25 m³',
    status: 'Ativo',
    responsavelId: '2', // Maria Santos
    observacoes: 'Caminhão para cargas pesadas',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    apelido: 'Utilitário 01',
    placa: 'GHI-9012',
    tipo: 'Utilitário',
    modelo: 'Fiat Strada',
    capacidade: '800 kg',
    status: 'Em manutenção',
    responsavelId: '3', // Pedro Costa
    observacoes: 'Em manutenção preventiva - revisão geral',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
  {
    id: '4',
    apelido: 'Carro Executivo',
    placa: 'JKL-3456',
    tipo: 'Carro',
    modelo: 'Toyota Corolla',
    status: 'Ativo',
    responsavelId: '4', // Ana Oliveira
    observacoes: 'Veículo para visitas técnicas e reuniões',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
];

export const mockAgendamentos: Agendamento[] = [
  {
    id: '1',
    veiculoId: '1',
    data: '2024-12-27',
    horaInicio: '08:00',
    horaFim: '10:00',
    tipo: 'Entrega',
    clienteId: '1', // Empresa ABC Ltda
    endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    documentoVinculado: 'PROP-001',
    observacao: 'Entrega de equipamentos de escritório',
    responsavelId: '1',
    status: 'Programado',
    createdAt: '2024-12-26T14:00:00Z',
    updatedAt: '2024-12-26T14:00:00Z',
  },
  {
    id: '2',
    veiculoId: '1',
    data: '2024-12-27',
    horaInicio: '14:00',
    horaFim: '16:00',
    tipo: 'Coleta',
    clienteId: '2', // Tech Solutions
    endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    documentoVinculado: 'PED-002',
    observacao: 'Coleta de equipamentos para manutenção',
    responsavelId: '1',
    status: 'Programado',
    createdAt: '2024-12-26T15:00:00Z',
    updatedAt: '2024-12-26T15:00:00Z',
  },
  {
    id: '3',
    veiculoId: '2',
    data: '2024-12-27',
    horaInicio: '09:00',
    horaFim: '12:00',
    tipo: 'Entrega',
    clienteId: '3', // ConstruTech
    endereco: 'Rua dos Construtores, 456 - Industrial, São Paulo - SP',
    documentoVinculado: 'PROP-003',
    observacao: 'Entrega de materiais de construção',
    responsavelId: '2',
    status: 'Em rota',
    createdAt: '2024-12-26T16:00:00Z',
    updatedAt: '2024-12-27T09:30:00Z',
  },
  {
    id: '4',
    veiculoId: '4',
    data: '2024-12-28',
    horaInicio: '10:00',
    horaFim: '11:00',
    tipo: 'Visita técnica',
    clienteId: '4', // DataCorp
    endereco: 'Rua da Tecnologia, 789 - Vila Olímpia, São Paulo - SP',
    observacao: 'Instalação de sistema de backup',
    responsavelId: '4',
    status: 'Programado',
    createdAt: '2024-12-27T10:00:00Z',
    updatedAt: '2024-12-27T10:00:00Z',
  },
];

export const mockOrdensServico: OrdemServico[] = [
  {
    id: '1',
    codigo: 'OS-000001',
    veiculoId: '1',
    motoristaId: '1',
    data: '2024-12-27',
    agendamentos: ['1', '2'],
    status: 'Gerada',
    createdAt: '2024-12-27T07:00:00Z',
    updatedAt: '2024-12-27T07:00:00Z',
  },
  {
    id: '2',
    codigo: 'OS-000002',
    veiculoId: '2',
    motoristaId: '2',
    data: '2024-12-27',
    agendamentos: ['3'],
    status: 'Em andamento',
    createdAt: '2024-12-27T08:00:00Z',
    updatedAt: '2024-12-27T09:30:00Z',
  },
];