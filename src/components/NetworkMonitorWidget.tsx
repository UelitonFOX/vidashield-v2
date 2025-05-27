import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Download, 
  Upload, 
  Server,
  Wifi
} from 'lucide-react';

interface NetworkMetric {
  id: string;
  nome: string;
  valor: string;
  unidade: string;
  status: 'normal' | 'warning' | 'critical';
  icon: React.ReactNode;
  tendencia: 'up' | 'down' | 'stable';
}

const NetworkMonitorWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<NetworkMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'unstable'>('online');

  useEffect(() => {
    const fetchNetworkMetrics = async () => {
      try {
        setLoading(true);
        
        // Simulando dados de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockMetrics: NetworkMetric[] = [
          {
            id: 'latency',
            nome: 'Latência',
            valor: '12',
            unidade: 'ms',
            status: 'normal',
            icon: <Activity className="w-3 h-3" />,
            tendencia: 'stable'
          },
          {
            id: 'download',
            nome: 'Download',
            valor: '45.2',
            unidade: 'MB/s',
            status: 'normal',
            icon: <Download className="w-3 h-3" />,
            tendencia: 'up'
          },
          {
            id: 'upload',
            nome: 'Upload',
            valor: '12.8',
            unidade: 'MB/s',
            status: 'normal',
            icon: <Upload className="w-3 h-3" />,
            tendencia: 'up'
          },
          {
            id: 'packet-loss',
            nome: 'Perda',
            valor: '0.1',
            unidade: '%',
            status: 'normal',
            icon: <Server className="w-3 h-3" />,
            tendencia: 'stable'
          }
        ];
        
        setMetrics(mockMetrics);
        setConnectionStatus('online');
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar métricas de rede:', err);
        setConnectionStatus('offline');
        setLoading(false);
      }
    };

    fetchNetworkMetrics();
    
    // Atualizar métricas a cada 5 segundos
    const interval = setInterval(fetchNetworkMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'online':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          dot: 'bg-green-400'
        };
      case 'unstable':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          dot: 'bg-yellow-400'
        };
      case 'offline':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          dot: 'bg-red-400'
        };
      default:
        return {
          bg: 'bg-zinc-500/20',
          text: 'text-zinc-400',
          dot: 'bg-zinc-400'
        };
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'online':
        return 'Estável';
      case 'unstable':
        return 'Instável';
      case 'offline':
        return 'Offline';
      default:
        return 'Verificando...';
    }
  };

  const colors = getConnectionColor();

  if (loading) {
    return (
      <div className="p-3 bg-zinc-800/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Wifi className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-400">Rede</span>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse ml-auto"></div>
        </div>
        <div className="text-xs text-zinc-500">Carregando métricas...</div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg ${colors.bg} transition-all`}>
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wifi className={`w-4 h-4 ${colors.text}`} />
          <span className="text-xs font-medium text-zinc-200">Rede</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${loading ? 'animate-pulse' : ''}`}></div>
          <span className={`text-xs font-medium ${colors.text}`}>
            {getConnectionText()}
          </span>
        </div>
      </div>

      {/* Métricas em grid compacto */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded">
            <div className="text-zinc-400 flex-shrink-0">
              {metric.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium text-white truncate">
                  {metric.valor}
                </span>
                <span className="text-xs text-zinc-500">
                  {metric.unidade}
                </span>
              </div>
              <div className="text-xs text-zinc-500 truncate">
                {metric.nome}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkMonitorWidget; 