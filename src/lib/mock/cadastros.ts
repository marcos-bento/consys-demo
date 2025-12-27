export type TipoPessoa = 'PJ' | 'PF';

export type StatusCadastro = 'Ativo' | 'Inativo';

export type Cliente = {
  id: string;
  tipo: TipoPessoa;
  razaoSocial?: string;
  nome?: string;
  nomeFantasia?: string;
  cnpj?: string;
  cpf?: string;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
  status: StatusCadastro;
  dataCriacao: string;
};

export type Fornecedor = {
  id: string;
  razaoSocial: string;
  cnpj: string;
  categoria: string;
  contato: string;
  email: string;
  telefone: string;
  status: StatusCadastro;
  dataCriacao: string;
};

export type Produto = {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  unidade: string;
  precoBase: number;
  controladoEstoque: boolean;
  status: StatusCadastro;
  dataCriacao: string;
};

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: 'Admin' | 'Comercial' | 'Financeiro' | 'Operacional';
  status: StatusCadastro;
  dataCriacao: string;
};

export type Categoria = {
  id: string;
  nome: string;
  tipo: 'Produto' | 'Fornecedor' | 'CentroCusto';
  status: StatusCadastro;
  dataCriacao: string;
};

export const clientesMock: Cliente[] = [
  {
    id: '1',
    tipo: 'PJ',
    razaoSocial: 'Tech Solutions Ltda',
    nomeFantasia: 'Tech Solutions',
    cnpj: '12.345.678/0001-90',
    email: 'contato@techsolutions.com',
    telefone: '(11) 99999-0000',
    cidade: 'São Paulo',
    uf: 'SP',
    status: 'Ativo',
    dataCriacao: '2024-01-15',
  },
  {
    id: '2',
    tipo: 'PF',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao.silva@email.com',
    telefone: '(21) 98888-1111',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    status: 'Ativo',
    dataCriacao: '2024-02-20',
  },
];

export const fornecedoresMock: Fornecedor[] = [
  {
    id: '1',
    razaoSocial: 'Fornecedor X Ltda',
    cnpj: '98.765.432/0001-10',
    categoria: 'Matéria-prima',
    contato: 'Marcos Silva',
    email: 'marcos@fornecedorx.com',
    telefone: '(11) 91234-5678',
    status: 'Ativo',
    dataCriacao: '2024-01-10',
  },
  {
    id: '2',
    razaoSocial: 'Distribuidora Y',
    cnpj: '87.654.321/0001-20',
    categoria: 'Serviços',
    contato: 'Fernanda Lima',
    email: 'fernanda@distribuidoray.com',
    telefone: '(31) 99876-5432',
    status: 'Ativo',
    dataCriacao: '2024-03-05',
  },
];

export const produtosMock: Produto[] = [
  {
    id: '1',
    nome: 'Mesa de reunião',
    codigo: 'MES-001',
    categoria: 'Mobiliário',
    unidade: 'un',
    precoBase: 2500.00,
    controladoEstoque: true,
    status: 'Ativo',
    dataCriacao: '2024-01-20',
  },
  {
    id: '2',
    nome: 'Cadeira ergonômica',
    codigo: 'CAD-010',
    categoria: 'Mobiliário',
    unidade: 'un',
    precoBase: 800.00,
    controladoEstoque: true,
    status: 'Ativo',
    dataCriacao: '2024-02-10',
  },
];

export const usuariosMock: Usuario[] = [
  {
    id: '1',
    nome: 'Ana Costa',
    email: 'ana.costa@consys.com',
    perfil: 'Admin',
    status: 'Ativo',
    dataCriacao: '2024-01-01',
  },
  {
    id: '2',
    nome: 'Carlos Santos',
    email: 'carlos.santos@consys.com',
    perfil: 'Comercial',
    status: 'Ativo',
    dataCriacao: '2024-01-05',
  },
];

export const categoriasMock: Categoria[] = [
  {
    id: '1',
    nome: 'Mobiliário',
    tipo: 'Produto',
    status: 'Ativo',
    dataCriacao: '2024-01-01',
  },
  {
    id: '2',
    nome: 'Matéria-prima',
    tipo: 'Fornecedor',
    status: 'Ativo',
    dataCriacao: '2024-01-01',
  },
  {
    id: '3',
    nome: 'TI',
    tipo: 'CentroCusto',
    status: 'Ativo',
    dataCriacao: '2024-01-01',
  },
];