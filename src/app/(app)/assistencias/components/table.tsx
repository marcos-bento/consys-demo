'use client';

import { useRouter } from 'next/navigation';
import { Eye, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Assistencia } from '@/lib/mock/assistencias';

interface AssistenciasTableProps {
  assistencias: Assistencia[];
  getStatusBadge: (etapa: Assistencia['etapa']) => { color: string; label: string };
}

export default function AssistenciasTable({ assistencias, getStatusBadge }: AssistenciasTableProps) {
  const router = useRouter();

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-50 text-red-700 border border-red-100';
      case 'Média': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      case 'Baixa': return 'bg-green-50 text-green-700 border border-green-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Protocolo</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Abertura</TableHead>
            <TableHead>Agendamento</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assistencias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Nenhuma assistência encontrada
              </TableCell>
            </TableRow>
          ) : (
            assistencias.map((assistencia) => {
              const statusBadge = getStatusBadge(assistencia.etapa);

              return (
                <TableRow
                  key={assistencia.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/assistencias/${assistencia.id}`)}
                >
                  <TableCell className="font-medium">{assistencia.protocolo}</TableCell>
                  <TableCell>{assistencia.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {assistencia.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getPrioridadeColor(assistencia.prioridade)}`}>
                      {assistencia.prioridade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadge.color}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{assistencia.responsavel}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(assistencia.dataAbertura).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {assistencia.dataAgendamento
                      ? new Date(assistencia.dataAgendamento).toLocaleDateString('pt-BR')
                      : '—'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/assistencias/${assistencia.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {assistencia.etapa !== 'Concluída' && assistencia.etapa !== 'Cancelada' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/assistencias/${assistencia.id}?edit=true`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
