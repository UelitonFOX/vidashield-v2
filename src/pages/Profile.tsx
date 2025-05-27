import React, { useState, useEffect, useRef } from 'react'
import { 
  User, 
  Edit3, 
  Camera, 
  Shield, 
  Settings, 
  Activity,
  Save,
  X,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Clock,
  Trash2,
  Download,
  AlertTriangle,
  Volume2,
  Play
} from 'lucide-react'
import { ProfileService, UserProfile, ProfileUpdateData, PasswordChangeData, ActivityLog } from '../services/profileService'
import { NOTIFICATION_SOUNDS, notificationSoundService } from '../services/notificationSounds'

// Hooks personalizados
const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    setLoading(true)
    const userProfile = await ProfileService.getCurrentProfile()
    if (userProfile) {
      setProfile(userProfile)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
  }, [])

  return { profile, setProfile, loading, loadProfile }
}

const usePasswordForm = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handlePasswordChange = async () => {
    const result = await ProfileService.changePassword(passwordForm)
    
    if (result.success) {
      setShowPasswordForm(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      alert('Senha alterada com sucesso!')
    } else {
      alert(result.message)
    }
  }

  return {
    showPasswordForm,
    setShowPasswordForm,
    passwordForm,
    setPasswordForm,
    showPasswords,
    setShowPasswords,
    handlePasswordChange
  }
}

// Componentes extraídos
const TabNavigation = ({ activeTab, setActiveTab, loadActivityLogs }: {
  activeTab: 'perfil' | 'seguranca' | 'configuracoes' | 'atividade'
  setActiveTab: (tab: 'perfil' | 'seguranca' | 'configuracoes' | 'atividade') => void
  loadActivityLogs: () => void
}) => {
  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'atividade', label: 'Atividade', icon: Activity }
  ]

  return (
    <div className="border-b border-gray-700">
      <nav className="flex space-x-8">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as 'perfil' | 'seguranca' | 'configuracoes' | 'atividade')
                if (tab.id === 'atividade') loadActivityLogs()
              }}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

const ProfileHeader = ({ profile }: { profile: UserProfile }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
      <p className="text-gray-400 mt-2">Gerencie suas informações pessoais e preferências</p>
    </div>
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
      profile.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
      profile.role === 'moderator' ? 'bg-blue-500/20 text-blue-300' :
      'bg-green-500/20 text-green-300'
    }`}>
      {profile.role === 'admin' ? 'Administrador' :
       profile.role === 'moderator' ? 'Moderador' : 'Usuário'}
    </div>
  </div>
)

const AvatarUpload = ({ profile, uploading, onAvatarUpload }: {
  profile: UserProfile
  uploading: boolean
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative">
      <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
        {profile.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
      >
        {uploading ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarUpload}
        className="hidden"
        aria-label="Upload foto de perfil"
        title="Selecionar foto de perfil"
      />
    </div>
  )
}

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null
  
  const strength = ProfileService.checkPasswordStrength(password)
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.color === 'red' ? 'bg-red-500' :
              strength.color === 'yellow' ? 'bg-yellow-500' :
              strength.color === 'orange' ? 'bg-orange-500' :
              'bg-green-500'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength.color === 'red' ? 'text-red-400' :
          strength.color === 'yellow' ? 'text-yellow-400' :
          strength.color === 'orange' ? 'text-orange-400' :
          'text-green-400'
        }`}>
          {strength.score === 5 ? 'Muito Forte' :
           strength.score === 4 ? 'Forte' :
           strength.score === 3 ? 'Média' :
           strength.score === 2 ? 'Fraca' : 'Muito Fraca'}
        </span>
      </div>
      <div className="text-xs text-gray-400">
        {strength.feedback.join(', ')}
      </div>
    </div>
  )
}

const NotificationSettings = ({ profile, onPreferenceChange }: {
  profile: UserProfile
  onPreferenceChange: (key: string, value: any) => void
}) => {
  const settings = [
    { key: 'email', label: 'E-mail', description: 'Receber notificações por e-mail' },
    { key: 'push', label: 'Push', description: 'Notificações no navegador' },
    { key: 'security', label: 'Segurança', description: 'Alertas de segurança' },
    { key: 'updates', label: 'Atualizações', description: 'Novidades do sistema' }
  ]

  const handleTestSound = async (soundId: string) => {
    try {
      await notificationSoundService.testSound(soundId)
    } catch (error) {
      console.error('Erro ao testar som:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configurações de notificação */}
      <div className="space-y-4">
        {settings.map(setting => (
          <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-white">{setting.label}</h4>
              <p className="text-sm text-gray-400">{setting.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profile.preferences.notifications[setting.key as keyof typeof profile.preferences.notifications]}
                onChange={(e) => onPreferenceChange('notifications', {
                  ...profile.preferences.notifications,
                  [setting.key]: e.target.checked
                })}
                className="sr-only peer"
                aria-label={`Ativar/desativar ${setting.label}`}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      {/* Configuração de som */}
      <div className="border-t border-gray-600 pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <Volume2 className="w-5 h-5 text-blue-400" />
          <h4 className="font-medium text-white">Som de Notificação</h4>
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
                  onChange={(e) => onPreferenceChange('notificationSound', e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 focus:ring-blue-500"
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
                  title="Testar som"
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
  )
}

const Profile: React.FC = () => {
  const { profile, setProfile, loading, loadProfile } = useProfile()
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'configuracoes' | 'atividade'>('perfil')
  
  // Estados para edição do perfil
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<ProfileUpdateData>({})
  const [uploading, setUploading] = useState(false)
  
  // Hook para senha
  const passwordHook = usePasswordForm()
  
  // Estados para logs de atividade
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name,
        phone: profile.phone || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const loadActivityLogs = async () => {
    const logs = await ProfileService.getActivityLogs(20)
    setActivityLogs(logs)
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    const success = await ProfileService.updateProfile(editForm)
    if (success) {
      setIsEditing(false)
      await loadProfile()
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return
    }

    setUploading(true)
    const avatarUrl = await ProfileService.uploadAvatar(file)
    if (avatarUrl && profile) {
      setProfile({ ...profile, avatar_url: avatarUrl })
    }
    setUploading(false)
  }

  const handlePreferenceChange = async (key: string, value: any) => {
    if (!profile) return
    
    const updatedPreferences = { ...profile.preferences, [key]: value }
    const success = await ProfileService.updateProfile({ preferences: updatedPreferences })
    
    if (success) {
      setProfile({ ...profile, preferences: updatedPreferences })
    }
  }

  const handleDeleteAccount = async () => {
    const success = await ProfileService.deleteAccount()
    if (success) {
      alert('Conta excluída com sucesso!')
      // Usar router ou redirect seguro ao invés de window.location
      location.assign('/')
    } else {
      alert('Erro ao excluir conta. Tente novamente.')
    }
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
        <p className="text-gray-400">Erro ao carregar perfil do usuário.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <ProfileHeader profile={profile} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} loadActivityLogs={loadActivityLogs} />

      <div className="grid grid-cols-1 gap-6">
        {/* Tab: Perfil */}
        {activeTab === 'perfil' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Informações Básicas</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
              </button>
            </div>

            <div className="flex items-start space-x-6">
              <AvatarUpload 
                profile={profile} 
                uploading={uploading} 
                onAvatarUpload={handleAvatarUpload} 
              />

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <p className="text-white py-2">{profile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
                    <p className="text-gray-400 py-2">{profile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-white py-2">{profile.phone || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Último acesso</label>
                    <p className="text-gray-400 py-2">
                      {profile.last_login ? new Date(profile.last_login).toLocaleString('pt-BR') : 'Primeiro acesso'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio || ''}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      placeholder="Conte um pouco sobre você..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  ) : (
                    <p className="text-white py-2">{profile.bio || 'Nenhuma biografia adicionada'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Segurança */}
        {activeTab === 'seguranca' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Segurança da Conta</h3>
                  <p className="text-gray-400 mt-1">Altere sua senha e gerencie a segurança</p>
                </div>
                <button
                  onClick={() => passwordHook.setShowPasswordForm(!passwordHook.showPasswordForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Alterar Senha</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <h4 className="font-medium text-white">Última Alteração</h4>
                  </div>
                  <p className="text-gray-300">
                    {profile.password_changed_at 
                      ? new Date(profile.password_changed_at).toLocaleDateString('pt-BR')
                      : 'Nunca alterada'
                    }
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <h4 className="font-medium text-white">Conta Criada</h4>
                  </div>
                  <p className="text-gray-300">
                    {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {passwordHook.showPasswordForm && (
                <div className="border border-gray-600 rounded-lg p-6 space-y-4">
                  <h4 className="text-lg font-medium text-white mb-4">Alterar Senha</h4>
                  
                  {['currentPassword', 'newPassword', 'confirmPassword'].map((field, index) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field === 'currentPassword' ? 'Senha Atual' : 
                         field === 'newPassword' ? 'Nova Senha' : 'Confirmar Nova Senha'}
                      </label>
                      <div className="relative">
                        <input
                          type={passwordHook.showPasswords[field as keyof typeof passwordHook.showPasswords] ? "text" : "password"}
                          value={passwordHook.passwordForm[field as keyof typeof passwordHook.passwordForm]}
                          onChange={(e) => passwordHook.setPasswordForm({ 
                            ...passwordHook.passwordForm, 
                            [field]: e.target.value 
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          placeholder={`Digite ${field === 'currentPassword' ? 'sua senha atual' : 
                                     field === 'newPassword' ? 'a nova senha' : 'a confirmação'}`}
                        />
                        <button
                          type="button"
                          onClick={() => passwordHook.setShowPasswords({ 
                            ...passwordHook.showPasswords, 
                            [field]: !passwordHook.showPasswords[field as keyof typeof passwordHook.showPasswords]
                          })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {passwordHook.showPasswords[field as keyof typeof passwordHook.showPasswords] ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {field === 'newPassword' && (
                        <PasswordStrengthIndicator password={passwordHook.passwordForm.newPassword} />
                      )}
                    </div>
                  ))}

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      onClick={passwordHook.handlePasswordChange}
                      disabled={!passwordHook.passwordForm.currentPassword || !passwordHook.passwordForm.newPassword || !passwordHook.passwordForm.confirmPassword}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Alterar Senha</span>
                    </button>
                    <button
                      onClick={() => passwordHook.setShowPasswordForm(false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Zona de Perigo */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Zona de Perigo</h3>
                  <p className="text-gray-300 mb-4">
                    Excluir sua conta é uma ação permanente e não pode ser desfeita.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir Conta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Configurações */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Notificações</h3>
                  <p className="text-gray-400">Configure como receber notificações</p>
                </div>
              </div>
              <NotificationSettings profile={profile} onPreferenceChange={handlePreferenceChange} />
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Configurações Regionais</h3>
                  <p className="text-gray-400">Idioma e fuso horário</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Idioma</label>
                  <select
                    value={profile.preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Selecionar idioma"
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
                    title="Selecionar fuso horário"
                  >
                    <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                    <option value="America/New_York">Nova York (GMT-5)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                    <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Atividade */}
        {activeTab === 'atividade' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">Histórico de Atividades</h3>
                <p className="text-gray-400">Acompanhe suas ações recentes</p>
              </div>
              <button
                onClick={loadActivityLogs}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            </div>

            <div className="space-y-3">
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-700 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      log.action.includes('security') || log.action.includes('password') ? 'bg-red-400' :
                      log.action.includes('login') ? 'bg-green-400' :
                      log.action.includes('update') ? 'bg-blue-400' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{log.description}</h4>
                        <span className="text-sm text-gray-400">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span>IP: {log.ip_address || 'N/A'}</span>
                        <span>•</span>
                        <span>Ação: {log.action}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma atividade registrada</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile 