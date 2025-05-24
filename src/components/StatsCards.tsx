import React from 'react';
import { Users, Key, Shield, AlertTriangle } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'red' | 'yellow';
}

const StatsCards: React.FC = () => {
  const statsCards: StatCard[] = [
    {
      title: 'Usuários Ativos',
      value: '0',
      icon: <Users className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Logins Hoje',
      value: '0',
      icon: <Key className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Tentativas Bloqueadas',
      value: '0',
      icon: <Shield className="w-6 h-6" />,
      color: 'red'
    },
    {
      title: 'Alertas Críticos',
      value: '0',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'yellow'
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsCards.map((card, index) => {
        const colors = getColors(card.color);
        
        return (
          <div 
            key={index}
            className={`p-6 rounded-lg border border-zinc-700 ${colors.bg} hover:border-zinc-600 transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colors.iconBg} ${colors.iconColor}`}>
                {card.icon}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${colors.valueColor} mb-2`}>
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