import React, { useState, useEffect } from 'react';
import { Users, Check, X, Clock, Mail, Calendar, AlertTriangle, RefreshCw, UserPlus, Shield } from 'lucide-react';
import { AccessRequestService, AccessRequest } from '../services/accessRequestService';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';

const AprovacaoUsuarios: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>({});
  const [approvalRequests, setApprovalRequests] = useState<any[]>([]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando solicitações pendentes SIMPLES...');
      
      // SIMPLES: Buscar diretamente na pending_users
      const { data: requests, error } = await supabase
        .from('pending_users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar pending_users:', error);
        setPendingRequests([]);
        return;
      }

      console.log(`📊 Encontradas ${requests?.length || 0} solicitações pendentes`);
      setPendingRequests(requests || []);
      
    } catch (error) {
      console.error('❌ Erro geral:', error);
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
      
      console.log(`✅ Aprovando usuário SIMPLES: ${request.email} como ${assignedRole}`);
      
      // SIMPLES: Criar profile em user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: crypto.randomUUID(),
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

      // SIMPLES: Remover da pending_users
      const { error: deleteError } = await supabase
        .from('pending_users')
        .delete()
        .eq('id', request.id);

      if (deleteError) {
        console.warn('⚠️ Erro ao remover de pending_users:', deleteError);
      }
      
      // Remover da lista local
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
      
      alert(`✅ ${request.full_name || request.email} aprovado como ${assignedRole}!`);
      
    } catch (error) {
      console.error('❌ Erro ao aprovar:', error);
      alert(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
      
      // BACKUP: Também marcar na tabela pending_users se existir
      await supabase
        .from('pending_users')
        .update({ 
          status: 'rejected',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);
      
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

  // MODO EMERGÊNCIA: Carregar dados do localStorage
  const loadEmergencyRequests = () => {
    try {
      console.log('🆘 Carregando solicitações em modo emergência...');
      const emergencyData = localStorage.getItem('vidashield_emergency_requests');
      
      if (emergencyData) {
        const requests = JSON.parse(emergencyData);
        console.log(`📦 Encontradas ${requests.length} solicitações em modo emergência`);
        
        // Converter para formato compatível
        const formattedRequests = requests.map((item: any) => ({
          id: item.request.id,
          email: item.request.email,
          full_name: item.request.full_name,
          department: item.request.department,
          phone: item.request.phone,
          justificativa: item.request.justificativa,
          role: item.request.role,
          status: 'pending',
          created_at: item.timestamp,
          source: 'emergency_mode'
        }));
        
        setPendingRequests(formattedRequests);
        setLoading(false);
        alert(`✅ Carregadas ${formattedRequests.length} solicitações do modo emergência!`);
      } else {
        alert('⚠️ Nenhuma solicitação encontrada no modo emergência');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados de emergência:', error);
      alert('❌ Erro ao carregar dados de emergência');
    }
  };

  // DEBUG: Verificar todo o localStorage
  const debugLocalStorage = () => {
    console.log('🔍 DEBUG: Verificando localStorage completo...');
    
    // Verificar todas as chaves do localStorage
    const keys = Object.keys(localStorage);
    console.log('🗝️ Chaves encontradas no localStorage:', keys);
    
    // Verificar dados específicos
    ['vidashield_emergency_requests', 'vidashield_backup_requests'].forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`📦 ${key}:`, parsed);
        } catch (e) {
          console.log(`📦 ${key} (texto):`, data);
        }
      } else {
        console.log(`❌ ${key}: não encontrado`);
      }
    });
    
    alert('🔍 Dados de debug enviados para o console. Pressione F12 para ver.');
  };

  // LIMPAR dados antigos mockados
  const clearOldData = async () => {
    if (confirm('⚠️ ATENÇÃO: Isto irá LIMPAR todos os dados antigos da tabela pending_users. Continuar?')) {
      try {
        const { error } = await supabase
          .from('pending_users')
          .delete()
          .eq('status', 'pending'); // Delete apenas os pendentes
          
        if (error) {
          console.error('❌ Erro ao limpar dados:', error);
          alert('❌ Erro ao limpar dados: ' + error.message);
        } else {
          console.log('✅ Dados antigos limpos com sucesso');
          alert('✅ Dados antigos limpos! Faça uma nova solicitação para testar.');
          fetchPendingRequests();
        }
      } catch (error) {
        console.error('❌ Erro:', error);
        alert('❌ Erro: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      }
    }
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
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            Aprovação de Usuários
          </h1>
          
          {/* Botões de controle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={fetchPendingRequests}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar Lista
            </button>
            
            <button
              onClick={loadEmergencyRequests}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              🆘 Carregar Modo Emergência
            </button>
            
            <button
              onClick={debugLocalStorage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              🔍 Debug localStorage
            </button>
            
            <button
              onClick={clearOldData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              🗑️ Limpar Dados Antigos
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Botão de Refresh */}
          <button
            onClick={fetchPendingRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all duration-200"
            title="Atualizar lista de solicitações"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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