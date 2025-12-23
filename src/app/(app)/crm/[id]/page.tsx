'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockLeads, Lead } from '../../../../lib/mock/crm';
import { ChevronRight, ArrowLeft, FileText, Clock } from 'lucide-react';

// Componente Label simples
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}

const mockHistory = [
  'Lead criado em 15/12/2025',
  'Contato inicial realizado em 16/12/2025',
  'Reunião agendada para 20/12/2025',
  'Proposta enviada em 18/12/2025',
];

export default function LeadDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const lead = mockLeads.find((l: Lead) => l.id === id);

  if (!lead) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Lead não encontrado</h1>
        </div>
        <Button onClick={() => router.push('/crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar a Negócios
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'Novo': return 'bg-blue-100 text-blue-800';
      case 'Em contato': return 'bg-yellow-100 text-yellow-800';
      case 'Qualificado': return 'bg-green-100 text-green-800';
      case 'Perdido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/crm" className="hover:text-gray-900">Negócios</Link>
        <ChevronRight className="h-4 w-4" />
        <span>{lead.empresa}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detalhes do Lead</h1>
        <Button onClick={() => router.push('/crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Dados do Lead */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Empresa</Label>
              <p className="text-lg">{lead.empresa}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Contato</Label>
              <p className="text-lg">{lead.contato}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Responsável</Label>
              <p className="text-lg">{lead.responsavel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHistory.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end">
        <Button onClick={() => router.push(`/documentos/nova?leadId=${lead.id}`)}>
          <FileText className="mr-2 h-4 w-4" />
          Criar Proposta
        </Button>
      </div>
    </div>
  );
}
