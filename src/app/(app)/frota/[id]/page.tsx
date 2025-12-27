'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Edit, Wrench, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Veiculo, StatusVeiculo, TipoVeiculo } from '../../../../lib/mock/frota';
import { useDemoData } from '@/src/lib/demo-context';

export default function VeiculoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { veiculos, setVeiculos, usuarios } = useDemoData();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const veiculo = useMemo(() => {
    return veiculos.find(v => v.id === params.id);
  }, [veiculos, params.id]);

  const responsavel = useMemo(() => {
    if (!veiculo) return null;
    return usuarios.find(u => u.id === veiculo.responsavelId);
  }, [veiculo, usuarios]);

  const [editVeiculo, setEditVeiculo] = useState<Veiculo | null>(null);

  if (!veiculo) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Veículo não encontrado</h1>
          <p className="text-muted-foreground">O veículo solicitado não foi encontrado.</p>
        </div>
        <Button onClick={() => router.push('/frota')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Frota
        </Button>
      </div>
    );
  }

  const handleEditVeiculo = () => {
    setEditVeiculo({ ...veiculo });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editVeiculo) return;

    setVeiculos(prev => prev.map(v =>
      v.id === veiculo.id
        ? { ...editVeiculo, updatedAt: new Date().toISOString() }
        : v
    ));
    setIsEditDialogOpen(false);
    setEditVeiculo(null);
  };

  const handleMarcarManutencao = () => {
    const novoStatus: StatusVeiculo = veiculo.status === 'Em manutenção' ? 'Ativo' : 'Em manutenção';

    setVeiculos(prev => prev.map(v =>
      v.id === veiculo.id
        ? { ...v, status: novoStatus, updatedAt: new Date().toISOString() }
        : v
    ));
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push('/frota')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-semibold">{veiculo.apelido}</h1>
          </div>
          <p className="text-muted-foreground">Detalhes do veículo</p>
        </div>
      </div>

      {/* Resumo Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações do Veículo</span>
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push(`/frota/${veiculo.id}/agenda`)}
                variant="outline"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Ir para agenda
              </Button>
              <Button onClick={handleEditVeiculo} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                onClick={handleMarcarManutencao}
                variant={veiculo.status === 'Em manutenção' ? 'default' : 'destructive'}
              >
                <Wrench className="mr-2 h-4 w-4" />
                {veiculo.status === 'Em manutenção' ? 'Liberar manutenção' : 'Marcar manutenção'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Apelido</Label>
              <p className="text-lg font-semibold">{veiculo.apelido}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Placa</Label>
              <p className="text-lg font-semibold">{veiculo.placa}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
              <Badge className={getTipoBadgeColor(veiculo.tipo)}>
                {veiculo.tipo}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className={getStatusBadgeColor(veiculo.status)}>
                {veiculo.status}
              </Badge>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Modelo</Label>
                <p>{veiculo.modelo || '-'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Capacidade</Label>
                <p>{veiculo.capacidade || '-'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Responsável
                </Label>
                <p>{responsavel?.nome || '-'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Última atualização</Label>
                <p>{new Date(veiculo.updatedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Observações */}
          {veiculo.observacoes && (
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
              <p className="text-sm bg-muted/30 p-3 rounded-md">{veiculo.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
          </DialogHeader>
          {editVeiculo && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Apelido *</Label>
                <Input
                  value={editVeiculo.apelido}
                  onChange={(e) => setEditVeiculo({ ...editVeiculo, apelido: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Placa *</Label>
                <Input
                  value={editVeiculo.placa}
                  onChange={(e) => setEditVeiculo({ ...editVeiculo, placa: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <Select
                    value={editVeiculo.tipo}
                    onValueChange={(value: TipoVeiculo) => setEditVeiculo({ ...editVeiculo, tipo: value })}
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
                    value={editVeiculo.status}
                    onValueChange={(value: StatusVeiculo) => setEditVeiculo({ ...editVeiculo, status: value })}
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
                  value={editVeiculo.modelo}
                  onChange={(e) => setEditVeiculo({ ...editVeiculo, modelo: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Capacidade</Label>
                <Input
                  value={editVeiculo.capacidade}
                  onChange={(e) => setEditVeiculo({ ...editVeiculo, capacidade: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Responsável</Label>
                <Select
                  value={editVeiculo.responsavelId}
                  onValueChange={(value) => setEditVeiculo({ ...editVeiculo, responsavelId: value })}
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
                  value={editVeiculo.observacoes}
                  onChange={(e) => setEditVeiculo({ ...editVeiculo, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Salvar Alterações
                </Button>
                <Button
                  onClick={() => setIsEditDialogOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}