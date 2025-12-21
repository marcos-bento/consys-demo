'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockRelatorios, type DadosRelatorio } from '@/src/lib/mock/relatorios';

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('30');

  const dados: DadosRelatorio = useMemo(() => mockRelatorios[periodo], [periodo]);

  const maxVendas = Math.max(...dados.vendasSemanais);
  const maxStatus = Math.max(...Object.values(dados.propostasPorStatus));

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;
  const formatPercent = (value: number) => `${value}%`;

  const renderVariacao = (variacao: number) => {
    if (variacao > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          +{variacao}%
        </div>
      );
    } else if (variacao < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="h-4 w-4 mr-1" />
          {variacao}%
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-600">
          <Minus className="h-4 w-4 mr-1" />
          0%
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Indicadores e análises (demo)</p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dados.kpis.vendas)}</div>
            {renderVariacao(dados.kpis.variacaoVendas)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Propostas Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.kpis.propostasEnviadas}</div>
            {renderVariacao(dados.kpis.variacaoPropostas)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(dados.kpis.taxaConversao)}</div>
            {renderVariacao(dados.kpis.variacaoConversao)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dados.kpis.ticketMedio)}</div>
            {renderVariacao(dados.kpis.variacaoTicket)}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 1: Vendas por Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-64 gap-2">
            {dados.vendasSemanais.map((valor, index) => {
              const height = (valor / maxVendas) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{ height: `${height}%` }}
                    title={formatCurrency(valor)}
                  ></div>
                  <span className="text-xs mt-2">S{index + 1}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 2: Propostas por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Propostas por Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(dados.propostasPorStatus).map(([status, qtd]) => {
            const width = (qtd / maxStatus) * 100;
            return (
              <div key={status} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium">{status}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${width}%` }}
                  ></div>
                </div>
                <Badge variant="secondary">{qtd}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Clientes (demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.topClientes.map((cliente, index) => (
                  <TableRow key={index}>
                    <TableCell>{cliente.cliente}</TableCell>
                    <TableCell className="text-right">{formatCurrency(cliente.valor)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Produtos (demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.topProdutos.map((produto, index) => (
                  <TableRow key={index}>
                    <TableCell>{produto.produto}</TableCell>
                    <TableCell className="text-right">{produto.qtd}</TableCell>
                    <TableCell className="text-right">{formatCurrency(produto.valor)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
