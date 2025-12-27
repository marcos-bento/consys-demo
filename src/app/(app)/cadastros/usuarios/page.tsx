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
import type { Usuario, StatusCadastro } from '../../../lib/mock/cadastros';

const statusList: StatusCadastro[] = ['Ativo', 'Inativo'];

export default function UsuariosPage() {
  const router = useRouter();
  const { usuarios, setUsuarios } = useDemoData();
  const [search, setSearch] = useState('');
  const [perfilFilter, setPerfilFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusCadastro | 'Todos'>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novo, setNovo] = useState({
    nome: '',
    email: '',
    perfil: 'Comercial' as Usuario['perfil'],
  });

  const perfis = useMemo(() => Array.from(new Set(usuarios.map((u) => u.perfil))), [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchesSearch =
        usuario.nome.toLowerCase().includes(search.toLowerCase()) ||
        usuario.email.toLowerCase().includes(search.toLowerCase());

      const matchesPerfil = perfilFilter === 'Todos' || usuario.perfil === perfilFilter;
      const matchesStatus = statusFilter === 'Todos' || usuario.status === statusFilter;

      return matchesSearch && matchesPerfil && matchesStatus;
    });
  }, [usuarios, search, perfilFilter, statusFilter]);

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

  const handleInativar = (usuario: Usuario) => {
    if (usuario.status === 'Inativo') return;
    setUsuarios(
      usuarios.map((u) =>
        u.id === usuario.id ? { ...u, status: 'Inativo' } : u,
      ),
    );
  };

  const handleCreate = () => {
    if (!novo.nome.trim() || !novo.email.trim()) return;

    const nextId = (usuarios.length + 1).toString();
    const hoje = new Date().toISOString().split('T')[0];
    const novoUsuario: Usuario = {
      id: nextId,
      nome: novo.nome,
      email: novo.email,
      perfil: novo.perfil,
      status: 'Ativo',
      dataCriacao: hoje,
    };
    setUsuarios([...usuarios, novoUsuario]);
    setIsDialogOpen(false);
    setNovo({
      nome: '',
      email: '',
      perfil: 'Comercial',
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Usuários</h1>
        <p className="text-muted-foreground">Gerencie usuários e suas permissões no sistema.</p>
      </div>

      {/* Topbar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={perfilFilter} onValueChange={setPerfilFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {perfis.map((perfil) => (
                    <SelectItem key={perfil} value={perfil}>
                      {perfil}
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
                  Novo usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo usuário</DialogTitle>
                  <DialogDescription>Registre um novo usuário no sistema.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Nome *</Label>
                    <Input
                      value={novo.nome}
                      onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
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
                    <Label>Perfil</Label>
                    <Select value={novo.perfil} onValueChange={(value: Usuario['perfil']) => setNovo({ ...novo, perfil: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                        <SelectItem value="Operacional">Operacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Salvar usuário
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
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {usuariosFiltrados.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado. Ajuste filtros ou crie um novo usuário.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((usuario) => (
                  <TableRow
                    key={usuario.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/cadastros/usuarios/${usuario.id}`)}
                  >
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{usuario.perfil}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(usuario.status)}>{usuario.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/usuarios/${usuario.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/cadastros/usuarios/${usuario.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {usuario.status === 'Ativo' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-rose-50"
                            onClick={() => handleInativar(usuario)}
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