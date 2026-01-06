'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Eye, Plus, XCircle, Grid3X3, Funnel } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
import { useDemoData } from '@/src/lib/demo-context';
import type { Compra, ItemCompra, StatusCompra, TipoCompra } from '@/lib/mock/compras';

const statusList: StatusCompra[] = ['Requisição', 'Cotação', 'Pedido', 'Recebido', 'Cancelado'];

export default function ComprasPage() {
  const router = useRouter();
  const { compras, setCompras } = useDemoData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusCompra | 'Todos'>('Todos');
  const [fornecedorFilter, setFornecedorFilter] = useState<string>('Todos');
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | 'Todos'>('Todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novo, setNovo] = useState({
    solicitante: 'Ana Costa',
    centroCusto: '',
    itens: [{ produto: '', quantidade: 1, observacao: '', fornecedorSugerido: '' }] as ItemCompra[],
    observacoes: '',
  });
  const [viewMode, setViewMode] = useState<'table' | 'funnel'>('table');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const fornecedores = useMemo(() => Array.from(new Set(compras.map((c) => c.fornecedor))), [compras]);

  const comprasOrdenadas = useMemo(
    () => [...compras].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [compras],
  );

  const comprasFiltradas = useMemo(() => {
    const now = new Date();
    return comprasOrdenadas.filter((compra) => {
      const matchesSearch =
        compra.codigo.toLowerCase().includes(search.toLowerCase()) ||
        compra.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
        compra.solicitante.toLowerCase().includes(search.toLowerCase()) ||
        compra.itens.some((i) => i.produto.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'Todos' || compra.status === statusFilter;
      const matchesFornecedor = fornecedorFilter === 'Todos' || compra.fornecedor === fornecedorFilter;
      const matchesPeriodo = (() => {
        if (periodo === 'Todos') return true;
        const diffDays = (now.getTime() - new Date(compra.data).getTime()) / (1000 * 60 * 60 * 24);
        if (periodo === '7d') return diffDays <= 7;
        if (periodo === '30d') return diffDays <= 30;
        if (periodo === '90d') return diffDays <= 90;
        return true;
      })();
      return matchesSearch && matchesStatus && matchesFornecedor && matchesPeriodo;
    });
  }, [comprasOrdenadas, search, statusFilter, fornecedorFilter, periodo]);

  const statusColor = (status: StatusCompra) => {
    switch (status) {
      case 'Requisição':
        return 'bg-slate-50 text-slate-700 border border-slate-200';
      case 'Cotação':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Pedido':
        return 'bg-[#d17a45] text-white border border-[#d17a45]';
      case 'Recebido':
        return 'bg-[#4a8f4a] text-white border border-[#4a8f4a]';
      case 'Cancelado':
        return 'bg-[#d34c46] text-white border border-[#d34c46]';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const handleDuplicate = (compra: Compra) => {
    const nextId = (compras.length + 1).toString();
    const hoje = new Date().toISOString().split('T')[0];
    const nova: Compra = {
      ...compra,
      id: nextId,
      codigo: `COMP-${String(nextId).padStart(3, '0')}`,
      status: 'Requisição',
      tipo: 'Requisição',
      data: hoje,
      historico: [{ data: hoje, descricao: 'Requisição duplicada' }],
    };
    setCompras([...compras, nova]);
  };

  const handleCancel = (compra: Compra) => {
    if (compra.status === 'Cancelado') return;
    const hoje = new Date().toISOString().split('T')[0];
    setCompras(
      compras.map((c) =>
        c.id === compra.id
          ? { ...c, status: 'Cancelado', historico: [...c.historico, { data: hoje, descricao: 'Cancelado' }] }
          : c,
      ),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeCompra = compras.find((c) => c.id === activeId);
    if (!activeCompra) return;

    const newStatus = overId as StatusCompra;
    if (activeCompra.status === newStatus) return;

    const hoje = new Date().toISOString().split('T')[0];
    setCompras(
      compras.map((c) =>
        c.id === activeId
          ? { ...c, status: newStatus, historico: [...c.historico, { data: hoje, descricao: `Movido para ${newStatus}` }] }
          : c,
      ),
    );
  };

  const handleCreate = () => {
    if (!novo.itens[0]?.produto.trim()) return;
    const nextId = (compras.length + 1).toString();
    const hoje = new Date().toISOString().split('T')[0];
    const valorEstimado = novo.itens.reduce((sum, item) => sum + (item.valorUnit || 0) * item.quantidade, 0);
    const nova: Compra = {
      id: nextId,
      codigo: `COMP-${String(nextId).padStart(3, '0')}`,
      tipo: 'Requisição',
      status: 'Requisição',
      fornecedor: novo.itens[0]?.fornecedorSugerido || 'Fornecedor TBD',
      solicitante: novo.solicitante,
      data: hoje,
      valorEstimado,
      centroCusto: novo.centroCusto,
      itens: novo.itens,
      historico: [{ data: hoje, descricao: 'Requisição criada' }],
    };
    setCompras([...compras, nova]);
    setIsDialogOpen(false);
    setNovo({
      solicitante: 'Ana Costa',
      centroCusto: '',
      itens: [{ produto: '', quantidade: 1, observacao: '', fornecedorSugerido: '' }],
      observacoes: '',
    });
  };

  const updateItem = (index: number, field: keyof ItemCompra, value: string | number) => {
    setNovo((prev) => {
      const itens = [...prev.itens];
      itens[index] = { ...itens[index], [field]: value };
      return { ...prev, itens };
    });
  };

  const addItem = () => {
    setNovo((prev) => ({
      ...prev,
      itens: [...prev.itens, { produto: '', quantidade: 1, observacao: '', fornecedorSugerido: '' }],
    }));
  };

  const removeItem = (index: number) => {
    setNovo((prev) => ({
      ...prev,
      itens: prev.itens.length === 1 ? prev.itens : prev.itens.filter((_, i) => i !== index),
    }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const SortableCard = ({ compra }: { compra: Compra }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: compra.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{compra.codigo}</p>
                <p className="text-xs text-muted-foreground">{compra.fornecedor}</p>
              </div>
              <Badge className={statusColor(compra.status)}>{compra.status}</Badge>
            </div>
            <p className="text-sm">{compra.solicitante}</p>
            <p className="text-sm font-medium">{formatCurrency(compra.valorEstimado)}</p>
            <p className="text-xs text-muted-foreground">{new Date(compra.data).toLocaleDateString('pt-BR')}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const Column = ({ status, compras: columnCompras }: { status: StatusCompra; compras: Compra[] }) => {
    return (
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h3 className="font-semibold text-lg">{status}</h3>
          <p className="text-sm text-muted-foreground">{columnCompras.length} itens</p>
        </div>
        <div
          className="min-h-96 bg-muted/30 rounded-lg p-4 space-y-3"
          data-droppable-id={status}
        >
          <SortableContext items={columnCompras.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {columnCompras.map((compra) => (
              <SortableCard key={compra.id} compra={compra} />
            ))}
          </SortableContext>
        </div>
      </div>
    );
  };

  const FunnelView = () => {
    const groupedCompras = statusList.reduce((acc, status) => {
      acc[status] = comprasFiltradas.filter((c) => c.status === status);
      return acc;
    }, {} as Record<StatusCompra, Compra[]>);

    return (
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {statusList.map((status) => (
            <Column key={status} status={status} compras={groupedCompras[status]} />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="font-medium text-sm">
                    {compras.find((c) => c.id === activeId)?.codigo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {compras.find((c) => c.id === activeId)?.fornecedor}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Compras</h1>
        <p className="text-muted-foreground">Requisições, pedidos e acompanhamento centralizado.</p>
      </div>

      {/* Topbar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Input
                placeholder="Buscar produto, fornecedor, código ou solicitante"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={(value: StatusCompra | 'Todos') => setStatusFilter(value)}>
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
              <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {fornecedores.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={periodo} onValueChange={(value: '7d' | '30d' | '90d' | 'Todos') => setPeriodo(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="7d">Últimos 7d</SelectItem>
                  <SelectItem value="30d">Últimos 30d</SelectItem>
                  <SelectItem value="90d">Últimos 90d</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Grid3X3 className="mr-2 h-4 w-4" />
                Tabela
              </Button>
              <Button
                variant={viewMode === 'funnel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('funnel')}
              >
                <Funnel className="mr-2 h-4 w-4" />
                Funil
              </Button>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova requisição
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Nova requisição</DialogTitle>
                  <DialogDescription>Registre uma nova necessidade de compra.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Solicitante</Label>
                      <Input
                        value={novo.solicitante}
                        onChange={(e) => setNovo({ ...novo, solicitante: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Centro de custo</Label>
                      <Input
                        value={novo.centroCusto}
                        onChange={(e) => setNovo({ ...novo, centroCusto: e.target.value })}
                        placeholder="Ex.: TI, Operações..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Itens</Label>
                    <div className="space-y-3">
                      {novo.itens.map((item, index) => (
                        <Card key={index} className="shadow-none border-dashed">
                          <CardContent className="p-3 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label>Produto/Descrição</Label>
                                <Input
                                  value={item.produto}
                                  onChange={(e) => updateItem(index, 'produto', e.target.value)}
                                  placeholder="O que precisa ser comprado"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Quantidade</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantidade}
                                  onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Fornecedor sugerido</Label>
                                <Input
                                  value={item.fornecedorSugerido || ''}
                                  onChange={(e) => updateItem(index, 'fornecedorSugerido', e.target.value)}
                                  placeholder="Opcional"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label>Observação</Label>
                              <Textarea
                                value={item.observacao || ''}
                                onChange={(e) => updateItem(index, 'observacao', e.target.value)}
                                placeholder="Ex.: especificações, cor, prazo..."
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button variant="ghost" size="sm" onClick={() => removeItem(index)} disabled={novo.itens.length === 1}>
                                Remover item
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={addItem}>
                      Adicionar item
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Label>Observações gerais</Label>
                    <Textarea
                      value={novo.observacoes}
                      onChange={(e) => setNovo({ ...novo, observacoes: e.target.value })}
                      placeholder="Observações adicionais"
                    />
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Salvar requisição
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
          <CardTitle>Requisições e Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {comprasFiltradas.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhuma compra encontrada. Ajuste filtros ou crie uma requisição.
            </div>
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor estimado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comprasFiltradas.map((compra) => (
                  <TableRow
                    key={compra.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/compras/${compra.id}`)}
                  >
                    <TableCell className="font-medium">{compra.codigo}</TableCell>
                    <TableCell>{compra.tipo}</TableCell>
                    <TableCell>{compra.fornecedor}</TableCell>
                    <TableCell>{compra.solicitante}</TableCell>
                    <TableCell>{new Date(compra.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{formatCurrency(compra.valorEstimado)}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(compra.status)}>{compra.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => router.push(`/compras/${compra.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/5"
                          onClick={() => handleDuplicate(compra)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {compra.status !== 'Cancelado' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-[#d34c46]"
                            onClick={() => handleCancel(compra)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <FunnelView />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
