'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Eye, CheckCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Lancamento } from '@/lib/mock/financeiro';
import { useDemoData } from '@/src/lib/demo-context';

export default function Financeiro() {
  const { lancamentos, setLancamentos } = useDemoData();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [periodoFilter, setPeriodoFilter] = useState<string>('30d');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | null>(null);
  const [newLancamento, setNewLancamento] = useState({
    tipo: 'Receber' as Lancamento['tipo'],
    descricao: '',
    parte: '',
    vencimento: '',
    valor: 0,
    categoria: '',
    observacao: '',
  });

  const filteredLancamentos = useMemo(() => {
    const hoje = new Date();

    // Calcular data inicial baseada no período
    let dataInicial = new Date();
    switch (periodoFilter) {
      case '7d':
        dataInicial.setDate(hoje.getDate() - 7);
        break;
      case '30d':
        dataInicial.setDate(hoje.getDate() - 30);
        break;
      case '90d':
        dataInicial.setDate(hoje.getDate() - 90);
        break;
      case 'mes-atual':
        dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      default:
        dataInicial.setDate(hoje.getDate() - 30);
    }

    return lancamentos.filter(lancamento => {
      const dataLancamento = new Date(lancamento.vencimento);

      // Filtro de período
      if (dataLancamento < dataInicial) return false;

      const matchesSearch = lancamento.descricao.toLowerCase().includes(search.toLowerCase()) ||
                           lancamento.parte.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === 'Todos' || lancamento.tipo === tipoFilter;

      let matchesStatus = true;
      if (statusFilter === 'Pago') matchesStatus = lancamento.pago;
      else if (statusFilter === 'Em aberto') matchesStatus = !lancamento.pago && dataLancamento >= hoje;
      else if (statusFilter === 'Vencido') matchesStatus = !lancamento.pago && dataLancamento < hoje;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [lancamentos, search, tipoFilter, statusFilter, periodoFilter]);

  const resumos = useMemo(() => {
    const hoje = new Date();
    const aReceber = lancamentos
      .filter(l => l.tipo === 'Receber' && !l.pago)
      .reduce((sum, l) => sum + l.valor, 0);
    const aPagar = lancamentos
      .filter(l => l.tipo === 'Pagar' && !l.pago)
      .reduce((sum, l) => sum + l.valor, 0);
    const vencidos = lancamentos
      .filter(l => !l.pago && new Date(l.vencimento) < hoje)
      .reduce((sum, l) => sum + l.valor, 0);
    const saldoPrevisto = aReceber - aPagar;
    return { aReceber, aPagar, vencidos, saldoPrevisto };
  }, [lancamentos]);

  const handleAddLancamento = () => {
    // Validação básica
    if (!newLancamento.descricao || !newLancamento.parte || !newLancamento.vencimento || newLancamento.valor <= 0) {
      return;
    }

    const id = (lancamentos.length + 1).toString();
    const lancamento: Lancamento = {
      id,
      tipo: newLancamento.tipo,
      descricao: newLancamento.descricao,
      parte: newLancamento.parte,
      vencimento: newLancamento.vencimento,
      valor: newLancamento.valor,
      pago: false,
    };
    setLancamentos([...lancamentos, lancamento]);
    setNewLancamento({
      tipo: 'Receber',
      descricao: '',
      parte: '',
      vencimento: '',
      valor: 0,
      categoria: '',
      observacao: '',
    });
    setIsDialogOpen(false);
  };

  const handleMarcarPago = (id: string) => {
    setLancamentos(lancamentos.map(l => l.id === id ? { ...l, pago: true } : l));
  };

  const handleEstornarPagamento = (id: string) => {
    setLancamentos(lancamentos.map(l => l.id === id ? { ...l, pago: false } : l));
  };

  const handleVerDetalhes = (lancamento: Lancamento) => {
    setSelectedLancamento(lancamento);
    setIsDetailOpen(true);
  };

  const getStatusLancamento = (lancamento: Lancamento) => {
    if (lancamento.pago) return { text: 'Pago', color: 'bg-[#4a8f4a] text-white border border-[#4a8f4a]' };
    const hoje = new Date();
    const vencimento = new Date(lancamento.vencimento);
    if (vencimento < hoje) return { text: 'Vencido', color: 'bg-[#d34c46] text-white border border-[#d34c46]' };
    return { text: 'Em aberto', color: 'bg-[#d17a45] text-white border border-[#d17a45]' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Financeiro</h1>
        <p className="text-muted-foreground">Controle financeiro da empresa</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setTipoFilter('Receber'); setStatusFilter('Em aberto'); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-white">{formatCurrency(resumos.aReceber)}</div>
            <p className="text-xs text-muted-foreground">Em aberto</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setTipoFilter('Pagar'); setStatusFilter('Em aberto'); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-white">{formatCurrency(resumos.aPagar)}</div>
            <p className="text-xs text-muted-foreground">Em aberto</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setTipoFilter('Todos'); setStatusFilter('Vencido'); }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-white">{formatCurrency(resumos.vencidos)}</div>
            <p className="text-xs text-muted-foreground">Atrasados</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className={`text-2xl font-bold ${resumos.saldoPrevisto >= 0 ? 'text-white' : 'text-white'}`}>
              {formatCurrency(resumos.saldoPrevisto)}
            </div>
            <p className="text-xs text-muted-foreground">Receber - Pagar</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lancamentos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliação</TabsTrigger>
        </TabsList>

        <TabsContent value="lancamentos" className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou parte..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Receber">Receber</SelectItem>
                  <SelectItem value="Pagar">Pagar</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Em aberto">Em aberto</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="mes-atual">Mês atual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Lançamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Lançamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Tipo</Label>
                    <Select value={newLancamento.tipo} onValueChange={(value: Lancamento['tipo']) => setNewLancamento({ ...newLancamento, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Receber">Receber</SelectItem>
                        <SelectItem value="Pagar">Pagar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Descrição</Label>
                    <Input
                      value={newLancamento.descricao}
                      onChange={(e) => setNewLancamento({ ...newLancamento, descricao: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Parte</Label>
                    <Input
                      value={newLancamento.parte}
                      onChange={(e) => setNewLancamento({ ...newLancamento, parte: e.target.value })}
                      placeholder="Cliente ou Fornecedor"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Vencimento</Label>
                    <Input
                      type="date"
                      value={newLancamento.vencimento}
                      onChange={(e) => setNewLancamento({ ...newLancamento, vencimento: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={newLancamento.valor}
                      onChange={(e) => setNewLancamento({ ...newLancamento, valor: parseFloat(e.target.value) || 0 })}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Categoria / Centro de custo</Label>
                    <Input
                      value={newLancamento.categoria}
                      onChange={(e) => setNewLancamento({ ...newLancamento, categoria: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Observação</Label>
                    <Input
                      value={newLancamento.observacao}
                      onChange={(e) => setNewLancamento({ ...newLancamento, observacao: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                  <Button
                    onClick={handleAddLancamento}
                    className="w-full"
                    disabled={!newLancamento.descricao || !newLancamento.parte || !newLancamento.vencimento || newLancamento.valor <= 0}
                  >
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabela */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLancamentos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhum lançamento encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Parte</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLancamentos.map((lancamento) => {
                      const status = getStatusLancamento(lancamento);
                      return (
                        <TableRow key={lancamento.id} className="hover:bg-muted/30">
                          <TableCell>
                            <Badge variant={lancamento.tipo === 'Receber' ? 'default' : 'secondary'}>
                              {lancamento.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{lancamento.descricao}</TableCell>
                          <TableCell>{lancamento.parte}</TableCell>
                          <TableCell>{new Date(lancamento.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>{formatCurrency(lancamento.valor)}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-primary/5"
                                onClick={() => handleVerDetalhes(lancamento)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!lancamento.pago && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-primary/5"
                                  onClick={() => handleMarcarPago(lancamento.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
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
        </TabsContent>

        <TabsContent value="conciliacao" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Conciliação Bancária</CardTitle>
              <p className="text-sm text-muted-foreground">Pendências para conciliação</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm mb-4">Nenhuma pendência de conciliação no momento</p>
                <Button variant="outline">
                  Conciliar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de detalhes */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lançamento</DialogTitle>
          </DialogHeader>
          {selectedLancamento && (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-slate-800 font-medium">{selectedLancamento.tipo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-slate-800 font-medium">{getStatusLancamento(selectedLancamento).text}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-slate-800">{selectedLancamento.descricao}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Parte</Label>
                  <p className="text-slate-800">{selectedLancamento.parte}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Vencimento</Label>
                  <p className="text-slate-800">{new Date(selectedLancamento.vencimento).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valor</Label>
                  <p className="text-slate-800 font-semibold">{formatCurrency(selectedLancamento.valor)}</p>
                </div>
              </div>

              {/* Histórico */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Histórico</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                    <span>Criado</span>
                    <span className="text-muted-foreground">Hoje</span>
                  </div>
                  {selectedLancamento.pago && (
                    <div className="flex justify-between items-center p-2 bg-[#4a8f4a] rounded">
                      <span className="text-white">Marcado como pago</span>
                      <span className="text-muted-foreground">Hoje</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t">
                {!selectedLancamento.pago ? (
                  <Button onClick={() => { handleMarcarPago(selectedLancamento.id); setIsDetailOpen(false); }} className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marcar como pago
                  </Button>
                ) : (
                  <Button onClick={() => { handleEstornarPagamento(selectedLancamento.id); setIsDetailOpen(false); }} variant="outline" className="flex-1">
                    Estornar pagamento
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
