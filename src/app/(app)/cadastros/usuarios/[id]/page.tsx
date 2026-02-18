'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type UserDetail = {
  id: string;
  username: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  createdAt?: string;
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

export default function UsuarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [userRes, logsRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/audit?userId=${encodeURIComponent(id)}&limit=50`),
        ]);
        if (!userRes.ok) {
          const data = await userRes.json().catch(() => ({}));
          throw new Error(data.error || 'Erro ao buscar usuario.');
        }
        if (!logsRes.ok) {
          const data = await logsRes.json().catch(() => ({}));
          throw new Error(data.error || 'Erro ao buscar logs.');
        }
        const userData = (await userRes.json()) as UserDetail;
        const logsData = (await logsRes.json()) as AuditLog[];
        if (!active) return;
        setUser(userData);
        setLogs(logsData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };
    void loadData();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Usuario</h1>
          <p className="text-sm text-muted-foreground">Resumo e acoes registradas.</p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/cadastros/usuarios')}>
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
      ) : (
        <>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Detalhes do usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="secondary">{user?.role || 'Sem perfil'}</Badge>
                {user?.createdAt && (
                  <Badge variant="outline">
                    Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nome completo</p>
                  <p className="font-medium">{user?.fullName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-medium">{user?.phone || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Logs de atividade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {logs.length === 0 ? (
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
        </>
      )}
    </div>
  );
}
