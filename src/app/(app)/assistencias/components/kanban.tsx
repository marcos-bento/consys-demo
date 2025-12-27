'use client';

import { useState } from 'react';
import { MoreHorizontal, Calendar, User, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { type Assistencia, type HistoricoAssistencia } from '@/src/lib/mock/assistencias';
import { useDemoData } from '@/src/lib/demo-context';

interface AssistenciasKanbanProps {
  assistencias: Assistencia[];
  getStatusBadge: (etapa: Assistencia['etapa']) => { color: string; label: string };
}

const etapas = [
  { id: 'Nova', label: 'Nova', icon: AlertTriangle },
  { id: 'Em análise', label: 'Em análise', icon: Clock },
  { id: 'Agendada', label: 'Agendada', icon: Calendar },
  { id: 'Em execução', label: 'Em execução', icon: User },
  { id: 'Concluída', label: 'Concluída', icon: CheckCircle },
  { id: 'Cancelada', label: 'Cancelada', icon: XCircle },
];

export default function AssistenciasKanban({ assistencias, getStatusBadge }: AssistenciasKanbanProps) {
  const { setAssistencias, setHistoricoAssistencias, historicoAssistencias } = useDemoData();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeAssistencia = assistencias.find((a) => a.id === activeId);
    if (!activeAssistencia) return;

    const newEtapa = overId as Assistencia['etapa'];
    if (activeAssistencia.etapa === newEtapa) return;

    moverAssistencia(activeId, newEtapa);
  };

  const getAssistenciasPorEtapa = (etapa: string) => {
    return assistencias.filter(a => a.etapa === etapa);
  };

  const moverAssistencia = (assistenciaId: string, novaEtapa: Assistencia['etapa']) => {
    setAssistencias(prev =>
      prev.map(a =>
        a.id === assistenciaId
          ? { ...a, etapa: novaEtapa, updatedAt: new Date().toISOString() }
          : a
      )
    );

    // Adicionar ao histórico
    const tipoHistorico: HistoricoAssistencia['tipo'] = novaEtapa === 'Concluída' ? 'Concluída' : novaEtapa === 'Cancelada' ? 'Cancelada' : 'Observação';
    const novoHistorico = {
      id: Date.now().toString(),
      assistenciaId,
      tipo: tipoHistorico,
      descricao: `Movido para ${novaEtapa.toLowerCase()}`,
      usuario: 'Usuário Demo',
      data: new Date().toISOString(),
    };

    setHistoricoAssistencias(prev => [...prev, novoHistorico]);
  };

  const concluirAssistencia = (assistenciaId: string) => {
    setAssistencias(prev =>
      prev.map(a =>
        a.id === assistenciaId
          ? { ...a, etapa: 'Concluída', dataConclusao: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString() }
          : a
      )
    );

    const novoHistorico = {
      id: Date.now().toString(),
      assistenciaId,
      tipo: 'Concluída' as const,
      descricao: 'Assistência concluída',
      usuario: 'Usuário Demo',
      data: new Date().toISOString(),
    };

    setHistoricoAssistencias(prev => [...prev, novoHistorico]);
  };

  const cancelarAssistencia = (assistenciaId: string) => {
    setAssistencias(prev =>
      prev.map(a =>
        a.id === assistenciaId
          ? { ...a, etapa: 'Cancelada', updatedAt: new Date().toISOString() }
          : a
      )
    );

    const novoHistorico = {
      id: Date.now().toString(),
      assistenciaId,
      tipo: 'Cancelada' as const,
      descricao: 'Assistência cancelada',
      usuario: 'Usuário Demo',
      data: new Date().toISOString(),
    };

    setHistoricoAssistencias(prev => [...prev, novoHistorico]);
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-50 text-red-700 border border-red-100';
      case 'Média': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      case 'Baixa': return 'bg-green-50 text-green-700 border border-green-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  const getIniciais = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const SortableCard = ({ assistencia }: { assistencia: Assistencia }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: assistencia.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <p className="font-medium text-sm">{assistencia.protocolo}</p>
              <p className="text-sm text-muted-foreground truncate">{assistencia.cliente}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {etapas
                  .filter(e => e.id !== assistencia.etapa)
                  .map((etapaOption) => (
                    <DropdownMenuItem
                      key={etapaOption.id}
                      onClick={() => moverAssistencia(assistencia.id, etapaOption.id as Assistencia['etapa'])}
                    >
                      Mover para {etapaOption.label}
                    </DropdownMenuItem>
                  ))}
                {assistencia.etapa !== 'Concluída' && assistencia.etapa !== 'Cancelada' && (
                  <>
                    <DropdownMenuItem onClick={() => concluirAssistencia(assistencia.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Concluir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cancelarAssistencia(assistencia.id)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${getPrioridadeColor(assistencia.prioridade)}`}>
                {assistencia.prioridade}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {assistencia.tipo}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(assistencia.dataAbertura).toLocaleDateString('pt-BR')}</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {getIniciais(assistencia.responsavel)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-16">{assistencia.responsavel.split(' ')[0]}</span>
              </div>
            </div>

            {assistencia.dataAgendamento && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(assistencia.dataAgendamento).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {etapas.map((etapa) => {
          const assistenciasEtapa = getAssistenciasPorEtapa(etapa.id);
          const IconComponent = etapa.icon;

          return (
            <div key={etapa.id} className="flex-shrink-0 w-80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">{etapa.label}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {assistenciasEtapa.length}
                </Badge>
              </div>

              <div className="space-y-3">
                <SortableContext items={assistenciasEtapa.map(a => a.id)} strategy={verticalListSortingStrategy}>
                  {assistenciasEtapa.map((assistencia) => (
                    <SortableCard key={assistencia.id} assistencia={assistencia} />
                  ))}
                </SortableContext>

                {assistenciasEtapa.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconComponent className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma assistência</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeId ? (
          <Card className="shadow-lg rotate-3">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm">
                    {assistencias.find(a => a.id === activeId)?.protocolo}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {assistencias.find(a => a.id === activeId)?.cliente}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getPrioridadeColor(assistencias.find(a => a.id === activeId)?.prioridade || 'Baixa')}`}>
                    {assistencias.find(a => a.id === activeId)?.prioridade}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {assistencias.find(a => a.id === activeId)?.tipo}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}