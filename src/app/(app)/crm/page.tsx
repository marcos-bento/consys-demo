'use client';

import { useEffect, useMemo, useState, type DragEvent, type KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EllipsisVertical, Plus, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import type { PrioridadeNegocio, StatusNegocio } from '@/lib/mock/negocios';

type PipelineData = {
  id: string;
  name: string;
  stages: { name: string }[];
  lossReasons?: { id: string; name: string }[];
};

const fallbackFunis = ['Vendas'];
const fallbackEtapas = ['Novo', 'Contato', 'Proposta', 'Negociacao', 'Fechado'];

const badgeByStatus: Record<StatusNegocio, string> = {
  Ativo: 'bg-blue-50 text-blue-700 border border-blue-100',
  Ganho: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  Perdido: 'bg-rose-50 text-rose-700 border border-rose-100',
};

export default function NegociosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { negocios, setNegocios, resetDemo } = useDemoData();
  const [funilSelecionado, setFunilSelecionado] = useState<string>('Vendas');
  const [funisOptions, setFunisOptions] = useState<string[]>(fallbackFunis);
  const [pipelinesData, setPipelinesData] = useState<PipelineData[]>([]);
  const [etapas, setEtapas] = useState<string[]>(fallbackEtapas);
  const [search, setSearch] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('Todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<PrioridadeNegocio | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusNegocio | 'Todos'>('Todos');
  const [hoveredEtapa, setHoveredEtapa] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'funnel' | 'table'>('funnel');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [funilParamApplied, setFunilParamApplied] = useState(false);
  const [perdaOpen, setPerdaOpen] = useState(false);
  const [perdaNegocioId, setPerdaNegocioId] = useState<string | null>(null);
  const [motivosPerda, setMotivosPerda] = useState<{ id: string; name: string }[]>([]);
  const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
  const [novoNegocio, setNovoNegocio] = useState({
    empresa: '',
    contato: '',
    telefone: '',
    valor: 0,
    responsavel: 'Ana Costa',
    etapa: 'Novo',
    prioridade: 'Média' as PrioridadeNegocio,
    observacao: '',
  });

  const responsaveis = useMemo(
    () =>
      Array.from(new Set(negocios.map((n) => n.responsavel?.trim()).filter(Boolean) as string[])),
    [negocios],
  );

  useEffect(() => {
    const funilParam = searchParams.get('funil');
    if (!funilParam || funilParamApplied) return;
    setFunilSelecionado(funilParam);
    setFunilParamApplied(true);
  }, [funilParamApplied, searchParams]);

  useEffect(() => {
    let isActive = true;
    const loadPipelines = async () => {
      try {
        const res = await fetch('/api/pipelines', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Falha ao carregar funis');
        }
        const data = await res.json();
        const pipelines = (data.pipelines ?? []) as PipelineData[];
        if (!isActive) return;
        if (pipelines.length === 0) {
          setFunisOptions(fallbackFunis);
          setEtapas(fallbackEtapas);
          return;
        }
        setPipelinesData(pipelines);
        const pipelineNames = pipelines.map((pipeline) => pipeline.name?.trim()).filter(Boolean) as string[];
        setFunisOptions(pipelineNames.length > 0 ? pipelineNames : fallbackFunis);
        const selected = pipelines.find((pipeline) => pipeline.name === funilSelecionado) ?? pipelines[0];
        const stageNames = selected.stages
          .map((stage) => stage.name?.trim())
          .filter(Boolean) as string[];
        setEtapas(stageNames.length > 0 ? stageNames : fallbackEtapas);
        if (selected.name !== funilSelecionado) {
          setFunilSelecionado(selected.name);
        }
      } catch (error) {
        console.error('[FUNIS_LOAD]', error);
      }
    };
    void loadPipelines();
    return () => {
      isActive = false;
    };
  }, [funilSelecionado]);

  useEffect(() => {
    if (etapas.length === 0) return;
    setNovoNegocio((prev) => (etapas.includes(prev.etapa) ? prev : { ...prev, etapa: etapas[0] }));
  }, [etapas]);

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

  const atualizarNegocio = async (id: string, payload: { etapa?: string; status?: StatusNegocio; lossReasonId?: string }) => {
    try {
      const res = await fetch(`/api/negocios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Falha ao atualizar negocio');
      }
    } catch (error) {
      console.error('[NEGOCIOS_UPDATE]', error);
      resetDemo();
    }
  };

  const handleMoverEtapa = (id: string, novaEtapa: string) => {
    setNegocios(
      negocios.map((negocio) =>
        negocio.id === id ? { ...negocio, etapa: novaEtapa, status: novaEtapa === 'Fechado' ? negocio.status : 'Ativo' } : negocio,
      ),
    );
    void atualizarNegocio(id, { etapa: novaEtapa });
  };

  const handleStatus = (id: string, status: StatusNegocio) => {
    if (status === 'Perdido') {
      const negocio = negocios.find((item) => item.id === id);
      if (!negocio) return;
      const pipeline = pipelinesData.find((item) => item.name === negocio.funil);
      setMotivosPerda(pipeline?.lossReasons ?? []);
      setMotivoSelecionado('');
      setPerdaNegocioId(id);
      setPerdaOpen(true);
      return;
    }
    setNegocios(
      negocios.map((negocio) =>
        negocio.id === id ? { ...negocio, status, etapa: status === 'Ganho' ? 'Fechado' : negocio.etapa } : negocio,
      ),
    );
    void atualizarNegocio(id, { status });
  };

  const handleConfirmarPerda = () => {
    if (!perdaNegocioId || !motivoSelecionado) return;
    setNegocios(
      negocios.map((negocio) =>
        negocio.id === perdaNegocioId ? { ...negocio, status: 'Perdido' } : negocio,
      ),
    );
    void atualizarNegocio(perdaNegocioId, { status: 'Perdido', lossReasonId: motivoSelecionado });
    setPerdaOpen(false);
    setPerdaNegocioId(null);
  };

  const handleCardOpen = (id: string) => {
    router.push(`/crm/${id}`);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setHoveredEtapa(null);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, etapa: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setHoveredEtapa(etapa);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, etapa: string) => {
    event.preventDefault();
    const cardId = draggingId || event.dataTransfer.getData('text/plain');
    const dragged = negocios.find((n) => n.id === cardId);
    if (cardId && dragged && dragged.etapa !== etapa) {
      handleMoverEtapa(cardId, etapa);
    }
    setDraggingId(null);
    setHoveredEtapa(null);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardOpen(id);
    }
  };

  const handleCriarNegocio = async () => {
    if (!novoNegocio.empresa.trim()) return;
    try {
      const res = await fetch('/api/negocios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa: novoNegocio.empresa,
          contato: novoNegocio.contato || 'Contato nÇœo informado',
          telefone: novoNegocio.telefone || undefined,
          valor: novoNegocio.valor,
          responsavel: novoNegocio.responsavel,
          etapa: novoNegocio.etapa,
          prioridade: novoNegocio.prioridade,
          funil: funilSelecionado,
          origem: 'Manual',
        }),
      });
      if (!res.ok) {
        throw new Error('Falha ao criar negocio');
      }
      await resetDemo();
      setIsDialogOpen(false);
      setNovoNegocio({
        empresa: '',
        contato: '',
        telefone: '',
        valor: 0,
        responsavel: 'Ana Costa',
        etapa: 'Novo',
        prioridade: 'MÇ¸dia',
        observacao: '',
      });
    } catch (error) {
      console.error('[NEGOCIOS_CREATE]', error);
    }
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6 lg:space-y-7 -mt-3 px-[20px] pt-[20px] max-w-full overflow-x-hidden">
      {/* Topbar */}
      <Card className="shadow-sm border border-border/70 mt-[10px] py-2">
        <CardContent className="py-2 px-3">
          <div className="flex flex-wrap items-end gap-3 max-w-full">
            <div className="space-y-1 w-full sm:w-36">
              <Label className="text-xs text-muted-foreground">Funil</Label>
              <Select value={funilSelecionado} onValueChange={setFunilSelecionado}>
                <SelectTrigger className="w-full" title="Filtra os negócios pelo funil ativo">
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
            </div>
            <div className="space-y-1 w-full sm:w-52">
              <Label className="text-xs text-muted-foreground">Busca</Label>
              <div className="relative w-full" title="Procure por empresa, contato ou código">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa, contato ou código"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1 w-full sm:w-40">
              <Label className="text-xs text-muted-foreground">Responsável</Label>
              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger className="w-full" title="Filtra pelo responsável vinculado ao negócio">
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
            </div>
            <div className="space-y-1 w-full sm:w-32">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={(value: StatusNegocio | 'Todos') => setStatusFilter(value)}>
                <SelectTrigger className="w-full" title="Filtra negócios por status atual">
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
            <div className="space-y-1 w-full sm:w-32">
              <Label className="text-xs text-muted-foreground">Visão</Label>
              <Select value={viewMode} onValueChange={(value: 'funnel' | 'table') => setViewMode(value)}>
                <SelectTrigger className="w-full" title="Altere entre visualização em funil ou tabela">
                  <SelectValue placeholder="Visão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funnel">Funil</SelectItem>
                  <SelectItem value="table">Tabela</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="h-[42px] w-full sm:w-auto" title="Crie um filtro personalizado para os negócios">
              Criar filtro dinâmico
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow h-[42px] w-full sm:w-auto">
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
                        onValueChange={(value) => setNovoNegocio({ ...novoNegocio, etapa: value })}
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

      {viewMode === 'funnel' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex flex-wrap gap-5 sm:flex-nowrap">
            {negociosPorEtapa.map(({ etapa, itens, total }) => {
              const isActive = hoveredEtapa === etapa;
              return (
                <div
                  key={etapa}
                  className={`w-full sm:w-72 shrink-0 space-y-3 rounded-xl border px-3 pb-3 pt-[5px] shadow-sm transition-colors ring-1 ring-slate-300/80 ${
                    isActive ? 'border-primary/60 bg-primary/5 ring-slate-400/90' : 'border-border/70 bg-white/70'
                  }`}
                  onDragOver={(event) => handleDragOver(event, etapa)}
                  onDrop={(event) => handleDrop(event, etapa)}
                  onDragLeave={() => setHoveredEtapa(null)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-dashed">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{etapa}</h2>
                      <Badge variant="secondary">{itens.length}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatCurrency(total)}</span>
                  </div>
                  <div className="space-y-3 min-h-[60vh]">
                    {itens.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                        Arraste um negócio para esta etapa
                      </div>
                    )}
                    {itens.map((negocio) => (
                      <Card
                        key={negocio.id}
                        draggable
                        onDragStart={(event) => handleDragStart(event, negocio.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleCardOpen(negocio.id)}
                        onKeyDown={(event) => handleCardKeyDown(event, negocio.id)}
                        tabIndex={0}
                        role="button"
                        className={`cursor-grab rounded-lg border border-border/60 shadow-sm transition hover:border-primary/40 hover:shadow-md active:cursor-grabbing ${
                          draggingId === negocio.id ? 'opacity-80 ring-2 ring-primary/30' : ''
                        } ${negocio.status === 'Perdido' ? 'bg-rose-200' : ''}`}
                      >
                        <CardContent className="p-3 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold leading-tight text-foreground">{negocio.empresa}</p>
                              <p className="text-xs text-muted-foreground">{negocio.contato}</p>
                            </div>
                            <div className="flex items-start gap-1">
                              <Badge className={`${badgeByStatus[negocio.status]} text-[11px] px-2 py-0.5`}>
                                {negocio.status}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:bg-primary/5"
                                    onClick={(event) => event.stopPropagation()}
                                    onMouseDown={(event) => event.stopPropagation()}
                                  >
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
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold">{formatCurrency(negocio.valor)}</span>
                            <span className="text-xs text-muted-foreground">Resp.: {negocio.responsavel}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{negocio.diasNoFunil}d no funil</span>
                            <Badge variant="outline" className="px-2 py-0 text-[11px]">
                              Prioridade {negocio.prioridade}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/70 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Contato</th>
                <th className="px-4 py-3 text-left">Responsável</th>
                <th className="px-4 py-3 text-left">Etapa</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {negociosFiltrados.map((negocio) => (
                <tr
                  key={negocio.id}
                  className="border-t border-border/80 hover:bg-muted/40 cursor-pointer"
                  onClick={() => handleCardOpen(negocio.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{negocio.codigo}</td>
                  <td className="px-4 py-3 font-medium">{negocio.empresa}</td>
                  <td className="px-4 py-3 text-muted-foreground">{negocio.contato}</td>
                  <td className="px-4 py-3 text-muted-foreground">{negocio.responsavel}</td>
                  <td className="px-4 py-3">{negocio.etapa}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${badgeByStatus[negocio.status]} text-[11px] px-2 py-0.5`}>{negocio.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(negocio.valor)}</td>
                </tr>
              ))}
              {negociosFiltrados.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-muted-foreground" colSpan={7}>
                    Nenhum negócio encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={perdaOpen}
        onOpenChange={(open) => {
          setPerdaOpen(open);
          if (!open) {
            setMotivoSelecionado('');
            setPerdaNegocioId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo da perda</DialogTitle>
            <DialogDescription>Selecione o motivo para marcar o negocio como perdido.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {motivosPerda.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum motivo cadastrado para este funil.</p>
            ) : (
              <div className="space-y-1">
                <Label>Motivo</Label>
                <Select value={motivoSelecionado} onValueChange={setMotivoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosPerda.map((motivo) => (
                      <SelectItem key={motivo.id} value={motivo.id}>
                        {motivo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPerdaOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmarPerda} disabled={!motivoSelecionado}>
                Confirmar perda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
