'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, UserX, Plus, Search } from 'lucide-react';

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
import type { Fornecedor, StatusCadastro } from '@/src/lib/mock/cadastros';

const statusList: StatusCadastro[] = ['Ativo', 'Inativo'];

export default function FornecedoresPage() {
  const router = useRouter();
  const { fornecedores, setFornecedores } = useDemoData();
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusCadastro | 'Todos'>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novo, setNovo] = useState({
    razaoSocial: '',
    cnpj: '',
    categoria: '',
    contato: '',
    email: '',
    telefone: '',
  });

  const categorias = useMemo(() => Array.from(new Set(fornecedores.map((f) => f.categoria))), [fornecedores]);

  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter((fornecedor) => {
      const matchesSearch =
        fornecedor.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
        fornecedor.cnpj.toLowerCase().includes(search.toLowerCase()) ||
        fornecedor.contato.toLowerCase().includes(search.toLowerCase()) ||
        fornecedor.email.toLowerCase().includes(search.toLowerCase());

      const matchesCategoria = categoriaFilter === 'Todos' || fornecedor.categoria === categoriaFilter;
      const matchesStatus = statusFilter === 'Todos' || fornecedor.status === statusFilter;

      return matchesSearch && matchesCategoria && matchesStatus;
    });
  }, [fornecedores, search, categoriaFilter, statusFilter]);

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

  const handleInativar = (fornecedor: Fornecedor) => {
    if (fornecedor.status === 'Inativo') return;
    setFornecedores(
      fornecedores.map((f) =>
        f.id === fornecedor.id ? { ...f, status: 'Inativo' } : f,
      ),
    );
  };

  const handleCreate = () => {
    if (!novo.razaoSocial.trim() || !novo.cnpj.trim()) return;

    const nextId = (fornecedores.length + 1).toString();
    const hoje = new Date().toISOString().split('T')[0];
    const novoFornecedor: Fornecedor = {
      id: nextId,
      razaoSocial: novo.razaoSocial,
      cnpj: novo.cnpj,
      categoria: novo.categoria,
      contato: novo.contato,
      email: novo.email,
      telefone: novo.telefone,
      status: 'Ativo',
      dataCriacao: hoje,
    };
    setFornecedores([...fornecedores, novoFornecedor]);
    setIsDialogOpen(false);
    setNovo({
      razaoSocial: '',
      cnpj: '',
      categoria: '',
      contato: '',
      email: '',
      telefone: '',
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Fornecedores</h1>
        <p className="text-muted-foreground">Gerencie empresas fornecedoras de produtos e serviços.</p>
      </div>

      {/* Topbar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por razão social, CNPJ, contato..."
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
                  Novo fornecedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo fornecedor</DialogTitle>
                  <DialogDescription>Registre uma nova empresa fornecedora.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Razão Social *</Label>
                      <Input
                        value={novo.razaoSocial}
                        onChange={(e) => setNovo({ ...novo, razaoSocial: e.target.value })}
                        placeholder="Razão social da empresa"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>CNPJ *</Label>
                      <Input
                        value={novo.cnpj}
                        onChange={(e) => setNovo({ ...novo, cnpj: e.target.value })}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Categoria</Label>
                      <Select value={novo.categoria} onValueChange={(value) => setNovo({ ...novo, categoria: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Matéria-prima">Matéria-prima</SelectItem>
                          <SelectItem value="Serviços">Serviços</SelectItem>
                          <SelectItem value="Transporte">Transporte</SelectItem>
                          <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Contato</Label>
                      <Input
                        value={novo.contato}
                        onChange={(e) => setNovo({ ...novo, contato: e.target.value })}
                        placeholder="Nome do contato principal"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={novo.email}
                        onChange={(e) => setNovo({ ...novo, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Telefone</Label>
                      <Input
                        value={novo.telefone}
                        onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
                        placeholder="(11) 99999-0000"
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Salvar fornecedor
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
          <CardTitle>Fornecedores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {fornecedoresFiltrados.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum fornecedor encontrado. Ajuste filtros ou crie um novo fornecedor.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fornecedoresFiltrados.map((fornecedor) => (
                  <TableRow
                    key={fornecedor.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/cadastros/fornecedores/${fornecedor.id}`)}
                  >
                    <TableCell className="font-medium">{fornecedor.razaoSocial}</TableCell>
                    <TableCell>{fornecedor.cnpj}</TableCell>
                    <TableCell>{fornecedor.categoria}</TableCell>
                    <TableCell>{fornecedor.contato}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(fornecedor.status)}>{fornecedor.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/fornecedores/${fornecedor.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/fornecedores/${fornecedor.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {fornecedor.status === 'Ativo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-rose-50"
                            onClick={() => handleInativar(fornecedor)}
                          >
                            <UserX className="h-4 w-4" />
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