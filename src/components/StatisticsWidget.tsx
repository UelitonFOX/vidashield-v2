import React from 'react';
import { Shield, AlertTriangle, Users, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface Variation {
  value: string;
  type: 'positive' | 'negative' | 'neutral';
}

interface Statistic {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  iconType?: 'success' | 'warning' | 'danger' | 'info';
  variation?: Variation;
}

export interface StatisticsWidgetProps {
  statistics?: Statistic[];
  title?: string;
}

export function StatisticsWidget({ statistics, title = "Estatísticas de Segurança" }: StatisticsWidgetProps) {
  const defaultStats: Statistic[] = [
    {
      title: 'Ameaças Bloqueadas',
      value: 1247,
      description: 'Tentativas maliciosas bloqueadas hoje',
      icon: <Shield className="w-5 h-5" />,
      iconType: 'success',
      variation: {
        value: '15% nas últimas 24h',
        type: 'positive'
      }
    },
    {
      title: 'Alertas Ativos',
      value: 8,
      description: 'Requerem atenção imediata',
      icon: <AlertTriangle className="w-5 h-5" />,
      iconType: 'warning',
      variation: {
        value: '2 novos alertas',
        type: 'negative'
      }
    },
    {
      title: 'Usuários Monitorados',
      value: 892,
      description: 'Sessões ativas sendo monitoradas',
      icon: <Users className="w-5 h-5" />,
      iconType: 'info',
      variation: {
        value: 'Estável',
        type: 'neutral'
      }
    },
    {
      title: 'Uptime do Sistema',
      value: '99.97%',
      description: 'Disponibilidade nos últimos 30 dias',
      icon: <Activity className="w-5 h-5" />,
      iconType: 'success',
      variation: {
        value: '0.03% melhoria',
        type: 'positive'
      }
    }
  ];

  const statsToShow = statistics || defaultStats;

  const getIconBgColor = (type?: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'danger': return 'bg-red-500/20';
      default: return 'bg-blue-500/20';
    }
  };

  const getIconColor = (type?: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getVariationIcon = (type: string) => {
    if (type === 'positive') return <TrendingUp className="w-3 h-3" />;
    if (type === 'negative') return <TrendingDown className="w-3 h-3" />;
    return <div className="w-2 h-2 bg-zinc-400 rounded-full" />;
  };

  const getVariationColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="card-dark">
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statsToShow.map((stat, index) => (
          <div key={index} className="p-4 bg-zinc-700/30 rounded-lg hover:bg-zinc-700/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${getIconBgColor(stat.iconType)}`}>
                <div className={getIconColor(stat.iconType)}>
                  {stat.icon}
                </div>
              </div>
              {stat.variation && (
                <div className={`flex items-center gap-1 text-xs ${getVariationColor(stat.variation.type)}`}>
                  {getVariationIcon(stat.variation.type)}
                  <span>{stat.variation.value}</span>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-1">{stat.title}</h4>
              <div className="text-2xl font-bold text-white mb-1">
                {typeof stat.value === 'number' 
                  ? stat.value.toLocaleString('pt-BR')
                  : stat.value}
              </div>
              <p className="text-xs text-zinc-400">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatisticsWidget; 