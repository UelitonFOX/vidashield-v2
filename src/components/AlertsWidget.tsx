import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  VidaWidget, 
  VidaInnerCard, 
  VidaBadge, 
  VidaScrollContainer, 
  VidaEmptyState 
} from './ui/VidaShieldComponents';
import { alertsService, SecurityAlert } from '../services/alertsService';

interface Alert extends SecurityAlert {
  tempo: string;
}

interface AlertsWidgetProps {
  limit?: number;
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ limit = 5 }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Função para formatar tempo relativo
  const formatTempo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        const { data: securityAlerts } = await alertsService.getAlerts({
          limit: limit,
          status: 'novo' // Apenas alertas novos no widget
        });
        
        // Transformar dados do Supabase para formato da UI
        const transformedAlerts: Alert[] = securityAlerts.map((alert) => ({
          ...alert,
          tempo: formatTempo(alert.created_at)
        }));
        
        setAlerts(transformedAlerts);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar alertas recentes:', err);
        setError('Não foi possível carregar os alertas');
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [limit]);

  const getAlertConfig = (tipo: string) => {
    switch (tipo) {
      case 'critical':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          badge: 'critical' as const
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          badge: 'warning' as const
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400',
          badge: 'success' as const
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5" />,
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          badge: 'info' as const
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          iconBg: 'bg-zinc-500/20',
          iconColor: 'text-zinc-400',
          badge: 'info' as const
        };
    }
  };

  const getBadgeLabel = (tipo: string) => {
    switch (tipo) {
      case 'critical': return 'Crítico';
      case 'warning': return 'Atenção';
      case 'success': return 'Sucesso';
      case 'info': return 'Info';
      default: return 'Info';
    }
  };

  return (
    <VidaWidget
      title="Alertas Recentes"
      loading={loading}
      error={error}
      fullHeight={true}
      actions={
        <Link 
          to="/alertas" 
          className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver todos
        </Link>
      }
    >
      <VidaScrollContainer>
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const config = getAlertConfig(alert.tipo);
            
            return (
              <div
                key={alert.id}
                className="cursor-pointer group"
                onClick={() => navigate(`/alertas?busca=${encodeURIComponent(alert.titulo)}`)}
                title={`Clique para ver detalhes do alerta: ${alert.titulo}`}
              >
                <VidaInnerCard className="hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.iconBg} ${config.iconColor} flex-shrink-0`}>
                      {config.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-green-300 transition-colors">
                          {alert.titulo}
                        </h4>
                        <VidaBadge variant={config.badge} className="flex-shrink-0 ml-2">
                          {getBadgeLabel(alert.tipo)}
                        </VidaBadge>
                      </div>
                      
                      {alert.mensagem && (
                        <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
                          {alert.mensagem}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-zinc-500">
                          {alert.tempo}
                        </p>
                        <span className="text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver detalhes →
                        </span>
                      </div>
                    </div>
                  </div>
                </VidaInnerCard>
              </div>
            );
          })
        ) : (
          <VidaEmptyState
            icon={<CheckCircle />}
            title="Sistema Seguro"
            description="Nenhum alerta recente"
          />
        )}
      </VidaScrollContainer>
    </VidaWidget>
  );
};

export default AlertsWidget; 