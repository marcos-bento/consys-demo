'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdministradorPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Administrador</h1>
        <p className="text-gray-600">Configurações avançadas e controles administrativos.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary" className="min-w-[180px] justify-center">
            Ver log
          </Button>
          <Button variant="secondary" className="min-w-[180px] justify-center">
            Atribuir funções para usuários
          </Button>
          <Button variant="secondary" className="min-w-[180px] justify-center">
            Outras funções de configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
