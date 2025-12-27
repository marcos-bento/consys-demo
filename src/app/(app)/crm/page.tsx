'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EllipsisVertical, Plus, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDemoData } from '@/src/lib/demo-context';
import type { EtapaNegocio, Negocio, PrioridadeNegocio, StatusNegocio } from '../../../lib/mock/negocios';

const funis = ['Vendas'];
const etapas: EtapaNegocio[] = ['Novo', 'Contato', 'Proposta', 'Negociação', 'Fechado'];

const badgeByStatus: Record<StatusNegocio, string> = {
  Ativo: 'bg-blue-50 text-blue-700 border border-blue-100',
  Ganho: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  Perdido: 'bg-rose-50 text-rose-700 border border-rose-100',
};

export default function NegociosPage() {
  const router = useRouter();
  const { negocios, setNegocios } = useDemoData();
  const [funilSelecionado, setFunilSelecionado] = useState<string>('Vendas');
  const [search, setSearch] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('Todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<PrioridadeNegocio | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusNegocio | 'Todos'>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoNegocio, setNovoNegocio] = useState({
    empresa: '',
    contato: '',
    telefone: '',
    valor: 0,
    responsavel: 'Ana Costa',
    etapa: 'Novo' as EtapaNegocio,
    prioridade: 'Média' as PrioridadeNegocio,
    observacao: '',
  });

  const funisOptions = funis;
  const responsaveis = useMemo(() => Array.from(new Set(negocios.map((n) => n.responsavel))), [negocios]);

  const negociosFiltrados = useMemo(() => {
    return negocios.filter((negocio) => {
      const matchesFunil = negocio.funil === funilSelecionado;
      const matchesSearch =
        negocio.empresa.toLowerCase().includes(search.toLowerCase()) ||
        negocio.contato.toLowerCase().includes(search.toLowerCase()) ||
        negocio.codigo.toLowerCase().includes(search.toLowerCase());
      const matchesResp = responsavelFilter === 'Todos' || negocio.responsavel === responsavelFilter;
      const matchesPrioridade = prioridadeFilter === 'Todos' || negocio.prioridade === prioridadeFilter;
      const matchesStatus = statusFilter === 'Todos' || negocio.status === statusFilter;
      return matchesFunil && matchesSearch && matchesResp && matchesPrioridade && matchesStatus;
    });
  }, [negocios, funilSelecionado, search, responsavelFilter, prioridadeFilter, statusFilter]);

  const negociosPorEtapa = etapas.map((etapa) => ({
    etapa,
    itens: negociosFiltrados.filter((negocio) => negocio.etapa === etapa),
    total: negociosFiltrados
      .filter((negocio) => negocio.etapa === etapa)
      .reduce((sum, negocio) => sum + negocio.valor, 0),
  }));

  const handleMoverEtapa = (id: string, novaEtapa: EtapaNegocio) => {
    setNegocios(
      negocios.map((negocio) =>
        negocio.id === id ? { ...negocio, etapa: novaEtapa, status: novaEtapa === 'Fechado' ? negocio.status : 'Ativo' } : negocio,
      ),
    );
  };

  const handleStatus = (id: string, status: StatusNegocio) => {
    setNegocios(
      negocios.map((negocio) =>
        negocio.id === id ? { ...negocio, status, etapa: status === 'Ativo' ? negocio.etapa : 'Fechado' } : negocio,
      ),
    );
  };

  const handleCriarNegocio = () => {
    if (!novoNegocio.empresa.trim()) return;
    const nextId = (negocios.length + 1).toString();
    const codigo = `NEG-${String(nextId).padStart(3, '0')}`;
    const novo: Negocio = {
      id: nextId,
      codigo,
      empresa: novoNegocio.empresa,
      contato: novoNegocio.contato || 'Contato não informado',
      telefone: novoNegocio.telefone || undefined,
      valor: novoNegocio.valor,
      responsavel: novoNegocio.responsavel,
      etapa: novoNegocio.etapa,
      status: 'Ativo',
      prioridade: novoNegocio.prioridade,
      funil: funilSelecionado as Negocio['funil'],
      diasNoFunil: 0,
      origem: 'Manual',
    };
    setNegocios([...negocios, novo]);
    setIsDialogOpen(false);
    setNovoNegocio({
      empresa: '',
      contato: '',
      telefone: '',
      valor: 0,
      responsavel: 'Ana Costa',
      etapa: 'Novo',
      prioridade: 'Média',
      observacao: '',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Negócios</h1>
        <p className="text-muted-foreground">Organize oportunidades por funil e etapa</p>
      </div>

      {/* Topbar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={funilSelecionado} onValueChange={setFunilSelecionado}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar funil" />
                </SelectTrigger>
                <SelectContent>
                  {funisOptions.map((funil) => (
                    <SelectItem key={funil} value={funil}>
                      {funil}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa, contato ou código"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp} value={resp}>
                      {resp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={prioridadeFilter} onValueChange={(value: PrioridadeNegocio | 'Todos') => setPrioridadeFilter(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Prioridade</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: StatusNegocio | 'Todos') => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Status</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Ganho">Ganho</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo negócio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo negócio</DialogTitle>
                  <DialogDescription>Cria um card no funil selecionado.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Empresa *</Label>
                    <Input
                      value={novoNegocio.empresa}
                      onChange={(e) => setNovoNegocio({ ...novoNegocio, empresa: e.target.value })}
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Contato</Label>
                    <Input
                      value={novoNegocio.contato}
                      onChange={(e) => setNovoNegocio({ ...novoNegocio, contato: e.target.value })}
                      placeholder="Pessoa de contato"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Telefone/E-mail</Label>
                    <Input
                      value={novoNegocio.telefone}
                      onChange={(e) => setNovoNegocio({ ...novoNegocio, telefone: e.target.value })}
                      placeholder="(11) 99999-0000"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>Valor estimado</Label>
                      <Input
                        type="number"
                        value={novoNegocio.valor}
                        onChange={(e) => setNovoNegocio({ ...novoNegocio, valor: parseFloat(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Responsável</Label>
                      <Select
                        value={novoNegocio.responsavel}
                        onValueChange={(value) => setNovoNegocio({ ...novoNegocio, responsavel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {responsaveis.map((resp) => (
                            <SelectItem key={resp} value={resp}>
                              {resp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Etapa inicial</Label>
                      <Select
                        value={novoNegocio.etapa}
                        onValueChange={(value: EtapaNegocio) => setNovoNegocio({ ...novoNegocio, etapa: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {etapas.map((etapa) => (
                            <SelectItem key={etapa} value={etapa}>
                              {etapa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Prioridade</Label>
                    <Select
                      value={novoNegocio.prioridade}
                      onValueChange={(value: PrioridadeNegocio) => setNovoNegocio({ ...novoNegocio, prioridade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Observação</Label>
                    <Textarea
                      value={novoNegocio.observacao}
                      onChange={(e) => setNovoNegocio({ ...novoNegocio, observacao: e.target.value })}
                      placeholder="Contexto, próximos passos..."
                    />
                  </div>
                  <Button onClick={handleCriarNegocio} className="w-full">
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Kanban */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {negociosPorEtapa.map(({ etapa, itens, total }) => (
            <div key={etapa} className="w-72 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{etapa}</h2>
                  <Badge variant="secondary">{itens.length}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{formatCurrency(total)}</span>
              </div>
              <div className="space-y-3">
                {itens.length === 0 && (
                  <div className="rounded-md border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
                    Nenhum negócio nesta etapa
                  </div>
                )}
                {itens.map((negocio) => (
                  <Card key={negocio.id} className="shadow-sm">
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">{negocio.empresa}</p>
                          <p className="text-sm text-muted-foreground">{negocio.contato}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-primary/5">
                              <EllipsisVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {etapas
                              .filter((e) => e !== negocio.etapa)
                              .map((e) => (
                                <DropdownMenuItem key={e} onSelect={() => handleMoverEtapa(negocio.id, e)}>
                                  Mover para {e}
                                </DropdownMenuItem>
                              ))}
                            <DropdownMenuItem onSelect={() => handleStatus(negocio.id, 'Ganho')}>
                              Marcar como ganho
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStatus(negocio.id, 'Perdido')}>
                              Marcar como perdido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{formatCurrency(negocio.valor)}</span>
                        <Badge className={badgeByStatus[negocio.status]}>{negocio.status}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Resp.: {negocio.responsavel}</span>
                        <span>{negocio.diasNoFunil}d</span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline">Prioridade {negocio.prioridade}</Badge>
                        {negocio.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:bg-primary/5"
                        onClick={() => router.push(`/crm/${negocio.id}`)}
                      >
                        Ver detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
