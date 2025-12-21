'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockProdutos, Produto } from '../../../lib/mock/estoque';
import { Search, Plus, Eye } from 'lucide-react';

export default function Estoque() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduto, setNewProduto] = useState({ nome: '', codigo: '', categoria: 'Mesas' as Produto['categoria'], estoque: 0 });

  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto => {
      const matchesSearch = produto.nome.toLowerCase().includes(search.toLowerCase()) ||
                           produto.codigo.toLowerCase().includes(search.toLowerCase());
      const matchesCategoria = categoriaFilter === 'Todos' || produto.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    });
  }, [produtos, search, categoriaFilter]);

  const handleAddProduto = () => {
    const id = (produtos.length + 1).toString();
    const produto: Produto = {
      id,
      ...newProduto,
    };
    setProdutos([...produtos, produto]);
    setNewProduto({ nome: '', codigo: '', categoria: 'Mesas', estoque: 0 });
    setIsDialogOpen(false);
  };

  const getStatusBadge = (estoque: number) => {
    if (estoque === 0) return { text: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    if (estoque < 10) return { text: 'Baixo', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'OK', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estoque</h1>
        <p className="text-gray-600">Gerencie seus produtos e inventário</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Mesas">Mesas</SelectItem>
              <SelectItem value="Cadeiras">Cadeiras</SelectItem>
              <SelectItem value="Armários">Armários</SelectItem>
              <SelectItem value="Acessórios">Acessórios</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={newProduto.nome}
                  onChange={(e) => setNewProduto({ ...newProduto, nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Código</Label>
                <Input
                  value={newProduto.codigo}
                  onChange={(e) => setNewProduto({ ...newProduto, codigo: e.target.value })}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={newProduto.categoria} onValueChange={(value: Produto['categoria']) => setNewProduto({ ...newProduto, categoria: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mesas">Mesas</SelectItem>
                    <SelectItem value="Cadeiras">Cadeiras</SelectItem>
                    <SelectItem value="Armários">Armários</SelectItem>
                    <SelectItem value="Acessórios">Acessórios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estoque Inicial</Label>
                <Input
                  type="number"
                  value={newProduto.estoque}
                  onChange={(e) => setNewProduto({ ...newProduto, estoque: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <Button onClick={handleAddProduto} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Em estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos.map((produto) => {
                const status = getStatusBadge(produto.estoque);
                return (
                  <TableRow key={produto.id}>
                    <TableCell>{produto.codigo}</TableCell>
                    <TableCell>{produto.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{produto.categoria}</Badge>
                    </TableCell>
                    <TableCell>{produto.estoque}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/estoque/${produto.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}