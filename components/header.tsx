'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDemoData } from '@/src/lib/demo-context';

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
  const { resetDemo } = useDemoData();
  const title = titles[pathname] || "Con'SYS";
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleConfirmReset = () => {
    resetDemo();
    setIsResetOpen(false);
    router.push('/dashboard');
  };

  return (
    <>
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
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setIsResetOpen(true);
                }}
              >
                Resetar dados da demo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar dados da demo</DialogTitle>
            <DialogDescription>
              Volta CRM, Documentos, Estoque e Financeiro para os dados iniciais e retorna ao
              dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              EssaÇõÇæes locais serÇæs descartadas. Confirmar agora?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsResetOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmReset}>
                Resetar e voltar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
