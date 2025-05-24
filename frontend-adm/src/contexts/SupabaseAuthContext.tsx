import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase, UserProfile, getUserProfile, signInWithGoogle, signInWithEmail, signOut, signUpWithEmail } from '../lib/supabase'

interface SupabaseAuthContextType {
  // Estado de autenticação
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Métodos de autenticação
  signInWithEmail: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signOut: () => Promise<void>
  
  // Utilitários
  refreshProfile: () => Promise<void>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined)

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth deve ser usado dentro de um SupabaseAuthProvider')
  }
  return context
}

interface SupabaseAuthProviderProps {
  children: React.ReactNode
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!session

  // Atualizar perfil do usuário
  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error)
      }
    } else {
      setUserProfile(null)
    }
  }

  // Configurar sessão e usuário
  const handleAuthChange = async (session: Session | null) => {
    setSession(session)
    setUser(session?.user ?? null)
    
    if (session?.user) {
      await refreshProfile()
    } else {
      setUserProfile(null)
    }
    
    setIsLoading(false)
  }

  // Métodos de autenticação envolvidos com tratamento de estado
  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const result = await signInWithEmail(email, password)
      return result
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true)
      const result = await signInWithGoogle()
      return result
    } catch (error) {
      console.error('Erro no login com Google:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true)
      const result = await signUpWithEmail(email, password, metadata)
      return result
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
      setUser(null)
      setUserProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      await handleAuthChange(session)
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      await handleAuthChange(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: SupabaseAuthContextType = {
    user,
    userProfile,
    session,
    isLoading,
    isAuthenticated,
    signInWithEmail: handleSignInWithEmail,
    signInWithGoogle: handleSignInWithGoogle,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshProfile
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
} 