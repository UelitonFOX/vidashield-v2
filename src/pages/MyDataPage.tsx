import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Download, 
  Trash2, 
  FileText, 
  Eye, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Database,
  History,
  Settings,
  Lock,
  ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LGPDService, UserLGPDData, LGPDDataRequest } from '../services/lgpdService'
import PremiumLayout from '../components/ui/PremiumLayout'
import PremiumHeader from '../components/ui/PremiumHeader'
import { Modal } from '../components/Modal'

const MyDataPage: React.FC = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<UserLGPDData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [deleteJustification, setDeleteJustification] = useState('')
  const [requestType, setRequestType] = useState('')
  const [requestDescription, setRequestDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const data = await LGPDService.getUserLGPDData()
      setUserData(data)
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const blob = await LGPDService.exportUserData()
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `VidaShield_MeusDados_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        // Recarregar dados para atualizar última exportação
        await loadUserData()
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
    }
  }

  const handleCreateRequest = async () => {
    if (!requestType || !requestDescription.trim()) return

    setIsSubmitting(true)
    try {
      await LGPDService.createDataRequest(requestType, requestDescription)
      setShowRequestModal(false)
      setRequestType('')
      setRequestDescription('')
      await loadUserData()
    } catch (error) {
      console.error('Erro ao criar solicitação:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteJustification.trim()) return

    setIsSubmitting(true)
    try {
      await LGPDService.requestAccountDeletion(deleteJustification)
      setShowDeleteModal(false)
      setDeleteJustification('')
      await loadUserData()
    } catch (error) {
      console.error('Erro ao solicitar exclusão:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10'
      case 'processing': return 'text-blue-400 bg-blue-500/10'
      case 'pending': return 'text-yellow-400 bg-yellow-500/10'
      case 'rejected': return 'text-red-400 bg-red-500/10'
      default: return 'text-zinc-400 bg-zinc-500/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Clock className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'data', label: 'Meus Dados', icon: Database },
    { id: 'requests', label: 'Solicitações', icon: FileText },
    { id: 'consent', label: 'Consentimentos', icon: Shield },
    { id: 'audit', label: 'Histórico', icon: History }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-300">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  return (
    <PremiumLayout
      header={
        <PremiumHeader title="Meus Dados" />
      }
    >
      <div className="space-y-6">
        
        {/* Header com Ações Rápidas */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/20 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Portal de Dados Pessoais</h1>
              <p className="text-zinc-300 max-w-2xl">
                Gerencie seus dados pessoais de acordo com a LGPD. Aqui você pode visualizar, 
                exportar, corrigir ou solicitar a exclusão dos seus dados.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar Dados
              </button>
              
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Nova Solicitação
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-zinc-800/50 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && userData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Estatísticas */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card-dark p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Consentimentos</p>
                        <p className="text-lg font-semibold text-green-400">{userData.consent_logs.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-dark p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Solicitações</p>
                        <p className="text-lg font-semibold text-blue-400">{userData.data_requests.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-dark p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <History className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">Atividades</p>
                        <p className="text-lg font-semibold text-purple-400">{userData.audit_trail.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo do Perfil */}
                <div className="card-dark p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Resumo do Perfil</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Email:</span>
                      <span className="text-zinc-200">{userData.profile?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Nome:</span>
                      <span className="text-zinc-200">{userData.profile?.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Consentimento LGPD:</span>
                      <span className={userData.profile?.lgpd_consent_date ? 'text-green-400' : 'text-red-400'}>
                        {userData.profile?.lgpd_consent_date ? 'Concedido' : 'Pendente'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Última Exportação:</span>
                      <span className="text-zinc-200">
                        {userData.profile?.last_data_export 
                          ? new Date(userData.profile.last_data_export).toLocaleDateString('pt-BR')
                          : 'Nunca'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="space-y-4">
                <div className="card-dark p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Seus Direitos LGPD</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setRequestType('access')
                        setRequestDescription('Solicitação de acesso aos meus dados pessoais conforme LGPD Art. 18')
                        setShowRequestModal(true)
                      }}
                      className="w-full p-3 text-left rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">Acessar Dados</p>
                          <p className="text-xs text-zinc-400">Ver todos os seus dados</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setRequestType('portability')
                        setRequestDescription('Solicitação de portabilidade dos meus dados pessoais')
                        setShowRequestModal(true)
                      }}
                      className="w-full p-3 text-left rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">Portabilidade</p>
                          <p className="text-xs text-zinc-400">Transferir seus dados</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setRequestType('correction')
                        setRequestDescription('Solicitação de correção de dados pessoais')
                        setShowRequestModal(true)
                      }}
                      className="w-full p-3 text-left rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-yellow-400" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">Corrigir Dados</p>
                          <p className="text-xs text-zinc-400">Atualizar informações</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full p-3 text-left rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <div>
                          <p className="text-sm font-medium text-red-300">Excluir Conta</p>
                          <p className="text-xs text-red-400">Deletar todos os dados</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Link para Política de Privacidade */}
                <div className="card-dark p-4">
                  <h4 className="font-medium text-zinc-200 mb-2">Documentos</h4>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Política de Privacidade
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && userData && (
            <div className="space-y-6">
              <div className="card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Seus Dados Pessoais</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <h4 className="font-medium text-zinc-200 mb-2">Perfil</h4>
                    <pre className="text-xs text-zinc-300 overflow-x-auto">
                      {JSON.stringify(userData.profile, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <h4 className="font-medium text-zinc-200 mb-2">Notificações ({userData.notifications?.length || 0})</h4>
                    <p className="text-sm text-zinc-400">Suas notificações e alertas do sistema</p>
                  </div>
                  
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <h4 className="font-medium text-zinc-200 mb-2">Logs de Autenticação ({userData.auth_logs?.length || 0})</h4>
                    <p className="text-sm text-zinc-400">Histórico de acessos à sua conta</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && userData && (
            <div className="space-y-6">
              <div className="card-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Minhas Solicitações</h3>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="btn-primary"
                  >
                    Nova Solicitação
                  </button>
                </div>
                
                <div className="space-y-3">
                  {userData.data_requests.length === 0 ? (
                    <p className="text-zinc-400 text-center py-8">
                      Nenhuma solicitação encontrada
                    </p>
                  ) : (
                    userData.data_requests.map((request) => (
                      <div key={request.id} className="p-4 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                {request.status.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-zinc-200">
                                {request.request_type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-300 mb-2">{request.description}</p>
                            <div className="flex items-center gap-4 text-xs text-zinc-400">
                              <span>Criado: {new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
                              {request.deadline_date && (
                                <span>Prazo: {new Date(request.deadline_date).toLocaleDateString('pt-BR')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Consent Tab */}
          {activeTab === 'consent' && userData && (
            <div className="space-y-6">
              <div className="card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Histórico de Consentimentos</h3>
                <div className="space-y-3">
                  {userData.consent_logs.map((consent) => (
                    <div key={consent.id} className="p-4 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {consent.consent_given ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="font-medium text-zinc-200">
                              {consent.consent_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400">
                            Versão: {consent.consent_version} • {new Date(consent.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          consent.consent_given ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {consent.consent_given ? 'CONCEDIDO' : 'NEGADO'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && userData && (
            <div className="space-y-6">
              <div className="card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Trilha de Auditoria</h3>
                <div className="space-y-3">
                  {userData.audit_trail.map((audit) => (
                    <div key={audit.id} className="p-4 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-zinc-200 mb-1">
                            {audit.action_type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-zinc-400">
                            Recurso: {audit.resource_type} • {new Date(audit.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <History className="w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Nova Solicitação */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Nova Solicitação LGPD"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Tipo de Solicitação
            </label>
                         <select
               value={requestType}
               onChange={(e) => setRequestType(e.target.value)}
               className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"
               title="Selecionar tipo de solicitação LGPD"
             >
              <option value="">Selecione um tipo</option>
              <option value="access">Acesso aos Dados</option>
              <option value="portability">Portabilidade dos Dados</option>
              <option value="correction">Correção de Dados</option>
              <option value="anonymization">Anonimização</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Descrição da Solicitação
            </label>
            <textarea
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              placeholder="Descreva detalhadamente sua solicitação..."
              className="w-full h-32 p-3 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowRequestModal(false)}
              className="btn-secundario"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateRequest}
              disabled={isSubmitting || !requestType || !requestDescription.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando...' : 'Criar Solicitação'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Exclusão de Conta */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Excluir Conta"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-300 mb-1">Ação Irreversível</h4>
                <p className="text-sm text-red-200">
                  Esta ação irá excluir permanentemente sua conta e todos os dados associados. 
                  Esta operação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Justificativa para Exclusão (opcional)
            </label>
            <textarea
              value={deleteJustification}
              onChange={(e) => setDeleteJustification(e.target.value)}
              placeholder="Por favor, informe o motivo da exclusão da conta..."
              className="w-full h-24 p-3 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secundario"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processando...' : 'Confirmar Exclusão'}
            </button>
          </div>
        </div>
      </Modal>
    </PremiumLayout>
  )
}

export default MyDataPage 