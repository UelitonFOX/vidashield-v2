import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, Clock, Loader2 } from 'lucide-react';

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
}

const ServerPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento de métricas do servidor
    const loadMetrics = () => {
      // Valores simulados - em produção, estes viriam de uma API
      const now = new Date();
      const uptimeHours = Math.floor(Math.random() * 72) + 24; // 1-3 dias
      const uptimeDays = Math.floor(uptimeHours / 24);
      const remainingHours = uptimeHours % 24;

      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 15, // 15-45%
        memory: Math.floor(Math.random() * 40) + 30, // 30-70%
        disk: Math.floor(Math.random() * 20) + 45, // 45-65%
        uptime: `${uptimeDays}d ${remainingHours}h`
      });
      setLoading(false);
    };

    // Carrega métricas inicial
    setTimeout(loadMetrics, 1000);

    // Atualiza métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (percentage: number, isGood: boolean = true) => {
    if (isGood) {
      // Para CPU/Mem - menor é melhor
      if (percentage < 30) return 'text-green-400';
      if (percentage < 60) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      // Para Disk - maior disponível é melhor
      if (percentage > 50) return 'text-green-400';
      if (percentage > 30) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  const getProgressColor = (percentage: number, isGood: boolean = true) => {
    if (isGood) {
      if (percentage < 30) return 'bg-green-500';
      if (percentage < 60) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      if (percentage > 50) return 'bg-green-500';
      if (percentage > 30) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-zinc-800/30 rounded-lg">
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <Loader2 className="w-5 h-5 animate-spin text-green-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Carregando métricas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 bg-zinc-800/30 rounded-lg">
        <div className="text-center text-zinc-600">
          <p className="text-xs">Performance do Servidor</p>
          <p className="text-xs mt-1 opacity-60">Erro ao carregar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-medium text-zinc-300 flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Performance do Servidor
        </h4>
        <div className="flex items-center gap-1 text-xs text-green-400">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          Online
        </div>
      </div>

      <div className="space-y-3">
        {/* CPU */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">CPU</span>
            </div>
            <span className={`text-xs font-medium ${getStatusColor(metrics.cpu)}`}>
              {metrics.cpu}%
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(metrics.cpu)}`}
              style={{ width: `${metrics.cpu}%` }}
            ></div>
          </div>
        </div>

        {/* Memória */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">RAM</span>
            </div>
            <span className={`text-xs font-medium ${getStatusColor(metrics.memory)}`}>
              {metrics.memory}%
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(metrics.memory)}`}
              style={{ width: `${metrics.memory}%` }}
            ></div>
          </div>
        </div>

        {/* Disco */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Disco</span>
            </div>
            <span className={`text-xs font-medium ${getStatusColor(100 - metrics.disk, false)}`}>
              {100 - metrics.disk}% livre
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(100 - metrics.disk, false)}`}
              style={{ width: `${100 - metrics.disk}%` }}
            ></div>
          </div>
        </div>

        {/* Uptime */}
        <div className="pt-2 border-t border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Uptime</span>
            </div>
            <span className="text-xs font-medium text-green-400">
              {metrics.uptime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerPerformance; 