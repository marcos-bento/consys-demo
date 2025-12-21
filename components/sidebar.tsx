'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShoppingCart, Package, DollarSign, FileText } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/crm', label: 'CRM', icon: Users },
  { href: '/comercial', label: 'Comercial', icon: ShoppingCart },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
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