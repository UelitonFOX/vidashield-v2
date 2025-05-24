import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  HelpCircle, 
  Settings, 
  Shield, 
  Zap, 
  AlertTriangle, 
  RefreshCw, 
  Mail, 
  UserCircle, 
  Key, 
  Lock, 
  MonitorSmartphone, 
  LogOut, 
  ChevronRight, 
  Clock, 
  Eye, 
  User, 
  X,
  Menu
} from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Popover from './Popover';
import '../styles/vidashield.css';

// Componente para conteúdo da ajuda em popover
const AjudaContent = () => {
  const navigate = useNavigate();

  const handleRedirectToHelp = () => {
    navigate('/ajuda');
  };

  return (
    <div className="py-4 px-5">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-700">
        <h3 className="text-lg font-semibold text-green-300">Central de Ajuda</h3>
      </div>

      <div className="text-center mb-4">
        <p className="text-zinc-400 text-sm">Guia rápido para utilizar os recursos do VidaShield</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700 hover:border-green-500/50 transition-all hover:shadow-[0_0_10px_rgba(34,197,94,0.15)] cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-medium text-green-300">Visão Geral</h4>
          </div>
          <p className="text-zinc-400 text-xs">
            Estatísticas de segurança, usuários e alertas em tempo real.
          </p>
        </div>

        <div className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700 hover:border-yellow-500/50 transition-all hover:shadow-[0_0_10px_rgba(234,179,8,0.15)] cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h4 className="text-sm font-medium text-yellow-500">Alertas</h4>
          </div>
          <p className="text-zinc-400 text-xs">
            Eventos de segurança classificados por severidade.
          </p>
        </div>
      </div>
      
      <div className="mt-5 flex justify-center">
        <button 
          onClick={handleRedirectToHelp}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-1.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Ver documentação completa</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Componente para conteúdo de notificações em popover
const NotificacoesContent = () => {
  return (
    <div className="py-4 px-5">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-700">
        <h3 className="text-lg font-semibold text-green-300 flex items-center">
          <Bell className="w-4 h-4 mr-2" />
          Notificações
        </h3>
      </div>

      <div className="space-y-3 mb-4">
        {/* Alerta de segurança */}
        <div className="p-2 bg-zinc-800 rounded-lg border-l-4 border-yellow-500 hover:bg-zinc-800/80 transition-all cursor-pointer">
          <div className="flex items-start gap-2">
            <div className="p-1.5 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="text-xs text-zinc-200 font-medium">Alerta de segurança crítico</div>
                <div className="text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded text-[10px]">Crítico</div>
              </div>
              <p className="text-xs text-zinc-400 mt-1 mb-1.5">Tentativa de acesso de IP desconhecido.</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Clock className="w-3 h-3" /> 
                  <span>Hoje, 14:32</span>
                </div>
                <button className="text-[10px] px-2 py-0.5 rounded bg-yellow-600 hover:bg-yellow-500 text-white transition-colors">
                  Ver
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Backup concluído */}
        <div className="p-2 bg-zinc-800 rounded-lg border-l-4 border-green-500 hover:bg-zinc-800/80 transition-all cursor-pointer">
          <div className="flex items-start gap-2">
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <Shield className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="text-xs text-zinc-200 font-medium">Backup concluído</div>
                <div className="text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded text-[10px]">Info</div>
              </div>
              <p className="text-xs text-zinc-400 mt-1 mb-1.5">Backup automático concluído com sucesso.</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Clock className="w-3 h-3" /> 
                  <span>Hoje, 09:15</span>
                </div>
                <button className="text-[10px] px-2 py-0.5 rounded bg-green-600 hover:bg-green-500 text-white transition-colors">
                  Ver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Link to="/alertas" className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-xs transition-colors bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded-lg">
          <Eye className="w-3 h-3" />
          Ver todas as notificações
          <ChevronRight className="w-2.5 h-2.5" />
        </Link>
      </div>
    </div>
  );
};

// Componente para configurações rápidas em popover
const ConfiguracoesContent = () => {
  const navigate = useNavigate();
  const { signOut } = useSupabaseAuth();

  const handleRedirectToProfile = () => {
    navigate('/user-profile');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // O redirecionamento será feito automaticamente pelo contexto
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="py-4 px-5">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-700">
        <h3 className="text-lg font-semibold text-green-300 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </h3>
      </div>

      {/* Link para perfil */}
      <div className="mb-3 group">
        <button 
          onClick={handleRedirectToProfile}
          className="w-full p-2 flex items-center gap-2 bg-zinc-800/70 rounded-lg border border-zinc-700 hover:border-green-500/50 transition-all hover:shadow-[0_0_10px_rgba(34,197,94,0.15)]"
        >
          <div className="p-1.5 bg-green-500/20 rounded-lg">
            <UserCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-xs font-medium text-zinc-200 group-hover:text-green-300 transition-colors">Meu Perfil</h4>
            <p className="text-[10px] text-zinc-500">Gerencie seus dados e preferências</p>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-green-400 transition-colors" />
        </button>
      </div>

      {/* Link para alterar senha */}
      <div className="mb-3 group">
        <button 
          onClick={handleRedirectToProfile}
          className="w-full p-2 flex items-center gap-2 bg-zinc-800/70 rounded-lg border border-zinc-700 hover:border-purple-500/50 transition-all hover:shadow-[0_0_10px_rgba(168,85,247,0.15)]"
        >
          <div className="p-1.5 bg-purple-500/20 rounded-lg">
            <Key className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-xs font-medium text-zinc-200 group-hover:text-purple-300 transition-colors">Alterar Senha</h4>
            <p className="text-[10px] text-zinc-500">Atualize suas credenciais</p>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-purple-400 transition-colors" />
        </button>
      </div>

      {/* Configurações do sistema (resumidas) */}
      <div className="mb-4 space-y-2">
        <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">Preferências</h4>

        <div className="flex items-center justify-between py-1.5 border-b border-zinc-800">
          <label htmlFor="modoEscuro" className="text-xs text-zinc-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Modo escuro
          </label>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="modoEscuro" className="sr-only peer" defaultChecked />
            <div className="w-8 h-4 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-700"></div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
        <Link to="/configuracoes" className="text-green-400 hover:text-green-300 text-xs transition-colors flex items-center gap-1">
          <Settings className="w-3 h-3" />
          Configurações avançadas
        </Link>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Sair
        </button>
      </div>
    </div>
  );
};

interface HeaderProps {
  toggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarCollapsed }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Efeito para atualizar o estado isMobile quando a largura da tela mudar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Adicionar evento de resize
    window.addEventListener('resize', handleResize);
    
    // Limpar evento ao desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <header className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-6 py-3 shadow-md sticky top-0 z-50 min-h-[60px] relative">
      <div className="flex items-center justify-between">
        {/* Área esquerda - botão de menu hamburger em telas menores */}
        <div className="w-32 flex items-center">
          {isMobile && toggleSidebar && (
            <button 
              onClick={toggleSidebar}
              className="p-2 text-zinc-400 hover:text-green-400 hover:bg-green-500/10 rounded-full transition-all mr-2 z-50"
              title={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
              aria-label={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
            >
              <Menu 
                className={`h-5 w-5 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-90'}`} 
              />
            </button>
          )}
        </div>

        {/* Centro com título estilizado */}
        <div className="flex-1 text-center z-40">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-300 to-green-500 text-transparent bg-clip-text">
            VidaShield
          </h1>
          <p className="text-sm text-zinc-400 -mt-1">Sistema de Segurança para Clínicas</p>
        </div>

        {/* Ícones à direita com popovers */}
        <div className="flex items-center gap-4 w-32 justify-end z-40">
          {/* Botão de notificações com popover */}
          <Popover 
            content={<NotificacoesContent />} 
            position="bottom" 
            width="350px"
            contentClassName="-translate-x-[280px]"
          >
            <button 
              className="relative p-2 text-zinc-400 hover:text-green-400 hover:bg-green-500/10 rounded-full transition-all"
              title="Notificações"
              aria-label="Ver notificações"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </Popover>

          {/* Botão de ajuda com popover */}
          <Popover 
            content={<AjudaContent />} 
            position="bottom" 
            width="350px"
            contentClassName="-translate-x-[280px]"
          >
            <button 
              className="p-2 text-zinc-400 hover:text-green-400 hover:bg-green-500/10 rounded-full transition-all"
              title="Ajuda"
              aria-label="Abrir central de ajuda"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </Popover>

          {/* Botão de configurações com popover */}
          <Popover 
            content={<ConfiguracoesContent />} 
            position="bottom" 
            width="350px"
            contentClassName="-translate-x-[320px]"
          >
            <button 
              className="p-2 text-zinc-400 hover:text-green-400 hover:bg-green-500/10 rounded-full transition-all"
              title="Configurações"
              aria-label="Configurações do sistema"
            >
              <Settings className="h-5 w-5" />
            </button>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default Header;
