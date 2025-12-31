'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
  Users,
  ChevronFirst,
  ChevronLast,
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
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/dep-pessoal', label: 'Dep. Pessoal', icon: Users },
  { href: '/administrador', label: 'Configurações', icon: ShieldCheck },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`min-h-full bg-blue-900 text-white flex flex-col transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <h1 className={`text-xl font-bold truncate transition-all ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          Con'SYS
        </h1>
        <button
          type="button"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-white hover:bg-blue-800 rounded-md p-2 transition-colors"
        >
          {collapsed ? <ChevronLast size={18} /> : <ChevronFirst size={18} />}
        </button>
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
                  className={`flex items-center gap-3 p-4 hover:bg-gray-700 transition-colors ${
                    isActive ? 'bg-gray-700' : ''
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <link.icon size={20} />
                  <span className={`whitespace-nowrap transition-opacity ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
