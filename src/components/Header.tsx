import React from 'react';
import { Bell, HelpCircle, Settings, Shield } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
      {/* Logo e Título */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-400/20 rounded-lg">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-green-400">VidaShield</h1>
            <p className="text-sm text-zinc-400">Sistema de Segurança para Clínicas</p>
          </div>
        </div>
      </div>

      {/* Ações do Header */}
      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button 
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors relative"
          title="Notificações"
        >
          <Bell className="w-5 h-5 text-zinc-400" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
            <span className="text-white text-[10px]">1</span>
          </span>
        </button>

        {/* Ajuda */}
        <button 
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          title="Ajuda"
        >
          <HelpCircle className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Configurações */}
        <button 
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          title="Configurações"
        >
          <Settings className="w-5 h-5 text-zinc-400" />
        </button>
      </div>
    </header>
  );
};

export default Header;
