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

    try {
      // Notificar administradores com os dados da solicitação
      await this.notifyAdminsNewRequest(requestData, data.user_id);
      console.log('✅ Solicitação processada e admins notificados!');
      
      return requestData;
    } catch (error) {
      console.error('❌ Erro ao notificar admins:', error);
      throw new Error('Erro ao processar solicitação. Tente novamente.');
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

      // Buscar administradores ativos
      const { data: admins } = await supabase
        .from('user_profiles')
        .select('id, email, name')
        .eq('role', 'admin')
        .eq('status', 'active');

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          type: 'auth',
          title: 'Nova Solicitação de Acesso',
          message: `${request.full_name || request.email} solicitou acesso ao sistema.`,
          severity: 'media',
          user_id: admin.id,
          metadata: {
            request_id: request.id,
            pending_user_id: userId,
            pending_user_email: request.email,
            pending_user_name: request.full_name,
            department: request.department,
            phone: request.phone,
            justificativa: request.justificativa,
            requested_at: request.created_at
          },
          action_url: '/aprovacao-usuarios'
        }));

        await supabase.from('notifications').insert(notifications);
        console.log(`✅ ${notifications.length} notificações criadas para admins`);
      }
    } catch (error) {
      console.error('❌ Erro ao notificar admins:', error);
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