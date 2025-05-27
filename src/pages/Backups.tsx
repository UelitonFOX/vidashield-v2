import React, { useState, useEffect } from 'react'
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Play, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  HardDrive,
  Calendar,
  Archive,
  RotateCcw,
  Plus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BackupService, BackupData, BackupConfig } from '../services/backupService'

const Backups: React.FC = () => {
  const [backups, setBackups] = useState<BackupData[]>([])
  const [config, setConfig] = useState<BackupConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'config'>('list')
  const [selectedType, setSelectedType] = useState<'full' | 'incremental' | 'differential'>('full')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [backupsData, configData] = await Promise.all([
        BackupService.getBackups(),
        BackupService.getBackupConfig()
      ])
      setBackups(backupsData)
      setConfig(configData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    setCreating(true)
    try {
      await BackupService.createBackup(selectedType)
      await loadData()
    } catch (error) {
      console.error('Erro ao criar backup:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Tem certeza que deseja restaurar este backup? Esta ação irá sobrescrever os dados atuais.')) {
      return
    }

    try {
      await BackupService.restoreBackup(backupId)
      await loadData()
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este backup?')) {
      return
    }

    try {
      await BackupService.deleteBackup(backupId)
      await loadData()
    } catch (error) {
      console.error('Erro ao excluir backup:', error)
    }
  }

  const handleSaveConfig = async () => {
    if (!config) return

    try {
      await BackupService.saveBackupConfig(config)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'incremental':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'differential':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatBackupType = (type: string) => {
    switch (type) {
      case 'full': return 'Completo'
      case 'incremental': return 'Incremental'
      case 'differential': return 'Diferencial'
      default: return type
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'running': return 'Em execução'
      case 'failed': return 'Falhou'
      case 'pending': return 'Pendente'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="ml-2 text-white">Carregando backups...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-cyan-400" />
            Sistema de Backup
          </h1>
          <p className="text-zinc-400 mt-1">
            Gerencie backups e configurações de segurança dos dados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Archive className="w-4 h-4 inline mr-2" />
              Backups
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === 'config'
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Configurações
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Criar Novo Backup</h3>
            <div className="flex items-center gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                title="Selecionar tipo de backup"
              >
                <option value="full">Backup Completo</option>
                <option value="incremental">Backup Incremental</option>
                <option value="differential">Backup Diferencial</option>
              </select>
              
              <button
                onClick={handleCreateBackup}
                disabled={creating}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {creating ? 'Criando...' : 'Criar Backup'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total de Backups</p>
                  <p className="text-2xl font-bold text-white">{backups.length}</p>
                </div>
                <Archive className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Concluídos</p>
                  <p className="text-2xl font-bold text-green-400">
                    {backups.filter(b => b.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Em Execução</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {backups.filter(b => b.status === 'running').length}
                  </p>
                </div>
                <Loader2 className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Espaço Total</p>
                  <p className="text-2xl font-bold text-white">
                    {backups
                      .filter(b => b.size)
                      .reduce((total, b) => total + parseInt(b.size?.split(' ')[0] || '0'), 0)} MB
                  </p>
                </div>
                <HardDrive className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Backups List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Lista de Backups</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Nome</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Tipo</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Tamanho</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Data</th>
                    <th className="text-left px-6 py-3 text-zinc-300 font-medium">Duração</th>
                    <th className="text-right px-6 py-3 text-zinc-300 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr key={backup.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{backup.name}</div>
                        {backup.file_path && (
                          <div className="text-zinc-400 text-sm">{backup.file_path}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(backup.type)}`}>
                          {formatBackupType(backup.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(backup.status)}
                          <span className="text-white">{formatStatus(backup.status)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {backup.size || '-'}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {formatDistanceToNow(new Date(backup.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {backup.duration || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {backup.status === 'completed' && (
                            <>
                              <button
                                onClick={() => handleRestoreBackup(backup.id)}
                                className="p-2 text-zinc-400 hover:text-green-400 transition-colors"
                                title="Restaurar backup"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-zinc-400 hover:text-blue-400 transition-colors"
                                title="Download backup"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Excluir backup"
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
      ) : (
        // Configurações Tab
        config && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Configurações de Backup</h3>
              
              <div className="space-y-6">
                {/* Backup Automático */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Backup Automático</label>
                    <p className="text-zinc-400 text-sm">Executar backups automaticamente</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                                         <input
                       type="checkbox"
                       checked={config.auto_backup}
                       onChange={(e) => setConfig({ ...config, auto_backup: e.target.checked })}
                       className="sr-only peer"
                       title="Ativar backup automático"
                     />
                    <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                {/* Intervalo */}
                <div>
                  <label className="block text-white font-medium mb-2">Intervalo de Backup</label>
                                     <select
                     value={config.interval}
                     onChange={(e) => setConfig({ ...config, interval: e.target.value as any })}
                     className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                     title="Intervalo de backup"
                   >
                    <option value="hourly">A cada hora</option>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>

                {/* Retenção */}
                <div>
                  <label className="block text-white font-medium mb-2">Retenção (dias)</label>
                                     <input
                     type="number"
                     value={config.retention_days}
                     onChange={(e) => setConfig({ ...config, retention_days: parseInt(e.target.value) })}
                     className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                     min="1"
                     max="365"
                     title="Dias de retenção de backup"
                     placeholder="30"
                   />
                </div>

                {/* O que incluir */}
                <div>
                  <label className="block text-white font-medium mb-4">Incluir no Backup</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.include_user_data}
                        onChange={(e) => setConfig({ ...config, include_user_data: e.target.checked })}
                        className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-700 rounded focus:ring-cyan-500"
                      />
                      <span className="ml-2 text-white">Dados de usuários</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.include_logs}
                        onChange={(e) => setConfig({ ...config, include_logs: e.target.checked })}
                        className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-700 rounded focus:ring-cyan-500"
                      />
                      <span className="ml-2 text-white">Logs do sistema</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.include_settings}
                        onChange={(e) => setConfig({ ...config, include_settings: e.target.checked })}
                        className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-700 rounded focus:ring-cyan-500"
                      />
                      <span className="ml-2 text-white">Configurações</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.compress}
                        onChange={(e) => setConfig({ ...config, compress: e.target.checked })}
                        className="w-4 h-4 text-cyan-600 bg-zinc-800 border-zinc-700 rounded focus:ring-cyan-500"
                      />
                      <span className="ml-2 text-white">Compactar arquivo</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveConfig}
                    className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default Backups 