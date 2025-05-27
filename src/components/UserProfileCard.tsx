import React from 'react'
import { User, Crown, Shield } from 'lucide-react'
import { VidaWidget, VidaBadge, VidaEmptyState } from './ui/VidaShieldComponents'
import { useUserProfile } from '../hooks/useUserProfile'

const UserProfileCard: React.FC = () => {
  const { profile, loading, error } = useUserProfile()

  const getUserTypeConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrador',
          variant: 'critical' as const,
          icon: <Crown className="w-3 h-3" />
        }
      case 'moderator':
        return {
          label: 'Moderador',
          variant: 'warning' as const,
          icon: <Shield className="w-3 h-3" />
        }
      case 'manager':
        return {
          label: 'Gerente',
          variant: 'warning' as const,
          icon: <Shield className="w-3 h-3" />
        }
      case 'viewer':
        return {
          label: 'Visualizador',
          variant: 'info' as const,
          icon: <User className="w-3 h-3" />
        }
      default:
        return {
          label: 'Usuário',
          variant: 'success' as const,
          icon: <User className="w-3 h-3" />
        }
    }
  }

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

  const formatLastAccess = (lastSignIn: string | null) => {
    if (!lastSignIn) return 'Primeiro acesso'
    
    const date = new Date(lastSignIn)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    if (diffInHours < 48) return 'Ontem'
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  return (
    <VidaWidget
      title="Meu Perfil"
      loading={loading}
      error={error}
    >
      {!profile ? (
        <VidaEmptyState
          icon={<User />}
          title="Perfil não encontrado"
          description="Não foi possível carregar as informações do perfil"
        />
      ) : (
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-green-400/30 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/30 flex items-center justify-center">
                <span className="text-green-400 font-bold text-lg">
                  {getInitials(profile.full_name, profile.email)}
                </span>
              </div>
            )}
          </div>

          {/* Informações do usuário */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white truncate">
                {profile.full_name || 'Usuário'}
              </h3>
              <VidaBadge variant={getUserTypeConfig(profile.role).variant}>
                <div className="flex items-center gap-1">
                  {getUserTypeConfig(profile.role).icon}
                  <span>{getUserTypeConfig(profile.role).label}</span>
                </div>
              </VidaBadge>
            </div>
            
            <p className="text-sm text-zinc-400 truncate mb-2">
              {profile.email}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>
                Último acesso: {formatLastAccess(profile.last_sign_in)}
              </span>
              <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
              <span>
                Desde: {new Date(profile.created_at).toLocaleDateString('pt-BR', {
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </VidaWidget>
  )
}

export default UserProfileCard 