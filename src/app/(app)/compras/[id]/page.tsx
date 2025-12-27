'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDemoData } from '@/src/lib/demo-context';
import type { Compra, StatusCompra, TipoCompra } from '../../../../lib/mock/compras';

const statusColor = (status: StatusCompra) => {
  switch (status) {
    case 'Requisição':
      return 'bg-slate-50 text-slate-700 border border-slate-200';
    case 'Cotação':
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    case 'Pedido':
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    case 'Recebido':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'Cancelado':
      return 'bg-rose-50 text-rose-700 border border-rose-100';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

export default function CompraDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { compras, setCompras } = useDemoData();

  const compra = compras.find((c) => c.id === id);

  const total = useMemo(
    () =>
      compra?.itens.reduce(
        (sum, item) => sum + (item.valorUnit || 0) * (item.quantidade || 0),
        0,
      ) || 0,
    [compra],
  );

  if (!compra) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Compra não encontrada</h1>
        <Button onClick={() => router.push('/compras')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const addEvento = (descricao: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    setCompras(
      compras.map((c) =>
        c.id === compra.id
          ? { ...c, historico: [...c.historico, { data: hoje, descricao }] }
          : c,
      ),
    );
  };

  const updateStatus = (status: StatusCompra, tipo?: TipoCompra) => {
    setCompras(
      compras.map((c) =>
        c.id === compra.id ? { ...c, status, tipo: tipo || c.tipo } : c,
      ),
    );
  };

  const handleFluxo = (acao: 'cotacao' | 'pedido' | 'recebido' | 'cancelar') => {
    if (acao === 'cotacao') {
      updateStatus('Cotação');
      addEvento('Enviado para cotação');
    }
    if (acao === 'pedido') {
      updateStatus('Pedido', 'Pedido');
      addEvento('Pedido gerado');
    }
    if (acao === 'recebido') {
      updateStatus('Recebido');
      addEvento('Recebido');
    }
    if (acao === 'cancelar') {
      updateStatus('Cancelado');
      addEvento('Cancelado');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{compra.codigo}</p>
          <h1 className="text-3xl font-semibold">Detalhe da Compra</h1>
        </div>
        <Button onClick={() => router.push('/compras')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Resumo */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className={statusColor(compra.status)}>{compra.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <Badge variant="secondary">{compra.tipo}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Solicitante</p>
            <p className="font-semibold">{compra.solicitante}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fornecedor</p>
            <p className="font-semibold">{compra.fornecedor}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data</p>
            <p className="font-semibold">{new Date(compra.data).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor total estimado</p>
            <p className="font-semibold">{formatCurrency(total || compra.valorEstimado)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Itens */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor unit.</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compra.itens.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.produto}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>{item.valorUnit ? formatCurrency(item.valorUnit) : '—'}</TableCell>
                  <TableCell>
                    {item.valorUnit
                      ? formatCurrency(item.valorUnit * item.quantidade)
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ações de fluxo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {compra.status === 'Requisição' && (
            <Button onClick={() => handleFluxo('cotacao')}>
              <FileText className="mr-2 h-4 w-4" />
              Enviar para cotação
            </Button>
          )}
          {compra.status === 'Cotação' && (
            <Button onClick={() => handleFluxo('pedido')}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Gerar pedido
            </Button>
          )}
          {compra.status === 'Pedido' && (
            <Button onClick={() => handleFluxo('recebido')}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marcar como recebido
            </Button>
          )}
          {compra.status !== 'Cancelado' && (
            <Button variant="outline" className="hover:bg-rose-50" onClick={() => handleFluxo('cancelar')}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {compra.historico.map((ev, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">{new Date(ev.data).toLocaleDateString('pt-BR')}</span>
              <span>{ev.descricao}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
