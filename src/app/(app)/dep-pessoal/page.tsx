'use client';

import { useState } from 'react';
import { Users, Calendar, Clock, UserPlus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecrutamentoTab } from './components/recrutamento-tab';
import { FeriasTab } from './components/ferias-tab';
import { PontoTab } from './components/ponto-tab';

export default function DepPessoalPage() {
  const [activeTab, setActiveTab] = useState('recrutamento');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Departamento Pessoal</h1>
        <p className="text-muted-foreground">Gestão de recrutamento, férias e controle de ponto</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Em processo</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Férias Planejadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Extras</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recrutamento" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Recrutamento</span>
          </TabsTrigger>
          <TabsTrigger value="ferias" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Férias</span>
          </TabsTrigger>
          <TabsTrigger value="ponto" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Ponto</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recrutamento" className="space-y-6">
          <RecrutamentoTab />
        </TabsContent>

        <TabsContent value="ferias" className="space-y-6">
          <FeriasTab />
        </TabsContent>

        <TabsContent value="ponto" className="space-y-6">
          <PontoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}