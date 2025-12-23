'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, Wrench, Fuel, Gauge } from 'lucide-react';

type Veiculo = {
  id: string;
  modelo: string;
  placa: string;
  status: 'Disponível' | 'Em uso' | 'Manutenção';
  proximaRevisao: string;
  km: number;
};

const frota: Veiculo[] = [
  { id: '1', modelo: 'Van de entregas', placa: 'FRO-001', status: 'Em uso', proximaRevisao: '15/02/2026', km: 48200 },
  { id: '2', modelo: 'Caminhão leve', placa: 'FRO-002', status: 'Disponível', proximaRevisao: '03/03/2026', km: 32100 },
  { id: '3', modelo: 'Pick-up suporte', placa: 'FRO-003', status: 'Manutenção', proximaRevisao: 'Em oficina', km: 75400 },
];

const stats = [
  { label: 'Veículos', value: '3', icon: Truck },
  { label: 'Disponíveis', value: '1', icon: Gauge },
  { label: 'Em uso', value: '1', icon: Fuel },
  { label: 'Em manutenção', value: '1', icon: Wrench },
];

const statusBadge = (status: Veiculo['status']) => {
  switch (status) {
    case 'Disponível':
      return 'bg-green-100 text-green-800';
    case 'Em uso':
      return 'bg-blue-100 text-blue-800';
    case 'Manutenção':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function FrotaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Frota</h1>
        <p className="text-gray-600">Status rápido dos veículos e revisões</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Veículos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próxima revisão</TableHead>
                <TableHead>Km</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frota.map((veiculo) => (
                <TableRow key={veiculo.id}>
                  <TableCell className="font-medium">{veiculo.modelo}</TableCell>
                  <TableCell>{veiculo.placa}</TableCell>
                  <TableCell>
                    <Badge className={statusBadge(veiculo.status)}>{veiculo.status}</Badge>
                  </TableCell>
                  <TableCell>{veiculo.proximaRevisao}</TableCell>
                  <TableCell>{veiculo.km.toLocaleString('pt-BR')} km</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
