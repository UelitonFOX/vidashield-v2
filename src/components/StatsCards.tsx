import React from 'react';
import { Users, Key, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'red' | 'yellow';
  loading?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const StatsCards: React.FC = () => {
  const { stats } = useDashboardStats();
  const navigate = useNavigate();

  const statsCards: StatCard[] = [
    {
      title: 'Usuários Ativos',
      value: stats.loading ? '...' : stats.totalUsers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: 'green',
      loading: stats.loading,
      clickable: false
    },
    {
      title: 'Logins Hoje',
      value: stats.loading ? '...' : stats.loginsToday.toLocaleString(),
      icon: <Key className="w-6 h-6" />,
      color: 'blue',
      loading: stats.loading,
      clickable: true,
      onClick: () => navigate('/alertas?tipo=info&busca=login')
    },
    {
      title: 'Tentativas Bloqueadas',
      value: stats.loading ? '...' : stats.blockedAttempts.toLocaleString(),
      icon: <Shield className="w-6 h-6" />,
      color: 'red',
      loading: stats.loading,
      clickable: true,
      onClick: () => navigate('/alertas?tipo=warning&busca=bloqueado')
    },
    {
      title: 'Alertas Críticos',
      value: stats.loading ? '...' : stats.criticalAlerts.toLocaleString(),
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'yellow',
      loading: stats.loading,
      clickable: true,
      onClick: () => navigate('/alertas?tipo=critical')
    }
  ];

  const getColors = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-zinc-800/50',
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400',
          valueColor: 'text-green-400'
        };
      case 'blue':
        return {
          bg: 'bg-zinc-800/50',
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          valueColor: 'text-blue-400'
        };
      case 'red':
        return {
          bg: 'bg-zinc-800/50',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          valueColor: 'text-red-400'
        };
      case 'yellow':
        return {
          bg: 'bg-zinc-800/50',
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          valueColor: 'text-yellow-400'
        };
      default:
        return {
          bg: 'bg-zinc-800/50',
          iconBg: 'bg-zinc-500/20',
          iconColor: 'text-zinc-400',
          valueColor: 'text-zinc-400'
        };
    }
  };

  if (stats.error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="col-span-full p-4 bg-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">Erro ao carregar estatísticas: {stats.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsCards.map((card, index) => {
        const colors = getColors(card.color);
        
        return (
          <div 
            key={index}
            className={`p-6 rounded-lg ${colors.bg} transition-all ${
              card.clickable 
                ? 'hover:shadow-lg hover:scale-105 cursor-pointer hover:bg-zinc-800/70' 
                : ''
            }`}
            onClick={card.clickable ? card.onClick : undefined}
            title={card.clickable ? `Ver alertas relacionados a ${card.title.toLowerCase()}` : undefined}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colors.iconBg} ${colors.iconColor} relative`}>
                {card.loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  card.icon
                )}
              </div>
              {card.clickable && (
                <div className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Clique para ver
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${colors.valueColor} mb-2 ${card.loading ? 'animate-pulse' : ''}`}>
                {card.value}
              </div>
              <div className="text-sm text-zinc-400">
                {card.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards; 