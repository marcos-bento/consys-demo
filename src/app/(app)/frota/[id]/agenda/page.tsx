'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, FileText, Download, Clock, MapPin, User, Calendar as CalendarIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Veiculo, Agendamento, TipoAgendamento, OrdemServico } from '@/lib/mock/frota';
import { useDemoData } from '@/src/lib/demo-context';

export default function AgendaVeiculoPage() {
  const params = useParams();
  const router = useRouter();
  const { veiculos, agendamentos, setAgendamentos, ordensServico, setOrdensServico, usuarios, clientes } = useDemoData();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const veiculo = useMemo(() => {
    return veiculos.find(v => v.id === params.id);
  }, [veiculos, params.id]);

  // Estado para novo agendamento
  const [newAgendamento, setNewAgendamento] = useState({
    data: selectedDate,
    horaInicio: '',
    horaFim: '',
    tipo: 'Entrega' as TipoAgendamento,
    clienteId: '',
    endereco: '',
    documentoVinculado: '',
    observacao: '',
    responsavelId: '',
  });

  // Agendamentos do dia selecionado para este veículo
  const agendamentosDoDia = useMemo(() => {
    return agendamentos
      .filter(a => a.veiculoId === params.id && a.data === selectedDate)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [agendamentos, params.id, selectedDate]);

  // Verificar conflitos de horário
  const hasConflitoHorario = useMemo(() => {
    if (!newAgendamento.horaInicio) return false;

    return agendamentosDoDia.some(agendamento => {
      if (agendamento.horaFim && newAgendamento.horaFim) {
        // Verificar sobreposição completa
        const inicioNovo = newAgendamento.horaInicio;
        const fimNovo = newAgendamento.horaFim;
        const inicioExistente = agendamento.horaInicio;
        const fimExistente = agendamento.horaFim!;

        return (
          (inicioNovo >= inicioExistente && inicioNovo < fimExistente) ||
          (fimNovo > inicioExistente && fimNovo <= fimExistente) ||
          (inicioNovo <= inicioExistente && fimNovo >= fimExistente)
        );
      } else {
        // Se não tem hora fim, verificar apenas se começa no mesmo horário
        return agendamento.horaInicio === newAgendamento.horaInicio;
      }
    });
  }, [agendamentosDoDia, newAgendamento.horaInicio, newAgendamento.horaFim]);

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

  const handleAddAgendamento = () => {
    if (!newAgendamento.horaInicio || !newAgendamento.clienteId) return;
    if (hasConflitoHorario) return;

    const agendamento: Agendamento = {
      id: Date.now().toString(),
      veiculoId: veiculo.id,
      data: newAgendamento.data,
      horaInicio: newAgendamento.horaInicio,
      horaFim: newAgendamento.horaFim || undefined,
      tipo: newAgendamento.tipo,
      clienteId: newAgendamento.clienteId,
      endereco: newAgendamento.endereco,
      documentoVinculado: newAgendamento.documentoVinculado || undefined,
      observacao: newAgendamento.observacao || undefined,
      responsavelId: veiculo.responsavelId, // Usa o responsável do veículo por padrão
      status: 'Programado',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAgendamentos(prev => [...prev, agendamento]);
    setNewAgendamento({
      data: selectedDate,
      horaInicio: '',
      horaFim: '',
      tipo: 'Entrega',
      clienteId: '',
      endereco: '',
      documentoVinculado: '',
      observacao: '',
      responsavelId: '',
    });
    setIsDialogOpen(false);
  };

  const handleGerarOS = (agendamentoId?: string) => {
    const agendamentosParaOS = agendamentoId
      ? [agendamentos.find(a => a.id === agendamentoId)!]
      : agendamentosDoDia;

    if (agendamentosParaOS.length === 0) return;

    const codigo = `OS-${Date.now().toString().slice(-6)}`;

    const os: OrdemServico = {
      id: Date.now().toString(),
      codigo,
      veiculoId: veiculo.id,
      motoristaId: veiculo.responsavelId,
      data: selectedDate,
      agendamentos: agendamentosParaOS.map(a => a.id),
      status: 'Gerada',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrdensServico(prev => [...prev, os]);

    // Simular download/geração do PDF
    alert(`OS ${codigo} gerada com sucesso! Em produção, seria gerado um PDF para download.`);
  };

  const getTipoBadgeColor = (tipo: TipoAgendamento) => {
    switch (tipo) {
      case 'Entrega':
        return 'bg-blue-100 text-blue-800';
      case 'Coleta':
        return 'bg-green-100 text-green-800';
      case 'Visita técnica':
        return 'bg-purple-100 text-purple-800';
      case 'Outro':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Programado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em rota':
        return 'bg-blue-100 text-blue-800';
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarHorario = (hora: string) => {
    return hora.substring(0, 5); // HH:MM
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push(`/frota/${veiculo.id}`)}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-semibold">Agenda - {veiculo.apelido}</h1>
          </div>
          <p className="text-muted-foreground">Gerencie os agendamentos do veículo</p>
        </div>
      </div>

      {/* Date Selector and Actions */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="pt-6">
                <Badge className={veiculo.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {veiculo.status}
                </Badge>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => handleGerarOS()}
                variant="outline"
                disabled={agendamentosDoDia.length === 0}
              >
                <FileText className="mr-2 h-4 w-4" />
                Gerar OS do dia
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={veiculo.status === 'Em manutenção'}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={newAgendamento.data}
                          onChange={(e) => setNewAgendamento({ ...newAgendamento, data: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Tipo</Label>
                        <Select
                          value={newAgendamento.tipo}
                          onValueChange={(value: TipoAgendamento) => setNewAgendamento({ ...newAgendamento, tipo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entrega">Entrega</SelectItem>
                            <SelectItem value="Coleta">Coleta</SelectItem>
                            <SelectItem value="Visita técnica">Visita técnica</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Horário início *</Label>
                        <Input
                          type="time"
                          value={newAgendamento.horaInicio}
                          onChange={(e) => setNewAgendamento({ ...newAgendamento, horaInicio: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Horário fim</Label>
                        <Input
                          type="time"
                          value={newAgendamento.horaFim}
                          onChange={(e) => setNewAgendamento({ ...newAgendamento, horaFim: e.target.value })}
                        />
                      </div>
                    </div>

                    {hasConflitoHorario && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          ⚠️ Conflito de horário detectado! Já existe um agendamento neste período.
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label>Cliente *</Label>
                      <Select
                        value={newAgendamento.clienteId}
                        onValueChange={(value) => {
                          setNewAgendamento({
                            ...newAgendamento,
                            clienteId: value,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Endereço</Label>
                      <Input
                        value={newAgendamento.endereco}
                        onChange={(e) => setNewAgendamento({ ...newAgendamento, endereco: e.target.value })}
                        placeholder="Endereço da entrega/coleta"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Observação</Label>
                      <Textarea
                        value={newAgendamento.observacao}
                        onChange={(e) => setNewAgendamento({ ...newAgendamento, observacao: e.target.value })}
                        placeholder="Observações adicionais..."
                        rows={2}
                      />
                    </div>

                    <Button
                      onClick={handleAddAgendamento}
                      className="w-full"
                      disabled={!newAgendamento.horaInicio || !newAgendamento.clienteId || hasConflitoHorario}
                    >
                      Criar Agendamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agenda do Dia */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Agendamentos do dia {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentosDoDia.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Nenhum agendamento para este dia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentosDoDia.map((agendamento) => {
                const cliente = clientes.find(c => c.id === agendamento.clienteId);
                const responsavel = usuarios.find(u => u.id === agendamento.responsavelId);

                return (
                  <Card key={agendamento.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatarHorario(agendamento.horaInicio)}
                                {agendamento.horaFim && ` - ${formatarHorario(agendamento.horaFim)}`}
                              </span>
                            </div>
                            <Badge className={getTipoBadgeColor(agendamento.tipo)}>
                              {agendamento.tipo}
                            </Badge>
                            <Badge className={getStatusBadgeColor(agendamento.status)}>
                              {agendamento.status}
                            </Badge>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{cliente?.nome}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{agendamento.endereco}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {responsavel && (
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">Resp: {responsavel.nome}</span>
                                </div>
                              )}
                              {agendamento.observacao && (
                                <p className="text-sm text-muted-foreground">
                                  {agendamento.observacao}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleGerarOS(agendamento.id)}
                            variant="outline"
                            size="sm"
                          >
                            <FileText className="mr-1 h-3 w-3" />
                            OS
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
