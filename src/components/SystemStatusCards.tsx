import React from 'react';
import { Database, Globe, Shield, RefreshCw, Loader2 } from 'lucide-react';
import { useSystemStatus } from '../hooks/useSystemStatus';

interface StatusCard {
  title: string;
  status: 'online' | 'offline' | 'warning';
  icon: React.ReactNode;
  info?: string;
}

const SystemStatusCards: React.FC = () => {
  const { api, database, auth, lastUpdate, loading, error } = useSystemStatus();

  const statusCards: StatusCard[] = [
    {
      title: 'API',
      status: api,
      icon: <Globe className="w-4 h-4" />,
    },
    {
      title: 'Banco de Dados',
      status: database,
      icon: <Database className="w-4 h-4" />,
      info: 'Supabase PostgreSQL'
    },
    {
      title: 'Autenticação',
      status: auth,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      title: 'Última atualização',
      status: 'online',
      icon: loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />,
      info: lastUpdate || 'Carregando...'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          border: '',
          dot: 'bg-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: '',
          dot: 'bg-yellow-400'
        };
      case 'offline':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: '',
          dot: 'bg-red-400'
        };
      default:
        return {
          bg: 'bg-zinc-500/20',
          text: 'text-zinc-400',
          border: '',
          dot: 'bg-zinc-400'
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'warning':
        return 'Atenção';
      case 'offline':
        return 'Offline';
      default:
        return 'Verificando';
    }
  };

  if (error) {
    return (
      <div className="p-3 bg-red-500/20 rounded-lg">
        <p className="text-red-400 text-xs">Erro ao verificar status: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Grid de badges compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {statusCards.map((card, index) => {
          const colors = getStatusColor(card.status);
          
          return (
            <div 
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} transition-all hover:bg-opacity-80`}
              title={card.info || card.title}
            >
              <div className={`${colors.text} flex-shrink-0`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-200 truncate">{card.title}</span>
                  <div className="flex items-center gap-1 ml-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${loading ? 'animate-pulse' : ''}`}></div>
                    <span className={`text-xs font-medium ${colors.text}`}>
                      {getStatusText(card.status)}
                    </span>
                  </div>
                </div>
                {card.info && (
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{card.info}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemStatusCards; 