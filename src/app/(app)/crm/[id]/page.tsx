'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, FileText, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { EtapaNegocio, Negocio, StatusNegocio } from '../../../../lib/mock/negocios';
import { useDemoData } from '@/src/lib/demo-context';

const timelineBase = ['Negócio criado', 'Contato realizado', 'Proposta enviada'];

export default function LeadDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { negocios, setNegocios } = useDemoData();
  const negocio = negocios.find((n: Negocio) => n.id === id);
  const [notas, setNotas] = useState<string[]>([]);
  const [notaNova, setNotaNova] = useState('');

  const etapas: EtapaNegocio[] = ['Novo', 'Contato', 'Proposta', 'Negociação', 'Fechado'];

  const timeline = useMemo(() => timelineBase, []);

  if (!negocio) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Negócio não encontrado</h1>
        </div>
        <Button onClick={() => router.push('/crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar a Negócios
        </Button>
      </div>
    );
  }

  const handleChangeEtapa = (novaEtapa: EtapaNegocio) => {
    setNegocios(
      negocios.map((n) => (n.id === negocio.id ? { ...n, etapa: novaEtapa, status: novaEtapa === 'Fechado' ? n.status : 'Ativo' } : n)),
    );
  };

  const handleStatus = (status: StatusNegocio) => {
    setNegocios(negocios.map((n) => (n.id === negocio.id ? { ...n, status, etapa: status === 'Ativo' ? n.etapa : 'Fechado' } : n)));
  };

  const addNota = () => {
    if (!notaNova.trim()) return;
    setNotas([notaNova.trim(), ...notas]);
    setNotaNova('');
  };

  const getStatusColor = (status: StatusNegocio) => {
    switch (status) {
      case 'Ganho':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Perdido':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/crm" className="hover:text-foreground">
          Negócios
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{negocio.codigo}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Detalhe do Negócio</h1>
        <Button onClick={() => router.push('/crm')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Resumo */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Empresa</Label>
              <p className="text-lg text-foreground">{negocio.empresa}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Contato</Label>
              <p className="text-lg text-foreground">{negocio.contato}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Valor</Label>
              <p className="text-lg font-semibold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negocio.valor)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Etapa</Label>
              <Select value={negocio.etapa} onValueChange={(value: EtapaNegocio) => handleChangeEtapa(value)}>
                <SelectTrigger className="w-full md:w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {etapas.map((etapa) => (
                    <SelectItem key={etapa} value={etapa}>
                      {etapa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Responsável</Label>
              <p className="text-lg text-foreground">{negocio.responsavel}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={getStatusColor(negocio.status)}>{negocio.status}</Badge>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-emerald-50"
                  onClick={() => handleStatus('Ganho')}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Ganho
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="hover:bg-rose-50"
                  onClick={() => handleStatus('Perdido')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Perdido
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {negocio.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            <Badge variant="secondary">Origem: {negocio.origem || '—'}</Badge>
            <Badge variant="secondary">Funil: {negocio.funil}</Badge>
            <Badge variant="secondary">Prioridade: {negocio.prioridade}</Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/documentos/nova?negocioId=${negocio.id}`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Criar proposta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeline.map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notas */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Adicionar nota</Label>
            <Textarea
              value={notaNova}
              onChange={(e) => setNotaNova(e.target.value)}
              placeholder="Ex.: Próximo passo, data de follow-up..."
            />
            <Button onClick={addNota} className="w-fit">
              Salvar nota
            </Button>
          </div>
          <Separator />
          <div className="space-y-3">
            {notas.length === 0 && <p className="text-sm text-muted-foreground">Sem notas registradas.</p>}
            {notas.map((nota, index) => (
              <div key={index} className="rounded-md border p-3 bg-white/70">
                <p className="text-sm text-foreground">{nota}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
