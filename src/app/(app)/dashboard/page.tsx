'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, CheckCircle, XCircle, Clock, DollarSign, ShoppingCart } from 'lucide-react';

// Dados mockados
const stats = [
  { title: 'Leads Ativos', value: 124, icon: User },
  { title: 'Propostas em Aberto', value: 45, icon: Clock },
  { title: 'Pedidos no Mês', value: 78, icon: ShoppingCart },
  { title: 'Faturamento', value: 'R$ 1.250.000', icon: DollarSign },
];

const statusData = [
  { status: 'Aguardando', count: 20, color: 'bg-yellow-500' },
  { status: 'Aprovado', count: 15, color: 'bg-[#4a8f4a]' },
  { status: 'Rejeitado', count: 10, color: 'bg-[#d34c46]' },
];

const activities = [
  { icon: User, text: 'Novo lead cadastrado: João Silva' },
  { icon: CheckCircle, text: 'Proposta aprovada para Empresa XYZ' },
  { icon: XCircle, text: 'Proposta rejeitada para Cliente ABC' },
  { icon: Clock, text: 'Reunião agendada com Lead 123' },
  { icon: DollarSign, text: 'Pagamento recebido: R$ 25.000' },
  { icon: ShoppingCart, text: 'Novo pedido criado: Pedido #456' },
];

const proposals = [
  { cliente: 'Empresa A', valor: 'R$ 50.000', status: 'Aprovado' },
  { cliente: 'Cliente B', valor: 'R$ 30.000', status: 'Aguardando' },
  { cliente: 'Empresa C', valor: 'R$ 75.000', status: 'Aprovado' },
  { cliente: 'Lead D', valor: 'R$ 20.000', status: 'Rejeitado' },
  { cliente: 'Cliente E', valor: 'R$ 40.000', status: 'Aguardando' },
];

const getGreeting = (hour: number) => {
  if (hour >= 18) return 'Boa noite';
  if (hour >= 12) return 'Boa tarde';
  return 'Bom dia';
};

export default function Dashboard() {
  const maxCount = Math.max(...statusData.map(d => d.count));
  const [username, setUsername] = useState('Usuário');
  const [greeting, setGreeting] = useState('Bom dia');

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">{greeting}, {username}</p>
        <p className="text-gray-600">Visão geral do sistema</p>
      </div>

      {/* Grid de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de propostas por status */}
        <Card>
          <CardHeader>
            <CardTitle>Propostas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm">{item.status}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-sm font-medium">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividades recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <activity.icon className="h-5 w-5 text-gray-500" />
                  <p className="text-sm">{activity.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de últimas propostas */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal, index) => (
                <TableRow key={index}>
                  <TableCell>{proposal.cliente}</TableCell>
                  <TableCell>{proposal.valor}</TableCell>
                  <TableCell>{proposal.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
