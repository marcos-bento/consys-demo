'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDemoData } from '@/src/lib/demo-context';
import type { TipoPessoa } from '@/lib/mock/cadastros';

export default function NovoClientePage() {
  const router = useRouter();
  const { resetDemo } = useDemoData();
  const [novo, setNovo] = useState({
    tipo: 'PJ' as TipoPessoa,
    razaoSocial: '',
    nome: '',
    nomeFantasia: '',
    cnpj: '',
    cpf: '',
    email: '',
    telefone: '',
    cidade: '',
    uf: '',
  });

  const handleCreate = async () => {
    if (!novo.razaoSocial && !novo.nome) return;
    if (novo.tipo === 'PJ' && !novo.cnpj) return;
    if (novo.tipo === 'PF' && !novo.cpf) return;
    if (!novo.email) return;

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo),
      });
      if (!res.ok) {
        throw new Error('Falha ao criar cliente');
      }
      await resetDemo();
      router.push('/cadastros/clientes');
    } catch (error) {
      console.error('[CLIENTES_CREATE]', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/cadastros/clientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Novo Cliente</h1>
          <p className="text-muted-foreground">Registre um novo cliente no sistema</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tipo de Pessoa *</Label>
            <Select value={novo.tipo} onValueChange={(value: TipoPessoa) => setNovo({ ...novo, tipo: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                <SelectItem value="PF">Pessoa Física</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {novo.tipo === 'PJ' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razão Social *</Label>
                <Input
                  value={novo.razaoSocial}
                  onChange={(e) => setNovo({ ...novo, razaoSocial: e.target.value })}
                  placeholder="Razão social da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  value={novo.nomeFantasia}
                  onChange={(e) => setNovo({ ...novo, nomeFantasia: e.target.value })}
                  placeholder="Nome fantasia (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <Input
                  value={novo.cnpj}
                  onChange={(e) => setNovo({ ...novo, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={novo.nome}
                  onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                  placeholder="Nome completo da pessoa"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={novo.cpf}
                  onChange={(e) => setNovo({ ...novo, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={novo.email}
                onChange={(e) => setNovo({ ...novo, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={novo.telefone}
                onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
                placeholder="(11) 99999-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={novo.cidade}
                onChange={(e) => setNovo({ ...novo, cidade: e.target.value })}
                placeholder="São Paulo"
              />
            </div>
            <div className="space-y-2">
              <Label>UF</Label>
              <Input
                value={novo.uf}
                onChange={(e) => setNovo({ ...novo, uf: e.target.value.toUpperCase() })}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCreate} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Salvar Cliente
            </Button>
            <Button variant="outline" onClick={() => router.push('/cadastros/clientes')}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
