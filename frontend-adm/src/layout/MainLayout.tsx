import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard as Dashboard, 
  Users2 as Users, 
  ScrollText as Logs, 
  BellRing as Alerts, 
  BarChart3 as Stats, 
  Settings,
  FileText as Reports,
  Download as Exports, 
  BookOpen as Docs, 
  HelpCircle as Help, 
  Cpu as Version,
  Clock as ClockIcon,
  UserRound as User,
  LogOut,
  UserCircle,
  ShieldCheck,
  UserCog,
  UserCheck,
  ShieldAlert,
  Stethoscope,
  HeartPulse,
  UserPlus,
  Building2,
  Menu
} from "lucide-react";
import logo from "../assets/images/logo.png";
import { useModal } from "../contexts/ModalContext";
import Ajuda from '../pages/Ajuda';
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { useAuth0 } from "@auth0/auth0-react";

// Componente para conteúdo da ajuda em modal
const AjudaModalContent = () => {
  return <Ajuda />;
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

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { openModal } = useModal();
  const { user, logout, isAuthenticated } = useAuth0();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Log para depuração
    console.log("MainLayout - Estado do usuário Auth0:", user);
    console.log("MainLayout - Autenticado Auth0:", isAuthenticated);
    
    // Verificar tamanho da tela e colapsar automaticamente em telas pequenas
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    // Inicializar com base na largura atual
    handleResize();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', handleResize);
    
    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [user, isAuthenticated, sidebarCollapsed]);

  // Função para obter iniciais do nome
  const getInitials = (name: string = '') => {
    if (!name) return 'NE';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Função para verificar se o link atual está ativo
  const isActive = (path: string) => {
    const activeClass = "bg-green-900/30 text-green-400 font-medium";
    const inactiveClass = "text-white hover:bg-green-900/20 hover:text-green-400";
    return currentPath === path ? activeClass : inactiveClass;
  };

  // Função para obter a URL da imagem do usuário
  const getUserAvatarUrl = () => {
    console.log("Dados do usuário para avatar:", user);
    // Verificar todas as possíveis fontes de avatar
    if (user?.picture) return user.picture;
    if (user?.avatar) return user.avatar;
    if (user?.photo) return user.photo;
    if (user?.['https://vidashield.app/picture']) return user?.['https://vidashield.app/picture'];
    return undefined;
  };

  // Função para obter o nome do usuário ou um valor padrão
  const getUserName = () => {
    return user?.name || "Usuário";
  };

  // Função para obter o cargo/função do usuário
  const getUserRole = (): {name: string; colorClass: string; icon: React.ReactNode} => {
    if (!user) return {name: 'Usuário', colorClass: 'text-zinc-300', icon: <UserCheck size={14} />};
    
    // Verificar todas as possíveis fontes de cargo/função
    const role = user['https://vidashield.app/role'] || 
                user.role || 
                (user.roles && user.roles[0]) ||
                (user['http://vidashield/roles'] && user['http://vidashield/roles'][0]);
    
    // Se encontrou algum role, formatar para exibição
    if (role) {
      // Converter para minúsculo e depois capitalizar primeira letra
      const formattedRole = typeof role === 'string' 
        ? role.toLowerCase().replace(/^\w/, c => c.toUpperCase())
        : 'usuario';
      
      // Traduzir roles comuns para português e definir cores e ícones
      const roleInfo: Record<string, {name: string; colorClass: string; icon: React.ReactNode}> = {
        'admin': {
          name: 'Administrador', 
          colorClass: 'text-green-400 bg-green-500/20',
          icon: <ShieldCheck size={14} className="mr-1" />
        },
        'administrator': {
          name: 'Administrador', 
          colorClass: 'text-green-400 bg-green-500/20',
          icon: <ShieldCheck size={14} className="mr-1" />
        },
        'manager': {
          name: 'Gerente', 
          colorClass: 'text-blue-400 bg-blue-500/20',
          icon: <UserCog size={14} className="mr-1" />
        },
        'user': {
          name: 'Usuário', 
          colorClass: 'text-zinc-300 bg-zinc-500/20',
          icon: <UserCheck size={14} className="mr-1" />
        },
        'usuario': {
          name: 'Usuário', 
          colorClass: 'text-zinc-300 bg-zinc-500/20',
          icon: <UserCheck size={14} className="mr-1" />
        },
        'security': {
          name: 'Segurança', 
          colorClass: 'text-yellow-400 bg-yellow-500/20',
          icon: <ShieldAlert size={14} className="mr-1" />
        },
        'staff': {
          name: 'Funcionário', 
          colorClass: 'text-indigo-400 bg-indigo-500/20',
          icon: <Building2 size={14} className="mr-1" />
        },
        'doctor': {
          name: 'Médico', 
          colorClass: 'text-purple-400 bg-purple-500/20',
          icon: <Stethoscope size={14} className="mr-1" />
        },
        'nurse': {
          name: 'Enfermeiro', 
          colorClass: 'text-cyan-400 bg-cyan-500/20',
          icon: <HeartPulse size={14} className="mr-1" />
        },
        'receptionist': {
          name: 'Recepcionista', 
          colorClass: 'text-pink-400 bg-pink-500/20',
          icon: <UserPlus size={14} className="mr-1" />
        },
        'guest': {
          name: 'Convidado', 
          colorClass: 'text-orange-400 bg-orange-500/20',
          icon: <User size={14} className="mr-1" />
        }
      };
      
      return roleInfo[formattedRole.toLowerCase()] || {
        name: formattedRole,
        colorClass: 'text-cyan-400 bg-cyan-500/20',
        icon: <UserCheck size={14} className="mr-1" />
      };
    }
    
    // Default para ambiente de desenvolvimento
    if (import.meta.env.DEV) {
      return {
        name: 'Administrador', 
        colorClass: 'text-green-400 bg-green-500/20',
        icon: <ShieldCheck size={14} className="mr-1" />
      }; // Para testes
    }
    
    return {
      name: 'Usuário', 
      colorClass: 'text-zinc-300 bg-zinc-500/20',
      icon: <UserCheck size={14} className="mr-1" />
    };
  };

  // Função para abrir modal de ajuda
  const handleOpenAjuda = () => {
    openModal("Central de Ajuda", <AjudaModalContent />, "xl");
  };

  // Função para abrir modal de notificações
  const handleOpenNotificacoes = () => {
    openModal("Notificações", <NotificacoesModalContent />, "md");
  };

  // Função para alternar o estado da sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen h-screen bg-zinc-900 text-white overflow-x-hidden">
      {/* Sidebar - ajustada para não sobrepor o header */}
      <aside 
        className={`sidebar ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-zinc-800 flex flex-col shadow-md transition-all duration-300 fixed lg:relative`}
      >
        {/* Botão de menu hambúrguer - ajustado para ficar visível na altura correta */}
        <button 
          onClick={toggleSidebar}
          className="absolute right-0 top-4 transform translate-x-1/2 bg-green-500 hover:bg-green-600 text-white p-1 rounded-full shadow-md z-10"
          aria-label={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
        >
          <Menu 
            size={14} 
            className={`sidebar-toggle transition-transform duration-300 ${sidebarCollapsed ? '' : 'open'}`} 
          />
        </button>
        
        {/* Área do Perfil do Usuário com dados do Auth0 */}
        <div className={`bg-zinc-700 p-4 flex flex-col items-center ${sidebarCollapsed ? 'py-2' : 'py-4'}`}>
          <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-20 h-20'} rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl mb-3 border-2 border-zinc-600 shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-300`}>
            {(user?.picture || getUserAvatarUrl()) ? (
              <img 
                src={getUserAvatarUrl() || user?.picture} 
                alt={user?.name || 'Usuário'} 
                className="w-full h-full rounded-full object-cover" 
                onError={(e) => {
                  console.error("Erro ao carregar imagem de perfil:", e);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Evita loop de erro
                  target.src = ""; // Remove a fonte para mostrar o fallback
                  target.style.display = "none"; // Esconde a img
                  // O parent div já tem a cor de fundo que será mostrada
                }}
              />
            ) : (
              <UserCircle className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-16 h-16'} text-white transition-all duration-300`} />
            )}
          </div>
          
          {!sidebarCollapsed && (
            <div className="text-center space-y-2 w-full">
              {/* Nome em destaque */}
              <div className="text-lg font-bold text-white truncate">
                {user?.name || "Usuário"}
              </div>
              
              {/* Cargo/função com destaque colorido */}
              <div className="rounded-md py-1">
                <span className={`text-sm font-medium ${getUserRole().colorClass} px-3 py-1 rounded-md inline-flex items-center`}>
                  {getUserRole().icon}
                  {getUserRole().name}
                </span>
              </div>
              
              {/* Email como rodapé de referência */}
              <div className="text-xs text-zinc-400 mt-1 truncate opacity-70">
                {user?.email || "email@exemplo.com"}
              </div>
              
              <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 mt-3 border-t border-zinc-600 pt-3 w-full">
                <ClockIcon className="w-3 h-3 text-zinc-500" /> 
                <span>Último acesso: {new Date().toLocaleString('pt-BR')}</span>
              </div>
              
              {/* Botão de Logout */}
              <button 
                onClick={() => logout({
                  logoutParams: {
                    returnTo: window.location.origin + '/login'
                  }
                })}
                className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-sm bg-zinc-800 hover:bg-red-700 text-zinc-300 hover:text-white transition-all duration-200 border border-zinc-600 hover:border-red-600"
              >
                <LogOut className="w-4 h-4" /> 
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto flex-1 p-2">
          <div className={`text-xs text-zinc-500 mb-2 px-2 ${sidebarCollapsed ? 'text-center' : ''}`}>
            {!sidebarCollapsed && "MENU PRINCIPAL"}
          </div>
          <nav className="space-y-1 text-sm">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/dashboard")}`}
              title="Dashboard"
            >
              <Dashboard className="w-4 h-4" /> 
              {!sidebarCollapsed && "Dashboard"}
            </Link>
            <Link 
              to="/estatisticas" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/estatisticas")}`}
              title="Estatísticas"
            >
              <Stats className="w-4 h-4" /> 
              {!sidebarCollapsed && "Estatísticas"}
            </Link>
            <Link 
              to="/usuarios" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/usuarios")}`}
              title="Usuários"
            >
              <Users className="w-4 h-4" /> 
              {!sidebarCollapsed && "Usuários"}
            </Link>
            <Link 
              to="/logs" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/logs")}`}
              title="Logs de Acesso"
            >
              <Logs className="w-4 h-4" /> 
              {!sidebarCollapsed && "Logs de Acesso"}
            </Link>
            <Link 
              to="/alertas" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/alertas")}`}
              title="Alertas"
            >
              <Alerts className="w-4 h-4" /> 
              {!sidebarCollapsed && "Alertas"}
            </Link>
            <Link 
              to="/relatorios" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/relatorios")}`}
              title="Relatórios"
            >
              <Reports className="w-4 h-4" /> 
              {!sidebarCollapsed && "Relatórios"}
            </Link>
            <Link 
              to="/exportacoes" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/exportacoes")}`}
              title="Exportações"
            >
              <Exports className="w-4 h-4" /> 
              {!sidebarCollapsed && "Exportações"}
            </Link>
          </nav>
          
          <div className={`text-xs text-zinc-500 mt-6 mb-2 px-2 ${sidebarCollapsed ? 'text-center' : ''}`}>
            {!sidebarCollapsed && "CONFIGURAÇÕES"}
          </div>
          <nav className="space-y-1 text-sm">
            <Link 
              to="/configuracoes" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/configuracoes")}`}
              title="Configurações"
            >
              <Settings className="w-4 h-4" /> 
              {!sidebarCollapsed && "Configurações"}
            </Link>
            <Link 
              to="/documentacao" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/documentacao")}`}
              title="Documentação"
            >
              <Docs className="w-4 h-4" /> 
              {!sidebarCollapsed && "Documentação"}
            </Link>
            <Link 
              to="/ajuda" 
              className={`flex items-center gap-2 py-2 ${sidebarCollapsed ? 'justify-center' : 'px-3'} rounded transition-colors ${isActive("/ajuda")}`}
              title="Ajuda"
            >
              <Help className="w-4 h-4" /> 
              {!sidebarCollapsed && "Ajuda"}
            </Link>
          </nav>
        </div>
        
        {/* Logo no rodapé */}
        <div className={`p-4 border-t border-zinc-700 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {sidebarCollapsed ? (
            <div className="flex items-center justify-center">
              <Version className="w-4 h-4 text-zinc-500" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <img 
                src={logo} 
                alt="Logo VidaShield" 
                className="w-full max-w-[120px]" 
              />
              <div className="text-xs text-zinc-500 ml-2 flex items-center">
                <Version className="w-3 h-3 mr-1" /> v2.0
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay para telas menores quando o menu está aberto */}
      {!sidebarCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 mt-[60px]" /* Ajustado para começar abaixo do header */
          onClick={toggleSidebar}
          aria-label="Fechar menu"
        ></div>
      )}

      {/* Área principal - margin-top removida pois o header tem posição sticky */}
      <div className={`main-content flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-0 lg:ml-64'}`}>
        <Header toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        
        <main className="flex-1 p-4 overflow-y-auto overflow-x-hidden max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
