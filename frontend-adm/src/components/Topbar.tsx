import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  HelpCircle,
  Settings,
  ScreenShare as Sistema,
  CreditCard as Contas,
  Database as Dados,
  BookOpen as Docs,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useModal } from '../contexts/ModalContext';
import { Ajuda } from '../pages/Ajuda';
import "../styles/vidashield.css";
import { useAuth } from '../contexts/AuthContext.jsx';
import logo from "../assets/images/logo.png";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Função para abrir modal de ajuda
  const handleOpenAjuda = () => {
    openModal("Central de Ajuda", <AjudaModalContent />, "xl");
  };

  // Função para abrir modal de notificações
  const handleOpenNotificacoes = () => {
    openModal("Notificações", <NotificacoesModalContent />, "md");
  };
  
  // Função para navegar para a página de perfil
  const goToProfile = () => {
    navigate('/user-profile');
    setShowUserMenu(false);
  };
  
  // Função para confirmar logout
  const handleLogout = () => {
    openModal('Confirmar Logout', (
      <div className="p-4 text-center">
        <h3 className="text-lg font-medium text-green-300 mb-2">Deseja realmente sair?</h3>
        <p className="text-zinc-400 mb-4">Você será desconectado do sistema.</p>
        
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => {
              logout({
                logoutParams: {
                  returnTo: window.location.origin + '/login'
                }
              });
              // Redireciona depois do logout para garantir
              setTimeout(() => window.location.href = '/', 100);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Sim, sair
          </button>
          <button 
            onClick={() => setShowUserMenu(false)}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Não, continuar
          </button>
        </div>
      </div>
    ), 'sm');
  };
  
  // Obter iniciais do nome para avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    
    return user.name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  return (
    <div className="topbar py-3 px-4 flex items-center justify-between bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 shadow-md">
      {/* Lado esquerdo vazio para balanço */}
      <div className="w-32"></div>
      
      {/* Logo centralizado */}
      <div className="flex-1 flex justify-center items-center">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src={logo} 
            alt="VidaShield" 
            className="h-16 md:h-20 object-contain filter drop-shadow-[0_0_8px_rgba(0,255,153,0.7)]" 
          />
        </Link>
      </div>
      
      {/* Controles do usuário */}
      <div className="flex items-center gap-2">
        {/* Menu do usuário */}
        <div className="relative mr-1">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            onBlur={() => setTimeout(() => setShowUserMenu(false), 100)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name || 'Usuário'} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                getUserInitials()
              )}
            </div>
            <span className="hidden md:inline text-zinc-300 text-sm truncate max-w-[100px]">
              {user?.name || 'Usuário'}
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-50 overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              <div className="p-3 border-b border-zinc-700">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-zinc-400 truncate">{user?.email || 'usuario@exemplo.com'}</p>
              </div>
              <div className="p-2">
                <button 
                  onClick={goToProfile}
                  className="w-full flex items-center space-x-2 p-2 text-left text-zinc-300 hover:bg-zinc-700 hover:text-green-300 rounded-md transition-colors"
                >
                  <User size={16} />
                  <span>Meu Perfil</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 p-2 text-left text-zinc-300 hover:bg-zinc-700 hover:text-red-400 rounded-md transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      
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
    </div>
  );
};

export default Topbar; 