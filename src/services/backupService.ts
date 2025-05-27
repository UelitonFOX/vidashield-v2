import { supabase } from './supabaseClient'
import { NotificationService } from './notificationService'

export interface BackupData {
  id: string
  name: string
  type: 'full' | 'incremental' | 'differential'
  status: 'pending' | 'running' | 'completed' | 'failed'
  size?: string
  created_at: string
  completed_at?: string
  duration?: string
  file_path?: string
  metadata?: any
  error_message?: string
}

export interface BackupConfig {
  auto_backup: boolean
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly'
  retention_days: number
  include_user_data: boolean
  include_logs: boolean
  include_settings: boolean
  compress: boolean
}

export class BackupService {
  
  /**
   * Buscar todos os backups
   */
  static async getBackups(): Promise<BackupData[]> {
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Erro ao buscar backups:', error)
      return []
    }
  }

  /**
   * Criar novo backup
   */
  static async createBackup(
    type: 'full' | 'incremental' | 'differential' = 'full',
    name?: string
  ): Promise<string | null> {
    try {
      const backupName = name || `Backup ${type} - ${new Date().toLocaleString('pt-BR')}`
      const startTime = Date.now()

      // Inserir registro de backup iniciado
      const { data: backup, error } = await supabase
        .from('backups')
        .insert([{
          name: backupName,
          type,
          status: 'running',
          metadata: {
            start_time: new Date().toISOString(),
            tables_included: ['users', 'notifications', 'auth_logs', 'threat_detection', 'dynamic_firewall']
          }
        }])
        .select()
        .single()

      if (error) throw error

      // Simular processo de backup
      const backupData = await this.performBackup(type, backup.id)
      
      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      // Atualizar status do backup
      await supabase
        .from('backups')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration: `${duration}s`,
          size: backupData.size,
          file_path: backupData.file_path,
          metadata: {
            ...backup.metadata,
            end_time: new Date().toISOString(),
            tables_backed_up: backupData.tables_count,
            records_backed_up: backupData.records_count
          }
        })
        .eq('id', backup.id)

      // Notificar sucesso
      await NotificationService.notifyBackupStatus({
        success: true,
        size: backupData.size,
        duration: `${duration}s`
      })

      return backup.id
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      
      // Notificar falha
      await NotificationService.notifyBackupStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })

      return null
    }
  }

  /**
   * Simular processo de backup
   */
  private static async performBackup(type: string, backupId: string) {
    // Simular tempo de backup baseado no tipo
    const delay = type === 'full' ? 3000 : type === 'incremental' ? 1000 : 2000
    await new Promise(resolve => setTimeout(resolve, delay))

    // Simular dados do backup
    const randomSize = Math.floor(Math.random() * 500) + 50 // 50-550 MB
    const tablesCount = Math.floor(Math.random() * 10) + 5   // 5-15 tabelas
    const recordsCount = Math.floor(Math.random() * 10000) + 1000 // 1K-11K registros

    return {
      size: `${randomSize} MB`,
      file_path: `/backups/${backupId}_${type}_${Date.now()}.sql.gz`,
      tables_count: tablesCount,
      records_count: recordsCount
    }
  }

  /**
   * Restaurar backup
   */
  static async restoreBackup(backupId: string): Promise<boolean> {
    try {
      // Buscar backup
      const { data: backup, error } = await supabase
        .from('backups')
        .select('*')
        .eq('id', backupId)
        .single()

      if (error) throw error

      if (backup.status !== 'completed') {
        throw new Error('Backup não está completo ou não pode ser restaurado')
      }

      // Simular processo de restauração
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Notificar sucesso da restauração
      await NotificationService.createNotification({
        type: 'system',
        title: 'Restauração Concluída',
        message: `Backup "${backup.name}" foi restaurado com sucesso`,
        severity: 'baixa',
        metadata: {
          backup_id: backupId,
          restore_time: new Date().toISOString()
        },
        action_url: '/backups'
      })

      return true
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      
      await NotificationService.createNotification({
        type: 'system',
        title: 'Falha na Restauração',
        message: `Erro ao restaurar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        severity: 'alta',
        action_url: '/backups'
      })

      return false
    }
  }

  /**
   * Excluir backup
   */
  static async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('backups')
        .delete()
        .eq('id', backupId)

      if (error) throw error

      await NotificationService.createNotification({
        type: 'system',
        title: 'Backup Excluído',
        message: 'Backup foi removido com sucesso',
        severity: 'baixa',
        action_url: '/backups'
      })

      return true
    } catch (error) {
      console.error('Erro ao excluir backup:', error)
      return false
    }
  }

  /**
   * Buscar configurações de backup
   */
  static async getBackupConfig(): Promise<BackupConfig> {
    try {
      const { data, error } = await supabase
        .from('backup_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('Erro ao buscar configurações de backup:', error)
        // Retorna configuração padrão se não encontrar
        return {
          auto_backup: true,
          interval: 'daily',
          retention_days: 30,
          include_user_data: true,
          include_logs: true,
          include_settings: true,
          compress: true
        }
      }

      return {
        auto_backup: data.auto_backup,
        interval: data.interval,
        retention_days: data.retention_days,
        include_user_data: data.include_user_data,
        include_logs: data.include_logs,
        include_settings: data.include_settings,
        compress: data.compress
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de backup:', error)
      return {
        auto_backup: true,
        interval: 'daily',
        retention_days: 30,
        include_user_data: true,
        include_logs: true,
        include_settings: true,
        compress: true
      }
    }
  }

  /**
   * Salvar configurações de backup
   */
  static async saveBackupConfig(config: BackupConfig): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('backup_config')
        .insert([{
          auto_backup: config.auto_backup,
          interval: config.interval,
          retention_days: config.retention_days,
          include_user_data: config.include_user_data,
          include_logs: config.include_logs,
          include_settings: config.include_settings,
          compress: config.compress
        }])

      if (error) {
        console.error('Erro ao salvar configurações de backup:', error)
        return false
      }

      await NotificationService.createNotification({
        type: 'system',
        title: 'Configurações Salvas',
        message: 'Configurações de backup foram atualizadas',
        severity: 'baixa',
        action_url: '/backups'
      })

      return true
    } catch (error) {
      console.error('Erro ao salvar configurações de backup:', error)
      return false
    }
  }

  /**
   * Agendar backup automático
   */
  static async scheduleAutoBackup(): Promise<void> {
    const config = await this.getBackupConfig()
    
    if (!config.auto_backup) return

    // Em um ambiente real, isso seria feito com um cron job ou scheduled function
    console.log(`Backup automático agendado para: ${config.interval}`)
    
    // Simular execução periódica (em produção seria um worker)
    // setTimeout(() => {
    //   this.createBackup('incremental', 'Backup Automático')
    // }, this.getIntervalMilliseconds(config.interval))
  }

  /**
   * Converter intervalo para millisegundos
   */
  private static getIntervalMilliseconds(interval: string): number {
    switch (interval) {
      case 'hourly': return 60 * 60 * 1000
      case 'daily': return 24 * 60 * 60 * 1000
      case 'weekly': return 7 * 24 * 60 * 60 * 1000
      case 'monthly': return 30 * 24 * 60 * 60 * 1000
      default: return 24 * 60 * 60 * 1000
    }
  }
} 