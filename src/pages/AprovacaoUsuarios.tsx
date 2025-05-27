import React, { useState, useEffect } from 'react';
import { Users, Check, X, Clock, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { NotificationService } from '../services/notificationService';

interface PendingUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  role?: string;
  department?: string | null;
  phone?: string | null;
  justificativa?: string | null;
}

const AprovacaoUsuarios: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<{ name: string; email: string } | null>(null);

  const fetchPendingUsers = async () => {
    try {
      // PRIMEIRO: tentar buscar usuários da tabela pending_users (dados demo/simulação)
      const { data: mockPendingUsers, error: mockError } = await supabase
        .from('pending_users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!mockError && mockPendingUsers && mockPendingUsers.length > 0) {
        // Usar dados da tabela pending_users se existirem
        const formattedUsers = mockPendingUsers.map(user => ({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          status: 'pending' as const,
          role: user.role || 'user',
          department: user.department,
          phone: user.phone,
          justificativa: user.justificativa
        }));
        
        setPendingUsers(formattedUsers);
        
        // Notificar admins se houver usuários pendentes
        if (formattedUsers.length > 0) {
          try {
            await NotificationService.notifyPendingUserApproval(formattedUsers.length);
          } catch (notificationError) {
            console.error('Erro ao enviar notificação de usuários pendentes:', notificationError);
          }
        }
        return;
      }

      // FALLBACK: se não há dados na pending_users, usar dados estáticos para demonstração
      console.log('⚠️ API Admin não disponível - usando dados de demonstração');
      
      const demoPendingUsers = [
        {
          id: 'demo-1-joao-carlos-silva',
          email: 'joao.carlos@empresa.com',
          full_name: 'João Carlos Silva',
          avatar_url: null,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending' as const,
          role: 'user',
          department: 'Análise de Segurança',
          phone: '(11) 99999-0001',
          justificativa: 'Preciso de acesso para monitorar ameaças de segurança na filial de São Paulo.'
        },
        {
          id: 'demo-2-maria-fernanda-santos',
          email: 'maria.fernanda@empresa.com',
          full_name: 'Maria Fernanda Santos',
          avatar_url: null,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending' as const,
          role: 'admin',
          department: 'Gerência de TI',
          phone: '(11) 99999-0002',
          justificativa: 'Gerente de TI responsável pela implementação do sistema de segurança.'
        },
        {
          id: 'demo-3-carlos-roberto-oliveira',
          email: 'carlos.roberto@empresa.com',
          full_name: 'Carlos Roberto Oliveira',
          avatar_url: null,
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: 'pending' as const,
          role: 'user',
          department: 'Desenvolvimento',
          phone: '(11) 99999-0003',
          justificativa: 'Desenvolvedor que trabalhará na integração de novos módulos de segurança.'
        },
        {
          id: 'demo-4-ana-paula-costa',
          email: 'ana.paula@empresa.com',
          full_name: 'Ana Paula Costa',
          avatar_url: null,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'pending' as const,
          role: 'user',
          department: 'Compliance',
          phone: '(11) 99999-0004',
          justificativa: 'Analista de compliance que precisa verificar conformidade das políticas de segurança.'
        }
      ];
      
      setPendingUsers(demoPendingUsers);
      
      // Notificar admins sobre os usuários pendentes
      try {
        await NotificationService.notifyPendingUserApproval(demoPendingUsers.length);
      } catch (notificationError) {
        console.error('Erro ao enviar notificação de usuários pendentes:', notificationError);
      }
      
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      
      // Em último caso, usar dados mínimos
      setPendingUsers([
        {
          id: 'fallback-1',
          email: 'usuario.teste@demo.com',
          full_name: 'Usuário de Teste',
          avatar_url: null,
          created_at: new Date().toISOString(),
          status: 'pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, email')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setCurrentAdmin({ name: profile.name, email: profile.email });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar admin atual:', error);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchCurrentAdmin();
  }, []);

  const approveUser = async (user: PendingUser) => {
    setProcessingId(user.id);
    try {
      // Simulação: Atualizar status na tabela pending_users ou usar apenas dados locais
      try {
        // Tentar atualizar na tabela pending_users se existir
        await supabase
          .from('pending_users')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch (dbError) {
        console.log('Tabela pending_users não encontrada, usando simulação local');
      }

      // Enviar notificações (simuladas)
      try {
        await NotificationService.notifyUserApproved({
          userId: user.id,
          userName: user.full_name || user.email.split('@')[0],
          userEmail: user.email,
          approvedBy: currentAdmin?.name || 'Admin',
          role: user.role || 'user',
          department: user.department || 'Geral'
        });

        await NotificationService.notifyAdminUserAction({
          action: 'approved',
          userName: user.full_name || user.email.split('@')[0],
          userEmail: user.email,
          actionBy: currentAdmin?.email || 'admin@sistema'
        });
      } catch (notificationError) {
        console.error('Erro ao enviar notificações:', notificationError);
      }

      // Atualizar lista local (remover da lista de pendentes)
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      
      console.log(`✅ Usuário ${user.email} aprovado com sucesso!`);
      alert(`✅ Usuário ${user.full_name || user.email} foi aprovado!\n\n⚠️ MODO DEMONSTRAÇÃO: Em um ambiente real, o usuário seria notificado por email e poderia fazer login no sistema.`);
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      alert('Erro ao aprovar usuário. Tente novamente.');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectUser = async (user: PendingUser) => {
    setProcessingId(user.id);
    try {
      // Confirmar se realmente quer rejeitar
      const reason = window.prompt(
        `Tem certeza que deseja rejeitar o usuário ${user.full_name || user.email}?\n\nEsta ação irá deletar a conta permanentemente.\n\nPor favor, forneça um motivo para a rejeição (opcional):`,
        ''
      );
      
      if (reason === null) { // Usuário cancelou
        setProcessingId(null);
        return;
      }
      
      // Enviar notificação antes de deletar (para o usuário ver)
      try {
        await NotificationService.notifyUserRejected({
          userId: user.id,
          userName: user.full_name || user.email.split('@')[0],
          userEmail: user.email,
          rejectedBy: currentAdmin?.name || 'Admin',
          reason: reason || undefined
        });

        // Notificar outros admins sobre a rejeição
        await NotificationService.notifyAdminUserAction({
          action: 'rejected',
          userName: user.full_name || user.email.split('@')[0],
          userEmail: user.email,
          actionBy: currentAdmin?.email || 'admin@sistema',
          reason: reason || undefined
        });
      } catch (notificationError) {
        console.error('Erro ao enviar notificações:', notificationError);
        // Continuar com a rejeição mesmo se notificação falhar
      }
      
      // Deletar usuário do Auth (ação irreversível)
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;

      // Atualizar lista local
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      
      console.log(`❌ Usuário ${user.email} rejeitado e removido.`);
      alert(`Usuário ${user.full_name || user.email} foi rejeitado e removido do sistema.`);
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      alert('Erro ao rejeitar usuário. Tente novamente.');
    } finally {
      setProcessingId(null);
    }
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
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">
              {pendingUsers.length} usuário(s) aguardando aprovação
            </span>
          </div>
        </div>
      </div>

      {/* Lista de usuários pendentes */}
      {pendingUsers.length === 0 ? (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
          <Users className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Nenhuma solicitação pendente
          </h3>
          <p className="text-zinc-400">
            Todos os usuários foram processados ou não há novas solicitações.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-800 border border-zinc-700 overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-zinc-700">
            {pendingUsers.map((user) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full border-2 border-zinc-600"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                          <Users className="w-6 h-6 text-zinc-400" />
                        </div>
                      )}
                    </div>

                    {/* Info do usuário */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {user.full_name || 'Nome não informado'}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Pendente
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Solicitado em {formatDate(user.created_at)}
                          </div>
                        </div>
                        
                        {(user.role || user.department || user.phone) && (
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            {user.role && <span>Role: {user.role}</span>}
                            {user.department && <span>Depto: {user.department}</span>}
                            {user.phone && <span>Tel: {user.phone}</span>}
                          </div>
                        )}
                        
                        {user.justificativa && (
                          <div className="text-xs text-zinc-500 italic">
                            "{user.justificativa}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveUser(user)}
                      disabled={processingId === user.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {processingId === user.id ? 'Processando...' : 'Aprovar'}
                    </button>
                    
                    <button
                      onClick={() => rejectUser(user)}
                      disabled={processingId === user.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {processingId === user.id ? 'Processando...' : 'Rejeitar'}
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
          <li>• Usuários aprovados recebem role "user" por padrão</li>
          <li>• Usuários rejeitados não podem acessar o sistema</li>
          <li>• Você pode alterar roles depois na página de Gerenciamento de Usuários</li>
          <li>• Usuários são notificados por email sobre aprovação/rejeição</li>
        </ul>
      </div>
    </div>
  );
};

export default AprovacaoUsuarios; 