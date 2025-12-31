'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Users, Truck, Package, UserCheck, Tag } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemoData } from '@/src/lib/demo-context';
import type { Cliente, Fornecedor, Produto as ProdutoCadastro, Usuario, Categoria } from '@/lib/mock/cadastros';

type CadastroData = {
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  produtosCadastro: ProdutoCadastro[];
  usuarios: Usuario[];
  categorias: Categoria[];
};

export default function CadastrosPage() {
  const data = useDemoData();
  const [usuariosDbCount, setUsuariosDbCount] = useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) return;
        const list = await res.json();
        setUsuariosDbCount(Array.isArray(list) ? list.length : null);
      } catch (error) {
        console.error('Erro ao contar usuários', error);
      }
    };
    loadUsers();
  }, []);

  const cadastros = useMemo(
    () => [
      {
        title: 'Clientes',
        description: 'Gerencie pessoas jurídicas e físicas',
        href: '/cadastros/clientes',
        icon: Users,
        count: data.clientes.length,
      },
      {
        title: 'Fornecedores',
        description: 'Cadastre empresas fornecedoras',
        href: '/cadastros/fornecedores',
        icon: Truck,
        count: data.fornecedores.length,
      },
      {
        title: 'Produtos',
        description: 'Controle produtos e serviços',
        href: '/cadastros/produtos',
        icon: Package,
        count: data.produtosCadastro.length,
      },
      {
        title: 'Usuários',
        description: 'Gerencie usuários do sistema',
        href: '/cadastros/usuarios',
        icon: UserCheck,
        count: usuariosDbCount ?? data.usuarios.length,
      },
      {
        title: 'Categorias',
        description: 'Configure categorias de apoio',
        href: '/cadastros/categorias',
        icon: Tag,
        count: data.categorias.length,
      },
    ],
    [data, usuariosDbCount],
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Cadastros</h1>
        <p className="text-muted-foreground">
          Base de dados do sistema - clientes, fornecedores, produtos e configurações.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cadastros.map((cadastro) => (
          <Link key={cadastro.href} href={cadastro.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{cadastro.title}</CardTitle>
                <cadastro.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">{cadastro.description}</CardDescription>
                <div className="mt-2 text-2xl font-bold">{cadastro.count}</div>
                <p className="text-xs text-muted-foreground">registros</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
