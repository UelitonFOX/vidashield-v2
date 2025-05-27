import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Shield, 
  Globe, 
  Smartphone, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  Timer,
  Database,
  Server,
  Loader2,
  Filter,
  Calendar,
  Download,
  Zap,
  Target
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import { 
  AnalyticsService, 
  AnalyticsData, 
  TrendData, 
  GeographicData, 
  DeviceStats, 
  PerformanceMetrics 
} from '../services/analyticsService'

type TabType = 'overview' | 'trends' | 'geography' | 'performance'
type PeriodType = '7d' | '30d' | '90d'

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [period, setPeriod] = useState<PeriodType>('7d')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [trendData, setTrendData] = useState<TrendData | null>(null)
  const [geographicData, setGeographicData] = useState<GeographicData[]>([])
  const [deviceStats, setDeviceStats] = useState<DeviceStats[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([])

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    setLoading(true)
    try {
      const [analytics, trends, geographic, devices, performance] = await Promise.all([
        AnalyticsService.getAnalyticsData(),
        AnalyticsService.getTrendData(period === '7d' ? 7 : period === '30d' ? 30 : 90),
        AnalyticsService.getGeographicData(),
        AnalyticsService.getDeviceStats(),
        AnalyticsService.getPerformanceMetrics()
      ])

      setAnalyticsData(analytics)
      setTrendData(trends)
      setGeographicData(geographic)
      setDeviceStats(devices)
      setPerformanceMetrics(performance)
    } catch (error) {
      console.error('Erro ao carregar dados de analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const handleExportData = () => {
    try {
      const exportData = {
        analytics: analyticsData,
        trends: trendData,
        geographic: geographicData,
        devices: deviceStats,
        performance: performanceMetrics,
        exportDate: new Date().toISOString(),
        period: period,
        activeTab: activeTab
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vidashield-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    }
  }

  const COLORS = ['#00d2d3', '#5352ed', '#ff9ff3', '#26de81', '#fd79a8', '#fdcb6e']

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-2" />
          <p className="text-zinc-400">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              Estatísticas Avançadas
            </h1>
            <p className="text-zinc-400 mt-1">Análise detalhada de métricas e performance do sistema</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <div className="flex bg-zinc-800 rounded-lg p-1">
              {(['7d', '30d', '90d'] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-cyan-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                </button>
              ))}
            </div>

            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mt-6">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'trends', label: 'Tendências', icon: LineChart },
            { id: 'geography', label: 'Geografia', icon: Globe },
            { id: 'performance', label: 'Performance', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && analyticsData && (
          <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Usuários Totais</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.totalUsers)}</p>
                    <p className="text-green-400 text-xs mt-1">+{analyticsData.newUsersToday} hoje</p>
                  </div>
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Logins</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.totalLogins)}</p>
                    <p className="text-green-400 text-xs mt-1">{analyticsData.loginsToday} hoje</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Ameaças</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.totalThreats}</p>
                    <p className="text-red-400 text-xs mt-1">{analyticsData.threatsToday} hoje</p>
                  </div>
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Score Segurança</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.securityScore}%</p>
                    <p className="text-green-400 text-xs mt-1">+2.3% esta semana</p>
                  </div>
                  <Target className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Stats */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  Dispositivos
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        dataKey="count"
                        data={deviceStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                      >
                        {deviceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient${index % COLORS.length})`} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #27272a', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {deviceStats.map((device, index) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-zinc-300">{device.device}</span>
                      </div>
                      <span className="text-white font-medium">{device.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Metrics */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  Métricas do Sistema
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-zinc-300">Uptime</span>
                    <span className="text-green-400 font-medium">{analyticsData.systemUptime}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-zinc-300">Tempo Resposta</span>
                    <span className="text-cyan-400 font-medium">{analyticsData.avgResponseTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-zinc-300">Dados Processados</span>
                    <span className="text-purple-400 font-medium">{analyticsData.dataProcessed}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-zinc-300">IPs Bloqueados</span>
                    <span className="text-red-400 font-medium">{analyticsData.blockedIPs}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && trendData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users Trend */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Novos Usuários</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData.users}>
                      <defs>
                        <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00d2d3" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00d2d3" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #27272a', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00d2d3" 
                        fillOpacity={1} 
                        fill="url(#usersGradient)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Logins Trend */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Logins Diários</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.logins}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #27272a', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Bar dataKey="value" fill="#26de81" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Threats Trend */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ameaças Detectadas</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={trendData.threats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #27272a', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ff4757" 
                        strokeWidth={3}
                        dot={{ fill: '#ff4757', strokeWidth: 2, r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Alerts Trend */}
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Alertas Criados</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData.alerts}>
                      <defs>
                        <linearGradient id="alertsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffa502" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffa502" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #27272a', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ffa502" 
                        fillOpacity={1} 
                        fill="url(#alertsGradient)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Geography Tab */}
        {activeTab === 'geography' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Distribuição Geográfica
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left px-4 py-3 text-zinc-300 font-medium">País/Cidade</th>
                      <th className="text-left px-4 py-3 text-zinc-300 font-medium">Usuários</th>
                      <th className="text-left px-4 py-3 text-zinc-300 font-medium">Ameaças</th>
                      <th className="text-left px-4 py-3 text-zinc-300 font-medium">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geographicData.map((location, index) => {
                      const riskScore = location.userCount > 0 ? Math.round((location.threatCount / location.userCount) * 100) : 0
                      return (
                        <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-white font-medium">{location.country}</div>
                              <div className="text-zinc-400 text-sm">{location.city}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-cyan-400 font-medium">{location.userCount}</td>
                          <td className="px-4 py-3 text-red-400 font-medium">{location.threatCount}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              riskScore <= 5 ? 'bg-green-500/20 text-green-400' :
                              riskScore <= 15 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {riskScore}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{metric.metric}</h3>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Atual</span>
                      <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                        {metric.metric.includes('Tempo') ? `${metric.current}ms` :
                         metric.metric.includes('%') || metric.metric.includes('Taxa') || metric.metric.includes('Score') || metric.metric.includes('Uptime') ? 
                         `${metric.current}%` : metric.current}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Meta</span>
                      <span className="text-zinc-300">
                        {metric.metric.includes('Tempo') ? `${metric.target}ms` :
                         metric.metric.includes('%') || metric.metric.includes('Taxa') || metric.metric.includes('Score') || metric.metric.includes('Uptime') ? 
                         `${metric.target}%` : metric.target}
                      </span>
                    </div>
                    
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (metric.current / metric.target) * 100)}%` 
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {metric.status === 'good' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {metric.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                      {metric.status === 'critical' && <XCircle className="w-4 h-4 text-red-400" />}
                      <span className={getStatusColor(metric.status)}>
                        {metric.status === 'good' ? 'Excelente' :
                         metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics 