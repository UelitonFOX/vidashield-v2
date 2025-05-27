import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Shield, 
  Activity, 
  LogOut, 
  X,
  AlertTriangle,
  FileText,
  Users,
  Settings,
  User,
  HelpCircle,
  BarChart3,
  Target,
  UserCheck,
  Lock,
  Database
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

interface SidebarProps {
  collapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, isMobile, onClose }) => {
  const { signOut } = useAuth();
  const { profile } = useUserProfile();
  const location = useLocation();

  // Hierarquia de roles (0 = menor permissão, 3 = maior permissão)
  const roleHierarchy = {
    viewer: 0,
    user: 1,
    moderator: 2,
    admin: 3
  };

  const getUserRoleLevel = () => {
    if (!profile?.role) return 0;
    return roleHierarchy[profile.role as keyof typeof roleHierarchy] || 0;
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
      color: 'text-green-400',
      requiredRole: 'user' // Qualquer usuário logado
    },
    {
      icon: AlertTriangle,
      label: 'Alertas de Segurança',
      href: '/alertas',
      color: 'text-yellow-400',
      requiredRole: 'user'
    },
    {
      icon: Target,
      label: 'Segurança Avançada',
      href: '/security',
      color: 'text-green-400',
      requiredRole: 'moderator'
    },
    {
      icon: Activity,
      label: 'Logs de Autenticação',
      href: '/logs',
      color: 'text-blue-400',
      requiredRole: 'moderator'
    },
    {
      icon: Shield,
      label: 'Ameaças Detectadas',
      href: '/threats',
      color: 'text-red-400',
      requiredRole: 'user'
    },
    {
      icon: Users,
      label: 'Gerenciamento de Usuários',
      href: '/usuarios',
      color: 'text-purple-400',
      requiredRole: 'admin'
    },
    {
      icon: UserCheck,
      label: 'Aprovação de Usuários',
      href: '/aprovacao-usuarios',
      color: 'text-indigo-400',
      requiredRole: 'admin'
    },
    {
      icon: Database,
      label: 'Sistema de Backup',
      href: '/backups',
      color: 'text-blue-400',
      requiredRole: 'admin'
    },
    {
      icon: Lock,
      label: 'Controle de Acesso',
      href: '/access-control',
      color: 'text-cyan-400',
      requiredRole: 'admin'
    },
    {
      icon: BarChart3,
      label: 'Estatísticas',
      href: '/analytics',
      color: 'text-cyan-400',
      requiredRole: 'user'
    },
    {
      icon: FileText,
      label: 'Relatórios',
      href: '/reports',
      color: 'text-orange-400',
      requiredRole: 'user'
    },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/configuracoes',
      color: 'text-zinc-400',
      requiredRole: 'admin'
    },
    {
      icon: User,
      label: 'Perfil',
      href: '/perfil',
      color: 'text-indigo-400',
      requiredRole: 'user'
    },
    {
      icon: HelpCircle,
      label: 'Ajuda',
      href: '/ajuda',
      color: 'text-zinc-400',
      requiredRole: 'user'
    }
  ];

  // Filtrar itens baseado no role do usuário
  const filteredMenuItems = menuItems.filter(item => {
    const userLevel = getUserRoleLevel();
    const requiredLevel = roleHierarchy[item.requiredRole as keyof typeof roleHierarchy];
    return userLevel >= requiredLevel;
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <aside 
      className={`
        fixed left-0 z-40
        ${collapsed ? 'w-16' : 'w-64'} 
        bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-700/50 
        transition-all duration-200 ease-in-out overflow-hidden
        ${isMobile && !collapsed ? 'h-screen top-0 shadow-xl shadow-green-400/10' : 'h-[calc(100vh-4rem)] top-16'}
      `}
    >
      {/* Mobile overlay quando expandida */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className="flex flex-col h-full relative z-50">
        {/* Header da Sidebar */}
        {!collapsed ? (
          <div className="p-4 border-b border-zinc-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-md flex items-center justify-center shadow-md shadow-green-400/30">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-green-400">VidaShield</h2>
                  <p className="text-xs text-zinc-400">Sistema de Segurança para Clínicas</p>
                </div>
              </div>
              {isMobile && (
                <button 
                  onClick={onClose}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Fechar menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Header compacto quando colapsada */
          <div className="p-3 border-b border-zinc-700/50 flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-md flex items-center justify-center shadow-md shadow-green-400/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Perfil do Usuário */}
        {!collapsed && profile && (
          <div className="p-4 border-b border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-semibold text-xs">
                      {getInitials(profile.full_name, profile.email)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {profile.full_name || profile.email.split('@')[0]}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <p className="text-xs text-green-400 font-medium">
                    {profile.role === 'admin' ? 'Administrador' : 
                     profile.role === 'moderator' ? 'Moderador' : 
                     profile.role === 'manager' ? 'Gerente' : 
                     profile.role === 'viewer' ? 'Visualizador' : 'Usuário'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-3">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
                MENU PRINCIPAL
              </h3>
            )}
            <nav className="space-y-1">
              {filteredMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={index}
                    to={item.href}
                    className={`
                      flex items-center rounded-lg text-sm transition-all duration-200 group relative
                      ${collapsed ? 'p-3 justify-center' : 'gap-3 px-3 py-2'}
                      ${isActive 
                        ? 'bg-green-500/20 text-green-300 shadow-sm shadow-green-400/20' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                      }
                    `}
                    onClick={isMobile && !collapsed ? onClose : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon 
                      className={`w-4 h-4 transition-all duration-200 ${
                        isActive 
                          ? 'text-green-400' 
                          : `${item.color} group-hover:scale-110`
                      }`} 
                    />
                    {!collapsed && (
                      <>
                        <span className={`font-medium ${isActive ? 'text-green-300' : ''}`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        )}
                      </>
                    )}
                    
                    {/* Indicador de página ativa quando colapsada */}
                    {collapsed && isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer - Logout */}
        <div className="p-3 border-t border-zinc-700/50">
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group
              ${collapsed ? 'p-3 justify-center' : 'gap-3 px-3 py-2'}
            `}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 