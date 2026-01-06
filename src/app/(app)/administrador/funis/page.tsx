'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PipelineStage = {
  id: string;
  name: string;
  position: number;
};

type PipelineLossReason = {
  id: string;
  name: string;
  active?: boolean;
};

type Pipeline = {
  id: string;
  name: string;
  stages: PipelineStage[];
  lossReasons: PipelineLossReason[];
};

type EditableStage = {
  id?: string;
  name: string;
};

type EditableLossReason = {
  id?: string;
  name: string;
};

export default function FunisAdminPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [stages, setStages] = useState<EditableStage[]>([]);
  const [lossReasons, setLossReasons] = useState<EditableLossReason[]>([]);
  const [pendingSave, setPendingSave] = useState<'stages' | 'lossReasons' | null>(null);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isSaveSuccessOpen, setIsSaveSuccessOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [novoFunil, setNovoFunil] = useState('');
  const [nomeFunil, setNomeFunil] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadPipelines = async () => {
      try {
        const res = await fetch('/api/pipelines', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar funis');
        const data = await res.json();
        const loaded = (data.pipelines ?? []).filter((pipeline: Pipeline) => Boolean(pipeline?.id)) as Pipeline[];
        if (!active) return;
        setPipelines(loaded);
        if (loaded.length > 0) {
          setSelectedPipelineId((prev) => prev || loaded[0].id);
        }
      } catch (err) {
        console.error('[FUNIS_ADMIN_LOAD]', err);
        if (active) setError('Nao foi possivel carregar os funis.');
      }
    };
    void loadPipelines();
    return () => {
      active = false;
    };
  }, []);

  const selectedPipeline = useMemo(
    () => pipelines.find((pipeline) => pipeline.id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId],
  );

  useEffect(() => {
    if (!selectedPipeline) {
      setStages([]);
      setLossReasons([]);
      setNomeFunil('');
      return;
    }
    const ordered = [...selectedPipeline.stages].sort((a, b) => a.position - b.position);
    setStages(ordered.map((stage) => ({ id: stage.id, name: stage.name })));
    setLossReasons(
      [...(selectedPipeline.lossReasons ?? [])].map((reason) => ({ id: reason.id, name: reason.name })),
    );
    setNomeFunil(selectedPipeline.name);
  }, [selectedPipeline]);

  const handleMove = (index: number, direction: -1 | 1) => {
    setStages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const handleAdd = () => {
    setStages((prev) => [...prev, { name: 'Nova etapa' }]);
  };

  const handleRemove = (index: number) => {
    setStages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLossReason = () => {
    setLossReasons((prev) => [...prev, { name: 'Novo motivo' }]);
  };

  const handleRemoveLossReason = (index: number) => {
    setLossReasons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveStages = async () => {
    if (!selectedPipelineId || selectedPipelineId === 'undefined') {
      setError('Selecione um funil antes de salvar.');
      return;
    }
    const cleaned = stages
      .map((stage) => ({ ...stage, name: stage.name.trim() }))
      .filter((stage) => stage.name.length > 0);

    if (cleaned.length === 0) {
      setError('Inclua ao menos uma etapa.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pipelines/${selectedPipelineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: cleaned }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Falha ao salvar etapas.');
      }
      const data = await res.json();
      const updated = data.pipeline as Pipeline | undefined;
      if (updated) {
        setPipelines((prev) => prev.map((pipeline) => (pipeline.id === updated.id ? updated : pipeline)));
      }
      setIsSaveSuccessOpen(true);
    } catch (err) {
      console.error('[FUNIS_ADMIN_SAVE]', err);
      setError(err instanceof Error ? err.message : 'Falha ao salvar etapas.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLossReasons = async () => {
    if (!selectedPipelineId || selectedPipelineId === 'undefined') {
      setError('Selecione um funil antes de salvar.');
      return;
    }

    const cleaned = lossReasons
      .map((reason) => ({ ...reason, name: reason.name.trim() }))
      .filter((reason) => reason.name.length > 0);

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pipelines/${selectedPipelineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lossReasons: cleaned }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Falha ao salvar motivos.');
      }
      const data = await res.json();
      const updated = data.pipeline as Pipeline | undefined;
      if (updated) {
        setPipelines((prev) => prev.map((pipeline) => (pipeline.id === updated.id ? updated : pipeline)));
      }
      setIsSaveSuccessOpen(true);
    } catch (err) {
      console.error('[FUNIS_ADMIN_SAVE_REASONS]', err);
      setError(err instanceof Error ? err.message : 'Falha ao salvar motivos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePipeline = async () => {
    const name = novoFunil.trim();
    if (!name) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Falha ao criar funil.');
      }
      const data = await res.json();
      const pipeline = data.pipeline as Pipeline | undefined;
      if (pipeline) {
        setPipelines((prev) => [...prev, pipeline]);
        setSelectedPipelineId(pipeline.id);
        setNovoFunil('');
        setIsCreateOpen(false);
      }
    } catch (err) {
      console.error('[FUNIS_ADMIN_CREATE]', err);
      setError(err instanceof Error ? err.message : 'Falha ao criar funil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePipeline = async () => {
    if (!selectedPipelineId || selectedPipelineId === 'undefined') {
      setError('Selecione um funil antes de excluir.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pipelines/${selectedPipelineId}`, { method: 'DELETE' });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Falha ao excluir funil.');
      }
      setPipelines((prev) => prev.filter((pipeline) => pipeline.id !== selectedPipelineId));
      const nextPipeline = pipelines.find((pipeline) => pipeline.id !== selectedPipelineId);
      setSelectedPipelineId(nextPipeline?.id ?? '');
      setIsDeleteOpen(false);
    } catch (err) {
      console.error('[FUNIS_ADMIN_DELETE]', err);
      setError(err instanceof Error ? err.message : 'Falha ao excluir funil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenamePipeline = async () => {
    if (!selectedPipelineId || selectedPipelineId === 'undefined') {
      setError('Selecione um funil antes de renomear.');
      return;
    }
    const name = nomeFunil.trim();
    if (!name) {
      setError('Informe um nome para o funil.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pipelines/${selectedPipelineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Falha ao renomear funil.');
      }
      const data = await res.json();
      const updated = data.pipeline as Pipeline | undefined;
      if (updated) {
        setPipelines((prev) => prev.map((pipeline) => (pipeline.id === updated.id ? updated : pipeline)));
        setNomeFunil(updated.name);
      }
      setIsRenameOpen(false);
    } catch (err) {
      console.error('[FUNIS_ADMIN_RENAME]', err);
      setError(err instanceof Error ? err.message : 'Falha ao renomear funil.');
    } finally {
      setIsSaving(false);
    }
  };

  const isProtectedPipeline = selectedPipeline?.name?.toLowerCase() === 'vendas';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Configurar funis</h1>
          <p className="text-muted-foreground">Edite etapas, crie ou exclua funis de negocios.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Criar funil
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Funis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-1">
            <Label>Funil</Label>
            <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um funil" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => setIsRenameOpen(true)} disabled={isSaving || !selectedPipelineId}>
              Editar nome do funil
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteOpen(true)}
              disabled={isSaving || !selectedPipelineId || isProtectedPipeline}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir funil
            </Button>
            {isProtectedPipeline && (
              <span className="text-xs text-muted-foreground">O funil Vendas nao pode ser excluido.</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Etapas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma etapa cadastrada para este funil.</p>
          ) : (
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div key={stage.id ?? `novo-${index}`} className="flex flex-wrap items-center gap-3">
                  <Input
                    value={stage.name}
                    onChange={(event) => {
                      const value = event.target.value;
                      setStages((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, name: value } : item)),
                      );
                    }}
                    className="min-w-[240px] flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      aria-label="Mover etapa para cima"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === stages.length - 1}
                      aria-label="Mover etapa para baixo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(index)}
                      aria-label="Remover etapa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar etapa
            </Button>
            <Button
              onClick={() => {
                setPendingSave('stages');
                setIsSaveConfirmOpen(true);
              }}
              disabled={isSaving || stages.length === 0 || !selectedPipelineId}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar etapas'}
            </Button>
            {error && <span className="text-sm text-white">{error}</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Motivos de perda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lossReasons.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum motivo cadastrado para este funil.</p>
          ) : (
            <div className="space-y-3">
              {lossReasons.map((reason, index) => (
                <div key={reason.id ?? `motivo-${index}`} className="flex flex-wrap items-center gap-3">
                  <Input
                    value={reason.name}
                    onChange={(event) => {
                      const value = event.target.value;
                      setLossReasons((prev) =>
                        prev.map((item, i) => (i === index ? { ...item, name: value } : item)),
                      );
                    }}
                    className="min-w-[240px] flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLossReason(index)}
                    aria-label="Remover motivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={handleAddLossReason}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar motivo
            </Button>
            <Button
              onClick={() => {
                setPendingSave('lossReasons');
                setIsSaveConfirmOpen(true);
              }}
              disabled={isSaving || !selectedPipelineId}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar motivos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo funil</DialogTitle>
            <DialogDescription>Crie um funil para organizar seus negocios.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nome do funil</Label>
              <Input
                value={novoFunil}
                onChange={(event) => setNovoFunil(event.target.value)}
                placeholder="Ex: Pos-vendas"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePipeline} disabled={isSaving || !novoFunil.trim()}>
                <Save className="mr-2 h-4 w-4" />
                Criar funil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSaveConfirmOpen}
        onOpenChange={(open) => {
          setIsSaveConfirmOpen(open);
          if (!open) {
            setPendingSave(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingSave === 'lossReasons' ? 'Salvar motivos' : 'Salvar etapas'}</DialogTitle>
            <DialogDescription>
              {pendingSave === 'lossReasons'
                ? 'Deseja aplicar as alteracoes nos motivos de perda deste funil?'
                : 'Deseja aplicar as alteracoes nas etapas deste funil?'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSaveConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setIsSaveConfirmOpen(false);
                if (pendingSave === 'lossReasons') {
                  void handleSaveLossReasons();
                } else {
                  void handleSaveStages();
                }
                setPendingSave(null);
              }}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveSuccessOpen} onOpenChange={setIsSaveSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvo com sucesso</DialogTitle>
            <DialogDescription>As etapas foram atualizadas.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsSaveSuccessOpen(false)}>Ok</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir funil</DialogTitle>
            <DialogDescription>Essa acao nao pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O funil e suas etapas serao removidos. Negocios vinculados impedem a exclusao.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeletePipeline} disabled={isSaving}>
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar nome do funil</DialogTitle>
            <DialogDescription>Atualize o nome do funil selecionado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Novo nome</Label>
              <Input
                value={nomeFunil}
                onChange={(event) => setNomeFunil(event.target.value)}
                placeholder="Nome do funil"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRenamePipeline} disabled={isSaving || !nomeFunil.trim()}>
                Salvar nome
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
