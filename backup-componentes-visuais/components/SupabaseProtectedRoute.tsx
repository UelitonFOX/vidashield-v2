import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

interface SupabaseProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
}

const SupabaseProtectedRoute = ({ children, requiredRole }: SupabaseProtectedRouteProps) => {
  const { isAuthenticated, isLoading, userProfile, user } = useSupabaseAuth()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuthorization = () => {
      // Se não está autenticado, não autorizado
      if (!isAuthenticated || !user) {
        setIsAuthorized(false)
        return
      }

      // Se não há verificação de perfil sendo exigida, autorizado
      if (!requiredRole) {
        setIsAuthorized(true)
        return
      }

      // Verificar se o usuário tem o papel necessário
      if (userProfile) {
        const hasRequiredRole = userProfile.role === requiredRole || userProfile.role === 'admin'
        const isActive = userProfile.is_active !== false // Por padrão, true se não especificado
        
        setIsAuthorized(hasRequiredRole && isActive)
      } else {
        // Se não há perfil carregado, assumir autorizado por enquanto
        setIsAuthorized(true)
      }
    }

    if (!isLoading) {
      checkAuthorization()
    }
  }, [isAuthenticated, isLoading, userProfile, user, requiredRole])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-zinc-300">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated || !isAuthorized) {
    console.log('SupabaseProtectedRoute - Redirecionando para login')
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Se há verificação de papel e usuário não tem permissão
  if (requiredRole && userProfile && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-900 p-8">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Acesso negado</h1>
          <p className="text-zinc-300 mb-6">
            Você não tem permissão para acessar esta página.
            {userProfile.is_active === false && (
              <span className="block mt-2 text-red-400">Sua conta está inativa.</span>
            )}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  // Se passou por todas as verificações, mostrar conteúdo
  return <>{children}</>
}

export default SupabaseProtectedRoute 