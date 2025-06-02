import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { User, AuthChangeEvent } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'user' | 'manager' | 'moderator' | 'viewer'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  created_at: string
  last_sign_in: string | null
}

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        
        // Buscar usuário atual
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          throw userError
        }

        if (!currentUser) {
          setUser(null)
          setProfile(null)
          setError(null)
          return
        }

        setUser(currentUser)

        // 🚨 CORREÇÃO: Buscar perfil do usuário na tabela user_profiles (NÃO profiles)
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        // 🚨 SEGURANÇA: Se NÃO há profile na tabela, retornar NULL
        // Isso forçará o redirecionamento para solicitar acesso
        if (profileError || !profileData) {
          // Se é erro RLS (406), é normal - usuário não aprovado ainda
          if (profileError?.code === 'PGRST116' || profileError?.message?.includes('406') || profileError?.message?.includes('Not Acceptable')) {
            console.log('🔒 RLS bloqueou busca de perfil - usuário não aprovado:', currentUser.email)
          } else {
            console.log('👤 Usuário autenticado mas SEM profile aprovado:', currentUser.email)
          }
          setProfile(null)
          setError(null)
          return
        }

        // Se há profile aprovado na tabela, usar esses dados
        const userProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.name || profileData.full_name || null,
          avatar_url: profileData.avatar_url || currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null,
          role: profileData.role,
          status: profileData.status,
          created_at: profileData.created_at || currentUser.created_at,
          last_sign_in: currentUser.last_sign_in_at || null
        }

        console.log('✅ Profile aprovado encontrado:', userProfile.email, 'Role:', userProfile.role)
        setProfile(userProfile)
        setError(null)
        
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserProfile()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    loading,
    error
  }
} 