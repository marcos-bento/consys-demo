'use client';

import { useMemo, useState } from 'react';
import { Calculator, Calendar, Eye, FileText, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { Colaborador, Ferias, StatusFerias } from '@/lib/mock/dep-pessoal';
import { useDemoData } from '@/src/lib/demo-context';

type StatusFeriasUI = StatusFerias | 'Solicitado' | 'Aprovado' | 'Reprovado' | 'Cancelado';

type FeriasUI = Omit<Ferias, 'status'> & {
  status: StatusFeriasUI;
  dataFim?: string;
  diasSolicitados?: number;
  dataSolicitacao?: string;
  observacoes?: string;
};

export function FeriasTab() {
  const router = useRouter();
  const { ferias, setFerias, colaboradores } = useDemoData();

  const feriasUI: FeriasUI[] = ferias as unknown as FeriasUI[];
  const setFeriasUI = setFerias as unknown as React.Dispatch<React.SetStateAction<FeriasUI[]>>;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [anoFilter, setAnoFilter] = useState<string>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newFerias, setNewFerias] = useState({
    colaboradorId: '',
    dataInicio: '',
    dataFim: '',
    diasSolicitados: '',
    observacoes: '',
    status: 'Solicitado' as StatusFeriasUI,
  });

  const filteredFerias = useMemo(() => {
    return feriasUI.filter((feria) => {
      const colaborador = (colaboradores as Colaborador[]).find(c => c.id === feria.colaboradorId);
      const dataFim = feria.dataFim ?? feria.dataRetorno ?? '';
      const matchesSearch =
        (colaborador?.nome.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        feria.dataInicio.includes(search) ||
        dataFim.includes(search);

      const matchesStatus = statusFilter === 'Todos' || feria.status === statusFilter;
      const matchesAno = anoFilter === 'Todos' || new Date(feria.dataInicio).getFullYear().toString() === anoFilter;

      return matchesSearch && matchesStatus && matchesAno;
    });
  }, [feriasUI, search, statusFilter, anoFilter, colaboradores]);

  const anosUnicos = useMemo(() => {
    const anos = [...new Set(feriasUI.map(f => new Date(f.dataInicio).getFullYear()))];
    return anos.sort((a, b) => b - a);
  }, [feriasUI]);

  const handleAddFerias = () => {
    if (!newFerias.colaboradorId || !newFerias.dataInicio || !newFerias.dataFim) return;

    const dataInicio = new Date(newFerias.dataInicio);
    const dataFim = new Date(newFerias.dataFim);
    const diasSolicitados = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const ferias = {
      id: Date.now().toString(),
      ...newFerias,
      diasSolicitados,
      dataSolicitacao: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dias: diasSolicitados,
      periodoAquisitivoInicio: newFerias.dataInicio,
      periodoAquisitivoFim: newFerias.dataFim,
      periodoConcessivoInicio: newFerias.dataInicio,
      periodoConcessivoFim: newFerias.dataFim,
      dataLimiteGozo: newFerias.dataFim,
      dataRetorno: newFerias.dataFim,
      abonoPecuniario: false,
      decimoTerceiro: false,
    } as FeriasUI;

    setFeriasUI(prev => [...prev, ferias]);
    setNewFerias({
      colaboradorId: '',
      dataInicio: '',
      dataFim: '',
      diasSolicitados: '',
      observacoes: '',
      status: 'Solicitado',
    });
    setIsDialogOpen(false);
  };

  const getStatusBadgeColor = (status: StatusFeriasUI) => {
    switch (status) {
      case 'Solicitado':
        return 'bg-blue-100 text-blue-800';
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Reprovado':
        return 'bg-red-100 text-red-800';
      case 'Cancelado':
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800';
      case 'Em gozo':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularDiasDisponiveis = (colaboradorId: string) => {
    const colaborador = (colaboradores as Colaborador[]).find(c => c.id === colaboradorId);
    if (!colaborador) return 0;

    const feriasAprovadas = feriasUI.filter(f =>
      f.colaboradorId === colaboradorId &&
      f.status === 'Aprovado' &&
      new Date(f.dataInicio).getFullYear() === new Date().getFullYear()
    );

    const diasUtilizados = feriasAprovadas.reduce((total, f) => total + (f.diasSolicitados ?? f.dias ?? 0), 0);
    return 30 - diasUtilizados;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Solicitações Pendentes</p>
                <p className="text-2xl font-bold">
                  {feriasUI.filter(f => f.status === 'Solicitado').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Férias Aprovadas</p>
                <p className="text-2xl font-bold">
                  {feriasUI.filter(f => f.status === 'Aprovado').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Dias Solicitados</p>
                <p className="text-2xl font-bold">
                  {feriasUI
                    .filter(f => f.status === 'Aprovado')
                    .reduce((total, f) => total + (f.diasSolicitados ?? f.dias ?? 0), 0)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Solicitações de Férias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="Buscar por colaborador..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Solicitado">Solicitado</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Reprovado">Reprovado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={anoFilter} onValueChange={setAnoFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {anosUnicos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova solicitação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nova Solicitação de Férias</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Colaborador *</Label>
                    <Select
                      value={newFerias.colaboradorId}
                      onValueChange={(value) => setNewFerias({ ...newFerias, colaboradorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {colaboradores.map((colaborador) => (
                          <SelectItem key={colaborador.id} value={colaborador.id}>
                            {colaborador.nome} - {colaborador.cargo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newFerias.colaboradorId && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        Dias disponíveis: <strong>{calcularDiasDisponiveis(newFerias.colaboradorId)}</strong>
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Data de Início *</Label>
                      <Input
                        type="date"
                        value={newFerias.dataInicio}
                        onChange={(e) => setNewFerias({ ...newFerias, dataInicio: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Data de Fim *</Label>
                      <Input
                        type="date"
                        value={newFerias.dataFim}
                        onChange={(e) => setNewFerias({ ...newFerias, dataFim: e.target.value })}
                      />
                    </div>
                  </div>

                  {newFerias.dataInicio && newFerias.dataFim && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-green-700">
                        Dias solicitados: <strong>
                          {Math.ceil((new Date(newFerias.dataFim).getTime() - new Date(newFerias.dataInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                        </strong>
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label>Observações</Label>
                    <Textarea
                      value={newFerias.observacoes}
                      onChange={(e) => setNewFerias({ ...newFerias, observacoes: e.target.value })}
                      placeholder="Motivo da solicitação, observações..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleAddFerias}
                    className="w-full"
                    disabled={!newFerias.colaboradorId || !newFerias.dataInicio || !newFerias.dataFim}
                  >
                    Solicitar Férias
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {filteredFerias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Solicitação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFerias.map((feria) => {
                  const colaborador = (colaboradores as Colaborador[]).find(c => c.id === feria.colaboradorId);
                  const dataFim = feria.dataFim ?? feria.dataRetorno ?? feria.dataInicio;
                  const dias = feria.diasSolicitados ?? feria.dias ?? 0;
                  const dataSolicitacao = feria.dataSolicitacao ?? feria.createdAt ?? feria.dataInicio;

                  return (
                    <TableRow key={feria.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {colaborador?.nome || 'Colaborador não encontrado'}
                        <div className="text-sm text-muted-foreground">{colaborador?.cargo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(feria.dataInicio).toLocaleDateString('pt-BR')}</div>
                          <div className="text-muted-foreground">até {new Date(dataFim).toLocaleDateString('pt-BR')}</div>
                        </div>
                      </TableCell>
                      <TableCell>{dias} dias</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(feria.status)}>
                          {feria.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(dataSolicitacao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dep-pessoal/ferias/${feria.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* TODO: Implementar geração de documento */}}
                          >
                            <FileText className="h-4 w-4" />
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
