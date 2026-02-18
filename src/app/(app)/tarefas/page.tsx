'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Tarefa = {
  id: string;
  message: string;
  scheduledAt: string;
  createdAt?: string;
  status: string;
  assignedTo?: { id: string; username: string; fullName: string } | null;
  createdBy?: { id: string; username: string; fullName: string } | null;
  deal?: { id: string; code: string; title: string; clientName?: string } | null;
};

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export default function TarefasPage() {
  const [viewMode, setViewMode] = useState<'agenda' | 'lista'>('agenda');
  const [tasks, setTasks] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tasks?status=OPEN', { cache: 'no-store', credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setTasks(data.tasks ?? []);
      } catch (error) {
        console.error('[TASKS_PAGE]', error);
      } finally {
        setLoading(false);
      }
    };
    void loadTasks();
  }, []);

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth],
  );

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Tarefa[]>();
    tasks.forEach((task) => {
      const date = new Date(task.scheduledAt);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    });
    return map;
  }, [tasks]);

  const monthGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = firstDay.getDay();

    const cells: Array<{ date: Date | null }> = [];
    for (let i = 0; i < leadingBlanks; i += 1) {
      cells.push({ date: null });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day) });
    }
    return cells;
  }, [currentMonth]);

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [tasks],
  );

  const resumoTarefa = (text: string, max = 120) =>
    text.length > max ? `${text.slice(0, max - 3)}...` : text;

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tarefas</h1>
          <p className="text-sm text-muted-foreground">Agenda de tarefas atribuidas a voce.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === 'agenda' ? 'default' : 'outline'}
            onClick={() => setViewMode('agenda')}
          >
            Agenda
          </Button>
          <Button
            type="button"
            variant={viewMode === 'lista' ? 'default' : 'outline'}
            onClick={() => setViewMode('lista')}
          >
            Lista
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="capitalize">{monthLabel}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                )
              }
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                )
              }
              aria-label="Proximo mes"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Carregando tarefas...</p>}
          {!loading && tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa agendada.</p>
          )}

          {!loading && tasks.length > 0 && viewMode === 'agenda' && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 text-xs text-muted-foreground">
                {weekdays.map((day) => (
                  <div key={day} className="py-2 text-center font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthGrid.map((cell, index) => {
                  if (!cell.date) {
                    return <div key={`empty-${index}`} className="min-h-[88px] rounded-md border border-dashed" />;
                  }
                  const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
                  const dayTasks = tasksByDate.get(key) ?? [];
                  return (
                    <div key={key} className="min-h-[88px] rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">{cell.date.getDate()}</div>
                      {dayTasks.map((task) => (
                        <Link
                          key={task.id}
                          href={task.deal?.id ? `/crm/${task.deal.id}` : '#'}
                          className="mt-2 block rounded-md border bg-white px-2 py-1 text-xs hover:bg-muted/50"
                        >
                          <div className="font-medium text-foreground">
                            {new Date(task.scheduledAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-muted-foreground">
                            {task.message}
                            {task.deal?.code ? ` · ${task.deal.title || task.deal.code}` : ''}
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && tasks.length > 0 && viewMode === 'lista' && (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <Link
                  key={task.id}
                  href={task.deal?.id ? `/crm/${task.deal.id}` : '#'}
                  className="block rounded-md border p-3 hover:bg-muted/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {task.deal?.title || task.deal?.code || 'Tarefa'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {resumoTarefa(task.message)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>
                        Data fim: {new Date(task.scheduledAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        Hora fim: {new Date(task.scheduledAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
                    <div>
                      Cliente: {task.deal?.clientName || 'Nao informado'}
                    </div>
                    <div>
                      Autor: {task.createdBy?.fullName || task.createdBy?.username || 'Nao informado'}
                    </div>
                    <div>
                      Responsavel: {task.assignedTo?.fullName || task.assignedTo?.username || 'Nao informado'}
                    </div>
                    <div>
                      Data de criacao:{' '}
                      {task.createdAt
                        ? new Date(task.createdAt).toLocaleDateString('pt-BR')
                        : 'Nao informado'}
                    </div>
                    <div>
                      Titulo do card: {task.deal?.title || task.deal?.code || 'Nao informado'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
