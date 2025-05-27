import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Wifi, 
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  CheckCircle
} from 'lucide-react';

interface SystemMetric {
  id: string;
  nome: string;
  valor: number;
  unidade: string;
  maximo: number;
  status: 'normal' | 'warning' | 'critical';
  tendencia: 'up' | 'down' | 'stable';
  historico: number[];
}

interface ServiceStatus {
  id: string;
  nome: string;
  status: 'online' | 'offline' | 'warning';
  uptime: string;
  ultimaVerificacao: string;
  url?: string;
}

const Monitoramento: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        setLoading(true);
        
        // Simulando dados de monitoramento
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const mockMetrics: SystemMetric[] = [
          {
            id: 'cpu',
            nome: 'CPU',
            valor: 34,
            unidade: '%',
            maximo: 100,
            status: 'normal',
            tendencia: 'stable',
            historico: [28, 32, 35, 31, 34, 36, 34]
          },
          {
            id: 'memory',
            nome: 'Memória RAM',
            valor: 68,
            unidade: '%',
            maximo: 100,
            status: 'normal',
            tendencia: 'up',
            historico: [62, 64, 66, 65, 67, 69, 68]
          },
          {
            id: 'disk',
            nome: 'Disco',
            valor: 45,
            unidade: '%',
            maximo: 100,
            status: 'normal',
            tendencia: 'stable',
            historico: [43, 44, 45, 44, 45, 46, 45]
          },
          {
            id: 'network',
            nome: 'Rede',
            valor: 12,
            unidade: 'MB/s',
            maximo: 100,
            status: 'normal',
            tendencia: 'down',
            historico: [15, 14, 13, 12, 11, 12, 12]
          }
        ];

        const mockServices: ServiceStatus[] = [
          {
            id: 'api',
            nome: 'API Principal',
            status: 'online',
            uptime: '99.98%',
            ultimaVerificacao: '30 segundos atrás',
            url: 'https://api.vidashield.com'
          },
          {
            id: 'database',
            nome: 'Banco de Dados',
            status: 'online',
            uptime: '99.95%',
            ultimaVerificacao: '1 minuto atrás'
          },
          {
            id: 'auth',
            nome: 'Autenticação',
            status: 'online',
            uptime: '100%',
            ultimaVerificacao: '45 segundos atrás'
          },
          {
            id: 'storage',
            nome: 'Armazenamento',
            status: 'warning',
            uptime: '98.2%',
            ultimaVerificacao: '2 minutos atrás'
          }
        ];
        
        setMetrics(mockMetrics);
        setServices(mockServices);
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados de monitoramento:', err);
        setLoading(false);
      }
    };

    fetchMonitoringData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchMonitoringData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getMetricStatusConfig = (status: string) => {
    switch (status) {
      case 'normal':
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          barColor: 'bg-green-400'
        };
      case 'warning':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          barColor: 'bg-yellow-400'
        };
      case 'critical':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          barColor: 'bg-red-400'
        };
      default:
        return {
          color: 'text-zinc-400',
          bg: 'bg-zinc-500/20',
          border: 'border-zinc-500/30',
          barColor: 'bg-zinc-400'
        };
    }
  };

  const getServiceStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          dot: 'bg-green-400',
          label: 'Online'
        };
      case 'warning':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          dot: 'bg-yellow-400',
          label: 'Atenção'
        };
      case 'offline':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          dot: 'bg-red-400',
          label: 'Offline'
        };
      default:
        return {
          color: 'text-zinc-400',
          bg: 'bg-zinc-500/20',
          border: 'border-zinc-500/30',
          dot: 'bg-zinc-400',
          label: 'Desconhecido'
        };
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'memory':
        return <MemoryStick className="w-5 h-5" />;
      case 'disk':
        return <HardDrive className="w-5 h-5" />;
      case 'network':
        return <Wifi className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-6 bg-green-400 rounded-full"></div>
          <h1 className="text-2xl font-bold text-white">Monitoramento</h1>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
            <p className="text-zinc-400">Carregando dados de monitoramento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 bg-green-400 rounded-full"></div>
          <h1 className="text-2xl font-bold text-white">Monitoramento</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock className="w-4 h-4" />
            <span>Última atualização: {lastUpdate}</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg transition-colors"
            aria-label="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Métricas do Sistema */}
      <div>
        <h2 className="text-lg font-semibold text-green-300 mb-4">Métricas do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const statusConfig = getMetricStatusConfig(metric.status);
            const percentage = (metric.valor / metric.maximo) * 100;
            
            return (
              <div 
                key={metric.id}
                className={`p-6 bg-zinc-800/50 rounded-lg border ${statusConfig.border} hover:bg-zinc-800/70 transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${statusConfig.bg} ${statusConfig.color}`}>
                    {getMetricIcon(metric.id)}
                  </div>
                  {getTendenciaIcon(metric.tendencia)}
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-zinc-200 mb-2">{metric.nome}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${statusConfig.color}`}>
                      {metric.valor}
                    </span>
                    <span className="text-sm text-zinc-500">{metric.unidade}</span>
                  </div>
                </div>
                
                {/* Barra de progresso */}
                <div className="mb-3">
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${statusConfig.barColor} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Mini gráfico de histórico */}
                <div className="flex items-end gap-1 h-8">
                  {metric.historico.map((value, index) => (
                    <div
                      key={index}
                      className={`flex-1 ${statusConfig.barColor} rounded-sm opacity-60`}
                      style={{ height: `${(value / Math.max(...metric.historico)) * 100}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status dos Serviços */}
      <div>
        <h2 className="text-lg font-semibold text-green-300 mb-4">Status dos Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => {
            const statusConfig = getServiceStatusConfig(service.status);
            
            return (
              <div 
                key={service.id}
                className={`p-6 bg-zinc-800/50 rounded-lg border ${statusConfig.border} hover:bg-zinc-800/70 transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusConfig.dot} animate-pulse`}></div>
                    <h3 className="text-lg font-medium text-zinc-200">{service.nome}</h3>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${statusConfig.color} ${statusConfig.bg}`}>
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Uptime:</span>
                    <span className={`text-sm font-medium ${statusConfig.color}`}>
                      {service.uptime}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Última verificação:</span>
                    <span className="text-sm text-zinc-300">{service.ultimaVerificacao}</span>
                  </div>
                  
                  {service.url && (
                    <div className="pt-2 border-t border-zinc-700">
                      <span className="text-xs text-zinc-500">URL:</span>
                      <p className="text-xs text-zinc-400 font-mono truncate">{service.url}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
        <h2 className="text-lg font-semibold text-green-300 mb-4">Resumo Geral</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-green-400">Sistema Estável</h3>
            <p className="text-sm text-zinc-400">Todos os componentes funcionando normalmente</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Server className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-blue-400">99.8%</h3>
            <p className="text-sm text-zinc-400">Disponibilidade média dos serviços</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-yellow-400">Baixa Carga</h3>
            <p className="text-sm text-zinc-400">Recursos do sistema otimizados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoramento; 