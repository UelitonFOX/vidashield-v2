import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ useAuth: Erro ao obter sessão:', error)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err) => {
      console.error('❌ useAuth: Erro inesperado ao obter sessão:', err)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Só logar eventos importantes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('🔄 useAuth:', event)
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string, captchaToken?: string) => {
    console.log('🔑 useAuth: Tentando login com email/senha...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined
    })
    
    if (error) {
      console.error('❌ useAuth: Erro no login:', error)
      throw error
    }
    console.log('✅ useAuth: Login com email/senha bem-sucedido')
    return data
  }

  const signInWithGoogle = async () => {
    console.log('🔑 useAuth: Tentando login com Google...')
    console.log('🌐 useAuth: Current origin:', window.location.origin)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    
    if (error) {
      console.error('❌ useAuth: Erro no login Google:', error)
      console.error('❌ useAuth: Error details:', {
        message: error.message,
        status: error.status,
        details: error
      })
      throw error
    }
    console.log('✅ useAuth: Login Google iniciado, redirecionando...')
    return data
  }

  const signUp = async (email: string, password: string, captchaToken?: string) => {
    console.log('📝 useAuth: Tentando registro...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined
    })
    
    if (error) {
      console.error('❌ useAuth: Erro no registro:', error)
      throw error
    }
    console.log('✅ useAuth: Registro bem-sucedido')
    return data
  }

  const signOut = async () => {
    console.log('🚪 useAuth: Fazendo logout...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ useAuth: Erro no logout:', error)
      throw error
    }
    console.log('✅ useAuth: Logout bem-sucedido')
  }

  return {
    user,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  }
} 