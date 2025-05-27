import React, { useState, useEffect } from 'react';
import { FileText, Info, CheckCircle, AlertTriangle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  service: string;
  message: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simula carregamento de logs do sistema
    const loadLogs = () => {
      const services = ['Auth', 'API', 'DB', 'Cache', 'Monitor'];
      const messages = {
        info: [
          'Sistema iniciado com sucesso',
          'Conexão estabelecida',
          'Processo de backup iniciado',
          'Configuração carregada',
          'Monitoramento ativo'
        ],
        success: [
          'Backup concluído com sucesso',
          'Cache atualizado',
          'Autenticação validada',
          'Dados sincronizados',
          'Sistema otimizado'
        ],
        warning: [
          'Alto uso de CPU detectado',
          'Cache próximo do limite',
          'Conexão lenta detectada',
          'SSL expira em 7 dias',
          'Disco com 80% de uso'
        ],
        error: [
          'Falha na conexão com DB',
          'Timeout na API externa',
          'Erro de autenticação',
          'Falha no backup automático',
          'Serviço não responsivo'
        ]
      };

      const levels: Array<'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error'];
      const newLogs: SystemLog[] = [];

      // Gera 8 logs recentes
      for (let i = 0; i < 8; i++) {
        const level = levels[Math.floor(Math.random() * levels.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        const messageList = messages[level];
        const message = messageList[Math.floor(Math.random() * messageList.length)];
        
        // Gera timestamp recente (últimas 2 horas)
        const timestamp = new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000);

        newLogs.push({
          id: `log-${i}`,
          timestamp: timestamp.toISOString(),
          level,
          service,
          message
        });
      }

      // Ordena por timestamp (mais recente primeiro)
      newLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setLogs(newLogs);
      setLoading(false);
    };

    // Carrega logs inicial
    setTimeout(loadLogs, 800);

    // Atualiza logs a cada 60 segundos
    const interval = setInterval(loadLogs, 60000);

    return () => clearInterval(interval);
  }, []);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="w-3 h-3 text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Info className="w-3 h-3 text-zinc-400" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleViewAllLogs = () => {
    // Em um sistema real, navegaria para uma página de logs completa
    navigate('/alertas?tipo=info&busca=sistema');
  };

  if (loading) {
    return (
      <div className="p-4 bg-zinc-800/30 rounded-lg">
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <Loader2 className="w-5 h-5 animate-spin text-green-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Carregando logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-medium text-zinc-300 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Logs do Sistema
        </h4>
        <button
          onClick={handleViewAllLogs}
          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
          title="Ver todos os logs"
        >
          <ExternalLink className="w-3 h-3" />
          Ver todos
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {logs.map((log) => (
          <div 
            key={log.id}
            className="p-2 bg-zinc-800/40 rounded hover:bg-zinc-800/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {getLogIcon(log.level)}
                <span className="text-xs font-medium text-zinc-300">
                  {log.service}
                </span>
              </div>
              <span className="text-xs text-zinc-500">
                {formatTime(log.timestamp)}
              </span>
            </div>
            
            <p className={`text-xs ${getLogColor(log.level)} leading-relaxed`}>
              {log.message}
            </p>
          </div>
        ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-4">
          <FileText className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-600">Nenhum log recente</p>
        </div>
      )}
    </div>
  );
};

export default SystemLogs; 