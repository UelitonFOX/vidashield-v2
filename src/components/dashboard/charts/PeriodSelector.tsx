import { ChartPeriodType } from "../types";

interface PeriodSelectorProps {
  chartPeriod: ChartPeriodType;
  onPeriodChange: (period: ChartPeriodType) => void;
}

/**
 * Componente para seleção de período nos gráficos
 */
const PeriodSelector = ({ chartPeriod, onPeriodChange }: PeriodSelectorProps) => {
  return (
    <div className="flex items-center space-x-1 border border-zinc-700 rounded-md p-0.5 bg-zinc-900/60">
      <button
        className={`px-2 py-1 text-[10px] xs:text-xs transition-all rounded ${chartPeriod === '7d' ? 'bg-zinc-800 text-green-400 shadow-[0_0_8px_rgba(0,255,153,0.15)]' : 'text-zinc-400 hover:text-zinc-300'}`}
        onClick={() => onPeriodChange('7d')}
        title="Últimos 7 dias"
      >
        7D
      </button>
      <button
        className={`px-2 py-1 text-[10px] xs:text-xs transition-all rounded ${chartPeriod === '15d' ? 'bg-zinc-800 text-green-400 shadow-[0_0_8px_rgba(0,255,153,0.15)]' : 'text-zinc-400 hover:text-zinc-300'}`}
        onClick={() => onPeriodChange('15d')}
        title="Últimos 15 dias"
      >
        15D
      </button>
      <button
        className={`px-2 py-1 text-[10px] xs:text-xs transition-all rounded ${chartPeriod === '30d' ? 'bg-zinc-800 text-green-400 shadow-[0_0_8px_rgba(0,255,153,0.15)]' : 'text-zinc-400 hover:text-zinc-300'}`}
        onClick={() => onPeriodChange('30d')}
        title="Últimos 30 dias"
      >
        30D
      </button>
    </div>
  );
};

export default PeriodSelector; 