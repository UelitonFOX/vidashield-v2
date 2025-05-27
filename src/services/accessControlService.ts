import { supabase } from './supabaseClient'
import { NotificationService } from './notificationService'

export interface AccessResource {
  id: string
  name: string
  description?: string
  resource_type: 'page' | 'api' | 'feature' | 'action'
  resource_path: string
  required_role: 'user' | 'moderator' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
  metadata?: any
}

export interface AccessPolicy {
  id: string
  name: string
  description?: string
  policy_type: 'role_based' | 'ip_based' | 'time_based' | 'custom'
  conditions: any
  actions: any
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface AccessLog {
  id: string
  user_id?: string
  resource_id?: string
  action: 'access' | 'denied' | 'blocked'
  result: 'allowed' | 'denied' | 'error'
  ip_address?: string
  user_agent?: string
  request_path?: string
  method?: string
  response_code?: number
  reason?: string
  metadata?: any
  created_at: string
  // Joined fields
  user_name?: string
  user_email?: string
  resource_name?: string
  resource_path?: string
}

export interface AccessStats {
  total_resources: number
  active_resources: number
  total_policies: number
  active_policies: number
  total_logs: number
  access_allowed: number
  access_denied: number
  unique_users: number
}

export class AccessControlService {

  /**
   * Buscar estatísticas de acesso
   */
  static async getAccessStats(): Promise<AccessStats> {
    try {
      const [resourcesData, policiesData, logsData] = await Promise.all([
        supabase
          .from('access_resources')
          .select('id, is_active'),
        supabase
          .from('access_policies')
          .select('id, is_active'),
        supabase
          .from('access_logs')
          .select('id, result, user_id')
      ])

      const resources = resourcesData.data || []
      const policies = policiesData.data || []
      const logs = logsData.data || []

      return {
        total_resources: resources.length,
        active_resources: resources.filter(r => r.is_active).length,
        total_policies: policies.length,
        active_policies: policies.filter(p => p.is_active).length,
        total_logs: logs.length,
        access_allowed: logs.filter(l => l.result === 'allowed').length,
        access_denied: logs.filter(l => l.result === 'denied').length,
        unique_users: new Set(logs.map(l => l.user_id).filter(Boolean)).size
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de acesso:', error)
      return {
        total_resources: 0,
        active_resources: 0,
        total_policies: 0,
        active_policies: 0,
        total_logs: 0,
        access_allowed: 0,
        access_denied: 0,
        unique_users: 0
      }
    }
  }

  /**
   * Buscar todos os recursos de acesso
   */
  static async getAccessResources(): Promise<AccessResource[]> {
    try {
      const { data, error } = await supabase
        .from('access_resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao buscar recursos de acesso:', error)
      return []
    }
  }

  /**
   * Criar novo recurso de acesso
   */
  static async createAccessResource(resource: Omit<AccessResource, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('access_resources')
        .insert([resource])
        .select()
        .single()

      if (error) throw error

      await NotificationService.createNotification({
        type: 'system',
        title: 'Recurso de Acesso Criado',
        message: `Novo recurso "${resource.name}" foi adicionado ao sistema`,
        severity: 'baixa',
        metadata: {
          resource_id: data.id,
          resource_path: resource.resource_path,
          required_role: resource.required_role
        },
        action_url: '/access-control'
      })

      return data.id
    } catch (error) {
      console.error('Erro ao criar recurso de acesso:', error)
      return null
    }
  }

  /**
   * Atualizar recurso de acesso
   */
  static async updateAccessResource(id: string, updates: Partial<AccessResource>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('access_resources')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await NotificationService.createNotification({
        type: 'system',
        title: 'Recurso de Acesso Atualizado',
        message: `Recurso foi modificado com sucesso`,
        severity: 'baixa',
        metadata: {
          resource_id: id,
          updates: Object.keys(updates)
        },
        action_url: '/access-control'
      })

      return true
    } catch (error) {
      console.error('Erro ao atualizar recurso de acesso:', error)
      return false
    }
  }

  /**
   * Excluir recurso de acesso
   */
  static async deleteAccessResource(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('access_resources')
        .delete()
        .eq('id', id)

      if (error) throw error

      await NotificationService.createNotification({
        type: 'system',
        title: 'Recurso de Acesso Removido',
        message: 'Recurso foi excluído do sistema',
        severity: 'baixa',
        action_url: '/access-control'
      })

      return true
    } catch (error) {
      console.error('Erro ao excluir recurso de acesso:', error)
      return false
    }
  }

  /**
   * Buscar todas as políticas de acesso
   */
  static async getAccessPolicies(): Promise<AccessPolicy[]> {
    try {
      const { data, error } = await supabase
        .from('access_policies')
        .select('*')
        .order('priority', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao buscar políticas de acesso:', error)
      return []
    }
  }

  /**
   * Criar nova política de acesso
   */
  static async createAccessPolicy(policy: Omit<AccessPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('access_policies')
        .insert([policy])
        .select()
        .single()

      if (error) throw error

      await NotificationService.createNotification({
        type: 'security',
        title: 'Nova Política de Acesso',
        message: `Política "${policy.name}" foi criada`,
        severity: 'media',
        metadata: {
          policy_id: data.id,
          policy_type: policy.policy_type,
          priority: policy.priority
        },
        action_url: '/access-control'
      })

      return data.id
    } catch (error) {
      console.error('Erro ao criar política de acesso:', error)
      return null
    }
  }

  /**
   * Atualizar política de acesso
   */
  static async updateAccessPolicy(id: string, updates: Partial<AccessPolicy>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('access_policies')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await NotificationService.createNotification({
        type: 'security',
        title: 'Política de Acesso Atualizada',
        message: 'Política foi modificada com sucesso',
        severity: 'baixa',
        action_url: '/access-control'
      })

      return true
    } catch (error) {
      console.error('Erro ao atualizar política de acesso:', error)
      return false
    }
  }

  /**
   * Excluir política de acesso
   */
  static async deleteAccessPolicy(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('access_policies')
        .delete()
        .eq('id', id)

      if (error) throw error

      await NotificationService.createNotification({
        type: 'security',
        title: 'Política de Acesso Removida',
        message: 'Política foi excluída do sistema',
        severity: 'media',
        action_url: '/access-control'
      })

      return true
    } catch (error) {
      console.error('Erro ao excluir política de acesso:', error)
      return false
    }
  }

  /**
   * Buscar logs de acesso com informações de usuário e recurso
   */
  static async getAccessLogs(limit: number = 100): Promise<AccessLog[]> {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao buscar logs de acesso:', error)
      return []
    }
  }

  /**
   * Registrar tentativa de acesso
   */
  static async logAccess(logData: Omit<AccessLog, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('access_logs')
        .insert([logData])

      if (error) throw error

      // Notificar sobre acessos negados suspeitos
      if (logData.result === 'denied' && logData.metadata?.suspicious) {
        await NotificationService.createNotification({
          type: 'security',
          title: 'Tentativa de Acesso Suspeita',
          message: `Acesso negado para ${logData.request_path || 'recurso protegido'}`,
          severity: 'alta',
          metadata: {
            ip_address: logData.ip_address,
            user_agent: logData.user_agent,
            reason: logData.reason
          },
          action_url: '/access-control'
        })
      }

      return true
    } catch (error) {
      console.error('Erro ao registrar log de acesso:', error)
      return false
    }
  }

  /**
   * Verificar se usuário tem acesso a um recurso
   */
  static async checkAccess(userId: string, resourcePath: string, userRole: string): Promise<{ allowed: boolean; reason: string }> {
    try {
      // Buscar recurso
      const { data: resource } = await supabase
        .from('access_resources')
        .select('*')
        .eq('resource_path', resourcePath)
        .eq('is_active', true)
        .single()

      if (!resource) {
        return { allowed: false, reason: 'Recurso não encontrado' }
      }

      // Verificar role necessária
      const roleHierarchy = { admin: 3, moderator: 2, user: 1 }
      const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
      const requiredRoleLevel = roleHierarchy[resource.required_role as keyof typeof roleHierarchy] || 3

      if (userRoleLevel >= requiredRoleLevel) {
        return { allowed: true, reason: `Role ${userRole} tem acesso` }
      } else {
        return { allowed: false, reason: `Requer role ${resource.required_role}` }
      }
    } catch (error) {
      console.error('Erro ao verificar acesso:', error)
      return { allowed: false, reason: 'Erro na verificação de acesso' }
    }
  }
} 