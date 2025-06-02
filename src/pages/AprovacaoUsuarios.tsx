import React, { useState, useEffect } from 'react';
import { Users, Check, X, Clock, Mail, Calendar, AlertTriangle, RefreshCcw, UserPlus } from 'lucide-react';
import { AccessRequestService, AccessRequest } from '../services/accessRequestService';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';

const AprovacaoUsuarios: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>({});

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando solicitações de acesso pendentes...');
      
      // WORKAROUND: Buscar dados das notificações em vez da tabela pending_users
      console.log('🔧 Usando workaround: buscando dados de notificações...');
      
      // Buscar TODAS as notificações de solicitação de acesso (não apenas do usuário atual)
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'auth')
        .contains('title', 'Nova Solicitação de Acesso')
        .order('created_at', { ascending: false });

      if (notifError) {
        console.error('❌ Erro ao buscar notificações:', notifError);
        setPendingRequests([]);
        return;
      }

      console.log('📧 Notificações encontradas:', notifications?.length || 0);

      // Converter notificações em solicitações mockadas
      const mockRequests: AccessRequest[] = (notifications || []).map((notification: any) => {
        const metadata = notification.metadata || {};
        return {
          id: metadata.request_id || notification.id,
          email: metadata.pending_user_email || 'email@exemplo.com',
          full_name: metadata.pending_user_name || 'Nome não informado',
          avatar_url: null,
          role: 'user',
          department: metadata.department || null,
          phone: metadata.phone || null,
          justificativa: metadata.justificativa || null,
          status: 'pending' as const,
          created_at: metadata.requested_at || notification.created_at,
          updated_at: notification.created_at,
          processed_by: null,
          processed_at: null,
          rejection_reason: null,
          user_id: metadata.pending_user_id
        };
      });

      // Filtrar apenas as não processadas (que não foram marcadas como read)
      const pendingOnly = mockRequests.filter((req, index) => 
        !notifications![index].read
      );

      setPendingRequests(pendingOnly);
      console.log(`📊 Processadas ${pendingOnly.length} solicitações pendentes das notificações`);
      
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações:', error);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const approveRequest = async (request: AccessRequest) => {
    if (!user?.id) return;
    
    setProcessingId(request.id);
    try {
      const assignedRole = selectedRole[request.id] || request.role || 'user';
      
      console.log(`✅ Aprovando usuário: ${request.email} com role: ${assignedRole}`);
      
      // WORKAROUND: Criar profile diretamente em vez de usar AccessRequestService
      console.log('🔧 Criando profile diretamente...');
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: request.user_id || crypto.randomUUID(),
          email: request.email,
          name: request.full_name || request.email.split('@')[0],
          role: assignedRole,
          status: 'active',
          department: request.department,
          phone: request.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('❌ Erro ao criar profile:', profileError);
        throw new Error(`Erro ao criar profile: ${profileError.message}`);
      }

      // Marcar notificação como processada (se possível)
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('metadata->request_id', request.id);
      
      // Remover da lista local
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
      
      alert(`✅ Usuário ${request.full_name || request.email} foi aprovado como ${assignedRole}!`);
      
    } catch (error) {
      console.error('❌ Erro ao aprovar usuário:', error);
      alert(`Erro ao aprovar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const rejectRequest = async (request: AccessRequest) => {
    if (!user?.id) return;
    
    setProcessingId(request.id);
    try {
      // Confirmar rejeição
      const reason = window.prompt(
        `Tem certeza que deseja rejeitar a solicitação de ${request.full_name || request.email}?\n\nPor favor, forneça um motivo para a rejeição (opcional):`,
        ''
      );
      
      if (reason === null) { // Usuário cancelou
        setProcessingId(null);
        return;
      }
      
      console.log(`❌ Rejeitando usuário: ${request.email}`);
      
      // WORKAROUND: Marcar apenas como rejeitada nas notificações
      await supabase
        .from('notifications')
        .update({ 
          read: true,
          metadata: {
            ...request,
            status: 'rejected',
            rejection_reason: reason,
            processed_by: user.id,
            processed_at: new Date().toISOString()
          }
        })
        .eq('metadata->request_id', request.id);
      
      // Remover da lista local
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
      
      alert(`Solicitação de ${request.full_name || request.email} foi rejeitada.`);
      
    } catch (error) {
      console.error('❌ Erro ao rejeitar usuário:', error);
      alert(`Erro ao rejeitar solicitação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = (requestId: string, role: string) => {
    setSelectedRole(prev => ({ ...prev, [requestId]: role }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      manager: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      moderator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      analyst: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      user: 'bg-green-500/20 text-green-400 border-green-500/30',
      viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Aprovação de Usuários</h1>
          <p className="text-zinc-400 mt-2">
            Gerencie solicitações de acesso ao sistema
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Botão de Refresh */}
          <button
            onClick={fetchPendingRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all duration-200"
            title="Atualizar lista de solicitações"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          
          {/* Contador */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-300">
                {pendingRequests.length} solicitação(ões) pendente(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de solicitações pendentes */}
      {pendingRequests.length === 0 ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
          <UserPlus className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Nenhuma solicitação pendente
          </h3>
          <p className="text-zinc-400">
            Todas as solicitações foram processadas ou não há novas solicitações.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-800 border border-zinc-700 overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-zinc-700">
            {pendingRequests.map((request) => (
              <li key={request.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {request.avatar_url ? (
                        <img
                          src={request.avatar_url}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full border-2 border-zinc-600"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                          <Users className="w-6 h-6 text-zinc-400" />
                        </div>
                      )}
                    </div>

                    {/* Info da solicitação */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {request.full_name || 'Nome não informado'}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(request.role)}`}>
                          {request.role}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {request.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Solicitado em {formatDate(request.created_at)}
                          </div>
                        </div>
                        
                        {(request.department || request.phone) && (
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            {request.department && <span>Depto: {request.department}</span>}
                            {request.phone && <span>Tel: {request.phone}</span>}
                          </div>
                        )}
                        
                        {request.justificativa && (
                          <div className="text-xs text-zinc-500 italic mt-2 p-2 bg-zinc-700/50 rounded">
                            <strong>Justificativa:</strong> "{request.justificativa}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    {/* Seletor de Role */}
                    <select
                      value={selectedRole[request.id] || request.role}
                      onChange={(e) => handleRoleChange(request.id, e.target.value)}
                      className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-2 py-1"
                      disabled={processingId === request.id}
                      aria-label="Selecionar role do usuário"
                    >
                      <option value="user">Usuário</option>
                      <option value="viewer">Visualizador</option>
                      <option value="analyst">Analista</option>
                      <option value="moderator">Moderador</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>

                    <button
                      onClick={() => approveRequest(request)}
                      disabled={processingId === request.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {processingId === request.id ? 'Processando...' : 'Aprovar'}
                    </button>
                    
                    <button
                      onClick={() => rejectRequest(request)}
                      disabled={processingId === request.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {processingId === request.id ? 'Processando...' : 'Rejeitar'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-400 mb-2">ℹ️ Informações Importantes</h4>
        <ul className="text-sm text-zinc-300 space-y-1">
          <li>• Selecione a role apropriada antes de aprovar cada usuário</li>
          <li>• Usuários aprovados recebem acesso imediatamente ao sistema</li>
          <li>• Usuários rejeitados são notificados sobre a decisão</li>
          <li>• Você pode alterar roles depois na página de Gerenciamento de Usuários</li>
        </ul>
      </div>
    </div>
  );
};

export default AprovacaoUsuarios; 