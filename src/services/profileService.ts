import { supabase } from './supabaseClient'
import { NotificationService } from './notificationService'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  phone?: string
  bio?: string
  avatar_url?: string
  preferences: {
    theme: 'dark' | 'light'
    notifications: {
      email: boolean
      push: boolean
      security: boolean
      updates: boolean
    }
    language: string
    timezone: string
    notificationSound: string
  }
  last_login?: string
  password_changed_at?: string
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  name?: string
  phone?: string
  bio?: string
  avatar_url?: string
  preferences?: any
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  description: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export class ProfileService {

  /**
   * Buscar perfil do usuário atual
   */
  static async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // Se é erro RLS (406), significa que usuário não tem perfil aprovado
        if (error.code === 'PGRST116' || error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
          console.log('🔒 RLS bloqueou busca de perfil - usuário não aprovado ainda');
          return null;
        }
        throw error;
      }

      return {
        ...data,
        preferences: data.preferences || {
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
            security: true,
            updates: false
          },
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          notificationSound: 'beep'
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }

  /**
   * Atualizar dados do perfil
   */
  static async updateProfile(updates: ProfileUpdateData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Log da atividade
      await this.logActivity('profile_update', 'Perfil atualizado com sucesso')

      await NotificationService.createNotification({
        type: 'system',
        title: 'Perfil Atualizado',
        message: 'Suas informações de perfil foram atualizadas com sucesso',
        severity: 'baixa',
        action_url: '/perfil'
      })

      return true
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      return false
    }
  }

  /**
   * Upload da foto de perfil
   */
  static async uploadAvatar(file: File): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuário não autenticado')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('user-files')
        .getPublicUrl(filePath)

      const avatarUrl = data.publicUrl

      // Atualizar perfil com nova URL do avatar
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      await this.logActivity('avatar_update', 'Foto de perfil atualizada')

      await NotificationService.createNotification({
        type: 'system',
        title: 'Foto Atualizada',
        message: 'Sua foto de perfil foi alterada com sucesso',
        severity: 'baixa',
        action_url: '/perfil'
      })

      return avatarUrl
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error)
      return null
    }
  }

  /**
   * Alterar senha
   */
  static async changePassword(data: PasswordChangeData): Promise<{ success: boolean; message: string }> {
    try {
      if (data.newPassword !== data.confirmPassword) {
        return { success: false, message: 'As senhas não coincidem' }
      }

      if (data.newPassword.length < 6) {
        return { success: false, message: 'A senha deve ter pelo menos 6 caracteres' }
      }

      const { error } = await supabase.auth.updateUser({ 
        password: data.newPassword 
      })

      if (error) throw error

      // Atualizar timestamp da alteração de senha
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ password_changed_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      await this.logActivity('password_change', 'Senha alterada com sucesso')

      await NotificationService.createNotification({
        type: 'security',
        title: 'Senha Alterada',
        message: 'Sua senha foi alterada com sucesso',
        severity: 'media',
        action_url: '/perfil'
      })

      return { success: true, message: 'Senha alterada com sucesso' }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      return { success: false, message: 'Erro ao alterar senha. Tente novamente.' }
    }
  }

  /**
   * Buscar logs de atividade do usuário
   */
  static async getActivityLogs(limit: number = 20): Promise<ActivityLog[]> {
    try {
      // TODO: Implementar tabela user_activity_logs
      // Por enquanto retorna array vazio para evitar erros
      return []
    } catch (error) {
      console.error('Erro ao buscar logs de atividade:', error)
      return []
    }
  }

  /**
   * Registrar atividade do usuário
   */
  static async logActivity(action: string, description: string): Promise<void> {
    try {
      // TODO: Implementar tabela user_activity_logs
      // Por enquanto só loga no console
      console.log(`[ACTIVITY] ${action}: ${description}`)
    } catch (error) {
      console.error('Erro ao registrar atividade:', error)
    }
  }

  /**
   * Obter IP do usuário (simulado)
   */
  private static async getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return '127.0.0.1'
    }
  }

  /**
   * Excluir conta
   */
  static async deleteAccount(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Usuário não autenticado')

      // Primeiro, marcar o perfil como excluído
      await supabase
        .from('user_profiles')
        .update({ 
          email: `deleted_${Date.now()}@deleted.com`,
          name: 'Conta Excluída',
          role: 'user'
        })
        .eq('id', user.id)

      // Depois, fazer logout
      await supabase.auth.signOut()

      return true
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      return false
    }
  }

  /**
   * Verificar força da senha
   */
  static checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
    color: string
  } {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) score++
    else feedback.push('Pelo menos 8 caracteres')

    if (/[a-z]/.test(password)) score++
    else feedback.push('Letra minúscula')

    if (/[A-Z]/.test(password)) score++
    else feedback.push('Letra maiúscula')

    if (/[0-9]/.test(password)) score++
    else feedback.push('Número')

    if (/[^A-Za-z0-9]/.test(password)) score++
    else feedback.push('Caractere especial')

    const colors = {
      0: 'red',
      1: 'red',
      2: 'yellow',
      3: 'orange',
      4: 'green',
      5: 'green'
    }

    return {
      score,
      feedback: feedback.length > 0 ? feedback : ['Senha forte!'],
      color: colors[score as keyof typeof colors]
    }
  }
} 