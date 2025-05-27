import React, { useState, useEffect } from 'react'
import { 
  Lock, 
  Shield, 
  Users, 
  Settings, 
  Activity, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Globe,
  Key,
  Monitor,
  Database,
  Loader2,
  Filter,
  Search
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  AccessControlService, 
  AccessResource, 
  AccessPolicy, 
  AccessLog, 
  AccessStats 
} from '../services/accessControlService'

type TabType = 'resources' | 'policies' | 'logs' | 'overview'

const AccessControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AccessStats | null>(null)
  const [resources, setResources] = useState<AccessResource[]>([])
  const [policies, setPolicies] = useState<AccessPolicy[]>([])
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, resourcesData, policiesData, logsData] = await Promise.all([
        AccessControlService.getAccessStats(),
        AccessControlService.getAccessResources(),
        AccessControlService.getAccessPolicies(),
        AccessControlService.getAccessLogs(50)
      ])
      
      setStats(statsData)
      setResources(resourcesData)
      setPolicies(policiesData)
      setLogs(logsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleResource = async (id: string, currentStatus: boolean) => {
    await AccessControlService.updateAccessResource(id, { is_active: !currentStatus })
    await loadData()
  }

  const handleTogglePolicy = async (id: string, currentStatus: boolean) => {
    await AccessControlService.updateAccessPolicy(id, { is_active: !currentStatus })
    await loadData()
  }

  const handleDeleteResource = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este recurso?')) {
      await AccessControlService.deleteAccessResource(id)
      await loadData()
    }
  }

  const handleDeletePolicy = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta política?')) {
      await AccessControlService.deleteAccessPolicy(id)
      await loadData()
    }
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <Monitor className="w-4 h-4" />
      case 'api': return <Globe className="w-4 h-4" />
      case 'feature': return <Settings className="w-4 h-4" />
      case 'action': return <Key className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'role_based': return <Users className="w-4 h-4" />
      case 'ip_based': return <Globe className="w-4 h-4" />
      case 'time_based': return <Clock className="w-4 h-4" />
      case 'custom': return <Settings className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'allowed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'denied': return <XCircle className="w-4 h-4 text-red-400" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'moderator': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'user': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.resource_path.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPolicies = policies.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredLogs = logs.filter(l => 
    l.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.resource_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.request_path?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="ml-2 text-white">Carregando controle de acesso...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Lock className="w-8 h-8 text-cyan-400" />
            Controle de Acesso
          </h1>
          <p className="text-zinc-400 mt-1">
            Gerencie recursos, políticas e monitore acessos do sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'resources'
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Recursos
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'policies'
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Políticas
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Logs
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Recursos Ativos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.active_resources}/{stats.total_resources}
                  </p>
                </div>
                <Database className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Políticas Ativas</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.active_policies}/{stats.total_policies}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Acessos Permitidos</p>
                  <p className="text-2xl font-bold text-green-400">{stats.access_allowed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Acessos Negados</p>
                  <p className="text-2xl font-bold text-red-400">{stats.access_denied}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Recent Logs Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Atividade Recente</h3>
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getResultIcon(log.result)}
                    <div>
                      <p className="text-white font-medium">
                        {log.user_name || 'Usuário não identificado'}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {log.action} em {log.resource_name || log.request_path}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-sm">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                    <p className="text-zinc-500 text-xs">{log.ip_address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Recursos do Sistema</h3>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Recurso
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Recurso</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Tipo</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Caminho</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Role Necessária</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Status</th>
                    <th className="text-right px-6 py-3 text-zinc-300 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getResourceTypeIcon(resource.resource_type)}
                          <div>
                            <div className="text-white font-medium">{resource.name}</div>
                            {resource.description && (
                              <div className="text-zinc-400 text-sm">{resource.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium">
                          {resource.resource_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-mono text-sm">
                        {resource.resource_path}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 border rounded text-xs font-medium ${getRoleColor(resource.required_role)}`}>
                          {resource.required_role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleResource(resource.id, resource.is_active)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            resource.is_active
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {resource.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {resource.is_active ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-zinc-400 hover:text-cyan-400 transition-colors"
                            title="Editar recurso"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Excluir recurso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Políticas de Acesso</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Nova Política
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Política</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Tipo</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Prioridade</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Status</th>
                    <th className="text-right px-6 py-3 text-zinc-300 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map((policy) => (
                    <tr key={policy.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getPolicyTypeIcon(policy.policy_type)}
                          <div>
                            <div className="text-white font-medium">{policy.name}</div>
                            {policy.description && (
                              <div className="text-zinc-400 text-sm">{policy.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-medium">
                          {policy.policy_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-mono">{policy.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePolicy(policy.id, policy.is_active)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            policy.is_active
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {policy.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {policy.is_active ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-zinc-400 hover:text-cyan-400 transition-colors"
                            title="Editar política"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePolicy(policy.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Excluir política"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Logs de Acesso</h3>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Usuário</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Recurso</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Ação</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Resultado</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">IP</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">
                            {log.user_name || 'Não identificado'}
                          </div>
                          {log.user_email && (
                            <div className="text-zinc-400 text-sm">{log.user_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white">{log.resource_name || 'N/A'}</div>
                          <div className="text-zinc-400 text-sm font-mono">
                            {log.resource_path || log.request_path}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getResultIcon(log.result)}
                          <span className={`text-sm font-medium ${
                            log.result === 'allowed' ? 'text-green-400' :
                            log.result === 'denied' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {log.result === 'allowed' ? 'Permitido' :
                             log.result === 'denied' ? 'Negado' : 'Erro'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-mono text-sm">
                        {log.ip_address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessControl 