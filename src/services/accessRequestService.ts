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
   * Sistema unificado: usar apenas notificações
   */
  static async createRequest(data: CreateAccessRequestData): Promise<AccessRequest> {
    console.log('📝 Criando solicitação via sistema de notificações...', data);

    try {
      const requestId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      // Criar notificação para admin via NotificationService
      const notificationData = {
        type: 'auth' as const,
        title: 'Nova Solicitação de Acesso',
        message: `${data.full_name || data.email} solicitou acesso ao sistema VidaShield.`,
        severity: 'media' as const,
        metadata: {
          request_id: requestId,
          email: data.email,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          role: data.role || 'user',
          department: data.department,
          phone: data.phone,
          justificativa: data.justificativa,
          status: 'pending',
          created_at: timestamp,
          updated_at: timestamp,
          user_id: data.user_id,
          system_type: 'access_request'
        },
        action_url: '/aprovacao-usuarios'
      };

      // Usar NotificationService que já lida com RLS corretamente
      await NotificationService.createNotification(notificationData);

      console.log('✅ Solicitação criada como notificação ID:', requestId);
      
      return {
        id: requestId,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url || null,
        role: data.role || 'user',
        department: data.department || null,
        phone: data.phone || null,
        justificativa: data.justificativa,
        status: 'pending',
        created_at: timestamp,
        updated_at: timestamp,
        processed_by: null,
        processed_at: null,
        rejection_reason: null,
        user_id: data.user_id
      };
      
    } catch (error) {
      console.error('❌ Erro ao processar solicitação:', error);
      throw new Error(`Falha ao criar solicitação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Buscar todas as solicitações pendentes via notificações
   */
  static async getPendingRequests(): Promise<AccessRequest[]> {
    console.log('🔍 Buscando solicitações pendentes via notificações...');

    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'auth')
        .eq('read', false)
        .contains('metadata', { system_type: 'access_request' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar notificações:', error);
        throw error;
      }

      const requests = notifications?.map(notif => ({
        id: notif.metadata.request_id,
        email: notif.metadata.email,
        full_name: notif.metadata.full_name,
        avatar_url: notif.metadata.avatar_url,
        role: notif.metadata.role,
        department: notif.metadata.department,
        phone: notif.metadata.phone,
        justificativa: notif.metadata.justificativa,
        status: notif.metadata.status,
        created_at: notif.metadata.created_at,
        updated_at: notif.metadata.updated_at,
        processed_by: notif.metadata.processed_by,
        processed_at: notif.metadata.processed_at,
        rejection_reason: notif.metadata.rejection_reason,
        user_id: notif.metadata.user_id
      })) || [];

      console.log(`📊 Encontradas ${requests.length} solicitações pendentes`);
      return requests;
      
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações:', error);
      return [];
    }
  }

  /**
   * Aprovar uma solicitação (criar user_profile + marcar notificação como lida)
   */
  static async approveRequest(requestId: string, approvedBy: string, assignedRole?: string): Promise<void> {
    console.log(`✅ Aprovando solicitação ${requestId}...`);

    try {
      // Buscar a notificação da solicitação
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('metadata->request_id', requestId)
        .eq('type', 'auth')
        .contains('metadata', { system_type: 'access_request' })
        .single();

      if (fetchError || !notification) {
        throw new Error('Solicitação não encontrada nas notificações');
      }

      const request = notification.metadata;

      // Criar profile do usuário aprovado
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: request.user_id || crypto.randomUUID(),
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

      // Marcar notificação como lida (processada)
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          read: true,
          metadata: {
            ...request,
            status: 'approved',
            processed_by: approvedBy,
            processed_at: new Date().toISOString()
          }
        })
        .eq('id', notification.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar notificação:', updateError);
      }

      console.log(`✅ Solicitação ${requestId} aprovada com sucesso`);
      
    } catch (error) {
      console.error('❌ Erro ao aprovar solicitação:', error);
      throw error;
    }
  }

  /**
   * Rejeitar uma solicitação
   */
  static async rejectRequest(requestId: string, rejectedBy: string, reason?: string): Promise<void> {
    console.log(`❌ Rejeitando solicitação ${requestId}...`);

    try {
      // Buscar e marcar notificação como rejeitada
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('metadata->request_id', requestId)
        .eq('type', 'auth')
        .contains('metadata', { system_type: 'access_request' })
        .single();

      if (fetchError || !notification) {
        throw new Error('Solicitação não encontrada nas notificações');
      }

      // Marcar notificação como rejeitada
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          read: true,
          metadata: {
            ...notification.metadata,
            status: 'rejected',
            processed_by: rejectedBy,
            processed_at: new Date().toISOString(),
            rejection_reason: reason
          }
        })
        .eq('id', notification.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar notificação:', updateError);
        throw new Error(`Erro ao rejeitar solicitação: ${updateError.message}`);
      }

      console.log(`❌ Solicitação ${requestId} rejeitada com sucesso`);
      
    } catch (error) {
      console.error('❌ Erro ao rejeitar solicitação:', error);
      throw error;
    }
  }
} 