import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Shield,
  Activity,
  LogOut,
  AlertTriangle,
  FileText,
  Users,
  Settings,
  User,
  HelpCircle,
  BarChart3,
  Target,
  Zap,
  Database,
  Lock,
  Ban,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserProfile } from '../../hooks/useUserProfile'

interface PremiumSidebarProps {
  collapsed?: boolean
  className?: string
}

const PremiumSidebar: React.FC<PremiumSidebarProps> = ({ 
  collapsed = false, 
  className = '' 
}) => {
  const { signOut } = useAuth()
  const { profile } = useUserProfile()
  const location = useLocation()

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

  const menuSections = [
    {
      title: 'Principal',
      items: [
        {
          icon: Home,
          label: 'Dashboard',
          href: '/dashboard',
          color: 'text-green-400',
          description: 'Visão geral do sistema',
          requiredRole: 'user'
        },
        {
          icon: Target,
          label: 'Segurança Avançada',
          href: '/security',
          color: 'text-green-400',
          description: 'Monitoramento avançado',
          badge: 'PRO',
          requiredRole: 'moderator'
        }
      ]
    },
    {
      title: 'Monitoramento',
      items: [
        {
          icon: AlertTriangle,
          label: 'Alertas de Segurança',
          href: '/alertas',
          color: 'text-yellow-400',
          description: 'Ameaças ativas',
          requiredRole: 'user'
        },
        {
          icon: Shield,
          label: 'Ameaças Detectadas',
          href: '/threats',
          color: 'text-red-400',
          description: 'Histórico de ameaças',
          requiredRole: 'user'
        },
        {
          icon: Activity,
          label: 'Logs de Autenticação',
          href: '/logs',
          color: 'text-blue-400',
          description: 'Registro de acessos',
          requiredRole: 'moderator'
        },
        {
          icon: Ban,
          label: 'IPs Bloqueados',
          href: '/blocked-ips',
          color: 'text-orange-400',
          description: 'Gerenciar IPs bloqueados',
          requiredRole: 'user'
        }
      ]
    },
    {
      title: 'Gerenciamento',
      items: [
        {
          icon: Users,
          label: 'Gerenciamento de Usuários',
          href: '/usuarios',
          color: 'text-purple-400',
          description: 'Gestão de usuários',
          requiredRole: 'admin'
        },
        {
          icon: UserCheck,
          label: 'Aprovação de Usuários',
          href: '/aprovacao-usuarios',
          color: 'text-indigo-400',
          description: 'Aprovar novos usuários',
          requiredRole: 'admin'
        },
        {
          icon: Database,
          label: 'Backups',
          href: '/backups',
          color: 'text-indigo-400',
          description: 'Backup e recuperação',
          requiredRole: 'admin'
        },
        {
          icon: Lock,
          label: 'Controle de Acesso',
          href: '/access-control',
          color: 'text-orange-400',
          description: 'Permissões e roles',
          requiredRole: 'admin'
        }
      ]
    },
    {
      title: 'Análise',
      items: [
        {
          icon: BarChart3,
          label: 'Estatísticas',
          href: '/analytics',
          color: 'text-cyan-400',
          description: 'Métricas e analytics avançados',
          requiredRole: 'user'
        },
        {
          icon: FileText,
          label: 'Relatórios',
          href: '/reports',
          color: 'text-orange-400',
          description: 'Relatórios detalhados',
          requiredRole: 'user'
        }
      ]
    }
  ]

  const bottomItems = [
    {
      icon: Settings,
      label: 'Configurações',
      href: '/configuracoes',
      color: 'text-zinc-400',
      description: 'Configurações do sistema',
      requiredRole: 'admin'
    },
    {
      icon: User,
      label: 'Perfil',
      href: '/perfil',
      color: 'text-indigo-400',
      description: 'Minha conta',
      requiredRole: 'user'
    },
    {
      icon: HelpCircle,
      label: 'Ajuda',
      href: '/ajuda',
      color: 'text-zinc-400',
      description: 'Suporte e documentação',
      requiredRole: 'user'
    }
  ]

  // Filtrar itens baseado no role do usuário
  const filteredMenuSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const userLevel = getUserRoleLevel();
      const requiredLevel = roleHierarchy[item.requiredRole as keyof typeof roleHierarchy];
      return userLevel >= requiredLevel;
    })
  })).filter(section => section.items.length > 0); // Remove seções vazias

  const filteredBottomItems = bottomItems.filter(item => {
    const userLevel = getUserRoleLevel();
    const requiredLevel = roleHierarchy[item.requiredRole as keyof typeof roleHierarchy];
    return userLevel >= requiredLevel;
  });

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

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const isActive = (href: string) => location.pathname === href

  const renderMenuItem = (item: any, isBottomItem = false) => {
    const active = isActive(item.href)
    
    return (
      <Link
        key={item.href}
        to={item.href}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          active
            ? 'bg-green-500/20 text-white shadow-lg shadow-green-500/10'
            : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white'
        }`}
        title={collapsed ? item.label : ''}
      >
        {/* Indicador de ativo */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-full" />
        )}

        {/* Ícone */}
        <div className="flex-shrink-0">
          <item.icon className={`w-5 h-5 ${
            active ? 'text-green-400' : item.color
          } transition-colors duration-200`} />
        </div>

        {/* Conteúdo do item */}
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {item.description}
                </p>
              )}
            </div>

            {/* Indicador de ativo (ponto) */}
            {active && (
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full" />
            )}
          </>
        )}

        {/* Tooltip para modo colapsado */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.label}
            {item.badge && (
              <span className="ml-1 text-green-400">({item.badge})</span>
            )}
          </div>
        )}
      </Link>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-zinc-900/95 backdrop-blur-xl ${className}`}>
      {/* Header */}
      <div className="p-6">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <Zap className="absolute -top-1 -right-1 w-4 h-4 text-green-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">VidaShield</h2>
              <p className="text-xs text-zinc-400">Security Suite</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* User Profile */}
      {!collapsed && profile && (
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 font-bold">
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
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
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

      {/* Menu Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-6">
          {filteredMenuSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => renderMenuItem(item))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Items */}
      <div className="p-4 space-y-1">
        {filteredBottomItems.length > 0 && (
          <>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-3">
                Sistema
              </h3>
            )}
            {filteredBottomItems.map((item) => renderMenuItem(item, true))}
          </>
        )}
        
        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 hover:text-white hover:bg-red-500/10 transition-all duration-200"
          title={collapsed ? 'Sair' : ''}
        >
          <LogOut className="w-5 h-5 text-red-400" />
          {!collapsed && (
            <span className="font-medium text-sm">Sair</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default PremiumSidebar 