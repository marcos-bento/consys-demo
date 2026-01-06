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
      className={`min-h-full bg-[#317daf] text-white flex flex-col transition-all duration-200 overflow-hidden ${
        collapsed ? 'w-16' : 'w-52'
      }`}
    >
      <div className="flex items-center justify-between p-3">
        <h1 className={`text-lg font-bold truncate transition-all ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          Con'SYS
        </h1>
        <button
          type="button"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-white hover:bg-blue-800 rounded-md p-1.5 transition-colors"
        >
          {collapsed ? <ChevronLast size={16} /> : <ChevronFirst size={16} />}
        </button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onLinkClick}
                  className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 transition-colors max-w-full ${
                    isActive ? 'bg-[#2b2b2b]' : ''
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <link.icon size={18} />
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
