import React, { useState, useRef, useEffect } from 'react'
import { Shield, Search, Settings, LogOut, User, Command } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'
import QuickSettingsPopover from './QuickSettingsPopover'
import GlobalSearch from './GlobalSearch'
import { useUserProfile } from '../../hooks/useUserProfile'

interface PremiumHeaderProps {
  title?: string
  showSearch?: boolean
  onSearch?: (query: string) => void
  className?: string
}

const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  title = 'VidaShield Security',
  showSearch = true,
  onSearch,
  className = ''
}) => {
  const { profile, loading } = useUserProfile()
  const [showQuickSettings, setShowQuickSettings] = useState(false)
  const [showGlobalSearch, setShowGlobalSearch] = useState(false)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)

  // Atalho Cmd+K / Ctrl+K para abrir busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowGlobalSearch(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getUserTypeLabel = (role?: 'admin' | 'user' | 'manager' | 'moderator' | 'viewer') => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'manager': return 'Gerente'
      case 'moderator': return 'Moderador'
      case 'viewer': return 'Visualizador'
      case 'user': return 'Usuário'
      default: return 'Usuário'
    }
  }

  return (
    <header className={`flex items-center justify-between ${className}`}>
      {/* Left Section - Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-8 h-8 text-green-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-xs text-zinc-400">Sistema de Segurança Avançada</p>
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-8">
          <button
            onClick={() => setShowGlobalSearch(true)}
            className="w-full flex items-center gap-3 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/70 rounded-lg text-zinc-400 hover:text-zinc-300 transition-all duration-200 group"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Buscar páginas, usuários, configurações...</span>
            <div className="flex items-center gap-1 text-xs bg-zinc-700 px-2 py-1 rounded border border-zinc-600">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>
      )}

      {/* Right Section - User Info & Notifications */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationCenter />

        {/* Settings */}
        <div className="relative">
          <button
            ref={settingsButtonRef}
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className={`p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 transition-all duration-200 group cursor-pointer ${
              showQuickSettings ? 'bg-zinc-700' : ''
            }`}
            title="Configurações Rápidas"
          >
            <Settings className={`w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-all duration-300 ${
              showQuickSettings ? 'text-green-400 rotate-90' : 'group-hover:rotate-90'
            }`} />
          </button>
          
          <QuickSettingsPopover
            isOpen={showQuickSettings}
            onClose={() => setShowQuickSettings(false)}
            triggerRef={settingsButtonRef}
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
              <div className="space-y-1">
                <div className="w-20 h-3 bg-zinc-700 rounded animate-pulse" />
                <div className="w-16 h-2 bg-zinc-700 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              {/* Avatar */}
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">
                      {getInitials(profile?.full_name, profile?.email)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
              </div>

              {/* User Info */}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {profile?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-zinc-400">
                  {getUserTypeLabel(profile?.role)}
                </p>
              </div>

              {/* User Menu */}
                             <div className="relative group">
                 <button 
                   className="p-1 rounded-lg hover:bg-zinc-700 transition-colors"
                   title="Menu do usuário"
                 >
                   <User className="w-4 h-4 text-zinc-400" />
                 </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3">
                    <p className="text-sm font-medium text-white">
                      {profile?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-zinc-400">{profile?.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link to="/perfil" className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>
                    <Link to="/configuracoes" className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configurações
                    </Link>
                    <div className="my-2" />
                    <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
    </header>
  )
}

export default PremiumHeader 