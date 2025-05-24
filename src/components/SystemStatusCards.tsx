import React from 'react';
import { Database, Globe, Shield, RefreshCw } from 'lucide-react';

interface StatusCard {
  title: string;
  status: 'online' | 'offline' | 'warning';
  icon: React.ReactNode;
  info?: string;
}

const SystemStatusCards: React.FC = () => {
  const statusCards: StatusCard[] = [
    {
      title: 'API',
      status: 'online',
      icon: <Globe className="w-5 h-5" />,
    },
    {
      title: 'Banco de Dados',
      status: 'online',
      icon: <Database className="w-5 h-5" />,
      info: 'PostgreSQL'
    },
    {
      title: 'Autenticação',
      status: 'online',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      title: 'Última atualização',
      status: 'online',
      icon: <RefreshCw className="w-5 h-5" />,
      info: '13:37:23'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          border: 'border-green-500/30',
          dot: 'bg-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/30',
          dot: 'bg-yellow-400'
        };
      case 'offline':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/30',
          dot: 'bg-red-400'
        };
      default:
        return {
          bg: 'bg-zinc-500/20',
          text: 'text-zinc-400',
          border: 'border-zinc-500/30',
          dot: 'bg-zinc-400'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statusCards.map((card, index) => {
        const colors = getStatusColor(card.status);
        
        return (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${colors.border} ${colors.bg} transition-all hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-zinc-800/50 ${colors.text}`}>
                {card.icon}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                <span className={`text-xs font-medium ${colors.text} capitalize`}>
                  {card.status === 'online' ? 'Online' : card.status}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-zinc-200 mb-1">{card.title}</h3>
              {card.info && (
                <p className="text-xs text-zinc-400">{card.info}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SystemStatusCards; 