import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import "../styles/vidashield.css";

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-950 p-4">
          <div className="relative z-10">
            {children || <Outlet />}
          </div>
          
          {/* Elementos decorativos de fundo */}
          <div className="fixed top-1/4 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
          <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 