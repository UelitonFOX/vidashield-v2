import React from 'react';
import { FiUsers, FiDollarSign, FiShield, FiCheckCircle } from 'react-icons/fi';

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
  statistics: Statistic[];
  title?: string;
}

export function StatisticsWidget({ statistics, title }: StatisticsWidgetProps) {
  return (
    <div className="statistics-widget">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="stats-grid">
        {statistics.map((stat, index) => (
          <div key={index} className="stat-card">
            {stat.icon && (
              <div className={`stat-icon ${stat.iconType ? `icon-${stat.iconType}` : 'icon-info'}`}>
                {stat.icon}
              </div>
            )}
            <div className="stat-info">
              <h3 className="stat-title">{stat.title}</h3>
              <div className="stat-value">
                {typeof stat.value === 'number' && stat.title.toLowerCase().includes('porcentagem') 
                  ? `${stat.value}%` 
                  : typeof stat.value === 'number' && stat.title.toLowerCase().includes('valor') 
                  ? `R$ ${stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                  : stat.value}
              </div>
              <p className="stat-description">{stat.description}</p>
              {stat.variation && (
                <div className={`stat-variation ${stat.variation.type}`}>
                  {stat.variation.type === 'positive' ? '▲' : stat.variation.type === 'negative' ? '▼' : '●'} {stat.variation.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DefaultStatisticsWidget() {
  const defaultStats: Statistic[] = [
    {
      title: 'Total de Usuários',
      value: 2482,
      description: 'Usuários ativos na plataforma',
      icon: <FiUsers size={20} />,
      iconType: 'info',
      variation: {
        value: '12% desde o mês passado',
        type: 'positive'
      }
    },
    {
      title: 'Faturamento Mensal',
      value: 28650,
      description: 'Receita recorrente mensal',
      icon: <FiDollarSign size={20} />,
      iconType: 'success',
      variation: {
        value: '8.2% desde o mês passado',
        type: 'positive'
      }
    },
    {
      title: 'Alertas de Segurança',
      value: 7,
      description: 'Alertas ativos que precisam de atenção',
      icon: <FiShield size={20} />,
      iconType: 'warning',
      variation: {
        value: '3 novos alertas',
        type: 'negative'
      }
    },
    {
      title: 'Taxa de Aprovação',
      value: 94.8,
      description: 'Percentual de transações aprovadas',
      icon: <FiCheckCircle size={20} />,
      iconType: 'success',
      variation: {
        value: 'Estável',
        type: 'neutral'
      }
    }
  ];

  return <StatisticsWidget statistics={defaultStats} title="Estatísticas da Plataforma" />;
}

export default DefaultStatisticsWidget; 