import React, { useState, useRef, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight, 
  UserPlus, 
  KeyRound,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Phone,
  Building,
  MapPin
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabaseClient'

// Importação do HCaptcha
import HCaptcha from '@hcaptcha/react-hcaptcha'

type FormMode = 'login' | 'register' | 'forgot-password' | 'reset-password'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  company: string
  location: string
}

const Login: React.FC = () => {
  const { signIn, signInWithGoogle, signUp, user } = useAuth()
  const [mode, setMode] = useState<FormMode>('login')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    company: '',
    location: ''
  })
  
  // Estados de loading
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  
  // Estados de UI
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [showCaptcha, setShowCaptcha] = useState(true) // Sempre mostrar captcha inicial
  const [captchaKey, setCaptchaKey] = useState(0) // Para forçar re-render do captcha
  
  // Refs
  const captchaRef = useRef<any>(null)

  // Se já está logado, redireciona
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // Reset form quando muda modo
  useEffect(() => {
    setError('')
    setSuccess('')
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      company: '',
      location: ''
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setCaptchaToken('')
    // Reset captcha quando muda de modo
    setCaptchaKey(prev => prev + 1)
  }, [mode])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email e senha são obrigatórios')
      return false
    }

    if (mode === 'register') {
      if (!formData.fullName) {
        setError('Nome completo é obrigatório')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem')
        return false
      }
      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        return false
      }
    }

    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Sempre verificar captcha para login
      if (!captchaToken) {
        setError('Complete o captcha para continuar')
        setLoading(false)
        return
      }

      await signIn(formData.email, formData.password, captchaToken)
       
       // Reset captcha após login bem-sucedido
       setCaptchaKey(prev => prev + 1)
       setCaptchaToken('')
      setSuccess('Login realizado com sucesso!')
    } catch (err: any) {
      console.error('Erro no login:', err)
      
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.')
      
      // Reset captcha em caso de erro para tentar novamente
      setCaptchaKey(prev => prev + 1)
      setCaptchaToken('')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Verificar captcha para registro
    if (!captchaToken) {
      setError('Complete o captcha para continuar')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signUp(formData.email, formData.password, captchaToken)

       // Criar perfil do usuário - usar ID do usuário autenticado
       const { data: { user } } = await supabase.auth.getUser()
       if (user) {
         const { error: profileError } = await supabase
           .from('profiles')
           .insert({
             id: user.id,
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone || null,
            company: formData.company || null,
            location: formData.location || null,
            role: 'user',
            status: 'pending' // Requer aprovação de admin
          })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }
      }

      setSuccess('Conta criada com sucesso! Verifique seu email para confirmar.')
      setMode('login')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      setError('Digite seu email para recuperar a senha')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login com Google')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleCaptchaChange = (token: string) => {
    setCaptchaToken(token)
  }

  const handleCaptchaExpire = () => {
    setCaptchaToken('')
  }

  const refreshCaptcha = () => {
    setCaptchaKey(prev => prev + 1)
    setCaptchaToken('')
  }

  const getTitle = () => {
    switch (mode) {
      case 'register': return 'Criar Nova Conta'
      case 'forgot-password': return 'Recuperar Senha'
      case 'reset-password': return 'Redefinir Senha'
      default: return 'Faça seu Login'
    }
  }

  const getDescription = () => {
    switch (mode) {
      case 'register': return 'Crie sua conta para acessar o dashboard'
      case 'forgot-password': return 'Recupere o acesso à sua conta'
      case 'reset-password': return 'Defina uma nova senha'
      default: return 'Acesse seu dashboard de segurança'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex">
      {/* LADO ESQUERDO - Logos e Apoiadores */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 relative overflow-hidden">
        {/* Background decorativo sutil */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/3 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-400/3 rounded-full blur-3xl"></div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-between items-center p-8 w-full min-h-screen">
          {/* Seção Superior - Logo e Título */}
          <div className="flex flex-col items-center">
            {/* Logo Principal VidaShield - Banner Gigante */}
            <div className="mb-12">
              <img 
                src="/logo-vidashield.png" 
                alt="VidaShield - Sistema de Segurança para Clínicas" 
                className="h-64 w-auto drop-shadow-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div className="hidden items-center justify-center">
                <Shield className="w-40 h-40 text-green-400" />
              </div>
            </div>

            {/* Título */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Sistema de Segurança
              </h1>
              <p className="text-xl text-zinc-300 mb-3">
                para Clínicas Médicas
              </p>
              <p className="text-base text-green-400 font-medium">
                Proteção total dos dados dos seus pacientes
              </p>
            </div>
          </div>

          {/* Seção Inferior - Logos das Instituições (Alinhado à esquerda) */}
          <div className="w-full">
            {/* Layout horizontal das logos - alinhado à esquerda */}
            <div className="flex items-center justify-start gap-8 mb-6">
              {/* Talento Tech */}
              <div className="flex-shrink-0">
                <img 
                  src="/talento-tech.png" 
                  alt="Talento Tech Paraná" 
                  className="h-40 w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Apoiadores da imagem fornecida */}
              <div className="flex-1 max-w-lg">
                <img 
                  src="/apoiadores.png" 
                  alt="Instituições Apoiadoras do Paraná" 
                  className="w-full opacity-95 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            {/* Texto de rodapé - alinhado à esquerda */}
            <div className="text-left">
              <p className="text-zinc-500 text-sm leading-relaxed">
                Projeto desenvolvido em parceria com o
                <br />
                <span className="text-green-400 font-medium">Governo do Estado do Paraná</span>
                <br />
                através do programa Talento Tech
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile (apenas em telas pequenas) */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="/logo-vidashield.png" 
              alt="VidaShield Logo" 
              className="h-16 w-auto mx-auto drop-shadow-2xl"
            />
          </div>

          {/* Card do Formulário */}
          <div className="bg-zinc-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-zinc-700/50">
            {/* Header do Form */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{getTitle()}</h2>
              <p className="text-zinc-400">{getDescription()}</p>
            </div>

            {/* Alertas */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-sm">{success}</span>
              </div>
            )}

            {/* Formulários */}
            <form onSubmit={mode === 'register' ? handleRegister : mode === 'forgot-password' ? handleForgotPassword : handleLogin} className="space-y-6">
              
              {/* Nome Completo - apenas no registro */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all backdrop-blur-sm"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email {mode !== 'forgot-password' && '*'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all backdrop-blur-sm"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Senha - não mostrar no esqueci senha */}
              {mode !== 'forgot-password' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-11 pr-12 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmar Senha - apenas no registro */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-11 pr-12 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Campos opcionais do registro */}
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-11 pr-4 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all backdrop-blur-sm"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Empresa
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full pl-11 pr-4 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all backdrop-blur-sm"
                          placeholder="Sua empresa"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Localização
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-zinc-700/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all backdrop-blur-sm"
                        placeholder="Cidade, Estado"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Captcha - mostrar apenas no login e registro */}
              {(mode === 'login' || mode === 'register') && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-300">
                    Verificação de Segurança
                  </label>
                  <div className="bg-zinc-700/30 rounded-xl p-4 border border-zinc-600">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-zinc-400 text-sm">Complete o captcha para continuar</span>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="Atualizar captcha"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* hCaptcha integrado com Supabase */}
                    <div className="flex justify-center">
                      <HCaptcha
                        key={captchaKey} // Força re-render quando necessário
                        ref={captchaRef}
                        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "20000000-ffff-ffff-ffff-000000000002"}
                        onVerify={handleCaptchaChange}
                        onExpire={handleCaptchaExpire}
                        onError={(err: any) => console.error('Erro no captcha:', err)}
                        theme="dark"
                        size="normal"
                        tabIndex={0}
                      />
                    </div>
                    
                    {/* Status do captcha */}
                    {captchaToken && (
                      <div className="mt-2 text-center">
                        <span className="text-green-400 text-xs flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Captcha verificado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Esqueci a senha link - apenas no login */}
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-green-400 hover:text-green-300 text-sm transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || googleLoading || ((mode === 'login' || mode === 'register') && !captchaToken)}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 disabled:from-green-400/50 disabled:to-emerald-500/50 text-black font-semibold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'register' ? <UserPlus className="w-5 h-5" /> :
                     mode === 'forgot-password' ? <KeyRound className="w-5 h-5" /> :
                     <ArrowRight className="w-5 h-5" />}
                    {loading ? 'Processando...' : 
                     mode === 'register' ? 'Criar Conta' :
                     mode === 'forgot-password' ? 'Enviar Email' :
                     'Entrar'}
                  </>
                )}
              </button>

              {/* Login com Google - NA PARTE INFERIOR */}
              {(mode === 'login' || mode === 'register') && (
                <>
                  {/* Divisor */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-zinc-800 text-zinc-400">ou</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 font-medium py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                  >
                    {googleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    {googleLoading ? 'Conectando...' : `Continuar com Google`}
                  </button>
                </>
              )}
            </form>

            {/* Links de navegação */}
            <div className="mt-8 pt-6 border-t border-zinc-700">
              <div className="text-center space-y-3">
                {mode === 'login' && (
                  <p className="text-zinc-400 text-sm">
                    Não tem uma conta?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-green-400 hover:text-green-300 transition-colors font-medium"
                    >
                      Criar conta
                    </button>
                  </p>
                )}

                {mode === 'register' && (
                  <p className="text-zinc-400 text-sm">
                    Já tem uma conta?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-green-400 hover:text-green-300 transition-colors font-medium"
                    >
                      Fazer login
                    </button>
                  </p>
                )}

                {mode === 'forgot-password' && (
                  <p className="text-zinc-400 text-sm">
                    Lembrou da senha?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-green-400 hover:text-green-300 transition-colors font-medium"
                    >
                      Voltar ao login
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Info do sistema */}
            <div className="mt-6 text-center">
              <p className="text-zinc-500 text-xs">
                Sistema de segurança para clínicas médicas
              </p>
              <p className="text-zinc-600 text-xs mt-1">
                VidaShield © 2025 - Todos os direitos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 