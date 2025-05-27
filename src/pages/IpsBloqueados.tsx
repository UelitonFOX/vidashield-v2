import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  Eye,
  FileText,
  TrendingUp,
  Zap,
  Globe,
  MapPin,
  Unlock,
  Plus,
  Calendar,
  Activity,
  Ban,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BlockedIP {
  id: string
  ip_address: string
  reason: string  // Campo real da tabela
  motivo?: string  // Alias para compatibilidade 
  pais?: string
  cidade?: string
  data_bloqueio?: string
  ativo?: boolean
  attempts_count?: number  // Campo real da tabela
  tentativas_bloqueadas?: number  // Alias para compatibilidade
  last_attempt?: string  // Campo real da tabela
  ultima_tentativa?: string  // Alias para compatibilidade
  created_at: string
  updated_at?: string
  is_permanent?: boolean
  metadata?: any
}

interface FilterState {
  search: string
  motivo: string
  pais: string
  ativo: string
  dateFrom: string
  dateTo: string
}

interface NovoIpForm {
  ip_address: string
  motivo: string
  pais: string
  cidade: string
}

const IpsBloqueados: React.FC = () => {
  const [blockedIps, setBlockedIps] = useState<BlockedIP[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIp, setSelectedIp] = useState<BlockedIP | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [novoIp, setNovoIp] = useState<NovoIpForm>({
    ip_address: '',
    motivo: '',
    pais: '',
    cidade: ''
  })
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    motivo: '',
    pais: '',
    ativo: '',
    dateFrom: '',
    dateTo: ''
  })

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = blockedIps.length
    const ativos = blockedIps.filter(ip => ip.ativo).length
    const inativos = blockedIps.filter(ip => !ip.ativo).length
    const hoje = blockedIps.filter(ip => {
      if (!ip.data_bloqueio) return false
      const today = new Date().toISOString().split('T')[0]
      return ip.data_bloqueio.split('T')[0] === today
    }).length
    const paisesUnicos = new Set(blockedIps.map(ip => ip.pais).filter(Boolean)).size
    const totalTentativas = blockedIps.reduce((sum, ip) => sum + (ip.attempts_count || ip.tentativas_bloqueadas || 0), 0)
    const ultimasSemana = blockedIps.filter(ip => {
      if (!ip.data_bloqueio) return false
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return new Date(ip.data_bloqueio) >= sevenDaysAgo
    }).length

    return {
      total,
      ativos,
      inativos,
      hoje,
      paisesUnicos,
      totalTentativas,
      ultimasSemana
    }
  }, [blockedIps])

  // Buscar IPs bloqueados
  const fetchBlockedIps = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      setBlockedIps(data || [])
    } catch (error) {
      console.error('Erro ao buscar IPs bloqueados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockedIps()
  }, [])

  // Filtrar IPs
  const filteredIps = useMemo(() => {
    return blockedIps.filter(ip => {
      const matchesSearch = 
        (ip.ip_address || '').includes(filters.search) ||
        (ip.reason || ip.motivo || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (ip.pais || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (ip.cidade || '').toLowerCase().includes(filters.search.toLowerCase())

      const matchesMotivo = !filters.motivo || (ip.reason || ip.motivo) === filters.motivo
      const matchesPais = !filters.pais || ip.pais === filters.pais
      const matchesAtivo = !filters.ativo || (filters.ativo === 'true' ? ip.ativo : !ip.ativo)

      const ipDate = ip.data_bloqueio ? new Date(ip.data_bloqueio) : null
      const matchesDateFrom = !filters.dateFrom || (ipDate && ipDate >= new Date(filters.dateFrom))
      const matchesDateTo = !filters.dateTo || (ipDate && ipDate <= new Date(filters.dateTo))

      return matchesSearch && matchesMotivo && matchesPais && 
             matchesAtivo && matchesDateFrom && matchesDateTo
    })
  }, [blockedIps, filters])

  // Ações do IP
  const handleIpAction = async (ipId: string, action: 'unblock' | 'block') => {
    setActionLoading(ipId)
    try {
      const updateData = {
        ativo: action === 'block',
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('blocked_ips')
        .update(updateData)
        .eq('id', ipId)

      if (error) throw error

      // Atualizar estado local
      setBlockedIps(prev => prev.map(ip => 
        ip.id === ipId 
          ? { ...ip, ...updateData }
          : ip
      ))

      // Fechar modal se estiver aberto
      if (selectedIp?.id === ipId) {
        setSelectedIp(prev => prev ? { ...prev, ...updateData } : null)
      }

    } catch (error) {
      console.error('Erro ao atualizar IP:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Adicionar novo IP
  const handleAddIp = async () => {
    if (!novoIp.ip_address || !novoIp.motivo) {
      alert('IP e motivo são obrigatórios')
      return
    }

    try {
      const newIpData = {
        ip_address: novoIp.ip_address,
        reason: novoIp.motivo,
        pais: novoIp.pais || null,
        cidade: novoIp.cidade || null,
        data_bloqueio: new Date().toISOString(),
        ativo: true,
        attempts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_permanent: false
      }

      const { data, error } = await supabase
        .from('blocked_ips')
        .insert([newIpData])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setBlockedIps(prev => [data[0], ...prev])
        setNovoIp({ ip_address: '', motivo: '', pais: '', cidade: '' })
        setShowAddForm(false)
      }

    } catch (error) {
      console.error('Erro ao adicionar IP:', error)
      alert('Erro ao adicionar IP. Verifique se o IP não está duplicado.')
    }
  }

  // Exportar para CSV
  const exportToCSV = () => {
    if (filteredIps.length === 0) {
      alert('Nenhum IP para exportar')
      return
    }

    const csvData = filteredIps.map(ip => ({
      'Data/Hora': ip.data_bloqueio ? format(new Date(ip.data_bloqueio), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : 'N/A',
      'IP': ip.ip_address || '',
      'Motivo': ip.reason || ip.motivo || '',
      'País': ip.pais || '',
      'Cidade': ip.cidade || '',
      'Status': ip.ativo ? 'Ativo' : 'Inativo',
      'Tentativas Bloqueadas': ip.attempts_count || ip.tentativas_bloqueadas || 0,
      'Última Tentativa': (ip.last_attempt || ip.ultima_tentativa) ? format(new Date(ip.last_attempt || ip.ultima_tentativa!), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : 'N/A'
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ips-bloqueados-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Obter países únicos para o filtro
  const uniqueCountries = useMemo(() => {
    const countries = blockedIps.map(ip => ip.pais).filter(Boolean)
    return [...new Set(countries)].sort()
  }, [blockedIps])

  // Obter motivos únicos para o filtro
  const uniqueReasons = useMemo(() => {
    const reasons = blockedIps.map(ip => ip.reason || ip.motivo).filter(Boolean)
    return [...new Set(reasons)].sort()
  }, [blockedIps])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">IPs Bloqueados</h1>
          <p className="text-zinc-400">Gerencie e monitore todos os endereços IP bloqueados pelo sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar IP
          </button>
          <button
            onClick={fetchBlockedIps}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Total</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-400">Ativos</span>
          </div>
          <p className="text-xl font-bold text-red-400">{stats.ativos}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Unlock className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-400">Desbloqueados</span>
          </div>
          <p className="text-xl font-bold text-green-400">{stats.inativos}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-400">Hoje</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats.hoje}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400">Países</span>
          </div>
          <p className="text-xl font-bold text-purple-400">{stats.paisesUnicos}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-zinc-400">Tentativas</span>
          </div>
          <p className="text-xl font-bold text-orange-400">{stats.totalTentativas}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-zinc-400">Última Semana</span>
          </div>
          <p className="text-xl font-bold text-cyan-400">{stats.ultimasSemana}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="IP, motivo, país, cidade..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
              />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Motivo
            </label>
            <select
              value={filters.motivo}
              onChange={(e) => setFilters({ ...filters, motivo: e.target.value })}
              title="Filtrar por motivo do bloqueio"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            >
              <option value="">Todos</option>
              {uniqueReasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* País */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              País
            </label>
            <select
              value={filters.pais}
              onChange={(e) => setFilters({ ...filters, pais: e.target.value })}
              title="Filtrar por país"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            >
              <option value="">Todos</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Status
            </label>
            <select
              value={filters.ativo}
              onChange={(e) => setFilters({ ...filters, ativo: e.target.value })}
              title="Filtrar por status do bloqueio"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Desbloqueado</option>
            </select>
          </div>

          {/* Data From */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              title="Selecionar data inicial para filtro"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            />
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-zinc-400">Filtros rápidos:</span>
          <button
            onClick={() => setFilters({ ...filters, ativo: 'true' })}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Apenas Ativos
          </button>
          <button
            onClick={() => setFilters({ ...filters, ativo: 'false' })}
            className="px-3 py-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            Desbloqueados
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setFilters({ ...filters, dateFrom: today, dateTo: today })
            }}
            className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => setFilters({
              search: '',
              motivo: '',
              pais: '',
              ativo: '',
              dateFrom: '',
              dateTo: ''
            })}
            className="px-3 py-1 text-xs bg-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-500 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela de IPs */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-700/50 border-b border-zinc-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Data Bloqueio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Tentativas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
                      <span className="text-zinc-400">Carregando IPs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredIps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Nenhum IP encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredIps.map((ip) => (
                  <tr
                    key={ip.id}
                    className="hover:bg-zinc-700/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedIp(ip)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-white font-mono">{ip.ip_address}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-300">{ip.reason || ip.motivo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-zinc-300">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {ip.cidade ? `${ip.cidade}, ` : ''}{ip.pais || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ip.ativo 
                          ? 'text-red-400 bg-red-500/20' 
                          : 'text-green-400 bg-green-500/20'
                      }`}>
                        {ip.ativo ? 'Bloqueado' : 'Desbloqueado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {ip.data_bloqueio ? (
                        <>
                          {format(new Date(ip.data_bloqueio), 'dd/MM/yyyy', { locale: ptBR })}
                          <br />
                          <span className="text-xs text-zinc-500">
                            {format(new Date(ip.data_bloqueio), 'HH:mm:ss', { locale: ptBR })}
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-500">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-300">{ip.attempts_count || ip.tentativas_bloqueadas || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIp(ip)
                          }}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {ip.ativo ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIpAction(ip.id, 'unblock')
                            }}
                            disabled={actionLoading === ip.id}
                            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                            title="Desbloquear IP"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIpAction(ip.id, 'block')
                            }}
                            disabled={actionLoading === ip.id}
                            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            title="Bloquear IP novamente"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div>
          Mostrando {filteredIps.length} de {blockedIps.length} IPs
        </div>
        <div className="text-xs">
          Última atualização: {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedIp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-xl border border-zinc-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Detalhes do IP Bloqueado</h3>
                <button
                  onClick={() => setSelectedIp(null)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      IP Address
                    </label>
                    <p className="text-white font-mono text-lg">{selectedIp.ip_address}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedIp.ativo 
                        ? 'text-red-400 bg-red-500/20' 
                        : 'text-green-400 bg-green-500/20'
                    }`}>
                      {selectedIp.ativo ? 'Bloqueado' : 'Desbloqueado'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Motivo do Bloqueio
                  </label>
                  <p className="text-white">{selectedIp.reason || selectedIp.motivo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      País
                    </label>
                    <p className="text-white">{selectedIp.pais || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Cidade
                    </label>
                    <p className="text-white">{selectedIp.cidade || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Data do Bloqueio
                    </label>
                    <p className="text-white">
                      {selectedIp.data_bloqueio ? 
                        format(new Date(selectedIp.data_bloqueio), 'dd/MM/yyyy às HH:mm:ss', { locale: ptBR }) :
                        'N/A'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Tentativas Bloqueadas
                    </label>
                    <p className="text-white">{selectedIp.attempts_count || selectedIp.tentativas_bloqueadas || 0}</p>
                  </div>
                </div>

                {(selectedIp.last_attempt || selectedIp.ultima_tentativa) && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Última Tentativa
                    </label>
                    <p className="text-white">
                      {format(new Date(selectedIp.last_attempt || selectedIp.ultima_tentativa!), 'dd/MM/yyyy às HH:mm:ss', { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-zinc-700">
                <div className="flex gap-2">
                  {selectedIp.ativo ? (
                    <button
                      onClick={() => handleIpAction(selectedIp.id, 'unblock')}
                      disabled={actionLoading === selectedIp.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Desbloquear IP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleIpAction(selectedIp.id, 'block')}
                      disabled={actionLoading === selectedIp.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Bloquear Novamente
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedIp(null)}
                  className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar IP */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-xl border border-zinc-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Adicionar IP Bloqueado</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    IP Address *
                  </label>
                  <input
                    type="text"
                    placeholder="192.168.1.1"
                    value={novoIp.ip_address}
                    onChange={(e) => setNovoIp({ ...novoIp, ip_address: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Motivo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Atividade suspeita"
                    value={novoIp.motivo}
                    onChange={(e) => setNovoIp({ ...novoIp, motivo: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      País
                    </label>
                    <input
                      type="text"
                      placeholder="Brasil"
                      value={novoIp.pais}
                      onChange={(e) => setNovoIp({ ...novoIp, pais: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      placeholder="São Paulo"
                      value={novoIp.cidade}
                      onChange={(e) => setNovoIp({ ...novoIp, cidade: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-zinc-700">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddIp}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Adicionar IP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IpsBloqueados 