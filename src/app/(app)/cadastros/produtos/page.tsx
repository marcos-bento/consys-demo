'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, X, Plus, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useDemoData } from '@/src/lib/demo-context';
import type { Produto, StatusCadastro } from '@/lib/mock/cadastros';

const statusList: StatusCadastro[] = ['Ativo', 'Inativo'];

export default function ProdutosPage() {
  const router = useRouter();
  const { produtosCadastro, setProdutosCadastro, resetDemo } = useDemoData();
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusCadastro | 'Todos'>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novo, setNovo] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    unidade: 'un',
    precoBase: 0,
    controladoEstoque: true,
  });

  const categorias = useMemo(
    () =>
      Array.from(new Set(produtosCadastro.map((p) => p.categoria?.trim()).filter(Boolean) as string[])),
    [produtosCadastro],
  );

  const produtosFiltrados = useMemo(() => {
    return produtosCadastro.filter((produto) => {
      const matchesSearch =
        produto.nome.toLowerCase().includes(search.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(search.toLowerCase());

      const matchesCategoria = categoriaFilter === 'Todos' || produto.categoria === categoriaFilter;
      const matchesStatus = statusFilter === 'Todos' || produto.status === statusFilter;

      return matchesSearch && matchesCategoria && matchesStatus;
    });
  }, [produtosCadastro, search, categoriaFilter, statusFilter]);

  const statusColor = (status: StatusCadastro) => {
    switch (status) {
      case 'Ativo':
        return 'bg-[#4a8f4a] text-white border border-[#4a8f4a]';
      case 'Inativo':
        return 'bg-[#d34c46] text-white border border-[#d34c46]';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const handleInativar = (produto: Produto) => {
    if (produto.status === 'Inativo') return;
    setProdutosCadastro(
      produtosCadastro.map((p) =>
        p.id === produto.id ? { ...p, status: 'Inativo' } : p,
      ),
    );
  };

  const handleCreate = async () => {
    if (!novo.nome.trim() || !novo.codigo.trim()) return;

    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo),
      });
      if (!res.ok) {
        throw new Error('Falha ao criar produto');
      }
      await resetDemo();
      setIsDialogOpen(false);
      setNovo({
        nome: '',
        codigo: '',
        categoria: '',
        unidade: 'un',
        precoBase: 0,
        controladoEstoque: true,
      });
    } catch (error) {
      console.error('[PRODUTOS_CREATE]', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Produtos</h1>
        <p className="text-muted-foreground">Controle produtos e serviços oferecidos.</p>
      </div>

      {/* Topbar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: StatusCadastro | 'Todos') => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {statusList.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo produto</DialogTitle>
                  <DialogDescription>Registre um novo produto ou serviço.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Nome do produto *</Label>
                      <Input
                        value={novo.nome}
                        onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                        placeholder="Nome do produto"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Código interno *</Label>
                      <Input
                        value={novo.codigo}
                        onChange={(e) => setNovo({ ...novo, codigo: e.target.value })}
                        placeholder="Código único"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Categoria</Label>
                      <Select value={novo.categoria} onValueChange={(value) => setNovo({ ...novo, categoria: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mobiliário">Mobiliário</SelectItem>
                          <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                          <SelectItem value="Serviços">Serviços</SelectItem>
                          <SelectItem value="Consultoria">Consultoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Unidade</Label>
                      <Select value={novo.unidade} onValueChange={(value) => setNovo({ ...novo, unidade: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="un">Unidade</SelectItem>
                          <SelectItem value="m²">Metro quadrado</SelectItem>
                          <SelectItem value="m">Metro</SelectItem>
                          <SelectItem value="kg">Quilograma</SelectItem>
                          <SelectItem value="h">Hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Preço base</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={novo.precoBase}
                        onChange={(e) => setNovo({ ...novo, precoBase: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="controlado"
                      checked={novo.controladoEstoque}
                      onCheckedChange={(checked) => setNovo({ ...novo, controladoEstoque: !!checked })}
                    />
                    <Label htmlFor="controlado">Produto controlado em estoque</Label>
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Salvar produto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {produtosFiltrados.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado. Ajuste filtros ou crie um novo produto.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço base</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto) => (
                  <TableRow
                    key={produto.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/cadastros/produtos/${produto.id}`)}
                  >
                    <TableCell className="font-medium">{produto.codigo}</TableCell>
                    <TableCell>{produto.nome}</TableCell>
                    <TableCell>{produto.categoria}</TableCell>
                    <TableCell>R$ {produto.precoBase.toFixed(2)}</TableCell>
                    <TableCell>{produto.controladoEstoque ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(produto.status)}>{produto.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/produtos/${produto.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/produtos/${produto.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {produto.status === 'Ativo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-[#d34c46]"
                            onClick={() => handleInativar(produto)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
