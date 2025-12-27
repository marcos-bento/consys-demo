'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Eye, Link2, Plus, Send, Share2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { Documento, DocumentoStatus, DocumentoTipo } from '../../../lib/mock/documentos';

const tipos: DocumentoTipo[] = ['Proposta', 'Documento de custo', 'Contrato', 'Outros'];
const statusList: DocumentoStatus[] = ['Rascunho', 'Emitido', 'Enviado', 'Assinado', 'Cancelado'];
const periodos = ['7d', '30d', '90d'] as const;

export default function Documentos() {
  const router = useRouter();
  const { documentos, setDocumentos } = useDemoData();
  const [search, setSearch] = useState('');
  const [clienteFilter, setClienteFilter] = useState<string>('Todos');
  const [tipoFilter, setTipoFilter] = useState<DocumentoTipo | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<DocumentoStatus | 'Todos'>('Todos');
  const [periodo, setPeriodo] = useState<(typeof periodos)[number] | 'Todos'>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoTipo, setNovoTipo] = useState<DocumentoTipo>('Proposta');
  const [novoCliente, setNovoCliente] = useState('');
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoDescricao, setNovoDescricao] = useState('');

  const clientesOptions = useMemo(
    () => Array.from(new Set(documentos.map((d) => d.cliente))),
    [documentos],
  );

  const documentosOrdenados = useMemo(() => {
    return [...documentos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [documentos]);

  const documentosFiltrados = useMemo(() => {
    const now = new Date();
    return documentosOrdenados.filter((doc) => {
      const matchesSearch =
        doc.cliente.toLowerCase().includes(search.toLowerCase()) ||
        doc.codigo.toLowerCase().includes(search.toLowerCase()) ||
        doc.tipo.toLowerCase().includes(search.toLowerCase()) ||
        (doc.responsavel || '').toLowerCase().includes(search.toLowerCase());
      const matchesCliente = clienteFilter === 'Todos' || doc.cliente === clienteFilter;
      const matchesTipo = tipoFilter === 'Todos' || doc.tipo === tipoFilter;
      const matchesStatus = statusFilter === 'Todos' || doc.status === statusFilter;

      const matchesPeriodo = (() => {
        if (periodo === 'Todos') return true;
        const diffDays = (now.getTime() - new Date(doc.data).getTime()) / (1000 * 60 * 60 * 24);
        if (periodo === '7d') return diffDays <= 7;
        if (periodo === '30d') return diffDays <= 30;
        if (periodo === '90d') return diffDays <= 90;
        return true;
      })();

      return matchesSearch && matchesCliente && matchesTipo && matchesStatus && matchesPeriodo;
    });
  }, [documentosOrdenados, search, clienteFilter, tipoFilter, statusFilter, periodo]);

  const getStatusColor = (status: DocumentoStatus) => {
    switch (status) {
      case 'Rascunho':
        return 'bg-slate-50 text-slate-700 border border-slate-200';
      case 'Emitido':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Enviado':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Assinado':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Cancelado':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const handleDuplicate = (doc: Documento) => {
    const nextId = (documentos.length + 1).toString();
    const newDoc: Documento = {
      ...doc,
      id: nextId,
      codigo: `DOC-${String(nextId).padStart(3, '0')}`,
      status: 'Rascunho',
      titulo: `${doc.titulo} (cópia)`,
      data: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDocumentos([...documentos, newDoc]);
  };

  const handleCreate = (openDetail?: boolean) => {
    if (!novoCliente.trim()) return;
    const nextId = (documentos.length + 1).toString();
    const codigo = `DOC-${String(nextId).padStart(3, '0')}`;
    const dataHoje = new Date().toISOString().split('T')[0];
    const novoDoc: Documento = {
      id: nextId,
      codigo,
      cliente: novoCliente,
      tipo: novoTipo,
      titulo: novoTitulo || `${novoTipo} - ${novoCliente}`,
      descricao: novoDescricao,
      data: dataHoje,
      status: 'Rascunho',
      responsavel: 'Equipe Comercial',
      origem: 'Documentos',
      createdAt: dataHoje,
      updatedAt: dataHoje,
    };
    setDocumentos([...documentos, novoDoc]);
    setIsDialogOpen(false);
    setNovoCliente('');
    setNovoTitulo('');
    setNovoDescricao('');
    if (openDetail) {
      router.push(`/documentos/${novoDoc.id}`);
    }
  };

  const handleShare = (doc: Documento) => {
    navigator.clipboard?.writeText(`https://consys-demo/doc/${doc.codigo}`).catch(() => {});
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Documentos</h1>
        <p className="text-muted-foreground">Centralize propostas, contratos e documentos de custo</p>
      </div>

      {/* Topbar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Input
                placeholder="Buscar cliente, código, tipo ou responsável"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={clienteFilter} onValueChange={setClienteFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {clientesOptions.map((cliente) => (
                    <SelectItem key={cliente} value={cliente}>
                      {cliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={(value: DocumentoTipo | 'Todos') => setTipoFilter(value)}>
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
              <Select value={statusFilter} onValueChange={(value: DocumentoStatus | 'Todos') => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
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
              <Select value={periodo} onValueChange={(value: (typeof periodos)[number] | 'Todos') => setPeriodo(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {periodos.map((p) => (
                    <SelectItem key={p} value={p}>
                      Últimos {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DropdownMenu open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DropdownMenuTrigger asChild>
                <Button className="shadow-sm hover:shadow">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo documento
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={() => setNovoTipo('Proposta')}>Proposta comercial</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setNovoTipo('Documento de custo')}>Documento de custo</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setNovoTipo('Contrato')}>Contrato</DropdownMenuItem>
                <div className="border-t my-1" />
                <p className="px-2 text-xs text-muted-foreground">Tipo selecionado: {novoTipo}</p>
                <div className="px-2 py-2 space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Cliente</Label>
                    <Input value={novoCliente} onChange={(e) => setNovoCliente(e.target.value)} placeholder="Nome do cliente" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Título</Label>
                    <Input value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} placeholder="Título do documento" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Observações</Label>
                    <Input value={novoDescricao} onChange={(e) => setNovoDescricao(e.target.value)} placeholder="Opcional" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleCreate(false)}>
                      Salvar rascunho
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleCreate(true)}>
                      Criar e abrir
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Lista</CardTitle>
        </CardHeader>
        <CardContent>
          {documentosFiltrados.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum documento encontrado. Tente ajustar filtros ou criar um novo.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentosFiltrados.map((doc) => (
                  <TableRow
                    key={doc.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/documentos/${doc.id}`)}
                  >
                    <TableCell className="font-medium">{doc.codigo}</TableCell>
                    <TableCell>{doc.cliente}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.tipo}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">{doc.titulo}</TableCell>
                    <TableCell>{new Date(doc.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell>{doc.responsavel}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/5" onClick={() => router.push(`/documentos/${doc.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/5" onClick={() => handleShare(doc)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/5" onClick={() => handleDuplicate(doc)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/5" onClick={() => alert('Download simulado!')}>
                          <Link2 className="h-4 w-4" />
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
