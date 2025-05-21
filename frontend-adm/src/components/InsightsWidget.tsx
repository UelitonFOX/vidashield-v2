import React, { useEffect, useState } from 'react';
import { FiTrendingDown, FiTrendingUp, FiAlertTriangle, FiActivity, FiRefreshCw, FiMap } from 'react-icons/fi';
import api from '../services/api';

interface InsightData {
  icon: React.ReactNode;
  text: string;
  type: 'security' | 'usage' | 'trend' | 'location';
}

const InsightsWidget: React.FC = () => {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados do backend
  const fetchInsightData = async () => {
    try {
      // Tentar obter dados reais do backend - buscar um único insight para atualizar o widget
      const response = await api.get('/insights/random');
      if (response.data && response.data.text) {
        const newInsight = {
          icon: getIconForType(response.data.type),
          text: response.data.text,
          type: response.data.type
        };
        
        // Adicionar novo insight mantendo os já existentes (máx 4)
        setInsights(prev => {
          const updated = [newInsight, ...prev];
          return updated.slice(0, 4);
        });
        return;
      }
    } catch (err) {
      console.log('Não foi possível obter insights da API, usando dados simulados');
    }

    // Fallback para dados simulados caso a API não esteja disponível
    generateRandomInsight();
  };

  // Função para buscar múltiplos insights iniciais
  const fetchInitialInsights = async () => {
    try {
      const response = await api.get('/insights/multiple', { params: { count: 4 } });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const formattedInsights = response.data.map(item => ({
          icon: getIconForType(item.type),
          text: item.text,
          type: item.type
        }));
        
        setInsights(formattedInsights);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('Não foi possível obter insights múltiplos, usando dados simulados');
    }
    
    // Fallback para geração aleatória se a API falhar
    generateRandomInsights();
    setLoading(false);
  };

  // Função para gerar um único insight aleatório (para atualização incremental)
  const generateRandomInsight = () => {
    const mockInsights: InsightData[] = [
      { 
        icon: <FiAlertTriangle />, 
        text: "🚨 IP 181.22.33.44 teve 3 tentativas bloqueadas nas últimas 2h.",
        type: 'security'
      },
      { 
        icon: <FiRefreshCw />, 
        text: "🔁 Usuário joao@exemplo.com trocou a senha 2 vezes em 7 dias.",
        type: 'security'
      },
      { 
        icon: <FiTrendingDown />, 
        text: "📉 Acesso caiu 25% em relação à semana passada.",
        type: 'trend'
      },
      { 
        icon: <FiMap />, 
        text: "🧭 Mais acessos vindos de Maringá nas últimas 24h.",
        type: 'location'
      },
      { 
        icon: <FiActivity />, 
        text: "📊 Horário de pico de acessos: 14h às 16h.",
        type: 'usage'
      },
      { 
        icon: <FiAlertTriangle />, 
        text: "🚨 3 tentativas de login do dispositivo não reconhecido.",
        type: 'security'
      },
      { 
        icon: <FiTrendingUp />, 
        text: "📈 Aumento de 30% em exportações de relatórios este mês.",
        type: 'trend'
      },
      { 
        icon: <FiRefreshCw />, 
        text: "🔄 5 novos usuários cadastrados na última semana.",
        type: 'usage'
      },
      { 
        icon: <FiActivity />, 
        text: "⏱️ Tempo médio de sessão: 22 minutos por usuário.",
        type: 'usage'
      },
      { 
        icon: <FiMap />, 
        text: "🌍 Acessos de 4 países diferentes nas últimas 24h.",
        type: 'location'
      }
    ];

    const randomIndex = Math.floor(Math.random() * mockInsights.length);
    const newInsight = mockInsights[randomIndex];
    
    setInsights(prev => {
      const updated = [newInsight, ...prev];
      return updated.slice(0, 4); // Mantém apenas os 4 mais recentes
    });
  };

  // Função para gerar insights aleatórios simulados iniciais
  const generateRandomInsights = () => {
    const mockInsights: InsightData[] = [
      { 
        icon: <FiAlertTriangle />, 
        text: "🚨 IP 181.22.33.44 teve 3 tentativas bloqueadas nas últimas 2h.",
        type: 'security'
      },
      { 
        icon: <FiRefreshCw />, 
        text: "🔁 Usuário joao@exemplo.com trocou a senha 2 vezes em 7 dias.",
        type: 'security'
      },
      { 
        icon: <FiTrendingDown />, 
        text: "📉 Acesso caiu 25% em relação à semana passada.",
        type: 'trend'
      },
      { 
        icon: <FiMap />, 
        text: "🧭 Mais acessos vindos de Maringá nas últimas 24h.",
        type: 'location'
      },
      { 
        icon: <FiActivity />, 
        text: "📊 Horário de pico de acessos: 14h às 16h.",
        type: 'usage'
      },
      { 
        icon: <FiAlertTriangle />, 
        text: "🚨 3 tentativas de login do dispositivo não reconhecido.",
        type: 'security'
      },
      { 
        icon: <FiTrendingUp />, 
        text: "📈 Aumento de 30% em exportações de relatórios este mês.",
        type: 'trend'
      },
      { 
        icon: <FiRefreshCw />, 
        text: "🔄 5 novos usuários cadastrados na última semana.",
        type: 'usage'
      }
    ];

    // Selecionar 3-4 insights aleatórios sem repetição
    const shuffled = [...mockInsights].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setInsights(selected);
  };

  // Função para retornar o ícone baseado no tipo
  const getIconForType = (type: string) => {
    switch (type) {
      case 'security':
        return <FiAlertTriangle />;
      case 'trend':
        return <FiTrendingDown />;
      case 'location':
        return <FiMap />;
      case 'usage':
      default:
        return <FiActivity />;
    }
  };

  // Inicialização - carregar dados iniciais
  useEffect(() => {
    fetchInitialInsights();

    // Configura o intervalo para atualizar um insight aleatório
    const intervalId = setInterval(() => {
      fetchInsightData();
    }, 30000); // Atualiza a cada 30 segundos

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="insights-container loading">
        <h2 className="section-title">Insights</h2>
        <div className="loading-indicator">Carregando insights...</div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      <div className="section-header">
        <h2 className="section-title">🔐 Segurança e Uso</h2>
      </div>
      
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-item ${insight.type}`}>
            <div className="insight-icon">
              {insight.icon}
            </div>
            <div className="insight-content">
              <p>{insight.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsWidget; 