import React, { useState, useEffect } from 'react'
import { Cpu, HardDrive, Users, Shield, Wifi, Clock, Activity, Database } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number | string
  unit: string
  icon: React.ReactNode
  trend?: number
  color: string
  threshold?: number
}

interface MetricsSummary {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  active_users: number
  threats_blocked: number
  uptime_percentage: number
  network_latency: number
  requests_per_minute: number
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  trend, 
  color, 
  threshold 
}) => {
  const isOverThreshold = threshold && typeof value === 'number' && value > threshold
  const displayValue = typeof value === 'number' ? value.toFixed(1) : value

  return (
    <div className={`bg-zinc-800 border rounded-lg p-4 ${
      isOverThreshold ? 'border-red-500 bg-red-500/10' : 'border-zinc-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs px-2 py-1 rounded ${
            trend > 0 ? 'bg-green-500/20 text-green-400' : 
            trend < 0 ? 'bg-red-500/20 text-red-400' : 
            'bg-zinc-700 text-zinc-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${
          isOverThreshold ? 'text-red-400' : 'text-white'
        }`}>
          {displayValue}
        </span>
        <span className="text-zinc-400 text-sm">{unit}</span>
      </div>
      
      <h3 className="text-zinc-300 text-sm mt-1">{title}</h3>
      
      {threshold && typeof value === 'number' && (
        <div className="mt-2">
          <div className="w-full bg-zinc-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                isOverThreshold ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((value / threshold) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 mt-1">
            Limite: {threshold}{unit}
          </span>
        </div>
      )}
    </div>
  )
}

const RealTimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadMetrics = async () => {
    try {
      // Mock data por enquanto - substituir por getLatestMetrics() quando estiver funcionando
      const data: MetricsSummary = {
        cpu_usage: 45.2 + (Math.random() - 0.5) * 10,
        memory_usage: 62.8 + (Math.random() - 0.5) * 15,
        disk_usage: 34.5,
        active_users: 1247 + Math.floor((Math.random() - 0.5) * 100),
        threats_blocked: 89,
        uptime_percentage: 99.97,
        network_latency: 12.3 + (Math.random() - 0.5) * 5,
        requests_per_minute: 2847 + Math.floor((Math.random() - 0.5) * 200)
      }
      setMetrics(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Carrega métricas inicialmente
    loadMetrics()

    // Atualiza a cada 15 segundos
    const interval = setInterval(loadMetrics, 15000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          <h2 className="text-lg font-semibold text-white">Métricas em Tempo Real</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 animate-pulse">
              <div className="w-10 h-10 bg-zinc-700 rounded-lg mb-2" />
              <div className="w-16 h-6 bg-zinc-700 rounded mb-1" />
              <div className="w-20 h-4 bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
        <div className="text-center text-zinc-400">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Erro ao carregar métricas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Métricas em Tempo Real</h2>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Clock className="w-4 h-4" />
          Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Métricas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={metrics.cpu_usage}
          unit="%"
          icon={<Cpu className="w-5 h-5 text-blue-400" />}
          color="bg-blue-500/20"
          threshold={80}
        />
        
        <MetricCard
          title="Memory Usage"
          value={metrics.memory_usage}
          unit="%"
          icon={<Database className="w-5 h-5 text-purple-400" />}
          color="bg-purple-500/20"
          threshold={90}
        />
        
        <MetricCard
          title="Disk Usage"
          value={metrics.disk_usage}
          unit="%"
          icon={<HardDrive className="w-5 h-5 text-orange-400" />}
          color="bg-orange-500/20"
          threshold={85}
        />
        
        <MetricCard
          title="Network Latency"
          value={metrics.network_latency}
          unit="ms"
          icon={<Wifi className="w-5 h-5 text-green-400" />}
          color="bg-green-500/20"
          threshold={100}
        />
        
        <MetricCard
          title="Usuários Ativos"
          value={metrics.active_users.toLocaleString('pt-BR')}
          unit=""
          icon={<Users className="w-5 h-5 text-indigo-400" />}
          color="bg-indigo-500/20"
        />
        
        <MetricCard
          title="Ameaças Bloqueadas"
          value={metrics.threats_blocked}
          unit=""
          icon={<Shield className="w-5 h-5 text-red-400" />}
          color="bg-red-500/20"
        />
        
        <MetricCard
          title="Uptime"
          value={metrics.uptime_percentage}
          unit="%"
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
          color="bg-emerald-500/20"
        />
        
        <MetricCard
          title="Requests/min"
          value={metrics.requests_per_minute.toLocaleString('pt-BR')}
          unit=""
          icon={<Activity className="w-5 h-5 text-cyan-400" />}
          color="bg-cyan-500/20"
        />
      </div>

      {/* Status Footer */}
      <div className="mt-4 pt-4 border-t border-zinc-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              Sistema Online
            </span>
            
            <span className="text-zinc-400">
              {metrics.uptime_percentage >= 99.9 ? '🟢' : metrics.uptime_percentage >= 99 ? '🟡' : '🔴'}
              SLA: {metrics.uptime_percentage >= 99.9 ? 'OK' : 'Warning'}
            </span>
          </div>
          
          <span className="text-zinc-500">
            Auto-refresh: 15s
          </span>
        </div>
      </div>
    </div>
  )
}

export default RealTimeMetrics 