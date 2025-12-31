'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  FileText,
  Paperclip,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Building,
  AlertTriangle
} from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import type { Assistencia, HistoricoAssistencia, AnexoAssistencia } from '@/lib/mock/assistencias';
import { useDemoData } from '@/src/lib/demo-context';

export default function AssistenciaDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const id = params.id as string;
  const {
    assistencias,
    setAssistencias,
    historicoAssistencias,
    setHistoricoAssistencias,
    anexosAssistencias,
    usuarios,
    documentos,
    setDocumentos
  } = useDemoData();

  const [novaObservacao, setNovaObservacao] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(isEditMode);
  const [editFormData, setEditFormData] = useState<Partial<Assistencia>>({});

  const assistencia = assistencias.find(a => a.id === id);
  const assistenciaHistorico = historicoAssistencias.filter(h => h.assistenciaId === id);
  const assistenciaAnexos = anexosAssistencias.filter(a => a.assistenciaId === id);

  const sortedHistorico = useMemo(() => {
    return [...assistenciaHistorico].sort((a, b) =>
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }, [assistenciaHistorico]);

  if (!assistencia) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Assistência não encontrada</h1>
          <Button onClick={() => router.push('/assistencias')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Assistência não encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (etapa: Assistencia['etapa']) => {
    const statusMap = {
      'Nova': { color: 'bg-blue-50 text-blue-700 border border-blue-100', label: 'Nova' },
      'Em análise': { color: 'bg-yellow-50 text-yellow-700 border border-yellow-100', label: 'Em análise' },
      'Agendada': { color: 'bg-purple-50 text-purple-700 border border-purple-100', label: 'Agendada' },
      'Em execução': { color: 'bg-orange-50 text-orange-700 border border-orange-100', label: 'Em execução' },
      'Concluída': { color: 'bg-green-50 text-green-700 border border-green-100', label: 'Concluída' },
      'Cancelada': { color: 'bg-red-50 text-red-700 border border-red-100', label: 'Cancelada' },
    };
    return statusMap[etapa];
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-50 text-red-700 border border-red-100';
      case 'Média': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
      case 'Baixa': return 'bg-green-50 text-green-700 border border-green-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  const getIniciais = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleMudarEtapa = (novaEtapa: Assistencia['etapa']) => {
    setAssistencias(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, etapa: novaEtapa, updatedAt: new Date().toISOString() }
          : a
      )
    );

    const novoHistorico: HistoricoAssistencia = {
      id: Date.now().toString(),
      assistenciaId: id,
      tipo: novaEtapa === 'Concluída' ? 'Concluída' : novaEtapa === 'Cancelada' ? 'Cancelada' : 'Observação',
      descricao: `Etapa alterada para ${novaEtapa}`,
      usuario: 'Usuário Demo',
      data: new Date().toISOString(),
    };

    setHistoricoAssistencias(prev => [...prev, novoHistorico]);
  };

  const handleConcluir = () => {
    setAssistencias(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, etapa: 'Concluída', dataConclusao: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString() }
          : a
      )
    );

    const novoHistorico: HistoricoAssistencia = {
      id: Date.now().toString(),
      assistenciaId: id,
      tipo: 'Concluída',
      descricao: 'Assistência concluída',
      usuario: 'Usuário Demo',
      data: new Date().toISOString(),
    };

    setHistoricoAssistencias(prev => [...prev, novoHistorico]);
  };

  const handleCancelar = () => {
    setAssistencias(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, etapa: 'Cancelada', updatedAt: new Date().toISOString() }
          : a
      )
    );

    const novoHistorico: HistoricoAssistencia = {
      id: Date.now().toString(),
      assistenciaId: id,
      tipo: 'Cancelada',
      descricao: 'Assistência cancelada',
      usuario: 'Usuário Demo',
      data: new Date().toISOString(),
    };

    setHistoricoAssistencias(prev => [...prev, novoHistorico]);
  };

  const handleAgendar = () => {
    // Implementar agendamento
    console.log('Agendar visita');
  };

  const handleReagendar = () => {
    // Implementar reagendamento
    console.log('Reagendar visita');
  };

  const handleAdicionarObservacao = () => {
    if (!novaObservacao.trim()) return;

    const novoHistorico: HistoricoAssistencia = {
      id: Date.now().toString(),
      assistenciaId: id,
      tipo: 'Observação',
      descricao: novaObservacao,
      usuario: 'Usuário Demo',
      data: new Date().toISOString(),
    };

    setHistoricoAssistencias(prev => [...prev, novoHistorico]);
    setNovaObservacao('');
  };

  const handleGerarOS = () => {
    // Criar documento OS
    const numero = (documentos.length + 1).toString().padStart(4, '0');
    const novoDocumento = {
      id: `os-${Date.now()}`,
      codigo: `OS-${numero}`,
      cliente: assistencia.cliente,
      tipo: 'Outros' as const,
      titulo: `OS - ${assistencia.protocolo} - ${assistencia.cliente}`,
      descricao: `Ordem de Serviço gerada para assistência ${assistencia.protocolo}`,
      data: new Date().toISOString().split('T')[0],
      status: 'Rascunho' as const,
      responsavel: assistencia.responsavel,
      itens: [
        {
          descricao: `${assistencia.tipo} - ${assistencia.descricao}`,
          qtd: 1,
          valorUnit: 0,
        }
      ],
      observacoes: `Assistência: ${assistencia.protocolo}`,
      origem: 'Assistências',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocumentos(prev => [...prev, novoDocumento]);

    // Adicionar ao histórico
    const novoHistorico: HistoricoAssistencia = {
      id: Date.now().toString(),
      assistenciaId: id,
      tipo: 'Observação',
      descricao: `OS ${novoDocumento.codigo} gerada`,
      usuario: 'Usuário Demo',
      data: new Date().toISOString(),
    };

    setHistoricoAssistencias(prev => [...prev, novoHistorico]);

    router.push('/documentos');
  };

  const statusBadge = getStatusBadge(assistencia.etapa);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Detalhes da Assistência</h1>
          <p className="text-muted-foreground">{assistencia.protocolo} • {assistencia.cliente}</p>
        </div>
        <Button onClick={() => router.push('/assistencias')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {assistencia.protocolo}
              <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
            </CardTitle>
            {assistencia.etapa !== 'Concluída' && assistencia.etapa !== 'Cancelada' && (
              <div className="flex gap-2">
                <Select onValueChange={handleMudarEtapa}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mudar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Nova', 'Em análise', 'Agendada', 'Em execução'].map((etapa) => (
                      <SelectItem key={etapa} value={etapa} disabled={etapa === assistencia.etapa}>
                        {etapa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleConcluir} variant="outline" size="sm">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Concluir
                </Button>
                <Button onClick={handleCancelar} variant="outline" size="sm">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Cliente
              </Label>
              <p className="text-lg font-medium">{assistencia.cliente}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <Badge variant="outline">{assistencia.tipo}</Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prioridade</Label>
              <Badge className={getPrioridadeColor(assistencia.prioridade)}>
                {assistencia.prioridade}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsável
              </Label>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getIniciais(assistencia.responsavel)}</AvatarFallback>
                </Avatar>
                <span>{assistencia.responsavel}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Abertura
              </Label>
              <p>{new Date(assistencia.dataAbertura).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Agendamento</Label>
              <p>{assistencia.dataAgendamento
                ? new Date(assistencia.dataAgendamento).toLocaleDateString('pt-BR')
                : 'Não agendado'
              }</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Conclusão</Label>
              <p>{assistencia.dataConclusao
                ? new Date(assistencia.dataConclusao).toLocaleDateString('pt-BR')
                : '—'
              }</p>
            </div>
          </div>

          {assistencia.endereco && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </Label>
              <p>{assistencia.endereco}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição
            </Label>
            <p className="text-sm bg-muted p-3 rounded-md">{assistencia.descricao}</p>
          </div>

          {/* Ações rápidas */}
          <div className="flex gap-2 pt-4 border-t">
            {assistencia.etapa !== 'Concluída' && assistencia.etapa !== 'Cancelada' && (
              <>
                <Button onClick={handleAgendar} variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar
                </Button>
                {assistencia.dataAgendamento && (
                  <Button onClick={handleReagendar} variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Reagendar
                  </Button>
                )}
              </>
            )}
            <Button onClick={handleGerarOS} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Gerar OS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline e Anexos */}
      <Tabs defaultValue="historico" className="w-full">
        <TabsList>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="anexos">Anexos ({assistenciaAnexos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline da Assistência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adicionar observação */}
              <div className="space-y-2">
                <Label>Adicionar observação</Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua observação..."
                    value={novaObservacao}
                    onChange={(e) => setNovaObservacao(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={handleAdicionarObservacao} disabled={!novaObservacao.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Histórico */}
              <div className="space-y-4">
                {sortedHistorico.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Nenhum histórico encontrado</p>
                  </div>
                ) : (
                  sortedHistorico.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {item.tipo === 'Criada' && <AlertTriangle className="h-4 w-4 text-blue-600" />}
                          {item.tipo === 'Agendada' && <Calendar className="h-4 w-4 text-purple-600" />}
                          {item.tipo === 'Iniciada' && <Clock className="h-4 w-4 text-orange-600" />}
                          {item.tipo === 'Concluída' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {item.tipo === 'Cancelada' && <XCircle className="h-4 w-4 text-red-600" />}
                          {item.tipo === 'Observação' && <FileText className="h-4 w-4 text-gray-600" />}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.tipo}</p>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.data).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        <p className="text-xs text-muted-foreground">por {item.usuario}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anexos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anexos</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assistenciaAnexos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Paperclip className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>Nenhum anexo encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assistenciaAnexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{anexo.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(anexo.dataUpload).toLocaleDateString('pt-BR')} •
                            {(anexo.tamanho / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
