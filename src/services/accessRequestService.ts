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
        title: '🔔 Nova Solicitação de Acesso',
        message: `${data.full_name || data.email} solicitou acesso ao sistema VidaShield.${data.department ? ` Departamento: ${data.department}.` : ''} Clique para revisar e aprovar.`,
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

      // NOVA FUNCIONALIDADE: Notificar especificamente todos os admins
      console.log('📨 Enviando notificações direcionadas para todos os admins...');
      await NotificationService.notifyPendingUserApproval(1);

      console.log('✅ Solicitação criada como notificação ID:', requestId);
      console.log('✅ Todos os admins foram notificados sobre a nova solicitação');
      
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
      // PRIMEIRO: Buscar TODAS as notificações auth (lidas e não lidas) para debug
      const { data: allNotifications, error: allError } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'auth')
        .order('created_at', { ascending: false });

      console.log(`🔍 [DEBUG] Total de notificações auth (todas): ${allNotifications?.length || 0}`);
      
      // Log das notificações para debug
      allNotifications?.forEach((notif, index) => {
        if (notif.metadata?.system_type === 'access_request') {
          console.log(`🔍 [DEBUG ${index}] Notificação access_request:`, {
            id: notif.id,
            read: notif.read,
            email: notif.metadata?.email,
            request_id: notif.metadata?.request_id,
            created_at: notif.created_at
          });
        }
      });

      // SEGUNDO: Buscar notificações de access_request não processadas (lidas ou não lidas)
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'auth')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar notificações:', error);
        throw error;
      }

      console.log(`🔍 Total de notificações auth (todas): ${notifications?.length || 0}`);

      // Filtrar no cliente apenas as notificações de access_request ainda não processadas
      const accessRequestNotifications = notifications?.filter(notif => {
        const isAccessRequest = notif.metadata?.system_type === 'access_request';
        const notProcessed = !notif.metadata?.status || notif.metadata?.status === 'pending';
        
        if (isAccessRequest) {
          console.log(`🔍 [ACCESS_REQUEST] Email: ${notif.metadata?.email}, Status: ${notif.metadata?.status}, Read: ${notif.read}`);
        }
        
        return isAccessRequest && notProcessed;
      }) || [];

      console.log(`🔍 Notificações de access_request encontradas: ${accessRequestNotifications.length}`);

      const requests = accessRequestNotifications.map(notif => ({
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
      }));

      console.log(`📊 Solicitações pendentes processadas: ${requests.length}`);
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
    console.log('🔄 Usando sistema unificado v2.1 - Buscar TODAS notificações auth'); // Force rebuild

    try {
      console.log('🔍 [APROVAÇÃO] Etapa 1: Buscando TODAS as notificações auth...');
      // CORREÇÃO: Buscar TODAS as notificações auth (lidas e não lidas) para manter consistência
      const { data: notifications, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'auth')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ [APROVAÇÃO] Erro ao buscar notificações:', fetchError);
        throw new Error('Erro ao buscar solicitações de acesso');
      }

      console.log(`🔍 [APROVAÇÃO] Etapa 2: Encontradas ${notifications?.length || 0} notificações auth (todas)`);

      // Filtrar no cliente pela request_id e system_type
      const notification = notifications?.find(notif => 
        notif.metadata?.request_id === requestId && 
        notif.metadata?.system_type === 'access_request'
      );

      if (!notification) {
        console.error('❌ [APROVAÇÃO] Notificação não encontrada para request_id:', requestId);
        console.error('❌ [APROVAÇÃO] Notificações disponíveis:', notifications?.map(n => ({
          id: n.id,
          request_id: n.metadata?.request_id,
          system_type: n.metadata?.system_type,
          email: n.metadata?.email
        })));
        throw new Error('Solicitação não encontrada nas notificações');
      }

      console.log('✅ [APROVAÇÃO] Etapa 3: Notificação encontrada:', {
        notification_id: notification.id,
        read: notification.read,
        email: notification.metadata?.email
      });
      const request = notification.metadata;
      console.log('📋 [APROVAÇÃO] Dados da solicitação:', {
        email: request.email,
        full_name: request.full_name,
        role: assignedRole || request.role || 'user'
      });

      console.log('🔍 [APROVAÇÃO] Etapa 4: Verificando usuário existente...');
      // Verificar se o usuário já existe na tabela user_profiles
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', request.email)
        .single();

      if (existingProfile) {
        console.error('❌ [APROVAÇÃO] Usuário já existe:', request.email);
        throw new Error('Usuário já possui perfil ativo no sistema');
      }

      console.log('✅ [APROVAÇÃO] Etapa 5: Usuário não existe, prosseguindo...');

      console.log('🔍 [APROVAÇÃO] Etapa 6: Tentando criar via RPC...');
      // Criar profile do usuário aprovado via RPC para bypass RLS
      const { error: profileError } = await supabase
        .rpc('create_user_profile_admin', {
          p_id: request.user_id || crypto.randomUUID(),
          p_email: request.email,
          p_name: request.full_name || request.email.split('@')[0],
          p_role: assignedRole || request.role || 'user',
          p_department: request.department,
          p_phone: request.phone,
          p_avatar_url: request.avatar_url
        });

      if (profileError) {
        console.error('❌ [APROVAÇÃO] Erro ao criar profile via RPC:', profileError);
        console.log('🔍 [APROVAÇÃO] Etapa 7: Tentando fallback direto...');
        
        // Fallback: tentar inserção direta com service_role
        const { error: directError } = await supabase
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

        if (directError) {
          console.error('❌ [APROVAÇÃO] Erro no fallback direto:', directError);
          throw new Error(`Erro ao criar profile: ${directError.message}`);
        }
        console.log('✅ [APROVAÇÃO] Profile criado via fallback direto');
      } else {
        console.log('✅ [APROVAÇÃO] Profile criado via RPC');
      }

      console.log('🔍 [APROVAÇÃO] Etapa 8: Atualizando notificação...');
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
        console.error('❌ [APROVAÇÃO] Erro ao atualizar notificação:', updateError);
      } else {
        console.log('✅ [APROVAÇÃO] Notificação atualizada com sucesso');
      }

      // NOVA FUNCIONALIDADE: Notificar outros admins sobre a aprovação
      console.log('📨 [APROVAÇÃO] Notificando outros admins sobre a aprovação...');
      try {
        await NotificationService.notifyAdminUserAction({
          action: 'approved',
          userName: request.full_name || request.email.split('@')[0],
          userEmail: request.email,
          actionBy: approvedBy
        });
        console.log('✅ [APROVAÇÃO] Outros admins notificados sobre a aprovação');
      } catch (notifyError) {
        console.error('⚠️ [APROVAÇÃO] Erro ao notificar outros admins:', notifyError);
        // Não falhar o processo principal por causa disso
      }

      console.log(`✅ [APROVAÇÃO] Solicitação ${requestId} aprovada com sucesso`);
      
    } catch (error) {
      console.error('❌ [APROVAÇÃO] Erro geral:', error);
      console.error('❌ [APROVAÇÃO] Error message:', error instanceof Error ? error.message : 'Erro desconhecido');
      console.error('❌ [APROVAÇÃO] Error stack:', error instanceof Error ? error.stack : 'Sem stack trace');
      throw error;
    }
  }

  /**
   * Rejeitar uma solicitação
   */
  static async rejectRequest(requestId: string, rejectedBy: string, reason?: string): Promise<void> {
    console.log(`❌ Rejeitando solicitação ${requestId}...`);

    try {
      // CORREÇÃO: Buscar TODAS as notificações auth (lidas e não lidas) para manter consistência
      const { data: notifications, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'auth')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Erro ao buscar notificações:', fetchError);
        throw new Error('Erro ao buscar solicitações de acesso');
      }

      // Filtrar no cliente pela request_id e system_type
      const notification = notifications?.find(notif => 
        notif.metadata?.request_id === requestId && 
        notif.metadata?.system_type === 'access_request'
      );

      if (!notification) {
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

      // NOVA FUNCIONALIDADE: Notificar outros admins sobre a rejeição
      console.log('📨 [REJEIÇÃO] Notificando outros admins sobre a rejeição...');
      try {
        await NotificationService.notifyAdminUserAction({
          action: 'rejected',
          userName: notification.metadata.full_name || notification.metadata.email.split('@')[0],
          userEmail: notification.metadata.email,
          actionBy: rejectedBy,
          reason: reason
        });
        console.log('✅ [REJEIÇÃO] Outros admins notificados sobre a rejeição');
      } catch (notifyError) {
        console.error('⚠️ [REJEIÇÃO] Erro ao notificar outros admins:', notifyError);
        // Não falhar o processo principal por causa disso
      }

      console.log(`❌ Solicitação ${requestId} rejeitada com sucesso`);
      
    } catch (error) {
      console.error('❌ Erro ao rejeitar solicitação:', error);
      throw error;
    }
  }
} 