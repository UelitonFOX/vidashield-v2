import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Shield, 
  Users,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { VidaWidget, VidaInnerCard, VidaBadge, VidaEmptyState, VidaGrid } from './ui/VidaShieldComponents';

interface Insight {
  id: string;
  titulo: string;
  valor: string | number;
  variacao: number;
  tipo: 'positiva' | 'negativa' | 'neutra';
  periodo: string;
  descricao: string;
  icon: React.ReactNode;
  categoria: 'performance' | 'seguranca' | 'usuarios' | 'sistema';
}

const AdvancedInsightsWidget: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        
        // Simulando dados avançados
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const mockInsights: Insight[] = [
          {
            id: 'performance-response',
            titulo: 'Tempo de Resposta Médio',
            valor: '143ms',
            variacao: -15.2,
            tipo: 'positiva',
            periodo: 'últimas 24h',
            descricao: 'Redução significativa na latência média das requisições',
            icon: <Zap className="w-5 h-5" />,
            categoria: 'performance'
          },
          {
            id: 'security-blocked',
            titulo: 'Tentativas Bloqueadas',
            valor: 247,
            variacao: 8.5,
            tipo: 'negativa',
            periodo: 'última semana',
            descricao: 'Aumento nas tentativas de acesso não autorizado',
            icon: <Shield className="w-5 h-5" />,
            categoria: 'seguranca'
          },
          {
            id: 'users-active',
            titulo: 'Usuários Ativos',
            valor: '1.2K',
            variacao: 12.4,
            tipo: 'positiva',
            periodo: 'último mês',
            descricao: 'Crescimento consistente na base de usuários ativos',
            icon: <Users className="w-5 h-5" />,
            categoria: 'usuarios'
          },
          {
            id: 'system-uptime',
            titulo: 'Disponibilidade',
            valor: '99.97%',
            variacao: 0.03,
            tipo: 'positiva',
            periodo: 'últimos 30 dias',
            descricao: 'Sistema mantendo alta disponibilidade',
            icon: <Activity className="w-5 h-5" />,
            categoria: 'sistema'
          },
          {
            id: 'performance-load',
            titulo: 'Carga do Sistema',
            valor: '34%',
            variacao: -8.1,
            tipo: 'positiva',
            periodo: 'tempo real',
            descricao: 'Otimização resultando em menor uso de recursos',
            icon: <TrendingDown className="w-5 h-5" />,
            categoria: 'performance'
          },
          {
            id: 'security-threats',
            titulo: 'Ameaças Detectadas',
            valor: 12,
            variacao: -45.2,
            tipo: 'positiva',
            periodo: 'última semana',
            descricao: 'Redução significativa em tentativas maliciosas',
            icon: <AlertCircle className="w-5 h-5" />,
            categoria: 'seguranca'
          }
        ];
        
        setInsights(mockInsights);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar insights:', err);
        setError('Não foi possível carregar os insights');
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getCategoriaConfig = (categoria: string) => {
    switch (categoria) {
      case 'performance':
        return {
          cor: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: ''
        };
      case 'seguranca':
        return {
          cor: 'text-red-400',
          bg: 'bg-red-500/20',
          border: ''
        };
      case 'usuarios':
        return {
          cor: 'text-green-400',
          bg: 'bg-green-500/20',
          border: ''
        };
      case 'sistema':
        return {
          cor: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: ''
        };
      default:
        return {
          cor: 'text-zinc-400',
          bg: 'bg-zinc-500/20',
          border: ''
        };
    }
  };

  const getVariacaoConfig = (tipo: string) => {
    switch (tipo) {
      case 'positiva':
        return {
          cor: 'text-green-400',
          icon: <TrendingUp className="w-4 h-4" />,
          sinal: '+'
        };
      case 'negativa':
        return {
          cor: 'text-red-400',
          icon: <TrendingDown className="w-4 h-4" />,
          sinal: ''
        };
      default:
        return {
          cor: 'text-zinc-400',
          icon: <Activity className="w-4 h-4" />,
          sinal: ''
        };
    }
  };

  const getVariacaoBadge = (tipo: string, variacao: number) => {
    const config = getVariacaoConfig(tipo);
    const variant = tipo === 'positiva' ? 'success' : tipo === 'negativa' ? 'critical' : 'info';
    
    return (
      <VidaBadge variant={variant}>
        <div className="flex items-center gap-1">
          {config.icon}
          <span>
            {config.sinal}{Math.abs(variacao)}%
          </span>
        </div>
      </VidaBadge>
    );
  };

  return (
    <VidaWidget
      title="Insights Avançados"
      loading={loading}
      error={error}
      actions={
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-xs text-zinc-400">Tempo real</span>
        </div>
      }
    >
      {insights.length === 0 ? (
        <VidaEmptyState
          icon={<Activity />}
          title="Sem Insights Disponíveis"
          description="Os insights aparecerão aqui quando houver dados suficientes"
        />
      ) : (
        <>
          <VidaGrid cols="3">
            {insights.map((insight) => {
              const categoriaConfig = getCategoriaConfig(insight.categoria);
              
              return (
                <VidaInnerCard key={insight.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${categoriaConfig.bg} ${categoriaConfig.cor}`}>
                      {insight.icon}
                    </div>
                    {getVariacaoBadge(insight.tipo, insight.variacao)}
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-zinc-200 mb-1">
                      {insight.titulo}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold ${categoriaConfig.cor}`}>
                        {insight.valor}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {insight.periodo}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {insight.descricao}
                  </p>
                </VidaInnerCard>
              );
            })}
          </VidaGrid>
          
          <div className="mt-6 pt-4 border-t border-zinc-600">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Sistema Operacional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Tempo real</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </VidaWidget>
  );
};

export default AdvancedInsightsWidget; 