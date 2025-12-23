'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';

type TabKey = 'clientes' | 'fornecedores' | 'produtos';

type Cliente = { id: string; nome: string; email: string; telefone: string };
type Fornecedor = { id: string; empresa: string; contato: string; telefone: string };
type Produto = { id: string; nome: string; sku: string; categoria: string; estoque: number };

export default function CadastrosPage() {
  const [tab, setTab] = useState<TabKey>('clientes');

  const [clientes, setClientes] = useState<Cliente[]>([
    { id: '1', nome: 'Empresa A', email: 'contato@empresa.com', telefone: '(11) 99999-0000' },
    { id: '2', nome: 'Tech Solutions', email: 'vendas@tech.com', telefone: '(21) 98888-1111' },
  ]);
  const [novoCliente, setNovoCliente] = useState<Cliente>({
    id: '',
    nome: '',
    email: '',
    telefone: '',
  });

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([
    { id: '1', empresa: 'Fornecedor X', contato: 'Marcos Silva', telefone: '(11) 91234-5678' },
    { id: '2', empresa: 'Distribuidora Y', contato: 'Fernanda Lima', telefone: '(31) 99876-5432' },
  ]);
  const [novoFornecedor, setNovoFornecedor] = useState<Fornecedor>({
    id: '',
    empresa: '',
    contato: '',
    telefone: '',
  });

  const [produtos, setProdutos] = useState<Produto[]>([
    { id: '1', nome: 'Mesa de reunião', sku: 'MES-001', categoria: 'Mobiliário', estoque: 12 },
    { id: '2', nome: 'Cadeira ergonômica', sku: 'CAD-010', categoria: 'Mobiliário', estoque: 40 },
  ]);
  const [novoProduto, setNovoProduto] = useState<Produto>({
    id: '',
    nome: '',
    sku: '',
    categoria: '',
    estoque: 0,
  });

  const handleAddCliente = () => {
    if (!novoCliente.nome) return;
    const id = (clientes.length + 1).toString();
    setClientes([...clientes, { ...novoCliente, id }]);
    setNovoCliente({ id: '', nome: '', email: '', telefone: '' });
  };

  const handleAddFornecedor = () => {
    if (!novoFornecedor.empresa) return;
    const id = (fornecedores.length + 1).toString();
    setFornecedores([...fornecedores, { ...novoFornecedor, id }]);
    setNovoFornecedor({ id: '', empresa: '', contato: '', telefone: '' });
  };

  const handleAddProduto = () => {
    if (!novoProduto.nome || !novoProduto.sku) return;
    const id = (produtos.length + 1).toString();
    setProdutos([...produtos, { ...novoProduto, id }]);
    setNovoProduto({ id: '', nome: '', sku: '', categoria: '', estoque: 0 });
  };

  const renderClientes = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Novo cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={novoCliente.nome}
                onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                placeholder="Razão social ou nome"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={novoCliente.email}
                onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                placeholder="contato@empresa.com"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={novoCliente.telefone}
                onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                placeholder="(11) 99999-0000"
              />
            </div>
          </div>
          <Button onClick={handleAddCliente}>
            <Plus className="mr-2 h-4 w-4" />
            Salvar cliente
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  const renderFornecedores = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Novo fornecedor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Empresa</Label>
              <Input
                value={novoFornecedor.empresa}
                onChange={(e) => setNovoFornecedor({ ...novoFornecedor, empresa: e.target.value })}
                placeholder="Razão social"
              />
            </div>
            <div>
              <Label>Contato</Label>
              <Input
                value={novoFornecedor.contato}
                onChange={(e) => setNovoFornecedor({ ...novoFornecedor, contato: e.target.value })}
                placeholder="Pessoa de contato"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={novoFornecedor.telefone}
                onChange={(e) => setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value })}
                placeholder="(11) 98888-0000"
              />
            </div>
          </div>
          <Button onClick={handleAddFornecedor}>
            <Plus className="mr-2 h-4 w-4" />
            Salvar fornecedor
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Telefone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell>{fornecedor.empresa}</TableCell>
                  <TableCell>{fornecedor.contato}</TableCell>
                  <TableCell>{fornecedor.telefone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  const renderProdutos = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Novo produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                placeholder="Nome comercial"
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={novoProduto.sku}
                onChange={(e) => setNovoProduto({ ...novoProduto, sku: e.target.value })}
                placeholder="Código interno"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                value={novoProduto.categoria}
                onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
                placeholder="Categoria"
              />
            </div>
            <div>
              <Label>Estoque</Label>
              <Input
                type="number"
                value={novoProduto.estoque}
                onChange={(e) => setNovoProduto({ ...novoProduto, estoque: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>
          <Button onClick={handleAddProduto}>
            <Plus className="mr-2 h-4 w-4" />
            Salvar produto
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell>{produto.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{produto.categoria || '—'}</Badge>
                  </TableCell>
                  <TableCell>{produto.estoque}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  const renderTabContent = () => {
    switch (tab) {
      case 'clientes':
        return renderClientes();
      case 'fornecedores':
        return renderFornecedores();
      case 'produtos':
        return renderProdutos();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Cadastros</h1>
        <p className="text-gray-600">Centralize clientes, fornecedores e produtos</p>
      </div>

      <div className="flex items-center gap-2">
        {[
          { key: 'clientes', label: 'Clientes' },
          { key: 'fornecedores', label: 'Fornecedores' },
          { key: 'produtos', label: 'Produtos' },
        ].map((item) => (
          <Button
            key={item.key}
            variant={tab === item.key ? 'default' : 'outline'}
            onClick={() => setTab(item.key as TabKey)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <Separator />

      <div className="space-y-6">{renderTabContent()}</div>
    </div>
  );
}
