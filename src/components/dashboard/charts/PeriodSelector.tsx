import React from 'react';
import { ChartPeriodType } from '../../../types/dashboard';

interface PeriodSelectorProps {
  chartPeriod: ChartPeriodType;
  onPeriodChange: (period: ChartPeriodType) => void;
}

/**
 * Componente seletor de período para os gráficos
 */
const PeriodSelector: React.FC<PeriodSelectorProps> = ({ chartPeriod, onPeriodChange }) => {
  const periods: { value: ChartPeriodType; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '15d', label: '15D' },
    { value: '30d', label: '30D' }
  ];

  return (
    <div className="flex items-center space-x-1">
      {periods.map(period => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-3 py-1 text-xs rounded-lg border transition-all duration-200 ${
            chartPeriod === period.value
              ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(0,255,153,0.3)]'
              : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:bg-zinc-600 hover:text-zinc-300'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector; 