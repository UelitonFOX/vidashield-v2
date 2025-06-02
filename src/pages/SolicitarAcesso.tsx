import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import { Shield, Send, AlertTriangle, Mail, User, Building, Phone, FileText } from 'lucide-react';

const SolicitarAcesso: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [solicitado, setSolicitado] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.user_metadata?.full_name || '',
    departamento: '',
    telefone: '',
    justificativa: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Tentar inserir na tabela pending_users (se existir) ou simular
      try {
        await supabase
          .from('pending_users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: formData.nome,
            department: formData.departamento,
            phone: formData.telefone,
            justificativa: formData.justificativa,
            status: 'pending',
            created_at: new Date().toISOString()
          });
      } catch (dbError) {
        console.log('Tabela pending_users não encontrada, enviando dados via metadata');
        
        // Atualizar metadados do usuário no auth
        await supabase.auth.updateUser({
          data: {
            full_name: formData.nome,
            department: formData.departamento,
            phone: formData.telefone,
            justificativa: formData.justificativa,
            access_requested: true,
            request_date: new Date().toISOString()
          }
        });
      }

      // Notificar admins (tentar criar notificação)
      try {
        const { data: admins } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('role', 'admin')
          .eq('status', 'active');

        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            type: 'auth',
            title: 'Nova Solicitação de Acesso',
            message: `${formData.nome || user.email} solicitou acesso ao sistema.`,
            severity: 'media',
            user_id: admin.id,
            metadata: {
              pending_user_id: user.id,
              pending_user_email: user.email,
              pending_user_name: formData.nome,
              department: formData.departamento,
              phone: formData.telefone,
              justificativa: formData.justificativa,
              requested_at: new Date().toISOString()
            },
            action_url: '/aprovacao-usuarios'
          }));

          await supabase
            .from('notifications')
            .insert(notifications);
        }
      } catch (notificationError) {
        console.error('Erro ao criar notificações:', notificationError);
        // Continuar mesmo se notificação falhar
      }

      setSolicitado(true);
    } catch (error) {
      console.error('Erro ao solicitar acesso:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (solicitado) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-800 rounded-2xl p-8 text-center border border-green-500/30">
          <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-green-400 mb-4">✅ Solicitação Enviada!</h2>
          
          <p className="text-zinc-300 mb-6 leading-relaxed">
            Sua solicitação de acesso foi enviada para os administradores do sistema. 
            Você será notificado por email quando sua conta for aprovada.
          </p>
          
          <div className="bg-zinc-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-zinc-400 mb-2">Dados enviados:</p>
            <p className="text-green-400 font-semibold">{formData.nome || user?.email}</p>
            <p className="text-sm text-zinc-500 mt-1">{user?.email}</p>
            {formData.departamento && (
              <p className="text-sm text-zinc-500">{formData.departamento}</p>
            )}
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-sm font-medium">⏱️ Próximos Passos</p>
            <p className="text-blue-300 text-xs mt-1">
              • Os administradores analisarão sua solicitação<br/>
              • Você receberá um email com o resultado<br/>
              • Após aprovação, poderá acessar o sistema normalmente
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Fazer Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-800 rounded-2xl p-8 border border-zinc-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">🔐 Solicitar Acesso</h1>
          
          <p className="text-zinc-300 leading-relaxed">
            Sua conta foi autenticada com sucesso, mas você precisa solicitar acesso 
            ao sistema VidaShield. Preencha os dados abaixo:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email (Autenticado)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-lg text-zinc-300 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Departamento/Área
            </label>
            <input
              type="text"
              value={formData.departamento}
              onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: TI, Segurança, Compliance..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Telefone
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Justificativa (Obrigatório)
            </label>
            <textarea
              value={formData.justificativa}
              onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Por que você precisa de acesso ao VidaShield? Descreva sua função e necessidade de acesso..."
              required
            />
          </div>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-400 text-sm font-medium">⚠️ Importante</p>
            <p className="text-amber-300 text-xs mt-1">
              • Apenas funcionários autorizados podem acessar o sistema<br/>
              • Suas informações serão verificadas pelos administradores<br/>
              • O processo de aprovação pode levar até 24 horas
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.justificativa.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Solicitar Acesso
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SolicitarAcesso; 