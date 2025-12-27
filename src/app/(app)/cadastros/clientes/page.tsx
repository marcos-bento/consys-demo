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
import type { Cliente, TipoPessoa, StatusCadastro } from '@/src/lib/mock/cadastros';

const statusList: StatusCadastro[] = ['Ativo', 'Inativo'];

export default function ClientesPage() {
  const router = useRouter();
  const { clientes, setClientes } = useDemoData();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoPessoa | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusCadastro | 'Todos'>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novo, setNovo] = useState({
    tipo: 'PJ' as TipoPessoa,
    razaoSocial: '',
    nome: '',
    nomeFantasia: '',
    cnpj: '',
    cpf: '',
    email: '',
    telefone: '',
    cidade: '',
    uf: '',
  });

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch =
        cliente.razaoSocial?.toLowerCase().includes(search.toLowerCase()) ||
        cliente.nome?.toLowerCase().includes(search.toLowerCase()) ||
        cliente.nomeFantasia?.toLowerCase().includes(search.toLowerCase()) ||
        cliente.cnpj?.toLowerCase().includes(search.toLowerCase()) ||
        cliente.cpf?.toLowerCase().includes(search.toLowerCase()) ||
        cliente.email.toLowerCase().includes(search.toLowerCase());

      const matchesTipo = tipoFilter === 'Todos' || cliente.tipo === tipoFilter;
      const matchesStatus = statusFilter === 'Todos' || cliente.status === statusFilter;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [clientes, search, tipoFilter, statusFilter]);

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

  const handleInativar = (cliente: Cliente) => {
    if (cliente.status === 'Inativo') return;
    setClientes(
      clientes.map((c) =>
        c.id === cliente.id ? { ...c, status: 'Inativo' } : c,
      ),
    );
  };

  const handleCreate = () => {
    if (!novo.razaoSocial && !novo.nome) return;
    if (novo.tipo === 'PJ' && !novo.cnpj) return;
    if (novo.tipo === 'PF' && !novo.cpf) return;

    const nextId = (clientes.length + 1).toString();
    const hoje = new Date().toISOString().split('T')[0];
    const novoCliente: Cliente = {
      id: nextId,
      tipo: novo.tipo,
      razaoSocial: novo.razaoSocial || undefined,
      nome: novo.nome || undefined,
      nomeFantasia: novo.nomeFantasia || undefined,
      cnpj: novo.cnpj || undefined,
      cpf: novo.cpf || undefined,
      email: novo.email,
      telefone: novo.telefone,
      cidade: novo.cidade,
      uf: novo.uf,
      status: 'Ativo',
      dataCriacao: hoje,
    };
    setClientes([...clientes, novoCliente]);
    setIsDialogOpen(false);
    setNovo({
      tipo: 'PJ',
      razaoSocial: '',
      nome: '',
      nomeFantasia: '',
      cnpj: '',
      cpf: '',
      email: '',
      telefone: '',
      cidade: '',
      uf: '',
    });
  };

  const getNomeExibicao = (cliente: Cliente) => {
    if (cliente.tipo === 'PJ') {
      return cliente.razaoSocial || cliente.nomeFantasia || 'Cliente PJ';
    }
    return cliente.nome || 'Cliente PF';
  };

  const getDocumento = (cliente: Cliente) => {
    if (cliente.tipo === 'PJ') {
      return cliente.cnpj || '';
    }
    return cliente.cpf || '';
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Clientes</h1>
        <p className="text-muted-foreground">Gerencie pessoas jurídicas e físicas do sistema.</p>
      </div>

      {/* Topbar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, razão social, CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={tipoFilter} onValueChange={(value: TipoPessoa | 'Todos') => setTipoFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
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
                  Novo cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo cliente</DialogTitle>
                  <DialogDescription>Registre um novo cliente no sistema.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={novo.tipo} onValueChange={(value: TipoPessoa) => setNovo({ ...novo, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                        <SelectItem value="PF">Pessoa Física</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {novo.tipo === 'PJ' ? (
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
                        <Label>Nome Fantasia</Label>
                        <Input
                          value={novo.nomeFantasia}
                          onChange={(e) => setNovo({ ...novo, nomeFantasia: e.target.value })}
                          placeholder="Nome fantasia (opcional)"
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
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Nome *</Label>
                        <Input
                          value={novo.nome}
                          onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                          placeholder="Nome completo"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>CPF *</Label>
                        <Input
                          value={novo.cpf}
                          onChange={(e) => setNovo({ ...novo, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>E-mail *</Label>
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
                    <div className="space-y-1">
                      <Label>Cidade</Label>
                      <Input
                        value={novo.cidade}
                        onChange={(e) => setNovo({ ...novo, cidade: e.target.value })}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>UF</Label>
                      <Input
                        value={novo.uf}
                        onChange={(e) => setNovo({ ...novo, uf: e.target.value.toUpperCase() })}
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Salvar cliente
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
          <CardTitle>Clientes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {clientesFiltrados.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum cliente encontrado. Ajuste filtros ou crie um novo cliente.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome / Razão Social</TableHead>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>CNPJ / CPF</TableHead>
                  <TableHead>Cidade / UF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/cadastros/clientes/${cliente.id}`)}
                  >
                    <TableCell className="font-medium">{getNomeExibicao(cliente)}</TableCell>
                    <TableCell>{cliente.nomeFantasia || '-'}</TableCell>
                    <TableCell>{getDocumento(cliente)}</TableCell>
                    <TableCell>{cliente.cidade} / {cliente.uf}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(cliente.status)}>{cliente.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/clientes/${cliente.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/clientes/${cliente.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {cliente.status === 'Ativo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-rose-50"
                            onClick={() => handleInativar(cliente)}
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