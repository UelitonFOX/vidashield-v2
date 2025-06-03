import { supabase } from './supabaseClient'
import emailjs from '@emailjs/browser'

export interface CreateNotificationParams {
  type: 'threat' | 'security' | 'auth' | 'system'
  title: string
  message: string
  severity?: 'baixa' | 'media' | 'alta' | 'critica'
  metadata?: any
  action_url?: string
  user_id?: string
}

export interface EmailNotificationConfig {
  enabled: boolean
  recipients: string[]
  serviceId: string
  templateId: string
  publicKey: string
}

export class NotificationService {
  // Configuração de emails (EmailJS - 100% gratuito)
  private static emailConfig: EmailNotificationConfig = {
    enabled: true,
    recipients: ['ueliton.talento.tech@gmail.com'], // Seu email principal
    serviceId: 'service_vidashield', // Configurar no EmailJS
    templateId: 'template_vidashield', // Configurar no EmailJS  
    publicKey: 'YOUR_PUBLIC_KEY' // Configurar no EmailJS
  }

  /**
   * Inicializar EmailJS (chamado uma vez ao carregar a aplicação)
   */
  static initializeEmailJS() {
    try {
      emailjs.init(this.emailConfig.publicKey)
      console.log('📧 EmailJS inicializado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao inicializar EmailJS:', error)
    }
  }

  /**
   * Enviar email via EmailJS (100% gratuito)
   */
  private static async sendEmail(subject: string, message: string, recipient: string): Promise<boolean> {
    try {
      if (!this.emailConfig.enabled) {
        console.log('📧 [EMAIL] Notificações por email desabilitadas')
        return false
      }

      console.log('📧 Enviando email para:', recipient)
      console.log('📧 Assunto:', subject)

      // Enviar via EmailJS
      const templateParams = {
        to_email: recipient,
        to_name: 'Administrador VidaShield',
        subject: subject,
        message: message,
        from_name: 'VidaShield Security System',
        reply_to: 'noreply@vidashield.com',
        website_url: 'https://vidashield.vercel.app'
      }

      const response = await emailjs.send(
        this.emailConfig.serviceId,
        this.emailConfig.templateId,
        templateParams
      )

      if (response.status === 200) {
        console.log('📧 ✅ Email enviado com sucesso via EmailJS')
        return true
      } else {
        console.log('📧 ❌ Erro ao enviar email:', response)
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email via EmailJS:', error)
      // Fallback: Log detalhado para debug
      console.log('📧 [FALLBACK] Email seria enviado para:', recipient)
      console.log('📧 [FALLBACK] Assunto:', subject)
      console.log('📧 [FALLBACK] Mensagem:', message)
      return false
    }
  }

  /**
   * Enviar notificações por email para todos os administradores
   */
  private static async sendEmailNotifications(title: string, message: string): Promise<void> {
    if (!this.emailConfig.enabled || this.emailConfig.recipients.length === 0) {
      console.log('📧 Nenhum email configurado para notificações')
      return
    }

    const promises = this.emailConfig.recipients.map(recipient => 
      this.sendEmail(`🔔 ${title}`, message, recipient)
    )

    try {
      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length
      const total = this.emailConfig.recipients.length
      
      console.log(`📧 Emails enviados: ${successful}/${total}`)
      
      if (successful === 0) {
        console.log('⚠️ [EMAIL] Configuração necessária:')
        console.log('⚠️ [EMAIL] 1. Criar conta gratuita em https://emailjs.com')
        console.log('⚠️ [EMAIL] 2. Configurar service_id, template_id e public_key')
        console.log('⚠️ [EMAIL] 3. Adicionar variáveis de ambiente')
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificações por email:', error)
    }
  }

  /**
   * Criar uma nova notificação
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_type: params.type,
        p_title: params.title,
        p_message: params.message,
        p_severity: params.severity || 'media',
        p_user_id: params.user_id || null,
        p_metadata: params.metadata || null,
        p_action_url: params.action_url || null
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      throw error
    }
  }

  /**
   * Notificação de ameaça detectada
   */
  static async notifyThreatDetected(threatData: {
    ip: string
    type: string
    severity: 'baixa' | 'media' | 'alta' | 'critica'
    details?: string
  }) {
    return this.createNotification({
      type: 'threat',
      title: `Ameaça ${threatData.severity.toUpperCase()} Detectada`,
      message: `IP ${threatData.ip} foi identificado como ${threatData.type}. ${threatData.details || ''}`,
      severity: threatData.severity,
      metadata: {
        ip_address: threatData.ip,
        threat_type: threatData.type,
        detection_time: new Date().toISOString()
      },
      action_url: '/security'
    })
  }

  /**
   * Notificação de login suspeito
   */
  static async notifySuspiciousLogin(loginData: {
    ip: string
    location?: string
    user_agent?: string
    attempts: number
  }) {
    const severity = loginData.attempts > 5 ? 'critica' : loginData.attempts > 3 ? 'alta' : 'media'
    
    return this.createNotification({
      type: 'auth',
      title: 'Tentativa de Login Suspeita',
      message: `${loginData.attempts} tentativas de login falharam do IP ${loginData.ip}${loginData.location ? ` (${loginData.location})` : ''}`,
      severity,
      metadata: {
        ip_address: loginData.ip,
        location: loginData.location,
        user_agent: loginData.user_agent,
        attempts_count: loginData.attempts,
        detection_time: new Date().toISOString()
      },
      action_url: '/logs'
    })
  }

  /**
   * Notificação de IP bloqueado
   */
  static async notifyIPBlocked(blockData: {
    ip: string
    reason: string
    is_permanent: boolean
    attempts: number
  }) {
    return this.createNotification({
      type: 'security',
      title: `IP ${blockData.is_permanent ? 'Permanentemente' : 'Temporariamente'} Bloqueado`,
      message: `IP ${blockData.ip} foi bloqueado devido a: ${blockData.reason}`,
      severity: blockData.is_permanent ? 'alta' : 'media',
      metadata: {
        ip_address: blockData.ip,
        block_reason: blockData.reason,
        is_permanent: blockData.is_permanent,
        attempts_count: blockData.attempts,
        block_time: new Date().toISOString()
      },
      action_url: '/security'
    })
  }

  /**
   * Notificação de sistema
   */
  static async notifySystemEvent(eventData: {
    title: string
    message: string
    severity?: 'baixa' | 'media' | 'alta' | 'critica'
    module?: string
    action_url?: string
  }) {
    return this.createNotification({
      type: 'system',
      title: eventData.title,
      message: eventData.message,
      severity: eventData.severity || 'baixa',
      metadata: {
        module: eventData.module,
        event_time: new Date().toISOString()
      },
      action_url: eventData.action_url
    })
  }

  /**
   * Notificação de backup
   */
  static async notifyBackupStatus(backupData: {
    success: boolean
    size?: string
    duration?: string
    error?: string
  }) {
    return this.createNotification({
      type: 'system',
      title: backupData.success ? 'Backup Concluído' : 'Falha no Backup',
      message: backupData.success 
        ? `Backup realizado com sucesso${backupData.size ? ` (${backupData.size})` : ''}${backupData.duration ? ` em ${backupData.duration}` : ''}`
        : `Falha no backup: ${backupData.error || 'Erro desconhecido'}`,
      severity: backupData.success ? 'baixa' : 'alta',
      metadata: {
        backup_success: backupData.success,
        backup_size: backupData.size,
        backup_duration: backupData.duration,
        backup_error: backupData.error,
        backup_time: new Date().toISOString()
      },
      action_url: '/backups'
    })
  }

  /**
   * Notificação de atualização de sistema
   */
  static async notifySystemUpdate(updateData: {
    version: string
    features?: string[]
    critical?: boolean
  }) {
    return this.createNotification({
      type: 'system',
      title: 'Atualização do Sistema Disponível',
      message: `Nova versão ${updateData.version} disponível${updateData.features ? `. Novidades: ${updateData.features.join(', ')}` : ''}`,
      severity: updateData.critical ? 'alta' : 'media',
      metadata: {
        update_version: updateData.version,
        update_features: updateData.features,
        is_critical: updateData.critical,
        update_time: new Date().toISOString()
      },
      action_url: '/configuracoes'
    })
  }

  /**
   * Limpar notificações antigas (mais de 30 dias)
   */
  static async cleanOldNotifications() {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())

      if (error) throw error
      
      console.log('Notificações antigas removidas com sucesso')
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error)
      throw error
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      throw error
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  static async markAllAsRead(userId?: string) {
    try {
      let query = supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { error } = await query

      if (error) throw error
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error)
      throw error
    }
  }

  /**
   * Notificar admins sobre novos usuários pendentes de aprovação
   */
  static async notifyPendingUserApproval(pendingUsersCount: number) {
    // Buscar todos os usuários admin
    const { data: admins, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'admin')

    if (error) {
      console.error('Erro ao buscar admins:', error)
      return
    }

    const message = `${pendingUsersCount} usuário${pendingUsersCount > 1 ? 's' : ''} aguardando aprovação para acesso ao sistema.`

    // Criar notificação para cada admin
    for (const admin of admins) {
      await this.createNotification({
        type: 'auth',
        title: 'Novos Usuários Aguardando Aprovação',
        message: message,
        severity: 'media',
        user_id: admin.id,
        metadata: {
          pending_users_count: pendingUsersCount,
          notification_type: 'pending_approval',
          notification_time: new Date().toISOString()
        },
        action_url: '/aprovacao-usuarios'
      })
    }

    // NOVA FUNCIONALIDADE: Enviar notificações por email para todos os administradores
    console.log('📧 Enviando notificações por email sobre nova solicitação...')
    await this.sendEmailNotifications('Nova Solicitação de Acesso - VidaShield', `
🔔 Nova solicitação de acesso recebida!

📊 Detalhes:
• ${pendingUsersCount} usuário${pendingUsersCount > 1 ? 's' : ''} aguardando aprovação
• Acesse: https://vidashield.vercel.app/aprovacao-usuarios
• Sistema: VidaShield Security

⏰ ${new Date().toLocaleString('pt-BR')}

Ação necessária: Revisar e aprovar/rejeitar solicitação(ões) pendente(s).
    `.trim())
  }

  /**
   * Notificar usuário sobre aprovação da conta
   */
  static async notifyUserApproved(userData: {
    userId: string
    userName: string
    userEmail: string
    approvedBy: string
    role: string
    department: string
  }) {
    return this.createNotification({
      type: 'auth',
      title: '🎉 Conta Aprovada!',
      message: `Sua conta foi aprovada por ${userData.approvedBy}. Bem-vindo(a) ao VidaShield, ${userData.userName}!`,
      severity: 'baixa',
      user_id: userData.userId,
      metadata: {
        approval_date: new Date().toISOString(),
        approved_by: userData.approvedBy,
        user_role: userData.role,
        user_department: userData.department,
        notification_type: 'user_approved'
      },
      action_url: '/dashboard'
    })
  }

  /**
   * Notificar usuário sobre rejeição da conta
   */
  static async notifyUserRejected(userData: {
    userId: string
    userName: string
    userEmail: string
    rejectedBy: string
    reason?: string
  }) {
    return this.createNotification({
      type: 'auth',
      title: '❌ Solicitação de Acesso Rejeitada',
      message: `Sua solicitação de acesso foi rejeitada por ${userData.rejectedBy}${userData.reason ? `. Motivo: ${userData.reason}` : ''}. Entre em contato com o administrador para mais informações.`,
      severity: 'alta',
      user_id: userData.userId,
      metadata: {
        rejection_date: new Date().toISOString(),
        rejected_by: userData.rejectedBy,
        rejection_reason: userData.reason,
        notification_type: 'user_rejected'
      },
      action_url: '/contato'
    })
  }

  /**
   * Notificar admins sobre ação de aprovação/rejeição
   */
  static async notifyAdminUserAction(actionData: {
    action: 'approved' | 'rejected'
    userName: string
    userEmail: string
    actionBy: string
    reason?: string
  }) {
    // Buscar todos os usuários admin exceto quem fez a ação
    const { data: admins, error } = await supabase
      .from('user_profiles')
      .select('id, name')
      .eq('role', 'admin')
      .neq('email', actionData.actionBy)

    if (error) {
      console.error('Erro ao buscar outros admins:', error)
      return
    }

    const actionText = actionData.action === 'approved' ? 'aprovou' : 'rejeitou'
    const icon = actionData.action === 'approved' ? '✅' : '❌'

    // Criar notificação para cada admin
    for (const admin of admins) {
      await this.createNotification({
        type: 'auth',
        title: `${icon} Usuário ${actionData.action === 'approved' ? 'Aprovado' : 'Rejeitado'}`,
        message: `${actionData.actionBy} ${actionText} o acesso de ${actionData.userName} (${actionData.userEmail})${actionData.reason ? `. Motivo: ${actionData.reason}` : ''}.`,
        severity: 'baixa',
        user_id: admin.id,
        metadata: {
          action_type: actionData.action,
          action_date: new Date().toISOString(),
          action_by: actionData.actionBy,
          affected_user: actionData.userEmail,
          action_reason: actionData.reason,
          notification_type: 'admin_user_action'
        },
        action_url: '/aprovacao-usuarios'
      })
    }
  }

  /**
   * Verificar usuários pendentes e notificar admins automaticamente
   */
  static async checkAndNotifyPendingUsers() {
    try {
      // Buscar usuários não confirmados no auth.users
      const { data: { users }, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        console.error('Erro ao buscar usuários:', error)
        return
      }

      // Filtrar usuários pendentes (email não confirmado)
      const pendingUsers = users.filter(user => !user.email_confirmed_at)
      
      if (pendingUsers.length > 0) {
        await this.notifyPendingUserApproval(pendingUsers.length)
        console.log(`Notificação enviada: ${pendingUsers.length} usuários pendentes`)
      }
    } catch (error) {
      console.error('Erro ao verificar usuários pendentes:', error)
    }
  }
}

export default NotificationService 