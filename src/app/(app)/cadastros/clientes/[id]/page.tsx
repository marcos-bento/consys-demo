'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Building2, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoData } from '@/src/lib/demo-context';

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { clientes, negocios, documentos } = useDemoData();

  const cliente = clientes.find((c) => c.id === params.id);

  if (!cliente) {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Cliente não encontrado</h1>
          <p className="text-muted-foreground">O cliente solicitado não foi encontrado no sistema.</p>
        </div>
        <Button onClick={() => router.push('/cadastros/clientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para clientes
        </Button>
      </div>
    );
  }

  const negociosCliente = negocios.filter((n) => n.empresa === cliente.razaoSocial || n.empresa === cliente.nome);
  const documentosCliente = documentos.filter((d) => d.cliente === cliente.razaoSocial || d.cliente === cliente.nome);

  const statusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-[#4a8f4a] text-white border border-[#4a8f4a]';
      case 'Inativo':
        return 'bg-[#d34c46] text-white border border-[#d34c46]';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getNomeExibicao = () => {
    if (cliente.tipo === 'PJ') {
      return cliente.razaoSocial || cliente.nomeFantasia || 'Cliente PJ';
    }
    return cliente.nome || 'Cliente PF';
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/cadastros/clientes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{getNomeExibicao()}</h1>
          <p className="text-muted-foreground">Detalhes do cliente</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Informações Principais */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dados Gerais</CardTitle>
              <div className="flex gap-2">
                <Badge className={statusColor(cliente.status)}>{cliente.status}</Badge>
                <Badge variant="outline">{cliente.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {cliente.tipo === 'PJ' && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Razão Social</p>
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {cliente.razaoSocial}
                    </p>
                  </div>
                  {cliente.nomeFantasia && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
                      <p>{cliente.nomeFantasia}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                    <p>{cliente.cnpj}</p>
                  </div>
                </>
              )}
              {cliente.tipo === 'PF' && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Nome</p>
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {cliente.nome}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">CPF</p>
                    <p>{cliente.cpf}</p>
                  </div>
                </>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {cliente.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {cliente.telefone || 'Não informado'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Localização</p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {cliente.cidade}, {cliente.uf}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(cliente.dataCriacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={() => router.push(`/cadastros/clientes/${cliente.id}/editar`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Cliente
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/documentos/nova?cliente=' + encodeURIComponent(getNomeExibicao()))}
            >
              Criar Documento
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/comercial/nova?cliente=' + cliente.id)}
            >
              Criar Proposta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Abas com informações relacionadas */}
      <Tabs defaultValue="negocios" className="w-full">
        <TabsList>
          <TabsTrigger value="negocios">Negócios ({negociosCliente.length})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({documentosCliente.length})</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="negocios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Negócios Relacionados</CardTitle>
              <CardDescription>Propostas e negócios vinculados a este cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {negociosCliente.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum negócio encontrado para este cliente.</p>
              ) : (
                <div className="space-y-3">
                  {negociosCliente.map((negocio) => (
                    <div key={negocio.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{negocio.empresa}</p>
                        <p className="text-sm text-muted-foreground">
                          Valor: R$ {negocio.valor.toLocaleString('pt-BR')} • Status: {negocio.status}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/crm/${negocio.id}`)}
                      >
                        Ver
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Documentos gerados para este cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {documentosCliente.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum documento encontrado para este cliente.</p>
              ) : (
                <div className="space-y-3">
                  {documentosCliente.map((documento) => (
                    <div key={documento.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{documento.titulo}</p>
                        <p className="text-sm text-muted-foreground">
                          Tipo: {documento.tipo} • Status: {documento.status}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/documentos/${documento.id}`)}
                      >
                        Ver
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>Visão geral dos valores relacionados ao cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    R$ {negociosCliente.reduce((sum, n) => sum + n.valor, 0).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor Total em Negócios</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {negociosCliente.filter(n => n.status === 'Ganho').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Negócios Fechados</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-white">
                    {documentosCliente.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Documentos Gerados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
