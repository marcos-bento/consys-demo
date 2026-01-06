'use client';

import { useState, useMemo } from 'react';
import { Clock, Upload, Eye, FileText, Calculator } from 'lucide-react';
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
import type { RegistroPonto } from '@/lib/mock/dep-pessoal';
import { useDemoData } from '@/src/lib/demo-context';

type StatusImportacao = 'Processando' | 'Concluido' | 'Erro';

type ImportacaoPontoUI = {
  id: string;
  colaboradorId: string;
  mes: string;
  ano: string;
  arquivo: string;
  observacoes: string;
  status: StatusImportacao;
  dataImportacao: string;
  registrosProcessados: number;
  horasExtrasCalculadas: number;
  createdAt: string;
  updatedAt: string;
};

type RegistroPontoUI = RegistroPonto & {
  horasTrabalhadas?: number;
  horasExtras?: number;
  importacaoId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function PontoTab() {
  const router = useRouter();
  const {
    registrosPonto,
    setRegistrosPonto,
    importacoesPonto,
    setImportacoesPonto,
    colaboradores,
  } = useDemoData();
  const registrosPontoUI = registrosPonto as unknown as RegistroPontoUI[];
  const setRegistrosPontoUI = setRegistrosPonto as unknown as React.Dispatch<
    React.SetStateAction<RegistroPontoUI[]>
  >;
  const importacoesPontoUI = importacoesPonto as unknown as ImportacaoPontoUI[];
  const setImportacoesPontoUI = setImportacoesPonto as unknown as React.Dispatch<
    React.SetStateAction<ImportacaoPontoUI[]>
  >;
  const [search, setSearch] = useState('');
  const [mesFilter, setMesFilter] = useState<string>('Todos');
  const [anoFilter, setAnoFilter] = useState<string>(new Date().getFullYear().toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estado para nova importação
  const [newImportacao, setNewImportacao] = useState({
    colaboradorId: '',
    mes: '',
    ano: '',
    arquivo: '',
    observacoes: '',
    status: 'Processando' as StatusImportacao,
  });

  // Filtros aplicados
  const filteredRegistros = useMemo(() => {
    return registrosPontoUI.filter((registro) => {
      const colaborador = colaboradores.find(c => c.id === registro.colaboradorId);
      const matchesSearch =
        (colaborador?.nome.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        registro.data.includes(search);

      const matchesMes = mesFilter === 'Todos' || new Date(registro.data).getMonth() + 1 === parseInt(mesFilter);
      const matchesAno = anoFilter === 'Todos' || new Date(registro.data).getFullYear().toString() === anoFilter;

      return matchesSearch && matchesMes && matchesAno;
    });
  }, [registrosPontoUI, search, mesFilter, anoFilter, colaboradores]);

  // Meses e anos únicos para filtros
  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const anosUnicos = useMemo(() => {
    const anos = [...new Set(registrosPontoUI.map(r => new Date(r.data).getFullYear()))];
    return anos.sort((a, b) => b - a);
  }, [registrosPontoUI]);

  const handleImportPonto = () => {
    if (!newImportacao.colaboradorId || !newImportacao.mes || !newImportacao.ano) return;

    const importacao: ImportacaoPontoUI = {
      id: Date.now().toString(),
      ...newImportacao,
      dataImportacao: new Date().toISOString().split('T')[0],
      registrosProcessados: Math.floor(Math.random() * 30) + 1,
      horasExtrasCalculadas: Math.floor(Math.random() * 20),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setImportacoesPontoUI(prev => [...prev, importacao]);

    // Simular geração de registros de ponto baseados na importação
    const registrosGerados: RegistroPontoUI[] = [];
    const diasNoMes = new Date(parseInt(newImportacao.ano), parseInt(newImportacao.mes), 0).getDate();

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = `${newImportacao.ano}-${newImportacao.mes.padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
      const diaSemana = new Date(data).getDay();

      // Simular horários de trabalho (segunda a sexta)
      if (diaSemana >= 1 && diaSemana <= 5) {
        const entrada = '08:00';
        const saida = Math.random() > 0.1 ? '17:00' : '18:30'; // 90% trabalham 8h, 10% fazem hora extra
        const horasTrabalhadas = saida === '17:00' ? 8 : 9.5;
        const horasExtras = Math.max(0, horasTrabalhadas - 8);

        registrosGerados.push({
          id: `${importacao.id}-${dia}`,
          colaboradorId: newImportacao.colaboradorId,
          data,
          entrada,
          saida,
          horasTrabalhadas,
          horasExtras,
          importacaoId: importacao.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    setRegistrosPontoUI(prev => [...prev, ...registrosGerados]);

    setNewImportacao({
      colaboradorId: '',
      mes: '',
      ano: '',
      arquivo: '',
      observacoes: '',
      status: 'Processando',
    });
    setIsDialogOpen(false);
  };

  const getStatusBadgeColor = (status: StatusImportacao) => {
    switch (status) {
      case 'Processando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Concluido':
        return 'bg-[#4a8f4a] text-white';
      case 'Erro':
        return 'bg-[#d34c46] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularTotais = () => {
    const totais = filteredRegistros.reduce(
      (acc, registro) => ({
        horasTrabalhadas: acc.horasTrabalhadas + (registro.horasTrabalhadas ?? 0),
        horasExtras: acc.horasExtras + (registro.horasExtras ?? 0),
      }),
      { horasTrabalhadas: 0, horasExtras: 0 }
    );

    return {
      horasTrabalhadas: Math.round(totais.horasTrabalhadas * 100) / 100,
      horasExtras: Math.round(totais.horasExtras * 100) / 100,
    };
  };

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Registros</p>
                <p className="text-2xl font-bold">{filteredRegistros.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Horas Trabalhadas</p>
                <p className="text-2xl font-bold">{totais.horasTrabalhadas}h</p>
              </div>
              <Clock className="h-8 w-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Horas Extras</p>
                <p className="text-2xl font-bold">{totais.horasExtras}h</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Importações</p>
                <p className="text-2xl font-bold">{importacoesPonto.length}</p>
              </div>
              <Upload className="h-8 w-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import History */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent>
          {importacoesPontoUI.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Nenhuma importação realizada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registros</TableHead>
                  <TableHead>Horas Extras</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importacoesPontoUI.slice(-5).reverse().map((importacao) => {
                  const colaborador = colaboradores.find(c => c.id === importacao.colaboradorId);
                  return (
                    <TableRow key={importacao.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {colaborador?.nome || 'Colaborador não encontrado'}
                      </TableCell>
                      <TableCell>
                        {meses.find(m => m.value === importacao.mes)?.label} {importacao.ano}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(importacao.status)}>
                          {importacao.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{importacao.registrosProcessados}</TableCell>
                      <TableCell>{importacao.horasExtrasCalculadas}h</TableCell>
                      <TableCell>{new Date(importacao.dataImportacao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dep-pessoal/ponto/importacao/${importacao.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Time Records */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Registros de Ponto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="Buscar por colaborador..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Month Filter */}
              <Select value={mesFilter} onValueChange={setMesFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Filter */}
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

            {/* Import Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar ponto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Importar Registros de Ponto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Colaborador *</Label>
                    <Select
                      value={newImportacao.colaboradorId}
                      onValueChange={(value) => setNewImportacao({ ...newImportacao, colaboradorId: value })}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Mês *</Label>
                      <Select
                        value={newImportacao.mes}
                        onValueChange={(value) => setNewImportacao({ ...newImportacao, mes: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {meses.map((mes) => (
                            <SelectItem key={mes.value} value={mes.value}>
                              {mes.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Ano *</Label>
                      <Input
                        type="number"
                        value={newImportacao.ano}
                        onChange={(e) => setNewImportacao({ ...newImportacao, ano: e.target.value })}
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Arquivo de Importação</Label>
                    <Input
                      value={newImportacao.arquivo}
                      onChange={(e) => setNewImportacao({ ...newImportacao, arquivo: e.target.value })}
                      placeholder="Nome do arquivo ou link"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Observações</Label>
                    <Textarea
                      value={newImportacao.observacoes}
                      onChange={(e) => setNewImportacao({ ...newImportacao, observacoes: e.target.value })}
                      placeholder="Observações sobre a importação..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleImportPonto}
                    className="w-full"
                    disabled={!newImportacao.colaboradorId || !newImportacao.mes || !newImportacao.ano}
                  >
                    Processar Importação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          {filteredRegistros.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum registro encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Horas Trabalhadas</TableHead>
                  <TableHead>Horas Extras</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistros.map((registro) => {
                  const colaborador = colaboradores.find(c => c.id === registro.colaboradorId);
                  return (
                    <TableRow key={registro.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {colaborador?.nome || 'Colaborador não encontrado'}
                      </TableCell>
                      <TableCell>{new Date(registro.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{registro.entrada}</TableCell>
                      <TableCell>{registro.saida}</TableCell>
                      <TableCell>{registro.horasTrabalhadas}h</TableCell>
                      <TableCell>
                        <span className={(registro.horasExtras ?? 0) > 0 ? 'text-white font-medium' : ''}>
                          {(registro.horasExtras ?? 0)}h
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dep-pessoal/ponto/${registro.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
