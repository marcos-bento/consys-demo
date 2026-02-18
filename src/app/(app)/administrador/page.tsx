'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdministradorPage() {
  const [canViewUserLogs, setCanViewUserLogs] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch('/api/users/me', { cache: 'no-store', credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const role = (data?.role ?? '').toLowerCase();
        setCanViewUserLogs(role === 'admin');
      } catch (error) {
        console.error('Erro ao carregar usuario atual', error);
      }
    };
    void loadMe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Administrador</h1>
        <p className="text-gray-600">Configuracoes avancadas e controles administrativos.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Configuracoes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant="secondary" className="min-w-[180px] justify-center">
            <Link href="/administrador/funis">Configurar Funis</Link>
          </Button>
          {canViewUserLogs ? (
            <Button asChild variant="secondary" className="min-w-[180px] justify-center">
              <Link href="/administrador/logs-usuarios">Visualizar Log de Usuario</Link>
            </Button>
          ) : null}
          <Button variant="secondary" className="min-w-[180px] justify-center">
            Atribuir funcoes para usuarios
          </Button>
          <Button variant="secondary" className="min-w-[180px] justify-center">
            Outras funcoes de configuracoes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
