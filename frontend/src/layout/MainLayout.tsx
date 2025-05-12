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
  ScreenShare as Sistema,
  CreditCard as Contas,
  Database as Dados
} from "lucide-react";
import logo from "../assets/images/logo.png";
import { useModal } from "../contexts/ModalContext";
import { Ajuda } from "../pages/Ajuda";
import { useState } from "react";

// Componente para conteúdo da ajuda em modal
const AjudaModalContent = () => {
  return <Ajuda modalView={true} />;
};

// Componente para conteúdo do modal de notificações
const NotificacoesModalContent = () => {
  return (
    <div className="py-2">
      <div className="mb-4 pb-2 border-b border-zinc-700">
        <h3 className="text-green-300 text-sm font-medium mb-3">Notificações recentes</h3>
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

  // Dados mockados do usuário (seriam obtidos de um contexto de autenticação)
  const userInfo = {
    name: "Nome Exemplo",
    role: "Administrador",
    lastLogin: "08/05/2025, 20:10",
    photoUrl: null, // Se for null, mostra as iniciais
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
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

  // Função para abrir modal de ajuda
  const handleOpenAjuda = () => {
    openModal("Central de Ajuda", <AjudaModalContent />, "xl");
  };

  // Função para abrir modal de notificações
  const handleOpenNotificacoes = () => {
    openModal("Notificações", <NotificacoesModalContent />, "md");
  };

  return (
    <div className="flex min-h-screen bg-zinc-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-800 p-0 hidden md:flex flex-col shadow-md">
        {/* Área do Perfil do Usuário - Redesenhada e Expandida */}
        <div className="bg-zinc-700/50 p-4 border-b border-zinc-600/30">
          <div className="flex flex-col items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400/20 to-green-400/5 
                            border-2 border-green-400/40 shadow-[0_0_15px_rgba(74,222,128,0.2)] 
                            flex items-center justify-center text-green-400 font-bold text-xl
                            mb-2">
              {userInfo.photoUrl ? (
                <img 
                  src={userInfo.photoUrl} 
                  alt={userInfo.name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                getInitials(userInfo.name)
              )}
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-white">{userInfo.name}</div>
              <div className="mt-1">
                <span className="bg-green-400/20 text-green-400 px-2 py-0.5 rounded text-xs">
                  {userInfo.role}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 mt-1">
            <ClockIcon className="w-3 h-3 text-zinc-500" /> 
            <span>Último acesso: {userInfo.lastLogin}</span>
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
        <header className="bg-zinc-800 p-4 shadow flex justify-between items-center">
          <h1 className="text-xl font-semibold">Painel da Clínica</h1>
          
          <div className="flex items-center gap-4">
            {/* Nome institucional da clínica */}
            <div className="text-sm text-zinc-300 hidden sm:block">
              Clínica VidaMais – Palmital/PR
            </div>
            
            {/* Botões na topbar */}
            <div className="flex items-center gap-2">
              {/* Botão de notificações */}
              <button 
                onClick={handleOpenNotificacoes}
                aria-label="Notificações" 
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-green-400 transition-colors relative"
                title="Notificações"
              >
                <Notification className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
              </button>
              
              {/* Botão de ajuda */}
              <button 
                onClick={handleOpenAjuda}
                aria-label="Ajuda" 
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-green-400 transition-colors"
                title="Ajuda do sistema"
              >
                <Help className="w-4 h-4" />
              </button>
              
              {/* Botão de configurações com dropdown ao passar o mouse */}
              <div className="relative">
                <button 
                  onMouseEnter={() => setShowConfigMenu(true)}
                  aria-label="Configurações" 
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-green-400 transition-colors"
                  title="Configurações"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                {/* Menu dropdown de configurações */}
                {showConfigMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-50 overflow-hidden"
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
                          <Sistema className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <span className="text-zinc-200 font-medium block">Configurações Gerais</span>
                          <span className="text-xs text-zinc-400">Ajustes do sistema e preferências</span>
                        </div>
                      </Link>
                      
                      {/* Gestão de Usuários */}
                      <Link to="/usuarios" className="group flex items-start p-2 hover:bg-zinc-700/60 rounded-md transition-all">
                        <div className="p-1.5 bg-zinc-700/40 rounded-md mr-3 group-hover:bg-green-500/20">
                          <Contas className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <span className="text-zinc-200 font-medium block">Gestão de Usuários</span>
                          <span className="text-xs text-zinc-400">Gerenciar usuários e permissões</span>
                        </div>
                      </Link>
                      
                      {/* Relatórios */}
                      <Link to="/relatorios" className="group flex items-start p-2 hover:bg-zinc-700/60 rounded-md transition-all">
                        <div className="p-1.5 bg-zinc-700/40 rounded-md mr-3 group-hover:bg-green-500/20">
                          <Dados className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <span className="text-zinc-200 font-medium block">Relatórios</span>
                          <span className="text-xs text-zinc-400">Exportação e configuração de relatórios</span>
                        </div>
                      </Link>
                      
                      {/* Documentação */}
                      <Link to="/documentacao" className="group flex items-start p-2 hover:bg-zinc-700/60 rounded-md transition-all">
                        <div className="p-1.5 bg-zinc-700/40 rounded-md mr-3 group-hover:bg-green-500/20">
                          <Docs className="w-5 h-5 text-green-400" />
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
          </div>
        </header>

        <main className="p-6 flex-1 overflow-y-auto">
          {/* Remova o botão de ajuda que aparece no conteúdo das páginas, mantendo apenas o componente children */}
          {children}
        </main>
      </div>
    </div>
  );
};
