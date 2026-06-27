import React, { useState, ReactNode } from 'react';
import Navbar from './Navbar';
import { Separator } from "../ui/separator";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'pl-17.5' : 'pl-60 max-md:pl-0'}`}>
        <header className="hidden md:flex sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">La Bombonera</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;