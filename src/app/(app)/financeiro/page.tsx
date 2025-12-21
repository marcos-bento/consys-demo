'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockLancamentos, Lancamento } from '../../../lib/mock/financeiro';
import { Search, Plus, Eye, CheckCircle } from 'lucide-react';

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(mockLancamentos);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | null>(null);
  const [newLancamento, setNewLancamento] = useState({
    tipo: 'Receber' as Lancamento['tipo'],
    descricao: '',
    parte: '',
    vencimento: '',
    valor: 0,
  });

  const filteredLancamentos = useMemo(() => {
    const hoje = new Date();
    return lancamentos.filter(lancamento => {
      const matchesSearch = lancamento.descricao.toLowerCase().includes(search.toLowerCase()) ||
                           lancamento.parte.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === 'Todos' || lancamento.tipo === tipoFilter;

      let matchesStatus = true;
      if (statusFilter === 'Pago') matchesStatus = lancamento.pago;
      else if (statusFilter === 'Em aberto') matchesStatus = !lancamento.pago && new Date(lancamento.vencimento) >= hoje;
      else if (statusFilter === 'Vencido') matchesStatus = !lancamento.pago && new Date(lancamento.vencimento) < hoje;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [lancamentos, search, tipoFilter, statusFilter]);

  const resumos = useMemo(() => {
    const aReceber = lancamentos
      .filter(l => l.tipo === 'Receber' && !l.pago)
      .reduce((sum, l) => sum + l.valor, 0);
    const aPagar = lancamentos
      .filter(l => l.tipo === 'Pagar' && !l.pago)
      .reduce((sum, l) => sum + l.valor, 0);
    const saldoPrevisto = aReceber - aPagar;
    return { aReceber, aPagar, saldoPrevisto };
  }, [lancamentos]);

  const handleAddLancamento = () => {
    const id = (lancamentos.length + 1).toString();
    const lancamento: Lancamento = {
      id,
      ...newLancamento,
      pago: false,
    };
    setLancamentos([...lancamentos, lancamento]);
    setNewLancamento({
      tipo: 'Receber',
      descricao: '',
      parte: '',
      vencimento: '',
      valor: 0,
    });
    setIsDialogOpen(false);
  };

  const handleMarcarPago = (id: string) => {
    setLancamentos(lancamentos.map(l => l.id === id ? { ...l, pago: true } : l));
  };

  const handleVerDetalhes = (lancamento: Lancamento) => {
    setSelectedLancamento(lancamento);
    setIsDetailOpen(true);
  };

  const getStatusLancamento = (lancamento: Lancamento) => {
    if (lancamento.pago) return { text: 'Pago', color: 'bg-green-100 text-green-800' };
    const hoje = new Date();
    const vencimento = new Date(lancamento.vencimento);
    if (vencimento < hoje) return { text: 'Vencido', color: 'bg-red-100 text-red-800' };
    return { text: 'Em aberto', color: 'bg-yellow-100 text-yellow-800' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="text-gray-600">Controle financeiro da empresa</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(resumos.aReceber)}</div>
            <p className="text-xs text-muted-foreground">Em aberto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(resumos.aPagar)}</div>
            <p className="text-xs text-muted-foreground">Em aberto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resumos.saldoPrevisto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(resumos.saldoPrevisto)}
            </div>
            <p className="text-xs text-muted-foreground">Receber - Pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
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
          <div className="text-sm text-gray-600">Últimos 30 dias</div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lançamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
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
              <div>
                <Label>Descrição</Label>
                <Input
                  value={newLancamento.descricao}
                  onChange={(e) => setNewLancamento({ ...newLancamento, descricao: e.target.value })}
                />
              </div>
              <div>
                <Label>Parte</Label>
                <Input
                  value={newLancamento.parte}
                  onChange={(e) => setNewLancamento({ ...newLancamento, parte: e.target.value })}
                  placeholder="Cliente ou Fornecedor"
                />
              </div>
              <div>
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={newLancamento.vencimento}
                  onChange={(e) => setNewLancamento({ ...newLancamento, vencimento: e.target.value })}
                />
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={newLancamento.valor}
                  onChange={(e) => setNewLancamento({ ...newLancamento, valor: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                />
              </div>
              <Button onClick={handleAddLancamento} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Parte</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLancamentos.map((lancamento) => {
                const status = getStatusLancamento(lancamento);
                return (
                  <TableRow key={lancamento.id}>
                    <TableCell>
                      <Badge variant={lancamento.tipo === 'Receber' ? 'default' : 'destructive'}>
                        {lancamento.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{lancamento.descricao}</TableCell>
                    <TableCell>{lancamento.parte}</TableCell>
                    <TableCell>{new Date(lancamento.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{formatCurrency(lancamento.valor)}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerDetalhes(lancamento)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!lancamento.pago && (
                          <Button
                            variant="ghost"
                            size="sm"
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
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Lançamento</DialogTitle>
          </DialogHeader>
          {selectedLancamento && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <p>{selectedLancamento.tipo}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p>{getStatusLancamento(selectedLancamento).text}</p>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <p>{selectedLancamento.descricao}</p>
                </div>
                <div>
                  <Label>Parte</Label>
                  <p>{selectedLancamento.parte}</p>
                </div>
                <div>
                  <Label>Vencimento</Label>
                  <p>{new Date(selectedLancamento.vencimento).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label>Valor</Label>
                  <p>{formatCurrency(selectedLancamento.valor)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}