import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Filter, 
  Search,
  Download,
  Loader2,
  Eye,
  X,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { alertsService, SecurityAlert } from '../services/alertsService';

interface Alert extends SecurityAlert {
  tempo: string;
  data: string;
}

const Alertas: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>(searchParams.get('tipo') || 'todos');
  const [filtroStatus, setFiltroStatus] = useState<string>(searchParams.get('status') || 'todos');
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [alertaSelecionado, setAlertaSelecionado] = useState<Alert | null>(null);

  // Funções de formatação
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

  const formatData = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        const { data: securityAlerts } = await alertsService.getAlerts({
          limit: 50,
          search: busca,
          tipo: filtroTipo !== 'todos' ? filtroTipo : undefined,
          status: filtroStatus !== 'todos' ? filtroStatus : undefined
        });
        
        // Transformar dados do Supabase para formato da UI
        const transformedAlerts: Alert[] = securityAlerts.map((alert) => ({
          ...alert,
          mensagem: alert.titulo,
          tempo: formatTempo(alert.created_at),
          data: formatData(alert.created_at)
        }));
        
        setAlerts(transformedAlerts);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar alertas:', err);
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [busca, filtroTipo, filtroStatus]);

  const getAlertConfig = (tipo: string) => {
    switch (tipo) {
      case 'critical':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          border: 'border-red-500/30',
          label: 'Crítico',
          labelColor: 'text-red-400 bg-red-500/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-400',
          border: 'border-yellow-500/30',
          label: 'Atenção',
          labelColor: 'text-yellow-400 bg-yellow-500/20'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400',
          border: 'border-green-500/30',
          label: 'Sucesso',
          labelColor: 'text-green-400 bg-green-500/20'
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5" />,
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          border: 'border-blue-500/30',
          label: 'Info',
          labelColor: 'text-blue-400 bg-blue-500/20'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          iconBg: 'bg-zinc-500/20',
          iconColor: 'text-zinc-400',
          border: 'border-zinc-500/30',
          label: 'Info',
          labelColor: 'text-zinc-400 bg-zinc-500/20'
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'novo':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Novo' };
      case 'visualizado':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Visualizado' };
      case 'resolvido':
        return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Resolvido' };
      default:
        return { color: 'text-zinc-400', bg: 'bg-zinc-500/20', label: 'Desconhecido' };
    }
  };

  const alertasFiltrados = alerts.filter(alert => {
    const matchTipo = filtroTipo === 'todos' || alert.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || alert.status === filtroStatus;
    const matchBusca = busca === '' || 
      alert.mensagem.toLowerCase().includes(busca.toLowerCase()) ||
      alert.descricao.toLowerCase().includes(busca.toLowerCase());
    
    return matchTipo && matchStatus && matchBusca;
  });

  const marcarComoVisualizado = async (alertId: string) => {
    try {
      await alertsService.updateAlertStatus(alertId, 'visualizado');
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'visualizado' as const } : alert
      ));
    } catch (error) {
      console.error('Erro ao marcar alerta como visualizado:', error);
    }
  };

  const resolverAlerta = async (alertId: string) => {
    try {
      await alertsService.updateAlertStatus(alertId, 'resolvido');
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolvido' as const } : alert
      ));
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
    }
  };

  const handleExportData = () => {
    try {
      if (alertasFiltrados.length === 0) {
        alert('Nenhum alerta para exportar');
        return;
      }

      // Criar dados para exportação
      const exportData = {
        alertas: alertasFiltrados.map(alerta => ({
          id: alerta.id,
          tipo: alerta.tipo,
          mensagem: alerta.mensagem,
          descricao: alerta.descricao,
          status: alerta.status,
          origem: alerta.origem,
          data: alerta.data,
          tempo: alerta.tempo,
          severity_level: alerta.severity_level,
          ip_address: alerta.ip_address
        })),
        filtros: {
          tipo: filtroTipo,
          status: filtroStatus
        },
        totalAlertas: alertasFiltrados.length,
        exportDate: new Date().toISOString()
      };

      // Criar arquivo JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vidashield-alertas-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar alertas:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-6 bg-green-400 rounded-full"></div>
          <h1 className="text-2xl font-bold text-white">Alertas</h1>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
            <p className="text-zinc-400">Carregando alertas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-6 bg-green-400 rounded-full"></div>
        <h1 className="text-2xl font-bold text-white">Alertas</h1>
      </div>

      {/* Filtros e busca */}
      <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar alertas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-600 rounded-lg text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-green-400"
              />
            </div>
          </div>

          {/* Filtro por tipo */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 bg-zinc-900/50 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:border-green-400"
              aria-label="Filtrar por tipo de alerta"
            >
              <option value="todos">Todos os tipos</option>
              <option value="critical">Crítico</option>
              <option value="warning">Atenção</option>
              <option value="success">Sucesso</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Filtro por status */}
          <div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 bg-zinc-900/50 border border-zinc-600 rounded-lg text-zinc-200 focus:outline-none focus:border-green-400"
              aria-label="Filtrar por status do alerta"
            >
              <option value="todos">Todos os status</option>
              <option value="novo">Novo</option>
              <option value="visualizado">Visualizado</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              title="Atualizar alertas"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {alertasFiltrados.length > 0 ? (
          alertasFiltrados.map((alert) => {
            const alertConfig = getAlertConfig(alert.tipo);
            const statusConfig = getStatusConfig(alert.status);
            
            return (
              <div 
                key={alert.id}
                className={`p-4 bg-zinc-800/50 rounded-lg border ${alertConfig.border} hover:bg-zinc-800/70 transition-all cursor-pointer`}
                onClick={() => {
                  setAlertaSelecionado(alert);
                  if (alert.status === 'novo') {
                    marcarComoVisualizado(alert.id);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${alertConfig.iconBg} ${alertConfig.iconColor} flex-shrink-0`}>
                    {alertConfig.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-zinc-200">
                        {alert.mensagem}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${alertConfig.labelColor}`}>
                          {alertConfig.label}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.color} ${statusConfig.bg}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                      {alert.descricao}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-4">
                        <span>{alert.tempo}</span>
                        <span>•</span>
                        <span>{alert.origem}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Ver detalhes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-400 mb-2">Nenhum alerta encontrado</h3>
            <p className="text-zinc-400">Não há alertas que correspondam aos filtros selecionados.</p>
          </div>
        )}
      </div>

      {/* Modal de detalhes do alerta */}
      {alertaSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Detalhes do Alerta</h2>
                <button
                  onClick={() => setAlertaSelecionado(null)}
                  className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getAlertConfig(alertaSelecionado.tipo).icon}
                  <span className={`px-3 py-1 rounded-full text-sm ${getAlertConfig(alertaSelecionado.tipo).labelColor}`}>
                    {getAlertConfig(alertaSelecionado.tipo).label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusConfig(alertaSelecionado.status).color} ${getStatusConfig(alertaSelecionado.status).bg}`}>
                    {getStatusConfig(alertaSelecionado.status).label}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-zinc-200 mb-2">
                    {alertaSelecionado.mensagem}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {alertaSelecionado.descricao}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-700">
                  <div>
                    <span className="text-sm text-zinc-500">Data/Hora:</span>
                    <p className="text-zinc-200">{alertaSelecionado.data}</p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-500">Origem:</span>
                    <p className="text-zinc-200">{alertaSelecionado.origem}</p>
                  </div>
                  {alertaSelecionado.ip_address && (
                    <div>
                      <span className="text-sm text-zinc-500">IP:</span>
                      <p className="text-zinc-200 font-mono">{alertaSelecionado.ip_address}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-zinc-500">Severidade:</span>
                    <p className="text-zinc-200">{alertaSelecionado.severity_level}/4</p>
                  </div>
                </div>
                
                {/* Botões de ação */}
                {alertaSelecionado.status !== 'resolvido' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-700">
                    {alertaSelecionado.status === 'novo' && (
                      <button
                        onClick={() => {
                          marcarComoVisualizado(alertaSelecionado.id);
                          setAlertaSelecionado({...alertaSelecionado, status: 'visualizado'});
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Marcar como Visualizado
                      </button>
                    )}
                    <button
                      onClick={() => {
                        resolverAlerta(alertaSelecionado.id);
                        setAlertaSelecionado({...alertaSelecionado, status: 'resolvido'});
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolver Alerta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alertas; 