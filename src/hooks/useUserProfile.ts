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
          throw new Error('Usuário não encontrado')
        }

        setUser(currentUser)

        // Buscar perfil do usuário na tabela profiles (se existir)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        // Se não encontrar perfil na tabela, usar dados do auth
        const avatarUrl = profileData?.avatar_url || 
                         currentUser.user_metadata?.avatar_url || 
                         currentUser.user_metadata?.picture || 
                         null

        const userProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: profileData?.full_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
          avatar_url: avatarUrl,
          role: profileData?.role || 'user',
          status: profileData?.status || 'active',
          created_at: currentUser.created_at,
          last_sign_in: currentUser.last_sign_in_at || null
        }

        // Se há avatar do OAuth mas não está salvo no profile, salvar
        if (avatarUrl && !profileData?.avatar_url) {
          await supabase
            .from('profiles')
            .upsert({
              id: currentUser.id,
              email: currentUser.email,
              full_name: userProfile.full_name,
              avatar_url: avatarUrl,
              role: userProfile.role,
              status: userProfile.status,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            })
        }

        // Se não tiver localização no perfil, tentar detectar automaticamente (apenas uma vez)
        if (!profileData?.location && navigator.geolocation && !localStorage.getItem('geolocation_attempted')) {
          localStorage.setItem('geolocation_attempted', 'true');
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Usar API de geocoding reverso para detectar cidade
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=pt`
                );
                const data = await response.json();
                const cidade = `${data.city}, ${data.principalSubdivision}`;
                
                // Atualizar no banco de dados
                await supabase
                  .from('profiles')
                  .upsert({
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: userProfile.full_name,
                    avatar_url: userProfile.avatar_url,
                    role: userProfile.role,
                    location: cidade,
                    updated_at: new Date().toISOString()
                  });
                
                console.log(`Localização detectada: ${cidade}`);
              } catch (error) {
                console.log('Erro ao detectar localização:', error);
              }
            },
            (error) => {
              console.log('Geolocalização negada pelo usuário:', error);
            }
          );
        }

        setProfile(userProfile)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
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