import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  HelpCircle,
  Settings,
  ScreenShare as Sistema,
  CreditCard as Contas,
  Database as Dados,
  BookOpen as Docs
} from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import { Ajuda } from '../pages/Ajuda';
import "../styles/vidashield.css";

// Componente para conteúdo da ajuda em modal
const AjudaModalContent = () => {
  return <Ajuda modalView={true} />;
};

// Componente para conteúdo do modal de notificações
const NotificacoesModalContent = () => {
  return (
    <div className="py-2">
      <div className="mb-4 pb-2 border-b border-zinc-700">
        <h3 className="text-green-400 text-sm font-medium mb-3">Notificações recentes</h3>
        <div className="space-y-3">
          <div className="p-2 bg-zinc-800 rounded border-l-4 border-yellow-500">
            <div className="text-sm text-zinc-200">Alerta de segurança crítico detectado</div>
            <div className="text-xs text-zinc-400 mt-1">Hoje, 14:32</div>
          </div>
          <div className="p-2 bg-zinc-800 rounded border-l-4 border-green-500">
            <div className="text-sm text-zinc-200">Backup diário concluído com sucesso</div>
            <div className="text-xs text-zinc-400 mt-1">Hoje, 09:15</div>
          </div>
          <div className="p-2 bg-zinc-800 rounded border-l-4 border-blue-500">
            <div className="text-sm text-zinc-200">Atualização do sistema disponível</div>
            <div className="text-xs text-zinc-400 mt-1">Ontem, 18:45</div>
          </div>
        </div>
      </div>
      <div className="text-center">
        <a href="/alertas" className="text-green-400 hover:text-green-300 text-sm transition-colors">
          Ver todas as notificações
        </a>
      </div>
    </div>
  );
};

const Topbar = () => {
  const { openModal } = useModal();
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  
  // Função para abrir modal de ajuda
  const handleOpenAjuda = () => {
    openModal("Central de Ajuda", <AjudaModalContent />, "xl");
  };

  // Função para abrir modal de notificações
  const handleOpenNotificacoes = () => {
    openModal("Notificações", <NotificacoesModalContent />, "md");
  };
  
  return (
    <div className="topbar p-3 flex justify-end items-center gap-2 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 shadow-md">
      <button 
        onClick={handleOpenNotificacoes}
        className="p-2 rounded-full text-zinc-400 hover:text-green-300 hover:bg-zinc-800 transition-all duration-200 relative"
        aria-label="Notificações"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-red-500 border border-zinc-900"></span>
      </button>
      
      <button 
        onClick={handleOpenAjuda}
        className="p-2 rounded-full text-zinc-400 hover:text-green-300 hover:bg-zinc-800 transition-all duration-200"
        aria-label="Ajuda"
        title="Ajuda"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      
      {/* Botão de configurações com dropdown ao passar o mouse */}
      <div className="relative">
        <button 
          onMouseEnter={() => setShowConfigMenu(true)}
          className="p-2 rounded-full text-zinc-400 hover:text-green-300 hover:bg-zinc-800 transition-all duration-200"
          aria-label="Configurações"
          title="Configurações"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        {/* Menu dropdown de configurações */}
        {showConfigMenu && (
          <div 
            className="absolute right-0 mt-2 w-72 bg-zinc-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-700 z-50 overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
            onMouseEnter={() => setShowConfigMenu(true)}
            onMouseLeave={() => setShowConfigMenu(false)}
          >
            <div className="p-2 border-b border-zinc-700">
              <span className="text-green-400 font-medium">Configurações rápidas</span>
            </div>
            <div className="p-3 grid grid-cols-1 gap-2">
              {/* Configurações Gerais */}
              <Link to="/configuracoes" className="group flex items-start p-2 hover:bg-zinc-700/60 rounded-md transition-all">
                <div className="p-1.5 bg-zinc-700/40 rounded-md mr-3 group-hover:bg-green-500/20">
                  <Sistema size={18} className="text-green-400" />
                </div>
                <div>
                  <span className="text-zinc-200 font-medium block">Configurações Gerais</span>
                  <span className="text-xs text-zinc-400">Ajustes do sistema e preferências</span>
                </div>
              </Link>
              
              {/* Gestão de Usuários */}
              <Link to="/usuarios" className="group flex items-start p-2 hover:bg-zinc-700/60 rounded-md transition-all">
                <div className="p-1.5 bg-zinc-700/40 rounded-md mr-3 group-hover:bg-green-500/20">
                  <Contas size={18} className="text-green-400" />
                </div>
                <div>
                  <span className="text-zinc-200 font-medium block">Gestão de Usuários</span>
                  <span className="text-xs text-zinc-400">Gerenciar usuários e permissões</span>
                </div>
              </Link>
              
              {/* Relatórios */}
              <Link to="/relatorios" className="group flex items-start p-2 hover:bg-zinc-700/60 rounded-md transition-all">
                <div className="p-1.5 bg-zinc-700/40 rounded-md mr-3 group-hover:bg-green-500/20">
                  <Dados size={18} className="text-green-400" />
                </div>
                <div>
                  <span className="text-zinc-200 font-medium block">Relatórios</span>
                  <span className="text-xs text-zinc-400">Exportação e configuração de relatórios</span>
                </div>
              </Link>
              
              {/* Documentação */}
              <Link to="/documentacao" className="group flex items-start p-2 hover:bg-zinc-700/60 rounded-md transition-all">
                <div className="p-1.5 bg-zinc-700/40 rounded-md mr-3 group-hover:bg-green-500/20">
                  <Docs size={18} className="text-green-400" />
                </div>
                <div>
                  <span className="text-zinc-200 font-medium block">Documentação</span>
                  <span className="text-xs text-zinc-400">Manuais e documentação do sistema</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar; 