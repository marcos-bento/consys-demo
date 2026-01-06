'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Minus, RotateCcw, ShoppingCart, AlertTriangle, Eye } from 'lucide-react';

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

import type { Movimentacao, Produto } from '@/lib/mock/estoque';
import { useDemoData } from '@/src/lib/demo-context';

export default function ProdutoEstoqueDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { produtos, setProdutos, movimentacoes, setMovimentacoes } = useDemoData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<Movimentacao['tipo']>('Entrada');
  const [movimentacao, setMovimentacao] = useState({
    quantidade: 0,
    observacao: '',
  });
  const [tipoFiltro, setTipoFiltro] = useState<string>('Todos');

  const produto = produtos.find((p) => p.id === id);
  const produtoMovimentacoes = movimentacoes[id] || [];

  const filteredMovimentacoes = useMemo(() => {
    if (tipoFiltro === 'Todos') return produtoMovimentacoes;
    return produtoMovimentacoes.filter(m => m.tipo === tipoFiltro);
  }, [produtoMovimentacoes, tipoFiltro]);

  if (!produto) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Produto não encontrado</h1>
          <Button onClick={() => router.push('/estoque')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Estoque
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Produto não encontrado no estoque.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (estoque: number, minimo?: number) => {
    const minThreshold = minimo || 10;
    if (estoque === 0) return { text: 'Sem estoque', color: 'bg-[#d34c46] text-white border border-[#d34c46]' };
    if (estoque < minThreshold) return { text: 'Baixo', color: 'bg-[#d17a45] text-white border border-[#d17a45]' };
    return { text: 'OK', color: 'bg-[#4a8f4a] text-white border border-[#4a8f4a]' };
  };

  const handleMovimentacao = () => {
    if (movimentacao.quantidade <= 0) return;

    let novoEstoque = produto.estoque;

    if (tipoMovimentacao === 'Entrada') {
      novoEstoque += movimentacao.quantidade;
    } else if (tipoMovimentacao === 'Saída') {
      if (movimentacao.quantidade > produto.estoque) {
        alert('Erro: Quantidade insuficiente em estoque!');
        return;
      }
      novoEstoque -= movimentacao.quantidade;
    } else if (tipoMovimentacao === 'Ajuste') {
      novoEstoque = movimentacao.quantidade;
    }

    // Atualizar produto
    const updatedProdutos = produtos.map(p =>
      p.id === id ? { ...p, estoque: novoEstoque } : p
    );
    setProdutos(updatedProdutos);

    // Registrar movimentação
    const novaMovimentacao: Movimentacao = {
      id: Date.now().toString(),
      data: new Date().toISOString().split('T')[0],
      tipo: tipoMovimentacao,
      quantidade: tipoMovimentacao === 'Ajuste' ? novoEstoque : movimentacao.quantidade,
      observacao: movimentacao.observacao,
      usuario: 'Usuário Demo',
    };

    const updatedMovimentacoes = {
      ...movimentacoes,
      [id]: [...produtoMovimentacoes, novaMovimentacao]
    };
    setMovimentacoes(updatedMovimentacoes);

    // Reset form
    setMovimentacao({ quantidade: 0, observacao: '' });
    setIsDialogOpen(false);
  };

  const openMovimentacaoDialog = (tipo: Movimentacao['tipo']) => {
    setTipoMovimentacao(tipo);
    setMovimentacao({ quantidade: 0, observacao: '' });
    setIsDialogOpen(true);
  };

  const status = getStatusBadge(produto.estoque, produto.minimo);
  const estoqueBaixo = produto.estoque < (produto.minimo || 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Detalhes do Estoque</h1>
          <p className="text-muted-foreground">{produto.nome} • {produto.codigo}</p>
        </div>
        <Button onClick={() => router.push('/estoque')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Produto</Label>
              <p className="text-lg font-medium">{produto.nome}</p>
              <p className="text-sm text-muted-foreground">{produto.codigo}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoria</Label>
              <Badge variant="outline" className="text-sm">{produto.categoria}</Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estoque Atual</Label>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{produto.estoque} unidades</p>
                <Badge className={status.color}>{status.text}</Badge>
                {produto.minimo && (
                  <p className="text-sm text-muted-foreground">Mínimo: {produto.minimo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={() => openMovimentacaoDialog('Entrada')} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Entrada
            </Button>
            <Button onClick={() => openMovimentacaoDialog('Saída')} variant="outline" className="flex-1">
              <Minus className="mr-2 h-4 w-4" />
              Saída
            </Button>
            <Button onClick={() => openMovimentacaoDialog('Ajuste')} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Ajuste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {estoqueBaixo && (
        <Card className="border-[#d17a45] bg-[#d17a45]">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-white" />
              <div>
                <p className="font-medium text-white">Atenção: Estoque baixo</p>
                <p className="text-sm text-white">
                  Estoque atual ({produto.estoque}) está abaixo do mínimo ({produto.minimo || 10})
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/compras/nova?produtoId=${produto.id}`)}
              className="border-[#d17a45] text-white hover:bg-[#d17a45]"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Gerar Compra
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Movimentações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Movimentações</CardTitle>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Saída">Saída</SelectItem>
                <SelectItem value="Ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMovimentacoes.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {tipoFiltro === 'Todos'
                  ? 'Nenhuma movimentação registrada'
                  : `Nenhuma movimentação do tipo ${tipoFiltro.toLowerCase()}`
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovimentacoes
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{new Date(mov.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge
                          variant={mov.tipo === 'Entrada' ? 'default' : mov.tipo === 'Saída' ? 'destructive' : 'secondary'}
                        >
                          {mov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {mov.tipo === 'Ajuste' ? mov.quantidade : mov.quantidade}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{mov.observacao || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{mov.usuario}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Movimentação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tipoMovimentacao === 'Entrada' && 'Registrar Entrada'}
              {tipoMovimentacao === 'Saída' && 'Registrar Saída'}
              {tipoMovimentacao === 'Ajuste' && 'Ajustar Estoque'}
            </DialogTitle>
            <DialogDescription>
              {tipoMovimentacao === 'Entrada' && 'Adicione unidades ao estoque'}
              {tipoMovimentacao === 'Saída' && 'Remova unidades do estoque'}
              {tipoMovimentacao === 'Ajuste' && 'Defina o novo total em estoque'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>
                {tipoMovimentacao === 'Ajuste' ? 'Novo estoque total' : 'Quantidade'}
              </Label>
              <Input
                type="number"
                value={movimentacao.quantidade}
                onChange={(e) => setMovimentacao({
                  ...movimentacao,
                  quantidade: parseInt(e.target.value) || 0
                })}
                min="0"
                max={tipoMovimentacao === 'Saída' ? produto.estoque : undefined}
                placeholder={tipoMovimentacao === 'Ajuste' ? 'Novo total em estoque' : 'Quantidade'}
              />
              {tipoMovimentacao === 'Saída' && (
                <p className="text-sm text-muted-foreground">
                  Disponível: {produto.estoque} unidades
                </p>
              )}
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
                {tipoMovimentacao === 'Entrada' && 'Registrar Entrada'}
                {tipoMovimentacao === 'Saída' && 'Registrar Saída'}
                {tipoMovimentacao === 'Ajuste' && 'Ajustar Estoque'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
