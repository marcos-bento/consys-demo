'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, ChevronRight, Minus, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockProdutos, mockMovimentacoes, type Movimentacao, type Produto } from '../../../../lib/mock/estoque';

export default function ProdutoDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);
  const [movimentacoes, setMovimentacoes] = useState<Record<string, Movimentacao[]>>(mockMovimentacoes);
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isSaidaOpen, setIsSaidaOpen] = useState(false);
  const [quantidade, setQuantidade] = useState(0);
  const [observacao, setObservacao] = useState('');

  const produto = produtos.find((p) => p.id === id);
  const produtoMovimentacoes = movimentacoes[id] || [];

  if (!produto) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Produto não encontrado</h1>
        </div>
        <Button onClick={() => router.push('/estoque')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Estoque
        </Button>
      </div>
    );
  }

  const handleMovimentacao = (tipo: 'Entrada' | 'Saída') => {
    if (tipo === 'Saída' && quantidade > produto.estoque) {
      alert('Quantidade insuficiente em estoque!');
      return;
    }

    const novaMovimentacao: Movimentacao = {
      data: new Date().toISOString().split('T')[0],
      tipo,
      quantidade,
      observacao,
    };

    const novasMovimentacoes = [...produtoMovimentacoes, novaMovimentacao];
    setMovimentacoes({ ...movimentacoes, [id]: novasMovimentacoes });

    const novoEstoque = tipo === 'Entrada' ? produto.estoque + quantidade : produto.estoque - quantidade;
    const novosProdutos = produtos.map((p) => (p.id === id ? { ...p, estoque: novoEstoque } : p));
    setProdutos(novosProdutos);

    setQuantidade(0);
    setObservacao('');
    setIsEntradaOpen(false);
    setIsSaidaOpen(false);
  };

  const getStatusBadge = (estoque: number) => {
    if (estoque === 0) return { text: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    if (estoque < 10) return { text: 'Baixo', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'OK', color: 'bg-green-100 text-green-800' };
  };

  const status = getStatusBadge(produto.estoque);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/estoque" className="hover:text-gray-900">
          Estoque
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{produto.nome}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detalhes do Produto</h1>
        <Button onClick={() => router.push('/estoque')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Dados do Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Nome</Label>
              <p className="text-lg">{produto.nome}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Código</Label>
              <p className="text-lg">{produto.codigo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Categoria</Label>
              <div className="mt-1">
                <Badge variant="outline">{produto.categoria}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Estoque Atual</Label>
              <p className="text-lg">{produto.estoque} unidades</p>
              <Badge className={`${status.color} mt-1`}>{status.text}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtoMovimentacoes.map((mov, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(mov.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant={mov.tipo === 'Entrada' ? 'default' : 'destructive'}>{mov.tipo}</Badge>
                  </TableCell>
                  <TableCell>{mov.quantidade}</TableCell>
                  <TableCell>{mov.observacao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end space-x-2">
        <Dialog open={isEntradaOpen} onOpenChange={setIsEntradaOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Entrada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Entrada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div>
                <Label>Observação</Label>
                <Input
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Motivo da entrada"
                />
              </div>
              <Button onClick={() => handleMovimentacao('Entrada')} className="w-full">
                Registrar Entrada
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isSaidaOpen} onOpenChange={setIsSaidaOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Minus className="mr-2 h-4 w-4" />
              Saída
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Saída</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                  min="1"
                  max={produto.estoque}
                />
              </div>
              <div>
                <Label>Observação</Label>
                <Input
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Motivo da saída"
                />
              </div>
              <Button onClick={() => handleMovimentacao('Saída')} className="w-full">
                Registrar Saída
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
