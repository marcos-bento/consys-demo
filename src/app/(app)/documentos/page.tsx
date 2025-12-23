'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, Copy } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { mockPropostas, Proposta } from '../../../lib/mock/comercial';

export default function Documentos() {
  const router = useRouter();
  const [propostas, setPropostas] = useState<Proposta[]>(mockPropostas);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  const filteredPropostas = useMemo(() => {
    return propostas.filter((proposta) => {
      const matchesSearch =
        proposta.cliente.toLowerCase().includes(search.toLowerCase()) ||
        proposta.codigo.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || proposta.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [propostas, search, statusFilter]);

  const handleDuplicate = (proposta: Proposta) => {
    const newId = (propostas.length + 1).toString();
    const newCodigo = `PROP-${String(newId).padStart(3, '0')}`;
    const duplicated: Proposta = {
      ...proposta,
      id: newId,
      codigo: newCodigo,
      status: 'Rascunho',
      data: new Date().toISOString().split('T')[0],
    };
    setPropostas([...propostas, duplicated]);
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-gray-600">Acesse e gerencie as propostas geradas para clientes</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Rascunho">Rascunho</SelectItem>
            <SelectItem value="Enviada">Enviada</SelectItem>
            <SelectItem value="Aprovada">Aprovada</SelectItem>
            <SelectItem value="Reprovada">Reprovada</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => router.push('/documentos/nova')}>Novo Documento</Button>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPropostas.map((proposta) => {
                const total =
                  proposta.itens.reduce((sum, item) => sum + item.qtd * item.valorUnit, 0) -
                  proposta.desconto;
                return (
                  <TableRow key={proposta.id}>
                    <TableCell>{proposta.codigo}</TableCell>
                    <TableCell>{proposta.cliente}</TableCell>
                    <TableCell>{formatCurrency(total)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(proposta.status)}>{proposta.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(proposta.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/documentos/${proposta.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDuplicate(proposta)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
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
