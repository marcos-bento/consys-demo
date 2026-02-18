'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Menu, Search, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDemoData } from '@/src/lib/demo-context';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/crm': 'Negócios',
  '/comercial': 'Documentos',
  '/documentos': 'Documentos',
  '/compras': 'Compras',
  '/cadastros': 'Cadastros',
  '/estoque': 'Estoque',
  '/assistencias': 'Assistências',
  '/financeiro': 'Financeiro',
  '/frota': 'Frota',
  '/administrador': 'Administrador',
  '/relatorios': 'Relatórios',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resetDemo } = useDemoData();
  const title = titles[pathname] || "Con'SYS";
  const [isMounted, setIsMounted] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [username, setUsername] = useState('Usuário');
  const [tasksOpen, setTasksOpen] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasks, setTasks] = useState<
    {
      id: string;
      message: string;
      scheduledAt: string;
      status: string;
      deal?: { id: string; code: string; title: string } | null;
    }[]
  >([]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro ao sair', error);
    } finally {
      router.push('/login');
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const loadUser = async () => {
      try {
        const resMe = await fetch('/api/users/me', { cache: 'no-store', credentials: 'include' });
        if (!resMe.ok) return;
        const me = await resMe.json();
        if (me?.username) {
          setUsername(me.username);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário', error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!tasksOpen) return;
    const loadTasks = async () => {
      setTasksLoading(true);
      try {
        const res = await fetch('/api/tasks?status=OPEN', { cache: 'no-store', credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setTasks(data.tasks ?? []);
      } catch (error) {
        console.error('Erro ao carregar tarefas', error);
      } finally {
        setTasksLoading(false);
      }
    };
    void loadTasks();
  }, [tasksOpen]);

  const handleConfirmReset = () => {
    resetDemo();
    setIsResetOpen(false);
    router.push('/dashboard');
  };

  return (
    <>
      <header className="bg-white shadow p-4">
        <div className="mx-auto flex w-full max-w-[75vw] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
              <Menu />
            </Button>
            <h1 className="text-xl font-semibold ml-2 md:ml-0">{title}</h1>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-4 min-w-0">
            <div className="relative w-full max-w-xs min-w-0">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar..." className="pl-8 w-full" />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setTasksOpen(true)} aria-label="Ver tarefas">
              <Calendar size={20} />
            </Button>
            {isMounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2">
                  <User size={20} />
                  <span className="hidden sm:inline">{username}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      setIsResetOpen(true);
                    }}
                  >
                    Resetar dados da demo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User size={20} />
                <span className="hidden sm:inline">{username}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar dados da demo</DialogTitle>
            <DialogDescription>
              Volta CRM, Documentos, Estoque e Financeiro para os dados iniciais e retorna ao
              dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              EssaÇõÇæes locais serÇæs descartadas. Confirmar agora?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsResetOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmReset}>
                Resetar e voltar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tasksOpen} onOpenChange={setTasksOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tarefas agendadas</DialogTitle>
            <DialogDescription>Veja as tarefas atribuidas a voce.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {tasksLoading && <p className="text-sm text-muted-foreground">Carregando tarefas...</p>}
            {!tasksLoading && tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa agendada.</p>
            )}
            {!tasksLoading &&
              tasks.map((task) => (
                <div key={task.id} className="rounded-md border p-3 space-y-1">
                  <p className="text-sm font-medium text-foreground">{task.message}</p>
                  <div className="text-xs text-muted-foreground">
                    <span>
                      {new Date(task.scheduledAt).toLocaleDateString('pt-BR')}{" "}
                      {new Date(task.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {task.deal?.code && (
                      <span> · {task.deal.title || task.deal.code}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => router.push('/tarefas')}>
              Abrir tarefas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
