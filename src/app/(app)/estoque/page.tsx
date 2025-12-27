'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Eye, ArrowUpDown, Package, AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import type { Produto, Movimentacao } from '../../../lib/mock/estoque';
import { useDemoData } from '@/src/lib/demo-context';

export default function Estoque() {
  const router = useRouter();
  const { produtos, setProdutos, movimentacoes, setMovimentacoes } = useDemoData();
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [controladoFilter, setControladoFilter] = useState<string>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [movimentacao, setMovimentacao] = useState({
    produtoId: '',
    tipo: 'Entrada' as Movimentacao['tipo'],
    quantidade: 0,
    observacao: '',
  });

  // Filtrar apenas produtos controlados em estoque
  const produtosControlados = useMemo(() => {
    return produtos.filter(p => p.controladoEstoque);
  }, [produtos]);

  const getStatusBadge = (estoque: number, minimo?: number) => {
    const minThreshold = minimo || 10;
    if (estoque === 0) return { text: 'Sem estoque', color: 'bg-rose-50 text-rose-700 border border-rose-100' };
    if (estoque < minThreshold) return { text: 'Baixo', color: 'bg-amber-50 text-amber-700 border border-amber-100' };
    return { text: 'OK', color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' };
  };

  const filteredProdutos = useMemo(() => {
    return produtosControlados.filter((produto) => {
      const matchesSearch =
        produto.nome.toLowerCase().includes(search.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(search.toLowerCase());
      const matchesCategoria = categoriaFilter === 'Todos' || produto.categoria === categoriaFilter;
      const matchesControlado = controladoFilter === 'Todos' ||
        (controladoFilter === 'Sim' && produto.controladoEstoque) ||
        (controladoFilter === 'Não' && !produto.controladoEstoque);

      const status = getStatusBadge(produto.estoque, produto.minimo);
      const matchesStatus = statusFilter === 'Todos' || status.text === statusFilter;

      return matchesSearch && matchesCategoria && matchesControlado && matchesStatus;
    });
  }, [produtosControlados, search, categoriaFilter, statusFilter, controladoFilter]);

  const getUltimaMovimentacao = (produtoId: string) => {
    const movs = movimentacoes[produtoId] || [];
    if (movs.length === 0) return '—';
    const ultima = movs.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
    return new Date(ultima.data).toLocaleDateString('pt-BR');
  };

  const handleMovimentacao = () => {
    if (!movimentacao.produtoId || movimentacao.quantidade <= 0) return;

    const produto = produtos.find(p => p.id === movimentacao.produtoId);
    if (!produto) return;

    let novoEstoque = produto.estoque;

    if (movimentacao.tipo === 'Entrada') {
      novoEstoque += movimentacao.quantidade;
    } else if (movimentacao.tipo === 'Saída') {
      if (movimentacao.quantidade > produto.estoque) {
        alert('Erro: Quantidade insuficiente em estoque!');
        return;
      }
      novoEstoque -= movimentacao.quantidade;
    } else if (movimentacao.tipo === 'Ajuste') {
      novoEstoque = movimentacao.quantidade;
    }

    // Atualizar produto
    const updatedProdutos = produtos.map(p =>
      p.id === movimentacao.produtoId ? { ...p, estoque: novoEstoque } : p
    );
    setProdutos(updatedProdutos);

    // Registrar movimentação
    const novaMovimentacao: Movimentacao = {
      id: Date.now().toString(),
      data: new Date().toISOString().split('T')[0],
      tipo: movimentacao.tipo,
      quantidade: movimentacao.tipo === 'Ajuste' ? novoEstoque : movimentacao.quantidade,
      observacao: movimentacao.observacao,
      usuario: 'Usuário Demo', // Mock
    };

    const updatedMovimentacoes = {
      ...movimentacoes,
      [movimentacao.produtoId]: [...(movimentacoes[movimentacao.produtoId] || []), novaMovimentacao]
    };
    setMovimentacoes(updatedMovimentacoes);

    // Reset form
    setMovimentacao({
      produtoId: selectedProduto?.id || '',
      tipo: 'Entrada',
      quantidade: 0,
      observacao: '',
    });
    setIsDialogOpen(false);
    setSelectedProduto(null);
  };

  const openMovimentacaoDialog = (produto?: Produto, tipo: Movimentacao['tipo'] = 'Entrada') => {
    setSelectedProduto(produto || null);
    setMovimentacao({
      produtoId: produto?.id || '',
      tipo,
      quantidade: 0,
      observacao: '',
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Estoque</h1>
        <p className="text-muted-foreground">Controle de inventário e movimentações</p>
      </div>

      {/* Topbar com filtros */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas</SelectItem>
              <SelectItem value="Mesas">Mesas</SelectItem>
              <SelectItem value="Cadeiras">Cadeiras</SelectItem>
              <SelectItem value="Armários">Armários</SelectItem>
              <SelectItem value="Acessórios">Acessórios</SelectItem>
              <SelectItem value="Frota">Frota</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="OK">OK</SelectItem>
              <SelectItem value="Baixo">Baixo</SelectItem>
              <SelectItem value="Sem estoque">Sem estoque</SelectItem>
            </SelectContent>
          </Select>
          <Select value={controladoFilter} onValueChange={setControladoFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Controlado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Sim">Sim</SelectItem>
              <SelectItem value="Não">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/cadastros/produtos')}>
            <Package className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
          <Button onClick={() => openMovimentacaoDialog()}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProdutos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {produtosControlados.length === 0
                  ? 'Nenhum produto controlado em estoque'
                  : 'Nenhum item encontrado com os filtros aplicados'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Em estoque</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última mov.</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => {
                  const status = getStatusBadge(produto.estoque, produto.minimo);
                  return (
                    <TableRow key={produto.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{produto.codigo}</TableCell>
                      <TableCell>{produto.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.categoria}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{produto.estoque}</TableCell>
                      <TableCell>{produto.minimo || '—'}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.text}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getUltimaMovimentacao(produto.id)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-primary/5"
                            onClick={() => router.push(`/estoque/${produto.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-primary/5"
                            onClick={() => openMovimentacaoDialog(produto)}
                          >
                            <ArrowUpDown className="h-4 w-4" />
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

      {/* Dialog de Movimentação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre entrada, saída ou ajuste de estoque
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Produto</Label>
              <Select
                value={movimentacao.produtoId}
                onValueChange={(value) => setMovimentacao({ ...movimentacao, produtoId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtosControlados.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome} ({produto.estoque} em estoque)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                value={movimentacao.tipo}
                onValueChange={(value: Movimentacao['tipo']) =>
                  setMovimentacao({ ...movimentacao, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Saída">Saída</SelectItem>
                  <SelectItem value="Ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>
                {movimentacao.tipo === 'Ajuste' ? 'Novo estoque' : 'Quantidade'}
              </Label>
              <Input
                type="number"
                value={movimentacao.quantidade}
                onChange={(e) => setMovimentacao({
                  ...movimentacao,
                  quantidade: parseInt(e.target.value) || 0
                })}
                min="0"
                placeholder={movimentacao.tipo === 'Ajuste' ? 'Novo total em estoque' : 'Quantidade'}
              />
            </div>
            <div className="space-y-1">
              <Label>Observação</Label>
              <Textarea
                value={movimentacao.observacao}
                onChange={(e) => setMovimentacao({ ...movimentacao, observacao: e.target.value })}
                placeholder="Motivo da movimentação..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleMovimentacao} className="flex-1">
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
