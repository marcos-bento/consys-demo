'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/crm': 'Negócios',
  '/comercial': 'Documentos',
  '/documentos': 'Documentos',
  '/compras': 'Compras',
  '/cadastros': 'Cadastros',
  '/estoque': 'Estoque',
  '/assistencias': 'Assistências',
  '/financeiro': 'Financeiro',
  '/frota': 'Frota',
  '/administrador': 'Administrador',
  '/relatorios': 'Relatórios',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = titles[pathname] || "Con'SYS";

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu />
        </Button>
        <h1 className="text-xl font-semibold ml-2 md:ml-0">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar..." className="pl-8 w-64" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2">
            <User size={20} />
            <span>Usuário</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
