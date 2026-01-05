'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Search, Plus } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
type DbUser = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<DbUser[]>([]);
  const [search, setSearch] = useState('');
  const [perfilFilter, setPerfilFilter] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);
  const [novoUsuario, setNovoUsuario] = useState({ username: '', password: '', role: 'Admin' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) return;
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Erro ao buscar usuários', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const perfis = useMemo(() => Array.from(new Set(usuarios.map((u) => u.role || ''))).filter(Boolean), [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchesSearch =
        usuario.username.toLowerCase().includes(search.toLowerCase()) ||
        (usuario.role?.toLowerCase() || '').includes(search.toLowerCase());

      const matchesPerfil = perfilFilter === 'Todos' || usuario.role === perfilFilter;

      return matchesSearch && matchesPerfil;
    });
  }, [usuarios, search, perfilFilter]);

  const handleCriarUsuario = async () => {
    if (!novoUsuario.username.trim() || !novoUsuario.password.trim()) {
      setError('Preencha username e senha.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível criar o usuário.');
        return;
      }
      const created: DbUser = await res.json();
      setUsuarios((prev) => [...prev, created]);
      setNovoUsuario({ username: '', password: '', role: 'Admin' });
    } catch (e) {
      console.error('Erro ao salvar usuário', e);
      setError('Erro ao salvar usuário.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Usuários</h1>
        <p className="text-muted-foreground">Gerencie usuários diretamente da base de dados.</p>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm">
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por username ou perfil"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
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
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Username *</Label>
                      <Input
                        placeholder="nome.sobrenome"
                        value={novoUsuario.username}
                        onChange={(e) => setNovoUsuario((prev) => ({ ...prev, username: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Senha *</Label>
                      <Input
                        type="password"
                        placeholder="••••••"
                        value={novoUsuario.password}
                        onChange={(e) => setNovoUsuario((prev) => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Perfil</Label>
                      <Select
                        value={novoUsuario.role}
                        onValueChange={(value) => setNovoUsuario((prev) => ({ ...prev, role: value }))}
                      >
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
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <Button onClick={handleCriarUsuario} disabled={saving} className="w-full">
                      {saving ? 'Salvando...' : 'Criar usuário'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Carregando usuários...
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Criado em</TableHead>
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
                    <TableCell className="font-medium">{usuario.username}</TableCell>
                    <TableCell>{usuario.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('pt-BR') : '-'}
                      </Badge>
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
