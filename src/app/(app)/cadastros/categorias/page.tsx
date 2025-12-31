'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, X, Plus, Search } from 'lucide-react';

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
import { useDemoData } from '@/src/lib/demo-context';
import type { Categoria, StatusCadastro } from '@/lib/mock/cadastros';

const statusList: StatusCadastro[] = ['Ativo', 'Inativo'];

export default function CategoriasPage() {
  const router = useRouter();
  const { categorias, setCategorias } = useDemoData();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusCadastro | 'Todos'>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novo, setNovo] = useState({
    nome: '',
    tipo: 'Produto' as Categoria['tipo'],
  });

  const tipos = useMemo(() => Array.from(new Set(categorias.map((c) => c.tipo))), [categorias]);

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((categoria) => {
      const matchesSearch = categoria.nome.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === 'Todos' || categoria.tipo === tipoFilter;
      const matchesStatus = statusFilter === 'Todos' || categoria.status === statusFilter;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [categorias, search, tipoFilter, statusFilter]);

  const statusColor = (status: StatusCadastro) => {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Inativo':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const handleInativar = (categoria: Categoria) => {
    if (categoria.status === 'Inativo') return;
    setCategorias(
      categorias.map((c) =>
        c.id === categoria.id ? { ...c, status: 'Inativo' } : c,
      ),
    );
  };

  const handleCreate = () => {
    if (!novo.nome.trim()) return;

    const nextId = (categorias.length + 1).toString();
    const hoje = new Date().toISOString().split('T')[0];
    const novaCategoria: Categoria = {
      id: nextId,
      nome: novo.nome,
      tipo: novo.tipo,
      status: 'Ativo',
      dataCriacao: hoje,
    };
    setCategorias([...categorias, novaCategoria]);
    setIsDialogOpen(false);
    setNovo({
      nome: '',
      tipo: 'Produto',
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Categorias</h1>
        <p className="text-muted-foreground">Configure categorias para organizar produtos, fornecedores e centros de custo.</p>
      </div>

      {/* Topbar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
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
                  Nova categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova categoria</DialogTitle>
                  <DialogDescription>Registre uma nova categoria no sistema.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Nome *</Label>
                    <Input
                      value={novo.nome}
                      onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                      placeholder="Nome da categoria"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Tipo</Label>
                    <Select value={novo.tipo} onValueChange={(value: Categoria['tipo']) => setNovo({ ...novo, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Produto">Produto</SelectItem>
                        <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                        <SelectItem value="CentroCusto">Centro de Custo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Salvar categoria
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
          <CardTitle>Categorias Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriasFiltradas.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhuma categoria encontrada. Ajuste filtros ou crie uma nova categoria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriasFiltradas.map((categoria) => (
                  <TableRow
                    key={categoria.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/cadastros/categorias/${categoria.id}`)}
                  >
                    <TableCell className="font-medium">{categoria.nome}</TableCell>
                    <TableCell>{categoria.tipo}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(categoria.status)}>{categoria.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/categorias/${categoria.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/categorias/${categoria.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {categoria.status === 'Ativo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-rose-50"
                            onClick={() => handleInativar(categoria)}
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
