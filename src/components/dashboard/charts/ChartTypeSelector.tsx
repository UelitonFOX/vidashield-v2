import React from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { ChartViewType } from '../../../types/dashboard';

interface ChartTypeSelectorProps {
  chartView: ChartViewType;
  onChartViewChange: (view: ChartViewType) => void;
}

/**
 * Componente seletor de tipo de gráfico (barras, linhas, área)
 */
const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({ chartView, onChartViewChange }) => {
  const chartTypes: { value: ChartViewType; icon: React.ComponentType<any>; title: string }[] = [
    { value: 'bar', icon: BarChart3, title: 'Gráfico de Barras' },
    { value: 'line', icon: TrendingUp, title: 'Gráfico de Linhas' },
    { value: 'area', icon: Calendar, title: 'Gráfico de Área' }
  ];

  return (
    <div className="flex items-center gap-1">
      {chartTypes.map(({ value, icon: Icon, title }) => (
        <button
          key={value}
          onClick={() => onChartViewChange(value)}
          className={`p-2 rounded-lg border transition-all duration-200 ${
            chartView === value
              ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(0,255,153,0.3)]'
              : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:bg-zinc-600 hover:text-zinc-300'
          }`}
          title={title}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

export default ChartTypeSelector; 