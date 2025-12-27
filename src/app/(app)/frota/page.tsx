'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Veiculo, TipoVeiculo, StatusVeiculo } from '../../../lib/mock/frota';
import { useDemoData } from '@/src/lib/demo-context';

export default function FrotaPage() {
  const router = useRouter();
  const { veiculos, setVeiculos, usuarios, clientes } = useDemoData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estado para novo veículo
  const [newVeiculo, setNewVeiculo] = useState({
    apelido: '',
    placa: '',
    tipo: 'Van' as TipoVeiculo,
    modelo: '',
    capacidade: '',
    status: 'Ativo' as StatusVeiculo,
    responsavelId: '',
    observacoes: '',
  });

  // Filtros aplicados
  const filteredVeiculos = useMemo(() => {
    return veiculos.filter((veiculo) => {
      const matchesSearch =
        veiculo.apelido.toLowerCase().includes(search.toLowerCase()) ||
        veiculo.placa.toLowerCase().includes(search.toLowerCase()) ||
        veiculo.modelo.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'Todos' || veiculo.status === statusFilter;
      const matchesTipo = tipoFilter === 'Todos' || veiculo.tipo === tipoFilter;

      const responsavel = usuarios.find(u => u.id === veiculo.responsavelId);
      const matchesResponsavel = responsavelFilter === 'Todos' ||
        (responsavel && responsavel.nome.toLowerCase().includes(responsavelFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesTipo && matchesResponsavel;
    });
  }, [veiculos, search, statusFilter, tipoFilter, responsavelFilter, usuarios]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = veiculos.length;
    const ativos = veiculos.filter(v => v.status === 'Ativo').length;
    const emManutencao = veiculos.filter(v => v.status === 'Em manutenção').length;
    const inativos = veiculos.filter(v => v.status === 'Inativo').length;

    return [
      { label: 'Total', value: total, icon: '🚛' },
      { label: 'Ativos', value: ativos, icon: '✅' },
      { label: 'Em Manutenção', value: emManutencao, icon: '🔧' },
      { label: 'Inativos', value: inativos, icon: '❌' },
    ];
  }, [veiculos]);

  const handleAddVeiculo = () => {
    if (!newVeiculo.apelido || !newVeiculo.placa) return;

    const veiculo: Veiculo = {
      id: Date.now().toString(),
      ...newVeiculo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setVeiculos(prev => [...prev, veiculo]);
    setNewVeiculo({
      apelido: '',
      placa: '',
      tipo: 'Van',
      modelo: '',
      capacidade: '',
      status: 'Ativo',
      responsavelId: '',
      observacoes: '',
    });
    setIsDialogOpen(false);
  };

  const getStatusBadgeColor = (status: StatusVeiculo) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Em manutenção':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inativo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoBadgeColor = (tipo: TipoVeiculo) => {
    switch (tipo) {
      case 'Van':
        return 'bg-blue-100 text-blue-800';
      case 'Caminhão':
        return 'bg-purple-100 text-purple-800';
      case 'Utilitário':
        return 'bg-orange-100 text-orange-800';
      case 'Carro':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Frota</h1>
        <p className="text-muted-foreground">Gerencie veículos e agendamentos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <span className="text-lg">{stat.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Veículos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa, modelo ou apelido..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>

              {/* Tipo Filter */}
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Caminhão">Caminhão</SelectItem>
                  <SelectItem value="Utilitário">Utilitário</SelectItem>
                  <SelectItem value="Carro">Carro</SelectItem>
                </SelectContent>
              </Select>

              {/* Responsável Filter */}
              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger className="w-full sm:w-48">
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
            </div>

            {/* New Vehicle Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo veículo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Veículo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Apelido *</Label>
                    <Input
                      value={newVeiculo.apelido}
                      onChange={(e) => setNewVeiculo({ ...newVeiculo, apelido: e.target.value })}
                      placeholder="ex.: Van 01"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Placa *</Label>
                    <Input
                      value={newVeiculo.placa}
                      onChange={(e) => setNewVeiculo({ ...newVeiculo, placa: e.target.value })}
                      placeholder="ABC-1234"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Tipo</Label>
                      <Select
                        value={newVeiculo.tipo}
                        onValueChange={(value: TipoVeiculo) => setNewVeiculo({ ...newVeiculo, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Van">Van</SelectItem>
                          <SelectItem value="Caminhão">Caminhão</SelectItem>
                          <SelectItem value="Utilitário">Utilitário</SelectItem>
                          <SelectItem value="Carro">Carro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select
                        value={newVeiculo.status}
                        onValueChange={(value: StatusVeiculo) => setNewVeiculo({ ...newVeiculo, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Modelo</Label>
                    <Input
                      value={newVeiculo.modelo}
                      onChange={(e) => setNewVeiculo({ ...newVeiculo, modelo: e.target.value })}
                      placeholder="ex.: Fiat Ducato"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Capacidade</Label>
                    <Input
                      value={newVeiculo.capacidade}
                      onChange={(e) => setNewVeiculo({ ...newVeiculo, capacidade: e.target.value })}
                      placeholder="ex.: 10 m³ ou 2.500 kg"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Responsável</Label>
                    <Select
                      value={newVeiculo.responsavelId}
                      onValueChange={(value) => setNewVeiculo({ ...newVeiculo, responsavelId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Observações</Label>
                    <Textarea
                      value={newVeiculo.observacoes}
                      onChange={(e) => setNewVeiculo({ ...newVeiculo, observacoes: e.target.value })}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleAddVeiculo}
                    className="w-full"
                    disabled={!newVeiculo.apelido || !newVeiculo.placa}
                  >
                    Cadastrar Veículo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          {filteredVeiculos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum veículo encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apelido / Nome</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVeiculos.map((veiculo) => {
                  const responsavel = usuarios.find(u => u.id === veiculo.responsavelId);
                  return (
                    <TableRow key={veiculo.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{veiculo.apelido}</TableCell>
                      <TableCell>{veiculo.placa}</TableCell>
                      <TableCell>
                        <Badge className={getTipoBadgeColor(veiculo.tipo)}>
                          {veiculo.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{veiculo.capacidade || '-'}</TableCell>
                      <TableCell>{responsavel?.nome || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(veiculo.status)}>
                          {veiculo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/frota/${veiculo.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/frota/${veiculo.id}/agenda`)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
