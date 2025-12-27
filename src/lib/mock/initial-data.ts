import { mockLeads, type Lead } from './crm';
import { mockPropostas, type Proposta } from './comercial';
import { mockProdutos, mockMovimentacoes, type Movimentacao, type Produto } from './estoque';
import { mockLancamentos, type Lancamento } from './financeiro';
import { mockNegocios, type Negocio } from './negocios';
import { mockDocumentosBase, type Documento } from './documentos';
import { mockCompras, type Compra } from './compras';
import { clientesMock, fornecedoresMock, produtosMock, usuariosMock, categoriasMock, type Cliente, type Fornecedor, type Produto as ProdutoCadastro, type Usuario, type Categoria } from './cadastros';
import { mockAssistencias, mockHistoricoAssistencias, mockAnexosAssistencias, type Assistencia, type HistoricoAssistencia, type AnexoAssistencia } from './assistencias';
import { mockVeiculos, mockAgendamentos, mockOrdensServico, type Veiculo, type Agendamento, type OrdemServico } from './frota';
import { mockCandidatos, mockNotasCandidatos, mockColaboradores, mockFerias, mockRegistrosPonto, mockImportacoesPonto, type Candidato, type NotaCandidato, type Colaborador, type Ferias, type RegistroPonto, type ImportacaoPonto } from './dep-pessoal';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const getInitialLeads = (): Lead[] => clone(mockLeads);
export const getInitialPropostas = (): Proposta[] => clone(mockPropostas);
export const getInitialProdutos = (): Produto[] => clone(mockProdutos);
export const getInitialMovimentacoes = (): Record<string, Movimentacao[]> =>
  clone(mockMovimentacoes);
export const getInitialLancamentos = (): Lancamento[] => clone(mockLancamentos);
export const getInitialNegocios = (): Negocio[] => clone(mockNegocios);
export const getInitialDocumentos = (propostas: Proposta[] = mockPropostas): Documento[] => {
  const mappedFromPropostas: Documento[] = propostas.map((proposta) => ({
    id: `p-${proposta.id}`,
    codigo: proposta.codigo,
    cliente: proposta.cliente,
    tipo: 'Proposta',
    titulo: `Proposta - ${proposta.cliente}`,
    descricao: 'Documento gerado pelo módulo Comercial',
    data: proposta.data,
    status:
      proposta.status === 'Rascunho'
        ? 'Rascunho'
        : proposta.status === 'Enviada'
          ? 'Enviado'
          : proposta.status === 'Aprovada'
            ? 'Assinado'
            : 'Cancelado',
    responsavel: 'Equipe Comercial',
    itens: proposta.itens.map((item) => ({
      descricao: item.produto,
      qtd: item.qtd,
      valorUnit: item.valorUnit,
    })),
    observacoes: proposta.desconto ? `Desconto aplicado: ${proposta.desconto}` : undefined,
    origem: 'Comercial',
    createdAt: proposta.data,
    updatedAt: proposta.data,
  }));
  return [...mappedFromPropostas, ...clone(mockDocumentosBase)];
};
export const getInitialCompras = (): Compra[] => clone(mockCompras);
export const getInitialClientes = (): Cliente[] => clone(clientesMock);
export const getInitialFornecedores = (): Fornecedor[] => clone(fornecedoresMock);
export const getInitialProdutosCadastro = (): ProdutoCadastro[] => clone(produtosMock);
export const getInitialUsuarios = (): Usuario[] => clone(usuariosMock);
export const getInitialCategorias = (): Categoria[] => clone(categoriasMock);
export const getInitialAssistencias = (): Assistencia[] => clone(mockAssistencias);
export const getInitialHistoricoAssistencias = (): HistoricoAssistencia[] => clone(mockHistoricoAssistencias);
export const getInitialAnexosAssistencias = (): AnexoAssistencia[] => clone(mockAnexosAssistencias);
export const getInitialVeiculos = (): Veiculo[] => clone(mockVeiculos);
export const getInitialAgendamentos = (): Agendamento[] => clone(mockAgendamentos);
export const getInitialOrdensServico = (): OrdemServico[] => clone(mockOrdensServico);
export const getInitialCandidatos = (): Candidato[] => clone(mockCandidatos);
export const getInitialNotasCandidatos = (): NotaCandidato[] => clone(mockNotasCandidatos);
export const getInitialColaboradores = (): Colaborador[] => clone(mockColaboradores);
export const getInitialFerias = (): Ferias[] => clone(mockFerias);
export const getInitialRegistrosPonto = (): RegistroPonto[] => clone(mockRegistrosPonto);
export const getInitialImportacoesPonto = (): ImportacaoPonto[] => clone(mockImportacoesPonto);

export const getInitialDemoState = () => ({
  leads: getInitialLeads(),
  propostas: getInitialPropostas(),
  produtos: getInitialProdutos(),
  movimentacoes: getInitialMovimentacoes(),
  lancamentos: getInitialLancamentos(),
  negocios: getInitialNegocios(),
  documentos: getInitialDocumentos(),
  compras: getInitialCompras(),
  clientes: getInitialClientes(),
  fornecedores: getInitialFornecedores(),
  produtosCadastro: getInitialProdutosCadastro(),
  usuarios: getInitialUsuarios(),
  categorias: getInitialCategorias(),
  assistencias: getInitialAssistencias(),
  historicoAssistencias: getInitialHistoricoAssistencias(),
  anexosAssistencias: getInitialAnexosAssistencias(),
  veiculos: getInitialVeiculos(),
  agendamentos: getInitialAgendamentos(),
  ordensServico: getInitialOrdensServico(),
  candidatos: getInitialCandidatos(),
  notasCandidatos: getInitialNotasCandidatos(),
  colaboradores: getInitialColaboradores(),
  ferias: getInitialFerias(),
  registrosPonto: getInitialRegistrosPonto(),
  importacoesPonto: getInitialImportacoesPonto(),
});
