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
  RefreshCw as Refresh,
  Clock as ClockIcon,
  Bell as Notification,
  UserRound as UserIcon,
  LogOut,
  ScreenShare as Sistema,
  CreditCard as Contas,
  Database as Dados
} from "lucide-react";
import logo from "../assets/images/logo.png";
import { useModal } from "../contexts/ModalContext";
import { Ajuda } from "../pages/Ajuda";
import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import { useAuth } from "../contexts/AuthContext";

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

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { openModal } = useModal();
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // Log para depuração
    console.log("MainLayout - Estado do usuário:", user);
    console.log("MainLayout - Autenticado:", isAuthenticated);
  }, [user, isAuthenticated]);

  // Função para obter iniciais do nome
  const getInitials = (name: string = '') => {
    if (!name) return 'US';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Função para verificar se o link atual está ativo
  const isActive = (path: string) => {
    return currentPath === path ? "text-green-400 font-medium" : "text-zinc-400 hover:text-green-400";
  };

  // Função para obter a URL da imagem do usuário
  const getUserAvatarUrl = () => {
    // Verificar primeiro se o usuário tem photo ou avatar
    if (user?.photo) return user.photo;
    if (user?.avatar) return user.avatar;
    return undefined; // Usando undefined em vez de null para compatibilidade com o tipo string | undefined
  };

  // Função para obter o nome do usuário ou um valor padrão
  const getUserName = () => {
    return user?.name || "Usuário";
  };

  // Função para obter o papel/função do usuário
  const getUserRole = () => {
    const role = user?.role || "usuário";
    // Traduzir papéis comuns
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      manager: "Gerente",
      user: "Usuário",
      usuario: "Usuário"
    };
    return roleMap[role.toLowerCase()] || role;
  };

  // Formatar data do último acesso (se disponível)
  const formatLastAccess = () => {
    return new Date().toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Função para abrir modal de ajuda
  const handleOpenAjuda = () => {
    openModal("Central de Ajuda", <AjudaModalContent />, "xl");
  };

  // Função para abrir modal de notificações
  const handleOpenNotificacoes = () => {
    openModal("Notificações", <NotificacoesModalContent />, "md");
  };

  // Função para fazer logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-800 p-0 hidden md:flex flex-col shadow-md">
        {/* Área do Perfil do Usuário - Usando dados reais do usuário */}
        <div className="bg-zinc-700/50 p-4 border-b border-zinc-600/30">
          <div className="flex flex-col items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400/20 to-green-400/5 
                            border-2 border-green-400/40 shadow-glow-soft
                            flex items-center justify-center text-green-400 font-bold text-xl
                            mb-2">
              {getUserAvatarUrl() ? (
                <img 
                  src={getUserAvatarUrl()} 
                  alt={getUserName()} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                getInitials(getUserName())
              )}
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-white">{getUserName()}</div>
              <div className="mt-1">
                <span className="bg-green-400/20 text-green-400 px-2 py-0.5 rounded text-xs">
                  {getUserRole()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 mt-1">
            <ClockIcon className="w-3 h-3 text-zinc-500" /> 
            <span>Último acesso: {formatLastAccess()}</span>
          </div>
          
          {/* Botões de ação (logout e refresh) */}
          <div className="flex justify-center mt-3 space-x-2">
            <button 
              onClick={handleLogout}
              className="py-1.5 px-3 text-xs rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-all hover:text-green-300 hover:border-green-400/30 hover:shadow-[0_0_10px_rgba(0,255,153,0.15)] flex items-center justify-center gap-1.5"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="py-1.5 px-3 text-xs rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-all hover:text-green-300 hover:border-green-400/30 hover:shadow-[0_0_10px_rgba(0,255,153,0.15)] flex items-center justify-center"
              title="Atualizar dados"
            >
              <Refresh className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          <div className="text-xs text-zinc-500 mb-2 px-2">MENU PRINCIPAL</div>
          <nav className="space-y-1 text-sm">
            <Link to="/dashboard" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/dashboard")}`}>
              <Dashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link to="/estatisticas" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/estatisticas")}`}>
              <Stats className="w-4 h-4" /> Estatísticas
            </Link>
            <Link to="/usuarios" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/usuarios")}`}>
              <Users className="w-4 h-4" /> Usuários
            </Link>
            <Link to="/logs" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/logs")}`}>
              <Logs className="w-4 h-4" /> Logs de Acesso
            </Link>
            <Link to="/alertas" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/alertas")}`}>
              <Alerts className="w-4 h-4" /> Alertas
            </Link>
            <Link to="/relatorios" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/relatorios")}`}>
              <Reports className="w-4 h-4" /> Relatórios
            </Link>
            <Link to="/exportacoes" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/exportacoes")}`}>
              <Exports className="w-4 h-4" /> Exportações
            </Link>
          </nav>
          
          <div className="text-xs text-zinc-500 mt-6 mb-2 px-2">CONFIGURAÇÕES</div>
          <nav className="space-y-1 text-sm">
            <Link to="/configuracoes" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/configuracoes")}`}>
              <Settings className="w-4 h-4" /> Configurações
            </Link>
            <Link to="/documentacao" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/documentacao")}`}>
              <Docs className="w-4 h-4" /> Documentação
            </Link>
            <Link to="/ajuda" className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${isActive("/ajuda")}`}>
              <Help className="w-4 h-4" /> Ajuda
            </Link>
          </nav>
        </div>
        
        {/* Logo movida para o rodapé */}
        <div className="p-4 border-t border-zinc-700/30">
          <div className="flex flex-col items-center justify-center">
            <img 
              src={logo} 
              alt="Logo VidaShield" 
              className="w-full max-w-[120px] opacity-80 hover:opacity-100 transition-opacity" 
              title="VidaShield - Segurança para Clínicas" 
            />
            <div className="text-xs text-zinc-500 mt-2 flex items-center justify-center gap-1">
              <Version className="w-3 h-3" /> v2.0
            </div>
          </div>
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        <main className="flex-1 p-0 md:p-2 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
