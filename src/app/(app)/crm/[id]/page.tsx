'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, FileText, Layers, MoreHorizontal, Pencil, Trash2, Undo2 } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import type { Negocio, StatusNegocio } from '@/lib/mock/negocios';
import type { Proposta } from '@/lib/mock/comercial';
import type { Documento } from '@/lib/mock/documentos';
import type { Cliente } from '@/lib/mock/cadastros';
import { useDemoData } from '@/src/lib/demo-context';

export default function LeadDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { negocios, propostas, documentos, clientes, usuarios, setNegocios, resetDemo } = useDemoData();
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
  const [editingInteracaoId, setEditingInteracaoId] = useState<string | null>(null);
  const [editingInteracaoMessage, setEditingInteracaoMessage] = useState('');
  const [clienteExtraOpen, setClienteExtraOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [painelDireito, setPainelDireito] = useState<'interacoes' | 'tarefa' | 'propostas' | 'documentos'>('interacoes');
  const [tarefaForm, setTarefaForm] = useState({
    mensagem: '',
    data: '',
    hora: '',
    usuarioId: '',
  });
  const [tarefasDeal, setTarefasDeal] = useState<
    {
      id: string;
      message: string;
      scheduledAt: string;
      status: string;
      assignedTo?: { id: string; username: string; fullName: string } | null;
      createdBy?: { id: string; username: string; fullName: string } | null;
    }[]
  >([]);
  const [confirmEtapa, setConfirmEtapa] = useState<string | null>(null);
  const [etapasFunil, setEtapasFunil] = useState<string[]>([]);
  const [pipelinesData, setPipelinesData] = useState<
    { name: string; stages: { name: string }[]; lossReasons?: { id: string; name: string }[] }[]
  >([]);
  const [motivosPerda, setMotivosPerda] = useState<{ id: string; name: string }[]>([]);
  const [motivoSelecionado, setMotivoSelecionado] = useState<string>('');
  const [perdaOpen, setPerdaOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [remanejarOpen, setRemanejarOpen] = useState(false);
  const [remanejarFunil, setRemanejarFunil] = useState('');
  const [remanejarEtapa, setRemanejarEtapa] = useState('');
  const [remanejarEtapas, setRemanejarEtapas] = useState<string[]>([]);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateForm, setDuplicateForm] = useState({
    titulo: '',
    empresa: '',
    contato: '',
    telefone: '',
    responsavel: '',
    etapa: '',
    origem: '',
  });
  const [editForm, setEditForm] = useState({
    titulo: '',
    empresa: '',
    contato: '',
    telefone: '',
    responsavel: '',
    origem: '',
  });

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
        setPipelinesData(pipelines);
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
    if (!negocio) return;
    setEditForm({
      titulo: negocio.titulo || '',
      empresa: negocio.empresa || '',
      contato: negocio.contato || '',
      telefone: negocio.telefone || '',
      responsavel: negocio.responsavel || '',
      origem: negocio.origem || '',
    });
  }, [negocio]);

  useEffect(() => {
    if (!negocio) return;
    const baseTitle = negocio.titulo || '';
    const duplicatedTitle = baseTitle.includes('(Duplicado)')
      ? baseTitle
      : baseTitle
        ? `${baseTitle} (Duplicado)`
        : '(Duplicado)';
    setDuplicateForm({
      titulo: duplicatedTitle,
      empresa: negocio.empresa || '',
      contato: negocio.contato || '',
      telefone: negocio.telefone || '',
      responsavel: negocio.responsavel || '',
      etapa: negocio.etapa || '',
      origem: negocio.origem || '',
    });
  }, [negocio]);

  useEffect(() => {
    if (!negocio) return;
    setRemanejarFunil(negocio.funil);
  }, [negocio]);

  useEffect(() => {
    if (!remanejarFunil || pipelinesData.length === 0) return;
    const selected = pipelinesData.find((pipeline) => pipeline.name === remanejarFunil) ?? pipelinesData[0];
    const stageNames = selected?.stages
      ?.map((stage) => stage.name?.trim())
      .filter(Boolean) as string[];
    setRemanejarEtapas(stageNames ?? []);
    if (!stageNames?.includes(remanejarEtapa)) {
      setRemanejarEtapa(stageNames?.[0] ?? '');
    }
  }, [pipelinesData, remanejarEtapa, remanejarFunil]);

  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      try {
        const res = await fetch('/api/users/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.username) {
          setUsuarioAtual(data.username);
          setCurrentUserId(data.id ?? null);
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

  useEffect(() => {
    if (tarefaForm.usuarioId) return;
    const defaultId = currentUserId ?? usuarios[0]?.id ?? '';
    if (defaultId) {
      setTarefaForm((prev) => ({ ...prev, usuarioId: defaultId }));
    }
  }, [currentUserId, usuarios, tarefaForm.usuarioId]);

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

  const loadTarefasDeal = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?dealId=${id}&status=OPEN`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Falha ao carregar tarefas');
      }
      const data = await res.json();
      setTarefasDeal(data.tasks ?? []);
    } catch (error) {
      console.error('[TASKS_DEAL]', error);
    }
  }, [id]);

  useEffect(() => {
    void loadInteracoes();
    void loadTarefasDeal();
  }, [loadInteracoes, loadTarefasDeal]);

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

  const handleUpdateNegocio = async () => {
    try {
      const res = await fetch(`/api/negocios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editForm.titulo,
          empresa: editForm.empresa,
          contato: editForm.contato,
          telefone: editForm.telefone,
          responsavel: editForm.responsavel,
          origem: editForm.origem,
        }),
      });
      if (!res.ok) {
        throw new Error('Falha ao atualizar negocio');
      }
      await resetDemo();
      setEditOpen(false);
    } catch (error) {
      console.error('[NEGOCIOS_EDIT]', error);
    }
  };

  const handleDeleteNegocio = async () => {
    try {
      const res = await fetch(`/api/negocios/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Falha ao deletar negocio');
      }
      await resetDemo();
      router.push('/crm');
    } catch (error) {
      console.error('[NEGOCIOS_DELETE]', error);
    }
  };

  const handleDuplicateNegocio = async () => {
    if (!duplicateForm.empresa.trim()) return;
    try {
      const tituloBase = duplicateForm.titulo.trim();
      const tituloDuplicado = tituloBase.includes('(Duplicado)')
        ? tituloBase
        : tituloBase
          ? `${tituloBase} (Duplicado)`
          : '(Duplicado)';
      const res = await fetch('/api/negocios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: tituloDuplicado,
          empresa: duplicateForm.empresa,
          contato: duplicateForm.contato || undefined,
          telefone: duplicateForm.telefone || undefined,
          responsavel: duplicateForm.responsavel || undefined,
          etapa: duplicateForm.etapa || undefined,
          funil: negocio?.funil,
          origem: duplicateForm.origem || undefined,
          valor: negocio?.valor ?? 0,
        }),
      });
      if (!res.ok) {
        throw new Error('Falha ao duplicar negocio');
      }
      const created = await res.json();
      await resetDemo();
      setDuplicateOpen(false);
      if (created?.id) {
        router.push(`/crm/${created.id}`);
      }
    } catch (error) {
      console.error('[NEGOCIOS_DUPLICATE]', error);
    }
  };

  const handleRemanejarNegocio = async () => {
    if (!remanejarFunil || !remanejarEtapa) return;
    try {
      const res = await fetch(`/api/negocios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funil: remanejarFunil,
          etapa: remanejarEtapa,
        }),
      });
      if (!res.ok) {
        throw new Error('Falha ao remanejar negocio');
      }
      await resetDemo();
      setRemanejarOpen(false);
    } catch (error) {
      console.error('[NEGOCIOS_REMANEJAR]', error);
    }
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

  const agendarTarefa = async () => {
    const message = tarefaForm.mensagem.trim();
    if (!message || !tarefaForm.data || !tarefaForm.hora || !tarefaForm.usuarioId) return;
    const scheduledAt = new Date(`${tarefaForm.data}T${tarefaForm.hora}:00`);
    if (Number.isNaN(scheduledAt.getTime())) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          scheduledAt: scheduledAt.toISOString(),
          assignedToId: tarefaForm.usuarioId,
          dealId: negocio.id,
        }),
      });
      if (!res.ok) {
        throw new Error('Falha ao agendar tarefa');
      }
      setTarefaForm((prev) => ({ ...prev, mensagem: '', data: '', hora: '' }));
      void loadTarefasDeal();
    } catch (error) {
      console.error('[TASKS_CREATE]', error);
    }
  };

  const finalizarTarefa = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!res.ok) {
        throw new Error('Falha ao finalizar tarefa');
      }
      void loadTarefasDeal();
    } catch (error) {
      console.error('[TASKS_COMPLETE]', error);
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

  const handleEditarInteracao = (activityId: string, message: string) => {
    setEditingInteracaoId(activityId);
    setEditingInteracaoMessage(message);
  };

  const handleCancelarEdicao = () => {
    setEditingInteracaoId(null);
    setEditingInteracaoMessage('');
  };

  const handleSalvarEdicao = async () => {
    if (!editingInteracaoId) return;
    const message = editingInteracaoMessage.trim();
    if (!message) return;
    try {
      const res = await fetch(`/api/negocios/${id}/activities?activityId=${editingInteracaoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        throw new Error('Falha ao editar interacao');
      }
      const updated = await res.json();
      setInteracoes((prev) => prev.map((item) => (item.id === updated.id ? { ...item, message: updated.message } : item)));
      handleCancelarEdicao();
    } catch (error) {
      console.error('[NEGOCIOS_ACTIVITY_EDIT]', error);
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
        return 'bg-[#4a8f4a] text-white border border-[#4a8f4a]';
      case 'Perdido':
        return 'bg-[#d34c46] text-white border border-[#d34c46]';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-100';
    }
  };

  const getIniciais = (nome: string) =>
    nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('') || 'NN';

  const formatField = (value?: string) => (value?.trim() ? value : 'Nao informado');

  const propostasCliente = useMemo(() => {
    if (!negocio) return [];
    const clienteNegocio = negocio.empresa.trim().toLowerCase();
    return propostas.filter(
      (proposta: Proposta) => proposta.cliente.trim().toLowerCase() === clienteNegocio,
    );
  }, [negocio, propostas]);

  const totalProposta = (proposta: Proposta) =>
    proposta.itens.reduce((sum, item) => sum + item.qtd * item.valorUnit, 0) - proposta.desconto;

  const propostaAlvo = useMemo(() => {
    if (!negocio) return null;
    if (propostasCliente.length === 0) return null;
    const propostaComValor = propostasCliente.find(
      (proposta) => totalProposta(proposta) === negocio.valor,
    );
    return propostaComValor ?? propostasCliente[0];
  }, [negocio, propostasCliente]);

  const documentosCliente = useMemo(() => {
    if (!negocio) return [];
    const clienteNegocio = negocio.empresa.trim().toLowerCase();
    return documentos.filter((documento: Documento) => documento.cliente.trim().toLowerCase() === clienteNegocio);
  }, [documentos, negocio]);

  const renderPainelDireito = () => {
    switch (painelDireito) {
      case 'interacoes':
        return (
          <>
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
          </>
        );
      case 'tarefa':
        return (
          <>
            <div className="space-y-1">
              <Label>Tarefa</Label>
              <Textarea
                value={tarefaForm.mensagem}
                onChange={(e) => setTarefaForm((prev) => ({ ...prev, mensagem: e.target.value }))}
                placeholder="Descreva a tarefa..."
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={tarefaForm.data}
                  onChange={(e) => setTarefaForm((prev) => ({ ...prev, data: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Horario</Label>
                <Input
                  type="time"
                  value={tarefaForm.hora}
                  onChange={(e) => setTarefaForm((prev) => ({ ...prev, hora: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Usuario</Label>
                <Select
                  value={tarefaForm.usuarioId}
                  onValueChange={(value) => setTarefaForm((prev) => ({ ...prev, usuarioId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={agendarTarefa} className="w-fit">
              Agendar tarefa
            </Button>
          </>
        );
      case 'propostas':
        return (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Propostas do cliente</p>
              <Button
                className="bg-[#0b4fa8] text-white hover:bg-[#0a4696]"
                onClick={() => router.push(`/documentos/nova?negocioId=${negocio.id}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Nova proposta
              </Button>
            </div>
            {propostasCliente.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma proposta encontrada.</p>
            ) : (
              <div className="space-y-2">
                {propostasCliente.map((proposta) => (
                  <Link
                    key={proposta.id}
                    href={`/documentos/p-${proposta.id}`}
                    className="block rounded-md border p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{proposta.codigo}</p>
                      <Badge variant="secondary">{proposta.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(proposta.data).toLocaleDateString('pt-BR')}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        );
      case 'documentos':
        return (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Documentos do cliente</p>
              <Button
                className="bg-[#0b4fa8] text-white hover:bg-[#0a4696]"
                onClick={() => router.push('/documentos')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Novo documento
              </Button>
            </div>
            {documentosCliente.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum documento encontrado.</p>
            ) : (
              <div className="space-y-2">
                {documentosCliente.map((documento) => (
                  <div key={documento.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{documento.codigo}</p>
                      <Badge variant="secondary">{documento.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{documento.titulo}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const ultimaProposta = useMemo(() => {
    if (propostasCliente.length === 0) return null;
    return [...propostasCliente].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    )[0];
  }, [propostasCliente]);

  const clienteAlvo = useMemo(() => {
    if (!negocio) return null;
    const empresa = negocio.empresa.trim().toLowerCase();
    return (
      clientes.find((cliente: Cliente) => cliente.nomeFantasia?.trim().toLowerCase() === empresa) ??
      clientes.find((cliente: Cliente) => cliente.razaoSocial?.trim().toLowerCase() === empresa) ??
      clientes.find((cliente: Cliente) => cliente.nome?.trim().toLowerCase() === empresa) ??
      null
    );
  }, [clientes, negocio]);

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

  const valorUltimaProposta = ultimaProposta ? totalProposta(ultimaProposta) : negocio.valor;
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorUltimaProposta);

  const funilHref = `/crm?funil=${encodeURIComponent(negocio.funil)}`;
  const propostaHref = propostaAlvo ? `/documentos/p-${propostaAlvo.id}` : '/documentos';
  const empresaHref = clienteAlvo ? `/cadastros/clientes/${clienteAlvo.id}` : '/cadastros/clientes';

  return (
    <div className="w-full max-w-none -mt-2 space-y-6 pt-0 pb-6">
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
          <span>{negocio.titulo || negocio.codigo}</span>
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
              <h1 className="text-2xl font-semibold">{negocio.titulo || negocio.codigo}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 bg-white px-3 text-foreground shadow-sm hover:bg-white"
              asChild
            >
              <Link href={funilHref}>{negocio.funil}</Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 bg-white px-3 text-foreground shadow-sm hover:bg-white"
              asChild
            >
              <Link href={propostaHref}>{valorUltimaProposta > 0 ? valorFormatado : ''}</Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 bg-white px-3 text-foreground shadow-sm hover:bg-white"
              asChild
            >
              <Link href={empresaHref}>{negocio.empresa}</Link>
            </Button>
          </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
              className={
                negocio.status === 'Perdido' || negocio.status === 'Ganho'
                  ? 'bg-[#4a8f4a] text-white hover:bg-[#4a8f4a]'
                  : 'bg-[#ef362e] text-white hover:bg-[#ef362e]'
              }
            onClick={() => handleStatus(negocio.status === 'Perdido' || negocio.status === 'Ganho' ? 'Ativo' : 'Perdido')}
          >
            {negocio.status === 'Perdido' || negocio.status === 'Ganho' ? (
              <>
                <Undo2 className="mr-2 h-4 w-4" />
                Reabrir
              </>
            ) : (
              'Perder'
            )}
          </Button>
          <Button variant="outline" onClick={() => setRemanejarOpen(true)}>
            Remanejar negocio
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Opcoes
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>Editar negocio</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDuplicateOpen(true)}>Duplicar negocio</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDeleteOpen(true)}>Deletar negocio</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stage bar */}
      <div className="flex w-full items-stretch gap-2 rounded-lg border bg-white p-2">
        {etapas.map((etapa) => {
          const active = etapa === negocio.etapa;
          return (
            <Button
              key={etapa}
              variant="ghost"
              className={`h-10 flex-1 min-w-0 rounded-md px-2 text-sm font-medium ${
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar negocio</DialogTitle>
            <DialogDescription>Atualize as informacoes principais do negocio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Titulo do negocio</Label>
              <Input
                value={editForm.titulo}
                onChange={(e) => setEditForm((prev) => ({ ...prev, titulo: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Empresa</Label>
              <Input
                value={editForm.empresa}
                onChange={(e) => setEditForm((prev) => ({ ...prev, empresa: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Contato</Label>
              <Input
                value={editForm.contato}
                onChange={(e) => setEditForm((prev) => ({ ...prev, contato: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input
                value={editForm.telefone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, telefone: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Responsavel</Label>
              <Input
                value={editForm.responsavel}
                onChange={(e) => setEditForm((prev) => ({ ...prev, responsavel: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Origem</Label>
              <Input
                value={editForm.origem}
                onChange={(e) => setEditForm((prev) => ({ ...prev, origem: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateNegocio}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar negocio</DialogTitle>
            <DialogDescription>Essa acao remove o negocio e suas interacoes.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteNegocio}>
              Confirmar exclusao
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={remanejarOpen} onOpenChange={setRemanejarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remanejar negocio</DialogTitle>
            <DialogDescription>Escolha o funil e a etapa de destino.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Funil</Label>
              <Select value={remanejarFunil} onValueChange={setRemanejarFunil}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funil" />
                </SelectTrigger>
                <SelectContent>
                  {pipelinesData.map((pipeline) => (
                    <SelectItem key={pipeline.name} value={pipeline.name}>
                      {pipeline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Etapa</Label>
              <Select value={remanejarEtapa} onValueChange={setRemanejarEtapa}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  {remanejarEtapas.map((etapa) => (
                    <SelectItem key={etapa} value={etapa}>
                      {etapa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRemanejarOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRemanejarNegocio}>Mover</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar negocio</DialogTitle>
            <DialogDescription>Revise as informacoes antes de duplicar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Titulo do negocio</Label>
              <Input
                value={duplicateForm.titulo}
                onChange={(e) => setDuplicateForm((prev) => ({ ...prev, titulo: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Empresa</Label>
              <Input
                value={duplicateForm.empresa}
                onChange={(e) => setDuplicateForm((prev) => ({ ...prev, empresa: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Contato</Label>
              <Input
                value={duplicateForm.contato}
                onChange={(e) => setDuplicateForm((prev) => ({ ...prev, contato: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input
                value={duplicateForm.telefone}
                onChange={(e) => setDuplicateForm((prev) => ({ ...prev, telefone: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Responsavel</Label>
              <Input
                value={duplicateForm.responsavel}
                onChange={(e) => setDuplicateForm((prev) => ({ ...prev, responsavel: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Etapa</Label>
              <Select
                value={duplicateForm.etapa}
                onValueChange={(value) => setDuplicateForm((prev) => ({ ...prev, etapa: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa" />
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
            <div className="space-y-1">
              <Label>Origem</Label>
              <Input
                value={duplicateForm.origem}
                onChange={(e) => setDuplicateForm((prev) => ({ ...prev, origem: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDuplicateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDuplicateNegocio}>Duplicar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full">
        <div className="space-y-6 lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Informacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Titulo do negocio</Label>
                  <p className="text-lg text-foreground">{negocio.titulo || 'Nao informado'}</p>
                </div>
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
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Cliente</h3>
                  <p className="text-xs text-muted-foreground">{formatField(negocio.empresa)}</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Tipo</Label>
                    <p className="text-lg text-foreground">{formatField(clienteAlvo?.tipo)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Razao social</Label>
                    <p className="text-lg text-foreground">{formatField(clienteAlvo?.razaoSocial)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-lg text-foreground">{formatField(clienteAlvo?.nome)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Nome fantasia</Label>
                    <p className="text-lg text-foreground">{formatField(clienteAlvo?.nomeFantasia)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-lg text-foreground">{formatField(clienteAlvo?.email)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Telefone</Label>
                    <p className="text-lg text-foreground">{formatField(clienteAlvo?.telefone)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between px-2"
                  onClick={() => setClienteExtraOpen((prev) => !prev)}
                >
                  <span>{clienteExtraOpen ? 'Ocultar detalhes' : 'Ver mais detalhes'}</span>
                  {clienteExtraOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {clienteExtraOpen && (
                  <div className="grid grid-cols-1 gap-4 pt-1">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">CNPJ</Label>
                      <p className="text-lg text-foreground">{formatField(clienteAlvo?.cnpj)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">CPF</Label>
                      <p className="text-lg text-foreground">{formatField(clienteAlvo?.cpf)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Cidade</Label>
                      <p className="text-lg text-foreground">{formatField(clienteAlvo?.cidade)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">UF</Label>
                      <p className="text-lg text-foreground">{formatField(clienteAlvo?.uf)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Status</Label>
                      <p className="text-lg text-foreground">{formatField(clienteAlvo?.status)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Data de criacao</Label>
                      <p className="text-lg text-foreground">
                        {clienteAlvo?.dataCriacao ? formatDate(clienteAlvo.dataCriacao) : 'Nao informado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Resumo do negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Responsavel do negocio</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {getIniciais(negocio.responsavel || 'Nao informado')}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-base font-medium text-foreground">
                    {formatField(negocio.responsavel)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Badge className={getStatusColor(negocio.status)}>{negocio.status}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Codigo da ultima proposta</Label>
                  <p className="text-lg text-foreground">{formatField(ultimaProposta?.codigo)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Valor da ultima proposta</Label>
                  <p className="text-lg text-foreground">
                    {ultimaProposta
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(totalProposta(ultimaProposta))
                      : 'Nao informado'}
                  </p>
                </div>
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
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant={painelDireito === 'interacoes' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPainelDireito('interacoes')}
                >
                  Interacoes
                </Button>
                <Button
                  type="button"
                  variant={painelDireito === 'tarefa' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPainelDireito('tarefa')}
                >
                  Agendar tarefa
                </Button>
                <Button
                  type="button"
                  variant={painelDireito === 'propostas' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPainelDireito('propostas')}
                >
                  Propostas
                </Button>
                <Button
                  type="button"
                  variant={painelDireito === 'documentos' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setPainelDireito('documentos')}
                >
                  Documentos
                </Button>
              </div>
              <div className="space-y-3">{renderPainelDireito()}</div>
              <Separator />
              <div className="space-y-3">
                {tarefasDeal.map((tarefa) => (
                  <div key={tarefa.id} className="rounded-md border border-blue-100 bg-blue-50/60 p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">
                            {getIniciais(tarefa.assignedTo?.fullName || tarefa.assignedTo?.username || usuarioAtual)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{formatDate(tarefa.scheduledAt)}</span>
                        <span>{formatTime(tarefa.scheduledAt)}</span>
                        <Badge variant="secondary">Tarefa agendada</Badge>
                        <span>para {tarefa.assignedTo?.fullName || tarefa.assignedTo?.username || 'Usuario'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => finalizarTarefa(tarefa.id)}
                          aria-label="Finalizar tarefa"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{tarefa.message}</p>
                  </div>
                ))}
                {interacoes.length === 0 && tarefasDeal.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem interacoes registradas.</p>
                )}
                {interacoes.map((interacao) => (
                  <div key={interacao.id} className="rounded-md border p-3 bg-white/70 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">
                            {getIniciais(interacao.createdBy || usuarioAtual)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{formatDate(interacao.createdAt)}</span>
                        <span>{formatTime(interacao.createdAt)}</span>
                        <Badge variant="secondary">{mapTipoInteracao(interacao.type)}</Badge>
                        <span>por {interacao.createdBy || usuarioAtual}</span>
                      </div>
                      {interacao.type === 'REGISTRO' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditarInteracao(interacao.id, interacao.message)}
                            aria-label="Editar interacao"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExcluirInteracao(interacao.id)}
                            aria-label="Excluir interacao"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingInteracaoId === interacao.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingInteracaoMessage}
                          onChange={(e) => setEditingInteracaoMessage(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={handleCancelarEdicao}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSalvarEdicao}>
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground">{interacao.message}</p>
                    )}
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
