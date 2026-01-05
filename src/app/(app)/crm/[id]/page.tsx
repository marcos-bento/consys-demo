'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, FileText, Layers, MoreHorizontal, Trash2, Undo2, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import type { Negocio, StatusNegocio } from '@/lib/mock/negocios';
import type { Proposta } from '@/lib/mock/comercial';
import type { Cliente } from '@/lib/mock/cadastros';
import { useDemoData } from '@/src/lib/demo-context';

const timelineBase = ['Negocio criado', 'Contato realizado', 'Proposta enviada'];

export default function LeadDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { negocios, propostas, clientes, setNegocios, resetDemo } = useDemoData();
  const negocio = negocios.find((n: Negocio) => n.id === id);
  const [interacoes, setInteracoes] = useState<
    {
      id: string;
      type: string;
      message: string;
      createdAt: string;
      createdBy: string;
    }[]
  >([]);
  const [conteudoInteracao, setConteudoInteracao] = useState('');
  const [usuarioAtual, setUsuarioAtual] = useState('Sistema');
  const [etapaSelecionada, setEtapaSelecionada] = useState<string>(
    negocio?.etapa ?? 'Novo',
  );
  const [confirmEtapa, setConfirmEtapa] = useState<string | null>(null);
  const [etapasFunil, setEtapasFunil] = useState<string[]>([]);
  const [motivosPerda, setMotivosPerda] = useState<{ id: string; name: string }[]>([]);
  const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
  const [perdaOpen, setPerdaOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const timeline = useMemo(() => timelineBase, []);

  useEffect(() => {
    let active = true;
    const loadEtapas = async () => {
      try {
        const res = await fetch('/api/pipelines', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Falha ao carregar funis');
        }
        const data = await res.json();
        const pipelines = (data.pipelines ?? []) as {
          name: string;
          stages: { name: string }[];
          lossReasons?: { id: string; name: string }[];
        }[];
        if (!active) return;
        const selected = pipelines.find((pipeline) => pipeline.name === negocio?.funil) ?? pipelines[0];
        const stageNames = selected?.stages
          ?.map((stage) => stage.name?.trim())
          .filter(Boolean) as string[];
        setEtapasFunil(stageNames ?? []);
        setMotivosPerda(selected?.lossReasons ?? []);
      } catch (error) {
        console.error('[FUNIS_ETAPAS]', error);
      }
    };
    void loadEtapas();
    return () => {
      active = false;
    };
  }, [negocio?.funil]);

  const etapas = useMemo(
    () => (etapasFunil.length > 0 ? etapasFunil : negocio ? [negocio.etapa] : ['Novo']),
    [etapasFunil, negocio],
  );

  useEffect(() => {
    if (!negocio) return;
    setEtapaSelecionada(negocio.etapa);
  }, [negocio]);

  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      try {
        const res = await fetch('/api/users/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.username) {
          setUsuarioAtual(data.username);
        }
      } catch (error) {
        console.error('[USER_ME]', error);
      }
    };
    void loadUser();
    return () => {
      active = false;
    };
  }, []);

  const loadInteracoes = useCallback(async () => {
    try {
      const res = await fetch(`/api/negocios/${id}/activities`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Falha ao carregar interacoes');
      }
      const data = await res.json();
      setInteracoes(data.activities ?? []);
    } catch (error) {
      console.error('[NEGOCIOS_ACTIVITIES]', error);
    }
  }, [id]);

  useEffect(() => {
    void loadInteracoes();
  }, [loadInteracoes]);

  if (!negocio) {
    return (
      <div className="space-y-6 py-6">
        <div>
          <h1 className="text-3xl font-semibold">Negocio nao encontrado</h1>
        </div>
        <Button onClick={() => router.push('/crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar a Negocios
        </Button>
      </div>
    );
  }

  const atualizarNegocio = async (payload: { etapa?: string; status?: StatusNegocio; lossReasonId?: string }) => {
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

  const handleChangeEtapa = (novaEtapa: string) => {
    setNegocios(
      negocios.map((n) => (n.id === negocio.id ? { ...n, etapa: novaEtapa, status: novaEtapa === 'Fechado' ? n.status : 'Ativo' } : n)),
    );
    void atualizarNegocio({ etapa: novaEtapa });
    void loadInteracoes();
  };

  const handleSolicitarMudancaEtapa = (novaEtapa: string) => {
    setConfirmEtapa(novaEtapa);
    setConfirmOpen(true);
  };

  const handleConfirmarMudancaEtapa = () => {
    if (confirmEtapa) {
      setEtapaSelecionada(confirmEtapa);
      handleChangeEtapa(confirmEtapa);
    }
    setConfirmOpen(false);
  };

  const handleStatus = (status: StatusNegocio) => {
    if (status === 'Perdido') {
      setMotivoSelecionado('');
      setPerdaOpen(true);
      return;
    }
    const proximaEtapa = status === 'Ganho' ? 'Fechado' : negocio.etapa;
    setNegocios(negocios.map((n) => (n.id === negocio.id ? { ...n, status, etapa: proximaEtapa } : n)));
    void atualizarNegocio({ status });
    void loadInteracoes();
  };

  const handleConfirmarPerda = () => {
    if (!motivoSelecionado) return;
    setNegocios(negocios.map((n) => (n.id === negocio.id ? { ...n, status: 'Perdido' } : n)));
    void atualizarNegocio({ status: 'Perdido', lossReasonId: motivoSelecionado });
    void loadInteracoes();
    setPerdaOpen(false);
  };

  const addInteracao = async () => {
    const message = conteudoInteracao.trim();
    if (!message) return;
    try {
      const res = await fetch(`/api/negocios/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type: 'REGISTRO' }),
      });
      if (!res.ok) {
        throw new Error('Falha ao salvar interacao');
      }
      const created = await res.json();
      setInteracoes((prev) => [created, ...prev]);
      setConteudoInteracao('');
    } catch (error) {
      console.error('[NEGOCIOS_ACTIVITY_CREATE]', error);
    }
  };

  const handleExcluirInteracao = async (activityId: string) => {
    try {
      const res = await fetch(`/api/negocios/${id}/activities?activityId=${activityId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Falha ao excluir interacao');
      }
      setInteracoes((prev) => prev.filter((item) => item.id !== activityId));
    } catch (error) {
      console.error('[NEGOCIOS_ACTIVITY_DELETE]', error);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('pt-BR');

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const mapTipoInteracao = (value: string) => {
    if (value === 'STAGE_CHANGE') return 'Mudanca de etapa';
    if (value === 'STATUS_CHANGE') return 'Mudanca de status';
    return 'Registro';
  };

  const getStatusColor = (status: StatusNegocio) => {
    switch (status) {
      case 'Ganho':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Perdido':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-100';
    }
  };

  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(negocio.valor);

  const propostaAlvo = useMemo(() => {
    const clienteNegocio = negocio.empresa.trim().toLowerCase();
    const propostasCliente = propostas.filter(
      (proposta: Proposta) => proposta.cliente.trim().toLowerCase() === clienteNegocio,
    );
    if (propostasCliente.length === 0) return null;
    const totalProposta = (proposta: Proposta) =>
      proposta.itens.reduce((sum, item) => sum + item.qtd * item.valorUnit, 0) - proposta.desconto;
    const propostaComValor = propostasCliente.find(
      (proposta) => totalProposta(proposta) === negocio.valor,
    );
    return propostaComValor ?? propostasCliente[0];
  }, [negocio.empresa, negocio.valor, propostas]);

  const clienteAlvo = useMemo(() => {
    const empresa = negocio.empresa.trim().toLowerCase();
    return (
      clientes.find((cliente: Cliente) => cliente.nomeFantasia?.trim().toLowerCase() === empresa) ??
      clientes.find((cliente: Cliente) => cliente.razaoSocial?.trim().toLowerCase() === empresa) ??
      clientes.find((cliente: Cliente) => cliente.nome?.trim().toLowerCase() === empresa) ??
      null
    );
  }, [clientes, negocio.empresa]);

  const funilHref = `/crm?funil=${encodeURIComponent(negocio.funil)}`;
  const propostaHref = propostaAlvo ? `/documentos/p-${propostaAlvo.id}` : '/documentos';
  const empresaHref = clienteAlvo ? `/cadastros/clientes/${clienteAlvo.id}` : '/cadastros/clientes';

  return (
    <div className="w-full max-w-none space-y-6 py-6">
      {/* Breadcrumb + back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/crm" className="hover:text-foreground">
            Negocios
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{negocio.codigo}</span>
        </div>
        <Button variant="ghost" onClick={() => router.push('/crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/50">
            <Layers className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Negociacao</p>
            <h1 className="text-2xl font-semibold">{negocio.codigo}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" className="h-7 px-3" asChild>
                <Link href={funilHref}>{negocio.funil}</Link>
              </Button>
              <Button variant="secondary" size="sm" className="h-7 px-3" asChild>
                <Link href={propostaHref}>{valorFormatado}</Link>
              </Button>
              <Button variant="secondary" size="sm" className="h-7 px-3" asChild>
                <Link href={empresaHref}>{negocio.empresa}</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className={negocio.status === 'Perdido' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}
            onClick={() => handleStatus(negocio.status === 'Perdido' ? 'Ativo' : 'Perdido')}
          >
            {negocio.status === 'Perdido' ? (
              <>
                <Undo2 className="mr-2 h-4 w-4" />
                Reabrir
              </>
            ) : (
              'Perder'
            )}
          </Button>
          <Button variant="outline">Remanejar negocio</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Opcoes
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Editar negocio</DropdownMenuItem>
              <DropdownMenuItem>Duplicar negocio</DropdownMenuItem>
              <DropdownMenuItem>Deletar negocio</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stage bar */}
      <div className="flex w-full items-center gap-2 overflow-x-auto rounded-lg border bg-white p-2">
        {etapas.map((etapa) => {
          const active = etapa === negocio.etapa;
          return (
            <Button
              key={etapa}
              variant="ghost"
              className={`h-10 rounded-md px-4 text-sm font-medium ${
                active ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted/60 text-muted-foreground'
              }`}
              onClick={() => handleSolicitarMudancaEtapa(etapa)}
            >
              {etapa}
            </Button>
          );
        })}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudar etapa</DialogTitle>
            <DialogDescription>
              {confirmEtapa
                ? `Deseja mover o card para etapa ${confirmEtapa}?`
                : 'Deseja mover o card para esta etapa?'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarMudancaEtapa}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={perdaOpen}
        onOpenChange={(open) => {
          setPerdaOpen(open);
          if (!open) {
            setMotivoSelecionado('');
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

      {/* Proposal CTA */}
      <div>
        <Button
          variant="secondary"
          onClick={() => router.push(`/documentos/nova?negocioId=${negocio.id}`)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Criar proposta
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full">
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Informacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Empresa</Label>
                <p className="text-lg text-foreground">{negocio.empresa}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Contato</Label>
                <p className="text-lg text-foreground">{negocio.contato}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Telefone</Label>
                <p className="text-lg text-foreground">{negocio.telefone ?? 'Nao informado'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Interacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={getStatusColor(negocio.status)}>{negocio.status}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-emerald-50"
                    onClick={() => handleStatus('Ganho')}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Ganho
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-rose-50"
                    onClick={() => handleStatus('Perdido')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Perdido
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Responsavel</Label>
                  <p className="text-lg text-foreground">{negocio.responsavel}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valor</Label>
                  <p className="text-lg font-semibold">{valorFormatado}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {negocio.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="secondary">Origem: {negocio.origem || 'Nao informado'}</Badge>
                <Badge variant="secondary">Funil: {negocio.funil}</Badge>
                <Badge variant="secondary">Prioridade: {negocio.prioridade}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Interacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Responsavel</Label>
                  <p className="text-sm font-medium text-foreground">{usuarioAtual}</p>
                </div>
                <div className="space-y-1">
                  <Label>Conteudo</Label>
                  <Textarea
                    value={conteudoInteracao}
                    onChange={(e) => setConteudoInteracao(e.target.value)}
                    placeholder="Descreva a interacao realizada..."
                  />
                </div>
                <Button onClick={addInteracao} className="w-fit">
                  Salvar interacao
                </Button>
              </div>
              <Separator />
              <div className="space-y-3">
                {interacoes.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem interacoes registradas.</p>
                )}
                {interacoes.map((interacao) => (
                  <div key={interacao.id} className="rounded-md border p-3 bg-white/70 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{formatDate(interacao.createdAt)}</span>
                        <span>{formatTime(interacao.createdAt)}</span>
                        <Badge variant="secondary">{mapTipoInteracao(interacao.type)}</Badge>
                        <span>por {interacao.createdBy || usuarioAtual}</span>
                      </div>
                      {interacao.type !== 'STAGE_CHANGE' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleExcluirInteracao(interacao.id)}
                          aria-label="Excluir interacao"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{interacao.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
