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
import { useAuth } from '../hooks/useAuth';
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
  const { signOut } = useAuth();

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
  const { user, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo e Toggle Sidebar */}
      <div className="flex items-center gap-4">
        {toggleSidebar && isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5 text-green-400" />
            ) : (
              <X className="w-5 h-5 text-green-400" />
            )}
          </button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-400/20 rounded-lg">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-green-400">VidaShield</h1>
            <p className="text-xs text-zinc-400">Cybersecurity Dashboard</p>
          </div>
        </div>
      </div>

      {/* Ações do usuário */}
      <div className="flex items-center gap-3">
        {/* Notificações */}
        <button 
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors relative"
          title="Notificações"
        >
          <Bell className="w-5 h-5 text-zinc-400" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
        </button>

        {/* Configurações */}
        <button 
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          title="Configurações"
        >
          <Settings className="w-5 h-5 text-zinc-400" />
        </button>

        {/* Usuário */}
        <div className="flex items-center gap-3 pl-3 border-l border-zinc-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="text-xs text-zinc-400">Administrador</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/30 transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
