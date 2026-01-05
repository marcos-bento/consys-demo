'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import type { Cliente, StatusCadastro, TipoPessoa } from '@/lib/mock/cadastros';

const statusList: StatusCadastro[] = ['Ativo', 'Inativo'];

export default function EditarClientePage() {
  const params = useParams();
  const router = useRouter();
  const { clientes, setClientes } = useDemoData();
  const cliente = clientes.find((c: Cliente) => c.id === params.id);

  const [form, setForm] = useState(() => ({
    tipo: (cliente?.tipo || 'PJ') as TipoPessoa,
    razaoSocial: cliente?.razaoSocial || '',
    nome: cliente?.nome || '',
    nomeFantasia: cliente?.nomeFantasia || '',
    cnpj: cliente?.cnpj || '',
    cpf: cliente?.cpf || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    cidade: cliente?.cidade || '',
    uf: cliente?.uf || '',
    status: (cliente?.status || 'Ativo') as StatusCadastro,
  }));

  if (!cliente) {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Cliente nao encontrado</h1>
          <p className="text-muted-foreground">O cliente solicitado nao foi encontrado no sistema.</p>
        </div>
        <Button onClick={() => router.push('/cadastros/clientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para clientes
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    if (form.tipo === 'PJ' && (!form.razaoSocial.trim() || !form.cnpj.trim())) return;
    if (form.tipo === 'PF' && (!form.nome.trim() || !form.cpf.trim())) return;
    if (!form.email.trim()) return;

    setClientes(
      clientes.map((c) =>
        c.id === cliente.id
          ? {
              ...c,
              tipo: form.tipo,
              razaoSocial: form.tipo === 'PJ' ? form.razaoSocial : undefined,
              nomeFantasia: form.tipo === 'PJ' ? form.nomeFantasia : undefined,
              cnpj: form.tipo === 'PJ' ? form.cnpj : undefined,
              nome: form.tipo === 'PF' ? form.nome : undefined,
              cpf: form.tipo === 'PF' ? form.cpf : undefined,
              email: form.email,
              telefone: form.telefone,
              cidade: form.cidade,
              uf: form.uf,
              status: form.status,
            }
          : c,
      ),
    );
    router.push(`/cadastros/clientes/${cliente.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push(`/cadastros/clientes/${cliente.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Editar Cliente</h1>
          <p className="text-muted-foreground">Atualize os dados do cliente</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tipo de Pessoa *</Label>
            <Select value={form.tipo} onValueChange={(value: TipoPessoa) => setForm({ ...form, tipo: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PJ">Pessoa Juridica</SelectItem>
                <SelectItem value="PF">Pessoa Fisica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.tipo === 'PJ' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razao Social *</Label>
                <Input
                  value={form.razaoSocial}
                  onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
                  placeholder="Razao social da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  value={form.nomeFantasia}
                  onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
                  placeholder="Nome fantasia (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <Input
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Nome completo da pessoa"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
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
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(11) 99999-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                placeholder="Sao Paulo"
              />
            </div>
            <div className="space-y-2">
              <Label>UF</Label>
              <Input
                value={form.uf}
                onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                placeholder="SP"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value: StatusCadastro) => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusList.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Salvar Cliente
            </Button>
            <Button variant="outline" onClick={() => router.push(`/cadastros/clientes/${cliente.id}`)}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
