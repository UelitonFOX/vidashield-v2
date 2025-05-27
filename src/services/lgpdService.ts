import { supabase } from './supabaseClient'

// Tipos LGPD
export interface LGPDConsentLog {
  id: string
  user_id: string
  consent_type: string
  consent_version: string
  consent_text: string
  consent_given: boolean
  ip_address?: string
  user_agent?: string
  device_info?: any
  location?: any
  metadata?: any
  created_at: string
  updated_at: string
}

export interface LGPDDataRequest {
  id: string
  user_id: string
  request_type: 'access' | 'portability' | 'correction' | 'deletion' | 'anonymization'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  description?: string
  request_data?: any
  response_data?: any
  processed_by?: string
  processing_notes?: string
  ip_address?: string
  user_agent?: string
  deadline_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface LGPDAuditTrail {
  id: string
  user_id?: string
  action_type: string
  resource_type: string
  resource_id?: string
  old_values?: any
  new_values?: any
  performed_by?: string
  justification?: string
  ip_address?: string
  user_agent?: string
  metadata?: any
  created_at: string
}

export interface LGPDTermsVersion {
  id: string
  version: string
  type: 'privacy_policy' | 'terms_of_use' | 'consent_form'
  title: string
  content: string
  effective_date: string
  expiry_date?: string
  is_active: boolean
  created_by?: string
  approved_by?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface UserLGPDData {
  profile: any
  consent_logs: LGPDConsentLog[]
  data_requests: LGPDDataRequest[]
  audit_trail: LGPDAuditTrail[]
  analytics_data?: any[]
  auth_logs?: any[]
  notifications?: any[]
}

export interface LGPDStats {
  total_users_with_consent: number
  total_data_requests: number
  pending_requests: number
  overdue_requests: number
  consent_rate: number
  deletion_requests: number
  portability_requests: number
  access_requests: number
  correction_requests: number
  recent_requests: LGPDDataRequest[]
}

export class LGPDService {
  /**
   * Registrar consentimento LGPD
   */
  static async registerConsent(
    consentType: string,
    consentGiven: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('register_lgpd_consent', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_consent_type: consentType,
        p_consent_given: consentGiven,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao registrar consentimento LGPD:', error)
      return null
    }
  }

  /**
   * Obter termos e políticas ativas
   */
  static async getActiveTerms(type?: string): Promise<LGPDTermsVersion[]> {
    try {
      let query = supabase
        .from('lgpd_terms_versions')
        .select('*')
        .eq('is_active', true)
        .order('effective_date', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar termos LGPD:', error)
        // Retornar termos padrão quando tabelas não existem
        return this.getDefaultTerms(type)
      }
      
      return data || this.getDefaultTerms(type)
    } catch (error) {
      console.error('Erro ao buscar termos LGPD:', error)
      return this.getDefaultTerms(type)
    }
  }

  /**
   * Obter termos padrão quando banco não está configurado
   */
  private static getDefaultTerms(type?: string): LGPDTermsVersion[] {
    const defaultTerms: LGPDTermsVersion[] = [
      {
        id: 'default-privacy-policy',
        version: '1.0.0',
        type: 'privacy_policy',
        title: 'Política de Privacidade - VidaShield',
        content: this.getDefaultPrivacyPolicy(),
        effective_date: new Date().toISOString(),
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'default-consent-form',
        version: '1.0.0',
        type: 'consent_form',
        title: 'Formulário de Consentimento LGPD',
        content: this.getDefaultConsentForm(),
        effective_date: new Date().toISOString(),
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    if (type) {
      return defaultTerms.filter(term => term.type === type)
    }
    
    return defaultTerms
  }

  /**
   * Política de privacidade padrão
   */
  private static getDefaultPrivacyPolicy(): string {
    return `
# Política de Privacidade - VidaShield

## 1. Informações Gerais
O VidaShield está comprometido com a proteção de seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).

## 2. Dados Coletados
Coletamos apenas os dados necessários para:
- Autenticação e identificação do usuário
- Funcionamento do sistema de segurança
- Monitoramento de ameaças e eventos
- Comunicação sobre alertas de segurança

## 3. Seus Direitos (Art. 18 da LGPD)
Você tem direito a:
- Confirmação da existência de tratamento
- Acesso aos dados
- Correção de dados incompletos, inexatos ou desatualizados
- Anonimização, bloqueio ou eliminação de dados desnecessários
- Portabilidade dos dados
- Eliminação dos dados pessoais tratados com consentimento
- Informação sobre entidades com as quais compartilhamos dados
- Revogação do consentimento

## 4. Finalidade do Tratamento
Seus dados são tratados para:
- Prover serviços de segurança médica
- Detectar e prevenir ameaças
- Melhorar nossos serviços
- Cumprir obrigações legais

## 5. Armazenamento e Segurança
- Dados criptografados em trânsito e em repouso
- Acesso restrito por controles de segurança
- Logs de auditoria para todas as operações
- Backup seguro e recuperação de dados

## 6. Compartilhamento
Não compartilhamos dados pessoais com terceiros, exceto:
- Quando exigido por lei
- Para proteger direitos, propriedade ou segurança
- Com seu consentimento explícito

## 7. Contato
Para exercer seus direitos ou esclarecer dúvidas:
Email: privacidade@vidashield.com
Telefone: (11) 1234-5678

Última atualização: ${new Date().toLocaleDateString('pt-BR')}
    `.trim()
  }

  /**
   * Formulário de consentimento padrão
   */
  private static getDefaultConsentForm(): string {
    return `
# Formulário de Consentimento LGPD

## Consentimento para Tratamento de Dados Pessoais

De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), solicitamos seu consentimento para o tratamento de seus dados pessoais.

### Dados que Coletamos:
- **Dados de Identificação**: Nome, email, telefone
- **Dados de Autenticação**: Credenciais de login, histórico de acesso
- **Dados de Segurança**: Logs de atividade, eventos de segurança
- **Dados Técnicos**: IP, dispositivo, navegador

### Finalidades do Tratamento:
- ✅ **Necessário**: Prover serviços de segurança médica
- ✅ **Necessário**: Detectar e prevenir ameaças
- 🔄 **Opcional**: Melhorias no sistema e analytics
- 🔄 **Opcional**: Comunicações promocionais

### Seus Direitos:
Você pode a qualquer momento:
- Acessar seus dados
- Corrigir informações
- Solicitar portabilidade
- Revogar consentimento
- Solicitar exclusão

Ao aceitar, você concorda com o tratamento de seus dados conforme descrito acima.
    `.trim()
  }

  /**
   * Criar solicitação de dados
   */
  static async createDataRequest(
    requestType: string,
    description?: string,
    requestData?: any
  ): Promise<string | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Usuário não autenticado')

      const deadlineDate = new Date()
      deadlineDate.setDate(deadlineDate.getDate() + 15) // 15 dias conforme LGPD

      const { data, error } = await supabase
        .from('lgpd_data_requests')
        .insert([{
          user_id: user.id,
          request_type: requestType,
          description,
          request_data: requestData,
          deadline_date: deadlineDate.toISOString(),
          ip_address: await this.getUserIP(),
          user_agent: navigator.userAgent
        }])
        .select()
        .single()

      if (error) throw error

      // Log da ação
      await this.logAuditTrail(
        user.id,
        'data_request_created',
        'lgpd_data_request',
        data.id,
        { request_type: requestType, description }
      )

      return data.id
    } catch (error) {
      console.error('Erro ao criar solicitação de dados:', error)
      return null
    }
  }

  /**
   * Obter dados completos do usuário para LGPD
   */
  static async getUserLGPDData(): Promise<UserLGPDData | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Usuário não autenticado')

      // Buscar dados em paralelo
      const [
        profileResult,
        consentLogsResult,
        dataRequestsResult,
        auditTrailResult,
        analyticsResult,
        authLogsResult,
        notificationsResult
      ] = await Promise.all([
        // Perfil do usuário
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single(),

        // Logs de consentimento
        supabase
          .from('lgpd_consent_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        // Solicitações de dados
        supabase
          .from('lgpd_data_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        // Trilha de auditoria
        supabase
          .from('lgpd_audit_trail')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),

        // Dados de analytics
        supabase
          .from('analytics_metrics')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(100),

        // Logs de autenticação
        supabase
          .from('auth_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),

        // Notificações
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100)
      ])

      return {
        profile: profileResult.data,
        consent_logs: consentLogsResult.data || [],
        data_requests: dataRequestsResult.data || [],
        audit_trail: auditTrailResult.data || [],
        analytics_data: analyticsResult.data || [],
        auth_logs: authLogsResult.data || [],
        notifications: notificationsResult.data || []
      }
    } catch (error) {
      console.error('Erro ao buscar dados LGPD do usuário:', error)
      return null
    }
  }

  /**
   * Exportar dados do usuário
   */
  static async exportUserData(): Promise<Blob | null> {
    try {
      const lgpdData = await this.getUserLGPDData()
      if (!lgpdData) throw new Error('Erro ao obter dados do usuário')

      // Log da exportação
      const user = (await supabase.auth.getUser()).data.user
      if (user) {
        await this.logAuditTrail(
          user.id,
          'data_export',
          'user_data',
          user.id,
          { export_timestamp: new Date().toISOString() }
        )

        // Atualizar última exportação
        await supabase
          .from('user_profiles')
          .update({ last_data_export: new Date().toISOString() })
          .eq('id', user.id)
      }

      // Criar arquivo JSON com todos os dados
      const exportData = {
        export_info: {
          generated_at: new Date().toISOString(),
          user_id: user?.id,
          export_type: 'complete_user_data',
          lgpd_compliance: true
        },
        user_profile: lgpdData.profile,
        consent_history: lgpdData.consent_logs,
        data_requests: lgpdData.data_requests,
        audit_trail: lgpdData.audit_trail,
        analytics_data: lgpdData.analytics_data,
        authentication_logs: lgpdData.auth_logs,
        notifications: lgpdData.notifications
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      return blob
    } catch (error) {
      console.error('Erro ao exportar dados do usuário:', error)
      return null
    }
  }

  /**
   * Solicitar exclusão de conta
   */
  static async requestAccountDeletion(justification?: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Usuário não autenticado')

      // Criar solicitação de exclusão
      const requestId = await this.createDataRequest(
        'deletion',
        `Solicitação de exclusão de conta. Justificativa: ${justification || 'Não informada'}`,
        { type: 'account_deletion', justification }
      )

      if (!requestId) throw new Error('Erro ao criar solicitação')

      // Marcar conta para exclusão
      await supabase
        .from('user_profiles')
        .update({
          deletion_requested: true,
          deletion_scheduled_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
        })
        .eq('id', user.id)

      // Log da solicitação
      await this.logAuditTrail(
        user.id,
        'deletion_requested',
        'user_account',
        user.id,
        { justification, request_id: requestId }
      )

      return true
    } catch (error) {
      console.error('Erro ao solicitar exclusão de conta:', error)
      return false
    }
  }

  /**
   * Obter estatísticas LGPD (para admins)
   */
  static async getLGPDStats(): Promise<LGPDStats | null> {
    try {
      const [
        usersWithConsentResult,
        dataRequestsResult,
        pendingRequestsResult,
        overdueRequestsResult,
        recentRequestsResult
      ] = await Promise.all([
        // Usuários com consentimento
        supabase
          .from('user_profiles')
          .select('id')
          .not('lgpd_consent_date', 'is', null),

        // Total de solicitações
        supabase
          .from('lgpd_data_requests')
          .select('id, request_type'),

        // Solicitações pendentes
        supabase
          .from('lgpd_data_requests')
          .select('id')
          .eq('status', 'pending'),

        // Solicitações em atraso
        supabase
          .from('lgpd_data_requests')
          .select('id')
          .eq('status', 'pending')
          .lt('deadline_date', new Date().toISOString()),

        // Solicitações recentes
        supabase
          .from('lgpd_data_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      const totalDataRequests = dataRequestsResult.data?.length || 0
      const requestsByType = dataRequestsResult.data?.reduce((acc: any, req: any) => {
        acc[req.request_type] = (acc[req.request_type] || 0) + 1
        return acc
      }, {}) || {}

      return {
        total_users_with_consent: usersWithConsentResult.data?.length || 0,
        total_data_requests: totalDataRequests,
        pending_requests: pendingRequestsResult.data?.length || 0,
        overdue_requests: overdueRequestsResult.data?.length || 0,
        consent_rate: 0.95, // Calcular baseado nos dados reais
        deletion_requests: requestsByType.deletion || 0,
        portability_requests: requestsByType.portability || 0,
        access_requests: requestsByType.access || 0,
        correction_requests: requestsByType.correction || 0,
        recent_requests: recentRequestsResult.data || []
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas LGPD:', error)
      return null
    }
  }

  /**
   * Log de auditoria LGPD
   */
  static async logAuditTrail(
    userId: string,
    actionType: string,
    resourceType: string,
    resourceId?: string,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase.rpc('log_lgpd_audit', {
        p_user_id: userId,
        p_action_type: actionType,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_metadata: metadata || {}
      })
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error)
    }
  }

  /**
   * Obter IP do usuário (para logs)
   */
  private static async getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return '0.0.0.0'
    }
  }

  /**
   * Verificar se usuário precisa atualizar consentimento
   */
  static async needsConsentUpdate(): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) return false

      // Buscar último consentimento do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('lgpd_consent_version')
        .eq('id', user.id)
        .single()

      // Buscar versão atual dos termos
      const { data: currentTerms } = await supabase
        .from('lgpd_terms_versions')
        .select('version')
        .eq('type', 'consent_form')
        .eq('is_active', true)
        .order('effective_date', { ascending: false })
        .limit(1)
        .single()

      return !profile?.lgpd_consent_version || 
             profile.lgpd_consent_version !== currentTerms?.version
    } catch (error) {
      console.error('Erro ao verificar consentimento:', error)
      return true // Por segurança, assumir que precisa atualizar
    }
  }
} 