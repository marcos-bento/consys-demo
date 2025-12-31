'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useDemoData } from '@/src/lib/demo-context';
import type { Assistencia } from '@/lib/mock/assistencias';

interface NovaAssistenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NovaAssistenciaDialog({ open, onOpenChange }: NovaAssistenciaDialogProps) {
  const { clientes, usuarios, setAssistencias, setHistoricoAssistencias, assistencias } = useDemoData();
  const [formData, setFormData] = useState({
    clienteId: '',
    tipo: '' as Assistencia['tipo'],
    prioridade: '' as Assistencia['prioridade'],
    descricao: '',
    responsavelId: '',
    endereco: '',
    dataAgendamento: undefined as Date | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.clienteId || !formData.tipo || !formData.prioridade || !formData.descricao || !formData.responsavelId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cliente = clientes.find(c => c.id === formData.clienteId);
      const responsavel = usuarios.find(u => u.id === formData.responsavelId);

      if (!cliente || !responsavel) return;

      // Gerar protocolo
      const numero = (assistencias.length + 1).toString().padStart(6, '0');
      const protocolo = `AST-${numero}`;

      const novaAssistencia: Assistencia = {
        id: Date.now().toString(),
        protocolo,
        cliente: cliente.nome || cliente.razaoSocial || 'Cliente',
        clienteId: cliente.id,
        tipo: formData.tipo,
        prioridade: formData.prioridade,
        etapa: 'Nova',
        responsavel: responsavel.nome,
        responsavelId: responsavel.id,
        descricao: formData.descricao,
        endereco: formData.endereco || undefined,
        dataAbertura: new Date().toISOString().split('T')[0],
        dataAgendamento: formData.dataAgendamento?.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAssistencias(prev => [...prev, novaAssistencia]);

      // Adicionar ao histórico
      const novoHistorico = {
        id: Date.now().toString(),
        assistenciaId: novaAssistencia.id,
        tipo: 'Criada' as const,
        descricao: 'Assistência criada',
        usuario: 'Usuário Demo',
        data: new Date().toISOString(),
      };

      setHistoricoAssistencias(prev => [...prev, novoHistorico]);

      // Reset form
      setFormData({
        clienteId: '',
        tipo: '' as Assistencia['tipo'],
        prioridade: '' as Assistencia['prioridade'],
        descricao: '',
        responsavelId: '',
        endereco: '',
        dataAgendamento: undefined,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar assistência:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      clienteId: '',
      tipo: '' as Assistencia['tipo'],
      prioridade: '' as Assistencia['prioridade'],
      descricao: '',
      responsavelId: '',
      endereco: '',
      dataAgendamento: undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Assistência</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova solicitação de assistência técnica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select
              value={formData.clienteId}
              onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome || cliente.razaoSocial} - {cliente.cidade}/{cliente.uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo e Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value as Assistencia['tipo'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Montagem">Montagem</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Garantia">Garantia</SelectItem>
                  <SelectItem value="Ajuste">Ajuste</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade *</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData({ ...formData, prioridade: value as Assistencia['prioridade'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do problema *</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva detalhadamente o problema ou solicitação..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Select
              value={formData.responsavelId}
              onValueChange={(value) => setFormData({ ...formData, responsavelId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {usuarios.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id}>
                    {usuario.nome} - {usuario.perfil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data de agendamento */}
          <div className="space-y-2">
            <Label>Data preferencial de agendamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dataAgendamento && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dataAgendamento ? (
                    format(formData.dataAgendamento, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dataAgendamento}
                  onSelect={(date) => setFormData({ ...formData, dataAgendamento: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço de atendimento</Label>
            <Input
              id="endereco"
              placeholder="Caso seja diferente do endereço do cliente..."
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.clienteId || !formData.tipo || !formData.prioridade || !formData.descricao || !formData.responsavelId}
          >
            {isSubmitting ? 'Criando...' : 'Criar Assistência'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
