export interface Lead {
  id: string;
  empresa: string;
  contato: string;
  status: 'Novo' | 'Em contato' | 'Qualificado' | 'Perdido';
  responsavel: string;
}

export const mockLeads: Lead[] = [
  { id: '1', empresa: 'Empresa A', contato: 'João Silva', status: 'Novo', responsavel: 'Ana Costa' },
  { id: '2', empresa: 'Tech Solutions', contato: 'Maria Santos', status: 'Em contato', responsavel: 'Carlos Lima' },
  { id: '3', empresa: 'Inovação Ltda', contato: 'Pedro Oliveira', status: 'Qualificado', responsavel: 'Ana Costa' },
  { id: '4', empresa: 'Global Corp', contato: 'Lucas Ferreira', status: 'Perdido', responsavel: 'Carlos Lima' },
  { id: '5', empresa: 'StartUp XYZ', contato: 'Fernanda Alves', status: 'Novo', responsavel: 'Ana Costa' },
  { id: '6', empresa: 'Mega Industries', contato: 'Roberto Gomes', status: 'Em contato', responsavel: 'Carlos Lima' },
  { id: '7', empresa: 'Future Tech', contato: 'Carla Mendes', status: 'Qualificado', responsavel: 'Ana Costa' },
  { id: '8', empresa: 'Alpha Beta', contato: 'Thiago Rocha', status: 'Perdido', responsavel: 'Carlos Lima' },
  { id: '9', empresa: 'Omega Systems', contato: 'Juliana Pereira', status: 'Novo', responsavel: 'Ana Costa' },
  { id: '10', empresa: 'Delta Group', contato: 'Ricardo Souza', status: 'Em contato', responsavel: 'Carlos Lima' },
];