'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Save, Send, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { mockLeads } from '../../../../lib/mock/crm';
import { mockPropostas, type ItemProposta, type Proposta } from '../../../../lib/mock/comercial';

// Componente Label simples
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}

export default function NovoDocumento() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

  const [cliente, setCliente] = useState('');
  const [itens, setItens] = useState<ItemProposta[]>([{ produto: '', qtd: 1, valorUnit: 0 }]);
  const [desconto, setDesconto] = useState(0);

  useEffect(() => {
    if (leadId) {
      const lead = mockLeads.find((l: { id: string; empresa: string }) => l.id === leadId);
      if (lead) {
        setCliente(lead.empresa);
      }
    }
  }, [leadId]);

  const addItem = () => {
    setItens([...itens, { produto: '', qtd: 1, valorUnit: 0 }]);
  };

  const removeItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemProposta, value: string | number) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setItens(newItens);
  };

  const subtotal = itens.reduce((sum, item) => sum + item.qtd * item.valorUnit, 0);
  const total = subtotal - desconto;

  const saveProposta = (status: Proposta['status']) => {
    // Em um app real, salvaria no backend com status
    router.push('/documentos');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Documento</h1>
        <p className="text-gray-600">Cadastre uma nova proposta para clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label>Produto</Label>
                    <Input
                      value={item.produto}
                      onChange={(e) => updateItem(index, 'produto', e.target.value)}
                      placeholder="Nome do produto/serviço"
                    />
                  </div>
                  <div className="w-20">
                    <Label>Qtd</Label>
                    <Input
                      type="number"
                      value={item.qtd}
                      onChange={(e) => updateItem(index, 'qtd', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div className="w-32">
                    <Label>Valor Unit.</Label>
                    <Input
                      type="number"
                      value={item.valorUnit}
                      onChange={(e) => updateItem(index, 'valorUnit', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={itens.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addItem} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div>
                <Label>Desconto</Label>
                <Input
                  type="number"
                  value={desconto}
                  onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                />
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button onClick={() => saveProposta('Rascunho')} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar como Rascunho
            </Button>
            <Button onClick={() => saveProposta('Enviada')} variant="outline" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Marcar como Enviada
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
