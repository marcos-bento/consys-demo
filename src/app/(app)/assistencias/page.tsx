'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Grid3X3, Funnel } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { useDemoData } from '@/src/lib/demo-context';
import type { Assistencia } from '@/lib/mock/assistencias';

import AssistenciasKanban from './components/kanban';
import AssistenciasTable from './components/table';
import NovaAssistenciaDialog from './components/nova-assistencia-dialog';

export default function AssistenciasPage() {
  const { assistencias, usuarios, clientes } = useDemoData();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('Todos');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('Todos');
  const [periodoFilter, setPeriodoFilter] = useState<string>('Todos');
  const [isNovaAssistenciaOpen, setIsNovaAssistenciaOpen] = useState(false);

  const filteredAssistencias = useMemo(() => {
    return assistencias.filter((assistencia) => {
      const matchesSearch =
        assistencia.protocolo.toLowerCase().includes(search.toLowerCase()) ||
        assistencia.cliente.toLowerCase().includes(search.toLowerCase()) ||
        assistencia.responsavel.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'Todos' || assistencia.etapa === statusFilter;
      const matchesTipo = tipoFilter === 'Todos' || assistencia.tipo === tipoFilter;
      const matchesPrioridade = prioridadeFilter === 'Todos' || assistencia.prioridade === prioridadeFilter;
      const matchesResponsavel = responsavelFilter === 'Todos' || assistencia.responsavel === responsavelFilter;

      // Filtro de período (simplificado)
      let matchesPeriodo = true;
      if (periodoFilter !== 'Todos') {
        const dataAbertura = new Date(assistencia.dataAbertura);
        const hoje = new Date();
        const diffTime = Math.abs(hoje.getTime() - dataAbertura.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (periodoFilter) {
          case 'Hoje':
            matchesPeriodo = diffDays === 0;
            break;
          case 'Esta semana':
            matchesPeriodo = diffDays <= 7;
            break;
          case 'Este mês':
            matchesPeriodo = diffDays <= 30;
            break;
          case 'Este ano':
            matchesPeriodo = diffDays <= 365;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesTipo && matchesPrioridade && matchesResponsavel && matchesPeriodo;
    });
  }, [assistencias, search, statusFilter, tipoFilter, prioridadeFilter, responsavelFilter, periodoFilter]);

  const getStatusBadge = (etapa: Assistencia['etapa']) => {
    const statusMap = {
      'Nova': { color: 'bg-blue-50 text-blue-700 border border-blue-100', label: 'Nova' },
      'Em análise': { color: 'bg-yellow-50 text-yellow-700 border border-yellow-100', label: 'Em análise' },
      'Agendada': { color: 'bg-purple-50 text-purple-700 border border-purple-100', label: 'Agendada' },
      'Em execução': { color: 'bg-[#d17a45] text-white border border-[#d17a45]', label: 'Em execução' },
      'Concluída': { color: 'bg-[#4a8f4a] text-white border border-[#4a8f4a]', label: 'Concluída' },
      'Cancelada': { color: 'bg-[#d34c46] text-white border border-[#d34c46]', label: 'Cancelada' },
    };
    return statusMap[etapa];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Assistências</h1>
          <p className="text-muted-foreground">Gerencie solicitações e atendimentos de assistência técnica</p>
        </div>
        <Button onClick={() => setIsNovaAssistenciaOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Assistência
        </Button>
      </div>

      {/* Topbar com filtros */}
      <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
        {/* Toggle de visualização */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <Funnel className="mr-2 h-4 w-4" />
              Funil
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Grid3X3 className="mr-2 h-4 w-4" />
              Tabela
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredAssistencias.length} assistência{filteredAssistencias.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          {/* Busca */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, protocolo ou responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Nova">Nova</SelectItem>
              <SelectItem value="Em análise">Em análise</SelectItem>
              <SelectItem value="Agendada">Agendada</SelectItem>
              <SelectItem value="Em execução">Em execução</SelectItem>
              <SelectItem value="Concluída">Concluída</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          {/* Tipo */}
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Montagem">Montagem</SelectItem>
              <SelectItem value="Manutenção">Manutenção</SelectItem>
              <SelectItem value="Garantia">Garantia</SelectItem>
              <SelectItem value="Ajuste">Ajuste</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>

          {/* Prioridade */}
          <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
            </SelectContent>
          </Select>

          {/* Responsável */}
          <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              {usuarios.map((usuario) => (
                <SelectItem key={usuario.id} value={usuario.nome}>
                  {usuario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Período */}
          <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Hoje">Hoje</SelectItem>
              <SelectItem value="Esta semana">Esta semana</SelectItem>
              <SelectItem value="Este mês">Este mês</SelectItem>
              <SelectItem value="Este ano">Este ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conteúdo */}
      {viewMode === 'kanban' ? (
        <AssistenciasKanban
          assistencias={filteredAssistencias}
          getStatusBadge={getStatusBadge}
        />
      ) : (
        <AssistenciasTable
          assistencias={filteredAssistencias}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Dialog Nova Assistência */}
      <NovaAssistenciaDialog
        open={isNovaAssistenciaOpen}
        onOpenChange={setIsNovaAssistenciaOpen}
      />
    </div>
  );
}
