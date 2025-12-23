'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Banknote,
  ShoppingCart,
  Package,
  DollarSign,
  FileText,
  ClipboardList,
  Truck,
  ShoppingBag,
  LifeBuoy,
  ShieldCheck,
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/crm', label: 'Negócios', icon: Banknote },
  { href: '/documentos', label: 'Documentos', icon: ShoppingCart },
  { href: '/compras', label: 'Compras', icon: ShoppingBag },
  { href: '/cadastros', label: 'Cadastros', icon: ClipboardList },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/assistencias', label: 'Assistências', icon: LifeBuoy },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/frota', label: 'Frota', icon: Truck },
  { href: '/administrador', label: 'Administrador', icon: ShieldCheck },
  { href: '/relatorios', label: 'Relatorios', icon: FileText },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 min-h-full bg-blue-900 text-white flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">Con'SYS</h1>
      </div>
      <nav className="flex-1">
        <ul>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onLinkClick}
                  className={`flex items-center p-4 hover:bg-gray-700 ${
                    isActive ? 'bg-gray-700' : ''
                  }`}
                >
                  <link.icon className="mr-2" size={20} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
