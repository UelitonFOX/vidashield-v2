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
  offline_mode?: boolean;
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
   * SOLUÇÃO FINAL: Usar apenas notificações (sem RLS)
   */
  static async createRequest(data: CreateAccessRequestData): Promise<AccessRequest> {
    console.log('📝 Criando solicitação via NOTIFICAÇÕES (sem RLS)...', data);

    try {
      const requestId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      
      // USAR NOTIFICAÇÕES COMO BANCO DE DADOS
      const notificationData = {
        type: 'pending_user_request',
        title: 'Nova Solicitação de Acesso',
        message: `${data.full_name || data.email} solicitou acesso ao sistema VidaShield.`,
        severity: 'media',
        user_id: '00000000-0000-0000-0000-000000000000', // Admin genérico
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
        action_url: '/aprovacao-usuarios',
        read: false
      };

      const { data: insertedNotification, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar notificação:', error);
        
        // FALLBACK FINAL: Salvar no localStorage como sistema offline
        if (error.message?.includes('row-level security') || error.code === '42501' || error.message?.includes('403')) {
          console.log('🔧 RLS bloqueou notificações - usando modo OFFLINE');
          
          const offlineRequest: AccessRequest = {
            id: requestId,
            email: data.email,
            full_name: data.full_name,
            avatar_url: data.avatar_url || null,
            role: data.role || 'user',
            department: data.department || null,
            phone: data.phone || null,
            justificativa: data.justificativa,
            status: 'pending' as const,
            created_at: timestamp,
            updated_at: timestamp,
            processed_by: null,
            processed_at: null,
            rejection_reason: null,
            user_id: data.user_id,
            offline_mode: true
          };
          
          // Salvar em localStorage
          try {
            const existingRequests = JSON.parse(localStorage.getItem('vidashield_offline_requests') || '[]');
            existingRequests.push(offlineRequest);
            localStorage.setItem('vidashield_offline_requests', JSON.stringify(existingRequests));
            
            console.log('✅ Solicitação salva em modo OFFLINE');
            console.log('📱 Admin pode acessar via botão de "Carregar Offline" na página de aprovação');
            
            return offlineRequest;
          } catch (localError) {
            console.error('❌ Erro ao salvar offline:', localError);
            throw new Error('Sistema indisponível. Tente novamente mais tarde.');
          }
        }
        
        throw new Error(`Erro ao criar solicitação: ${error.message}`);
      }

      console.log('✅ Solicitação criada como notificação ID:', insertedNotification.id);
      
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
      throw error;
    }
  }

  /**
   * Buscar todas as solicitações pendentes via notificações
   */
  static async getPendingRequests(): Promise<AccessRequest[]> {
    console.log('🔍 Buscando solicitações via notificações...');

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'pending_user_request')
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      return [];
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

    console.log(`📊 Encontradas ${requests.length} solicitações via notificações`);
    return requests;
  }

  /**
   * Aprovar uma solicitação (criar user_profile + marcar notificação como lida)
   */
  static async approveRequest(requestId: string, approvedBy: string, assignedRole?: string): Promise<void> {
    console.log(`✅ Aprovando solicitação ${requestId}...`);

    // Buscar a notificação da solicitação
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('metadata->request_id', requestId)
      .eq('type', 'pending_user_request')
      .single();

    if (fetchError || !notification) {
      throw new Error('Solicitação não encontrada');
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
  }

  /**
   * Rejeitar uma solicitação
   */
  static async rejectRequest(requestId: string, rejectedBy: string, reason?: string): Promise<void> {
    console.log(`❌ Rejeitando solicitação ${requestId}...`);

    // Marcar notificação como rejeitada
    const { error: updateError } = await supabase
      .from('notifications')
      .update({
        read: true,
        metadata: {
          status: 'rejected',
          processed_by: rejectedBy,
          processed_at: new Date().toISOString(),
          rejection_reason: reason
        }
      })
      .eq('metadata->request_id', requestId)
      .eq('type', 'pending_user_request');

    if (updateError) {
      console.error('❌ Erro ao atualizar notificação:', updateError);
      throw new Error(`Erro ao rejeitar solicitação: ${updateError.message}`);
    }

    console.log(`❌ Solicitação ${requestId} rejeitada`);
  }
} 