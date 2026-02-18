'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type DbUser = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

type AuditLog = {
  id: string;
  action: string;
  message?: string | null;
  entityType: string;
  entityId?: string | null;
  metadata?: { url?: string } | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: { id: string; username: string } | null;
};

export default function LogsUsuariosPage() {
  const router = useRouter();
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadAccessAndUsers = async () => {
      try {
        const meRes = await fetch('/api/users/me', { cache: 'no-store', credentials: 'include' });
        if (!meRes.ok) throw new Error('Nao autenticado.');
        const me = await meRes.json();
        const role = (me?.role ?? '').toLowerCase();
        if (!active) return;
        setCanView(role === 'admin');
        if (role !== 'admin') {
          setLoading(false);
          return;
        }

        const usersRes = await fetch('/api/users');
        if (!usersRes.ok) throw new Error('Erro ao buscar usuarios.');
        const data = (await usersRes.json()) as DbUser[];
        if (!active) return;
        setUsers(data);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };
    void loadAccessAndUsers();
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return users;
    return users.filter((user) => {
      return (
        user.username.toLowerCase().includes(query) ||
        (user.role ?? '').toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const loadLogs = async (userId: string) => {
    setLogsLoading(true);
    setLogs([]);
    try {
      const res = await fetch(`/api/audit?userId=${encodeURIComponent(userId)}&limit=100`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao buscar logs.');
      }
      const data = (await res.json()) as AuditLog[];
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar logs.');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    void loadLogs(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Log de usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Selecione um usuario para visualizar as atividades registradas.
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/administrador')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Carregando...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : !canView ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Acesso restrito para visualizar logs.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuario"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    Nenhum usuario encontrado.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user.id)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                        selectedUserId === user.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{user.username}</span>
                        <Badge variant="secondary">{user.role || '-'}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedUserId ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Selecione um usuario para visualizar o log.
                </div>
              ) : logsLoading ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Carregando logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhum log registrado.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{log.action}</Badge>
                      <span>{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                      <span>{log.entityType}</span>
                    </div>
                    {(log.metadata?.url || log.ip) && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {log.metadata?.url ? <span>URL: {log.metadata.url}</span> : null}
                        {log.ip ? <span className={log.metadata?.url ? 'ml-3' : ''}>IP: {log.ip}</span> : null}
                      </div>
                    )}
                    {log.message && <p className="mt-2 text-foreground">{log.message}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
