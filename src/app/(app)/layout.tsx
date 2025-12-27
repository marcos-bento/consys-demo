'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DemoProvider } from '@/src/lib/demo-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DemoProvider>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <Header onMenuClick={() => setOpen(true)} />
          <main className="flex-1 p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
        {/* Mobile sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left">
            <Sidebar onLinkClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </DemoProvider>
  );
}
