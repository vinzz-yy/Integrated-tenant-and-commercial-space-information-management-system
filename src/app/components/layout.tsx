import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  role: 'admin' | 'staff' | 'tenant';
}

export function Layout({ children, role }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar role={role} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
