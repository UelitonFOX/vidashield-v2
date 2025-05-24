import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Shield, Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'

const SupabaseLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(true)
  
  const { signInWithEmail, signInWithGoogle, signUp, isAuthenticated } = useSupabaseAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      if (isLoginMode) {
        await signInWithEmail(email, password)
      } else {
        await signUp(email, password, { 
          full_name: email.split('@')[0] // Nome padrão baseado no email
        })
        setError('Conta criada! Verifique seu email para confirmar.')
        setIsLoginMode(true)
        return
      }
      
      // Redirecionar será feito automaticamente pelo useEffect
    } catch (err: any) {
      console.error('Erro na autenticação:', err)
      setError(err.message || 'Erro na autenticação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true)
      setError('')
      await signInWithGoogle()
      // O redirecionamento será feito pelo Supabase
    } catch (err: any) {
      console.error('Erro no login com Google:', err)
      setError(err.message || 'Erro no login com Google')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">VidaShield</h1>
          <p className="text-zinc-400">
            {isLoginMode ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-zinc-800 rounded-lg p-6 shadow-xl border border-zinc-700">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              {isLoading ? 'Carregando...' : (isLoginMode ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-zinc-600"></div>
            <span className="px-4 text-zinc-400 text-sm">ou</span>
            <div className="flex-1 border-t border-zinc-600"></div>
          </div>

          {/* Login com Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:cursor-not-allowed border border-zinc-600 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <Chrome className="h-5 w-5" />
            Continuar com Google
          </button>

          {/* Toggle Login/Registro */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode)
                setError('')
              }}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              {isLoginMode ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-zinc-500 text-sm">
            Powered by Supabase • VidaShield v2.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default SupabaseLogin 