import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Shield, 
  Palette, 
  Volume2, 
  Save, 
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  Play,
  Download,
  Upload,
  Lock,
  AlertTriangle,
  Smartphone,
  QrCode,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react'
import { ProfileService, UserProfile } from '../services/profileService'
import { NOTIFICATION_SOUNDS, notificationSoundService } from '../services/notificationSounds'
import { securityService, SecurityLog, ActiveSession, TwoFactorSetup } from '../services/securityService'
import { themeService, ThemeMode } from '../services/themeService'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
}

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('notifications')
  
  // Estados para funcionalidades de segurança
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null)
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [copiedCode, setCopiedCode] = useState('')
  
  // Estados para senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const sections: SettingsSection[] = [
    { id: 'notifications', title: 'Notificações', description: 'Configurar alertas e sons', icon: Bell },
    { id: 'appearance', title: 'Aparência', description: 'Tema e personalização', icon: Palette },
    { id: 'regional', title: 'Regional', description: 'Idioma e fuso horário', icon: Globe },
    { id: 'security', title: 'Segurança', description: 'Configurações de segurança', icon: Shield },
    { id: 'data', title: 'Dados', description: 'Importar e exportar', icon: Download }
  ]

  useEffect(() => {
    loadProfile()
    loadSecurityData()
  }, [])

  useEffect(() => {
    // Aplicar animações do tema quando componente montar
    themeService.addThemeAnimations()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    const userProfile = await ProfileService.getCurrentProfile()
    if (userProfile) {
      setProfile(userProfile)
    }
    setLoading(false)
  }

  const loadSecurityData = async () => {
    try {
      // Carregar status do 2FA
      const tfa_status = await securityService.get2FAStatus()
      setTwoFactorEnabled(tfa_status)
      
      // Carregar sessões ativas
      const sessions = await securityService.getActiveSessions()
      setActiveSessions(sessions)
      
      // Carregar logs de segurança
      const logs = await securityService.getSecurityLogs(10)
      setSecurityLogs(logs)
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error)
    }
  }

  const handlePreferenceChange = async (key: string, value: any) => {
    if (!profile) return
    
    setSaving(true)
    
    const updatedPreferences = { ...profile.preferences, [key]: value }
    const success = await ProfileService.updateProfile({ preferences: updatedPreferences })
    
    if (success) {
      setProfile({ ...profile, preferences: updatedPreferences })
    }
    
    setSaving(false)
  }

  const handleTestSound = async (soundId: string) => {
    try {
      await notificationSoundService.testSound(soundId)
    } catch (error) {
      console.error('Erro ao testar som:', error)
    }
  }

  const handleExportData = () => {
    if (!profile) return
    
    const dataToExport = {
      profile: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        preferences: profile.preferences
      },
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vidashield-perfil-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Funções de Segurança
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Preencha todos os campos')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    setSaving(true)
    try {
      const success = await securityService.changePassword(currentPassword, newPassword)
      if (success) {
        alert('Senha alterada com sucesso!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        await loadSecurityData() // Recarregar logs
      } else {
        alert('Erro ao alterar senha. Verifique a senha atual.')
      }
    } catch (error) {
      alert('Erro ao alterar senha')
    }
    setSaving(false)
  }

  const handleSetup2FA = async () => {
    setSaving(true)
    try {
      const setup = await securityService.setup2FA()
      if (setup) {
        setTwoFactorSetup(setup)
        setShowBackupCodes(true)
      } else {
        alert('Erro ao configurar 2FA')
      }
    } catch (error) {
      alert('Erro ao configurar 2FA')
    }
    setSaving(false)
  }

  const handleEnable2FA = async () => {
    if (!twoFactorToken) {
      alert('Digite o código de verificação')
      return
    }

    setSaving(true)
    try {
      const success = await securityService.enable2FA(twoFactorToken)
      if (success) {
        alert('2FA ativado com sucesso!')
        setTwoFactorEnabled(true)
        setTwoFactorSetup(null)
        setTwoFactorToken('')
        setShowBackupCodes(false)
        await loadSecurityData()
      } else {
        alert('Código inválido. Tente novamente.')
      }
    } catch (error) {
      alert('Erro ao ativar 2FA')
    }
    setSaving(false)
  }

  const handleDisable2FA = async () => {
    if (!confirm('Tem certeza que deseja desativar o 2FA? Isso tornará sua conta menos segura.')) {
      return
    }

    setSaving(true)
    try {
      const success = await securityService.disable2FA()
      if (success) {
        alert('2FA desativado')
        setTwoFactorEnabled(false)
        await loadSecurityData()
      } else {
        alert('Erro ao desativar 2FA')
      }
    } catch (error) {
      alert('Erro ao desativar 2FA')
    }
    setSaving(false)
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja revogar esta sessão?')) {
      return
    }

    setSaving(true)
    try {
      const success = await securityService.revokeSession(sessionId)
      if (success) {
        alert('Sessão revogada com sucesso')
        await loadSecurityData()
      } else {
        alert('Erro ao revogar sessão')
      }
    } catch (error) {
      alert('Erro ao revogar sessão')
    }
    setSaving(false)
  }

  const handleRevokeAllSessions = async () => {
    if (!confirm('Tem certeza que deseja encerrar todas as outras sessões? Você precisará fazer login novamente nos outros dispositivos.')) {
      return
    }

    setSaving(true)
    try {
      const success = await securityService.revokeAllOtherSessions()
      if (success) {
        alert('Todas as outras sessões foram encerradas')
        await loadSecurityData()
      } else {
        alert('Erro ao encerrar sessões')
      }
    } catch (error) {
      alert('Erro ao encerrar sessões')
    }
    setSaving(false)
  }

  const handleThemeChange = (themeId: ThemeMode) => {
    themeService.setTheme(themeId)
    handlePreferenceChange('theme', themeId)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(''), 2000)
    })
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`
    return `${days} dia${days > 1 ? 's' : ''} atrás`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Erro ao carregar configurações.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
        </div>
        <p className="text-gray-400">Personalize sua experiência no VidaShield</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Seções</h3>
            <nav className="space-y-2">
              {sections.map(section => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs opacity-75">{section.description}</p>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6">
            
            {/* Notificações */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Configurações de Notificação</h2>
                  
                  {/* Toggle de notificações */}
                  <div className="space-y-4 mb-6">
                    {[
                      { key: 'email', label: 'E-mail', description: 'Receber notificações por e-mail' },
                      { key: 'push', label: 'Push', description: 'Notificações no navegador' },
                      { key: 'security', label: 'Segurança', description: 'Alertas de segurança' },
                      { key: 'updates', label: 'Atualizações', description: 'Novidades do sistema' }
                    ].map(setting => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">{setting.label}</h4>
                          <p className="text-sm text-gray-400">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.preferences.notifications[setting.key as keyof typeof profile.preferences.notifications]}
                            onChange={(e) => handlePreferenceChange('notifications', {
                              ...profile.preferences.notifications,
                              [setting.key]: e.target.checked
                            })}
                            className="sr-only peer"
                            aria-label={`Ativar ${setting.label.toLowerCase()}`}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Sons de notificação */}
                  <div className="border-t border-gray-600 pt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Volume2 className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Som de Notificação</h3>
                    </div>
                    <div className="space-y-3">
                      {NOTIFICATION_SOUNDS.map(sound => (
                        <div key={sound.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              id={sound.id}
                              name="notificationSound"
                              value={sound.id}
                              checked={profile.preferences.notificationSound === sound.id}
                              onChange={(e) => handlePreferenceChange('notificationSound', e.target.value)}
                              className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
                              aria-label={`Selecionar som ${sound.name}`}
                            />
                            <label htmlFor={sound.id} className="flex-1 cursor-pointer">
                              <div>
                                <p className="font-medium text-white">{sound.name}</p>
                                <p className="text-sm text-gray-400">{sound.description}</p>
                              </div>
                            </label>
                          </div>
                          {sound.id !== 'none' && (
                            <button
                              onClick={() => handleTestSound(sound.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              <span>Testar</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aparência */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Aparência</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Tema</label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {themeService.getAllThemes().map(theme => {
                        const iconMap: Record<string, React.ComponentType<any>> = {
                          dark: Moon,
                          light: Sun,
                          auto: Monitor,
                          neon: Palette,
                          ocean: Globe
                        }
                        const Icon = iconMap[theme.id] || Palette
                        const currentTheme = themeService.getCurrentTheme()
                        
                        return (
                          <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                              currentTheme === theme.id
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            <Icon className="w-6 h-6 mb-2" />
                            <div className="text-center">
                              <span className="text-sm font-medium block">{theme.name}</span>
                              <span className="text-xs text-gray-400">{theme.description}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Preview do tema atual */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-white mb-3">Preview</h4>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-blue-600 rounded"></div>
                      <div className="w-3/4 h-2 bg-gray-500 rounded"></div>
                      <div className="w-1/2 h-2 bg-green-500 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regional */}
            {activeSection === 'regional' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Configurações Regionais</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Idioma</label>
                    <select
                      value={profile.preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Selecionar idioma"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fuso Horário</label>
                    <select
                      value={profile.preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Selecionar fuso horário"
                    >
                      <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                      <option value="America/New_York">Nova York (GMT-5)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                      <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Segurança */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Configurações de Segurança</h2>
                
                <div className="space-y-6">
                  {/* Alteração de Senha */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <Lock className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Alterar Senha</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Senha Atual</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Digite sua senha atual"
                            className="w-full px-3 py-2 pr-10 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Digite uma nova senha forte"
                            className="w-full px-3 py-2 pr-10 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Nova Senha</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirme a nova senha"
                            className="w-full px-3 py-2 pr-10 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
                      >
                        {saving ? 'Alterando...' : 'Alterar Senha'}
                      </button>
                    </div>
                  </div>

                  {/* Autenticação de Dois Fatores */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-white">Autenticação de Dois Fatores</h3>
                          <p className="text-sm text-gray-400">Adicione uma camada extra de segurança</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {twoFactorEnabled ? 'Ativada' : 'Desativada'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={(e) => e.target.checked ? handleSetup2FA() : handleDisable2FA()}
                            className="sr-only peer"
                            aria-label="Ativar autenticação de dois fatores"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                    {!twoFactorEnabled && (
                      <button 
                        onClick={handleSetup2FA}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
                      >
                        {saving ? 'Configurando...' : 'Configurar 2FA'}
                      </button>
                    )}
                    
                    {/* Modal de configuração 2FA */}
                    {twoFactorSetup && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
                          <h3 className="text-xl font-semibold text-white mb-4">Configurar 2FA</h3>
                          <div className="space-y-4">
                            <div className="text-center">
                              <img src={twoFactorSetup.qr_code} alt="QR Code" className="mx-auto mb-4" />
                              <p className="text-sm text-gray-400">Escaneie o QR Code com seu app autenticador</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Código de Verificação</label>
                              <input
                                type="text"
                                value={twoFactorToken}
                                onChange={(e) => setTwoFactorToken(e.target.value)}
                                placeholder="Digite o código de 6 dígitos"
                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                                maxLength={6}
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setTwoFactorSetup(null)
                                  setTwoFactorToken('')
                                }}
                                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleEnable2FA}
                                disabled={saving || twoFactorToken.length !== 6}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white transition-colors"
                              >
                                {saving ? 'Ativando...' : 'Ativar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sessões Ativas */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <Monitor className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Sessões Ativas</h3>
                    </div>
                    <div className="space-y-3">
                      {activeSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${session.is_current ? 'bg-green-400' : 'bg-gray-400'}`} />
                            <div>
                              <p className="font-medium text-white">{session.device}</p>
                              <p className="text-sm text-gray-400">{session.location} • {formatTimestamp(session.last_active)}</p>
                            </div>
                          </div>
                          {!session.is_current && (
                            <button 
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={saving}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded text-sm text-white transition-colors"
                            >
                              {saving ? 'Revogando...' : 'Revogar'}
                            </button>
                          )}
                          {session.is_current && (
                            <span className="px-3 py-1 bg-green-600 rounded text-sm text-white">
                              Atual
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={handleRevokeAllSessions}
                      disabled={saving}
                      className="mt-3 w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
                    >
                      {saving ? 'Encerrando...' : 'Encerrar Todas as Outras Sessões'}
                    </button>
                  </div>

                  {/* Logs de Segurança */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Logs de Segurança</h3>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {securityLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-2 bg-gray-600 rounded text-sm">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              log.type === 'success' ? 'bg-green-400' :
                              log.type === 'warning' ? 'bg-yellow-400' :
                              log.type === 'error' ? 'bg-red-400' :
                              'bg-blue-400'
                            }`} />
                            <span className="text-white">{log.event}</span>
                          </div>
                          <span className="text-gray-400">{formatTimestamp(log.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Zona de Perigo */}
                  <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-400">Zona de Perigo</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Excluir Conta</h4>
                          <p className="text-sm text-gray-400">Esta ação não pode ser desfeita</p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors">
                          Excluir Conta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dados */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Gerenciamento de Dados</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Exportar Dados</h4>
                        <p className="text-sm text-gray-400">Baixar uma cópia dos seus dados</p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exportar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status de salvamento */}
            {saving && (
              <div className="mt-6 flex items-center space-x-2 text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                <span>Salvando...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 