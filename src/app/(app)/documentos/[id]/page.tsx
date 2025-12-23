'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, ChevronRight, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockPropostas, type ItemProposta, type Proposta } from '../../../../lib/mock/comercial';

// Componente Label simples
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}

export default function DocumentoDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const proposta = mockPropostas.find((p: Proposta) => p.id === id);

  if (!proposta) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documento não encontrado</h1>
        </div>
        <Button onClick={() => router.push('/documentos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar a Documentos
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: Proposta['status']) => {
    switch (status) {
      case 'Rascunho':
        return 'bg-gray-100 text-gray-800';
      case 'Enviada':
        return 'bg-blue-100 text-blue-800';
      case 'Aprovada':
        return 'bg-green-100 text-green-800';
      case 'Reprovada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const subtotal = proposta.itens.reduce(
    (sum: number, item: ItemProposta) => sum + item.qtd * item.valorUnit,
    0,
  );
  const total = subtotal - proposta.desconto;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/dashboard" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/documentos" className="hover:text-gray-900">
          Documentos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{proposta.codigo}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detalhes do Documento</h1>
        <Button onClick={() => router.push('/documentos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Código</Label>
              <p className="text-lg">{proposta.codigo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Cliente</Label>
              <p className="text-lg">{proposta.cliente}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">
                <Badge className={getStatusColor(proposta.status)}>{proposta.status}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Data</Label>
              <p className="text-lg">{new Date(proposta.data).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens */}
      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposta.itens.map((item: ItemProposta, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.produto}</TableCell>
                  <TableCell>{item.qtd}</TableCell>
                  <TableCell>{formatCurrency(item.valorUnit)}</TableCell>
                  <TableCell>{formatCurrency(item.qtd * item.valorUnit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Desconto:</span>
            <span>-{formatCurrency(proposta.desconto)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end space-x-2">
        <Button
          onClick={() => {
            alert('Documento aprovado!');
            router.push('/documentos');
          }}
          disabled={proposta.status !== 'Enviada'}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Aprovar
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            alert('Documento reprovado!');
            router.push('/documentos');
          }}
          disabled={proposta.status !== 'Enviada'}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reprovar
        </Button>
      </div>
    </div>
  );
}
