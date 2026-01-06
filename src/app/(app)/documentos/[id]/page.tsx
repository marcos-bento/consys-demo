'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Copy, Download, SendHorizonal, Share2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDemoData } from '@/src/lib/demo-context';
import type { Documento, DocumentoStatus } from '@/lib/mock/documentos';

const statusColor = (status: DocumentoStatus) => {
  switch (status) {
    case 'Rascunho':
      return 'bg-slate-50 text-slate-700 border border-slate-200';
    case 'Emitido':
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    case 'Enviado':
      return 'bg-[#d17a45] text-white border border-[#d17a45]';
    case 'Assinado':
      return 'bg-[#4a8f4a] text-white border border-[#4a8f4a]';
    case 'Cancelado':
      return 'bg-[#d34c46] text-white border border-[#d34c46]';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

const mockHistorico = ['Criado em 12/12', 'Enviado em 13/12', 'Visualizado em 14/12'];

export default function DocumentoDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { documentos, setDocumentos } = useDemoData();
  const documento = documentos.find((d: Documento) => d.id === id);

  const [isSendOpen, setIsSendOpen] = useState(false);
  const [emailDestino, setEmailDestino] = useState('');
  const [mensagem, setMensagem] = useState('');

  if (!documento) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Documento não encontrado</h1>
          <p className="text-muted-foreground">Verifique o código ou volte para a lista.</p>
        </div>
        <Button onClick={() => router.push('/documentos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar a Documentos
        </Button>
      </div>
    );
  }

  const duplicateAndOpen = () => {
    const nextId = (documentos.length + 1).toString();
    const dataHoje = new Date().toISOString().split('T')[0];
    const copy: Documento = {
      ...documento,
      id: nextId,
      codigo: `DOC-${String(nextId).padStart(3, '0')}`,
      status: 'Rascunho',
      titulo: `${documento.titulo} (cópia)`,
      data: dataHoje,
      createdAt: dataHoje,
      updatedAt: dataHoje,
    };
    setDocumentos([...documentos, copy]);
    router.push(`/documentos/${copy.id}`);
  };

  const handleSend = () => {
    // Apenas mock, não envia de fato
    setIsSendOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{documento.codigo}</p>
          <h1 className="text-3xl font-semibold">{documento.titulo}</h1>
        </div>
        <Button onClick={() => router.push('/documentos')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{documento.tipo}</Badge>
        <Badge className={statusColor(documento.status)}>{documento.status}</Badge>
        <Badge variant="secondary">Cliente: {documento.cliente}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" className="shadow-sm hover:shadow" onClick={() => alert('PDF gerado!')}>
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
        <Button variant="secondary" className="shadow-sm hover:shadow" onClick={() => setIsSendOpen(true)}>
          <SendHorizonal className="mr-2 h-4 w-4" />
          Enviar
        </Button>
        <Button variant="outline" className="shadow-sm hover:shadow" onClick={duplicateAndOpen}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicar
        </Button>
        <Button variant="outline" className="shadow-sm hover:shadow" onClick={() => navigator.clipboard?.writeText(`https://consys-demo/doc/${documento.codigo}`)}>
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </div>

      {/* Preview */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Prévia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Cliente</Label>
              <p className="text-lg text-foreground">{documento.cliente}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Responsável</Label>
              <p className="text-lg text-foreground">{documento.responsavel}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Data</Label>
              <p className="text-lg text-foreground">{new Date(documento.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Origem</Label>
              <p className="text-lg text-foreground">{documento.origem || '—'}</p>
            </div>
          </div>

          {documento.descricao && (
            <div className="space-y-1">
              <Label className="text-sm font-medium">Resumo</Label>
              <p className="text-muted-foreground">{documento.descricao}</p>
            </div>
          )}

          {documento.itens && documento.itens.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Itens</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Valor unit.</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documento.itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>{item.qtd}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorUnit)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorUnit * item.qtd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {documento.observacoes && (
            <div className="space-y-1">
              <Label className="text-sm font-medium">Observações</Label>
              <p className="text-muted-foreground">{documento.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadados */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Metadados</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Criado em</Label>
            <p className="text-muted-foreground">{documento.createdAt || documento.data}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Atualizado em</Label>
            <p className="text-muted-foreground">{documento.updatedAt || documento.data}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Versão</Label>
            <p className="text-muted-foreground">1.0 (mock)</p>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockHistorico.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dialog envio */}
      <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>E-mail destino</Label>
              <Input value={emailDestino} onChange={(e) => setEmailDestino(e.target.value)} placeholder="cliente@empresa.com" />
            </div>
            <div className="space-y-1">
              <Label>Mensagem</Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Olá, segue documento para revisão..."
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsSendOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSend}>Enviar (mock)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
