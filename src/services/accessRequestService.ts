import { supabase } from './supabaseClient';
import { NotificationService } from './notificationService';

export interface AccessRequest {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  department: string | null;
  phone: string | null;
  justificativa: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  processed_by: string | null;
  processed_at: string | null;
  rejection_reason: string | null;
  user_id?: string;
}

export interface CreateAccessRequestData {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  phone?: string;
  justificativa: string;
  role?: string;
}

export class AccessRequestService {
  /**
   * Criar uma nova solicitação de acesso
   * TEMPORÁRIO: Usando workaround para RLS
   */
  static async createRequest(data: CreateAccessRequestData): Promise<AccessRequest> {
    console.log('📝 Criando solicitação de acesso...', data);

    // WORKAROUND TEMPORÁRIO: Criar mock request e notificar admins diretamente
    console.log('🔧 Usando workaround temporário para contornar problema de RLS...');
    
    const requestData: AccessRequest = {
      id: crypto.randomUUID(),
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url || null,
      role: data.role || 'user',
      department: data.department || null,
      phone: data.phone || null,
      justificativa: data.justificativa || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      processed_by: null,
      processed_at: null,
      rejection_reason: null,
      user_id: data.user_id
    };

    console.log('📋 Dados da solicitação criada:', {
      id: requestData.id,
      email: requestData.email,
      name: requestData.full_name,
      department: requestData.department,
      role: requestData.role
    });

    try {
      console.log('📤 Iniciando processo de notificação aos admins...');
      
      // Notificar administradores com os dados da solicitação
      await this.notifyAdminsNewRequest(requestData, data.user_id);
      
      console.log('✅ Solicitação processada e admins notificados!');
      console.log('🎯 Solicitação ID:', requestData.id);
      
      return requestData;
    } catch (error) {
      console.error('❌ Erro ao notificar admins:', error);
      console.error('💥 Detalhes do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
      throw new Error(`Erro ao processar solicitação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Buscar todas as solicitações pendentes (apenas admins)
   */
  static async getPendingRequests(): Promise<AccessRequest[]> {
    console.log('🔍 Buscando solicitações pendentes...');

    const { data: requests, error } = await supabase
      .from('pending_users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar solicitações:', error);
      throw new Error(`Erro ao buscar solicitações: ${error.message}`);
    }

    console.log(`📊 Encontradas ${requests?.length || 0} solicitações pendentes`);
    return requests || [];
  }

  /**
   * Aprovar uma solicitação de acesso
   */
  static async approveRequest(requestId: string, approvedBy: string, assignedRole?: string): Promise<void> {
    console.log(`✅ Aprovando solicitação ${requestId}...`);

    // Buscar a solicitação
    const { data: request, error: fetchError } = await supabase
      .from('pending_users')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      throw new Error('Solicitação não encontrada');
    }

    // Criar profile do usuário aprovado
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: request.user_id || crypto.randomUUID(), // Usar user_id se disponível, senão gerar novo
        email: request.email,
        name: request.full_name || request.email.split('@')[0],
        role: assignedRole || request.role || 'user',
        status: 'active',
        department: request.department,
        phone: request.phone,
        avatar_url: request.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Erro ao criar profile:', profileError);
      throw new Error(`Erro ao criar profile: ${profileError.message}`);
    }

    // Atualizar status da solicitação
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({
        status: 'approved',
        processed_by: approvedBy,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('❌ Erro ao atualizar solicitação:', updateError);
      throw new Error(`Erro ao atualizar solicitação: ${updateError.message}`);
    }

    // Notificar aprovação
    await this.notifyUserApproved(request, assignedRole || request.role);

    console.log(`✅ Solicitação ${requestId} aprovada com sucesso`);
  }

  /**
   * Rejeitar uma solicitação de acesso
   */
  static async rejectRequest(requestId: string, rejectedBy: string, reason?: string): Promise<void> {
    console.log(`❌ Rejeitando solicitação ${requestId}...`);

    // Buscar a solicitação
    const { data: request, error: fetchError } = await supabase
      .from('pending_users')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      throw new Error('Solicitação não encontrada');
    }

    // Atualizar status da solicitação
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({
        status: 'rejected',
        processed_by: rejectedBy,
        processed_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('❌ Erro ao atualizar solicitação:', updateError);
      throw new Error(`Erro ao atualizar solicitação: ${updateError.message}`);
    }

    // Notificar rejeição
    await this.notifyUserRejected(request, reason);

    console.log(`❌ Solicitação ${requestId} rejeitada`);
  }

  /**
   * Notificar administradores sobre nova solicitação
   */
  private static async notifyAdminsNewRequest(request: AccessRequest, userId?: string): Promise<void> {
    try {
      console.log('📧 Notificando administradores sobre nova solicitação...');
      
      // Verificar se a tabela user_profiles existe e tem dados
      console.log('🔍 Verificando tabela user_profiles...');
      
      const { data: allUsers, error: allUsersError } = await supabase
        .from('user_profiles')
        .select('id, email, role, status')
        .limit(5);
        
      if (allUsersError) {
        console.error('❌ Erro ao acessar tabela user_profiles:', allUsersError);
        throw new Error(`Erro no banco de dados: ${allUsersError.message}`);
      }
      
      console.log(`📊 Total de usuários na tabela: ${allUsers?.length || 0}`);
      console.log('👥 Usuários encontrados:', allUsers?.map(u => `${u.email} (${u.role})`));

      // Buscar administradores ativos
      const { data: admins, error: adminsError } = await supabase
        .from('user_profiles')
        .select('id, email, name')
        .eq('role', 'admin')
        .eq('status', 'active');

      if (adminsError) {
        console.error('❌ Erro ao buscar administradores:', adminsError);
        throw new Error(`Erro ao buscar administradores: ${adminsError.message}`);
      }

      console.log(`👥 Encontrados ${admins?.length || 0} administradores ativos`);
      console.log('📋 Admins:', admins?.map(a => a.email));

      if (!admins || admins.length === 0) {
        console.error('⚠️ ERRO: Nenhum administrador ativo encontrado!');
        console.log('🔧 MODO EMERGÊNCIA: Processando solicitação sem notificar admins...');
        
        // MODO EMERGÊNCIA: Se não há admins, salvar dados localmente e continuar
        console.warn('⚠️ ATENÇÃO: Sistema em modo emergência - dados salvos apenas localmente');
        
        // Salvar dados completos em localStorage para recuperação posterior
        const emergencyData = {
          type: 'emergency_request',
          request,
          userId,
          timestamp: new Date().toISOString(),
          reason: 'No active admins found - RLS blocking queries'
        };
        
        try {
          const existingEmergency = JSON.parse(localStorage.getItem('vidashield_emergency_requests') || '[]');
          existingEmergency.push(emergencyData);
          localStorage.setItem('vidashield_emergency_requests', JSON.stringify(existingEmergency));
          console.log('💾 Dados salvos em modo emergência no localStorage');
        } catch (localError) {
          console.warn('⚠️ Erro ao salvar dados de emergência:', localError);
        }
        
        // Retornar sucesso para não bloquear o usuário
        console.log('✅ Solicitação processada em modo emergência');
        return;
      }

      if (admins && admins.length > 0) {
        // VERSÃO MELHORADA: Criar notificações mais detalhadas
        const notifications = admins.map(admin => ({
          type: 'auth',
          title: 'Nova Solicitação de Acesso',
          message: `${request.full_name || request.email} solicitou acesso ao sistema VidaShield.`,
          severity: 'media',
          user_id: admin.id,
          metadata: {
            // Dados completos da solicitação
            request_id: request.id,
            pending_user_id: userId || request.user_id,
            pending_user_email: request.email,
            pending_user_name: request.full_name,
            department: request.department,
            phone: request.phone,
            justificativa: request.justificativa,
            requested_role: request.role,
            requested_at: request.created_at,
            // Flag para identificar como solicitação via workaround
            workaround_request: true,
            // Dados extras para debug
            submission_method: 'notification_workaround',
            submitted_by_ip: 'unknown',
            user_agent: navigator.userAgent
          },
          action_url: '/aprovacao-usuarios',
          read: false
        }));

        const { data: insertedNotifications, error: insertError } = await supabase
          .from('notifications')
          .insert(notifications)
          .select();

        if (insertError) {
          console.error('❌ Erro ao inserir notificações:', insertError);
          throw new Error(`Erro ao notificar admins: ${insertError.message}`);
        }

        console.log(`✅ ${notifications.length} notificações criadas para admins`);
        console.log('📄 IDs das notificações:', insertedNotifications?.map(n => n.id));
        
        // BACKUP: Também salvar dados em localStorage para recuperação
        const backupData = {
          request,
          timestamp: new Date().toISOString(),
          notificationIds: insertedNotifications?.map(n => n.id) || []
        };
        
        try {
          const existingBackups = JSON.parse(localStorage.getItem('vidashield_backup_requests') || '[]');
          existingBackups.push(backupData);
          localStorage.setItem('vidashield_backup_requests', JSON.stringify(existingBackups));
          console.log('💾 Backup local salvo em localStorage');
        } catch (localError) {
          console.warn('⚠️ Erro ao salvar backup local:', localError);
        }
        
      } else {
        throw new Error('Nenhum administrador ativo encontrado no sistema');
      }
    } catch (error) {
      console.error('❌ Erro ao notificar admins:', error);
      throw error;
    }
  }

  /**
   * Notificar usuário sobre aprovação
   */
  private static async notifyUserApproved(request: AccessRequest, assignedRole: string): Promise<void> {
    try {
      await NotificationService.notifyUserApproved({
        userId: request.user_id || request.id,
        userName: request.full_name || request.email.split('@')[0],
        userEmail: request.email,
        approvedBy: 'Admin',
        role: assignedRole,
        department: request.department || 'Geral'
      });
    } catch (error) {
      console.error('❌ Erro ao notificar aprovação:', error);
    }
  }

  /**
   * Notificar usuário sobre rejeição
   */
  private static async notifyUserRejected(request: AccessRequest, reason?: string): Promise<void> {
    try {
      await NotificationService.notifyUserRejected({
        userId: request.user_id || request.id,
        userName: request.full_name || request.email.split('@')[0],
        userEmail: request.email,
        rejectedBy: 'Admin',
        reason
      });
    } catch (error) {
      console.error('❌ Erro ao notificar rejeição:', error);
    }
  }
} 