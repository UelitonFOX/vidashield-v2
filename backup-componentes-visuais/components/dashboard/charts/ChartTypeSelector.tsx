import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart 
} from "lucide-react";
import { ChartViewType } from "../types";

interface ChartTypeSelectorProps {
  chartView: ChartViewType;
  onChartViewChange: (view: ChartViewType) => void;
}

/**
 * Componente para seleção do tipo de visualização do gráfico
 */
const ChartTypeSelector = ({ chartView, onChartViewChange }: ChartTypeSelectorProps) => {
  return (
    <div className="flex items-center space-x-2">
      <button 
        className={`p-1.5 rounded-md border transition-all hover:bg-zinc-800 ${chartView === 'bar' ? 'bg-zinc-800 border-green-400/50 shadow-[0_0_8px_rgba(0,255,153,0.2)]' : 'bg-zinc-900/60 border-zinc-700'}`}
        onClick={() => onChartViewChange('bar')}
        title="Gráfico de Barras"
      >
        <BarChart3 className="w-4 h-4 text-green-300" />
      </button>
      <button 
        className={`p-1.5 rounded-md border transition-all hover:bg-zinc-800 ${chartView === 'line' ? 'bg-zinc-800 border-green-400/50 shadow-[0_0_8px_rgba(0,255,153,0.2)]' : 'bg-zinc-900/60 border-zinc-700'}`}
        onClick={() => onChartViewChange('line')}
        title="Gráfico de Linha"
      >
        <LineChartIcon className="w-4 h-4 text-green-300" />
      </button>
      <button 
        className={`p-1.5 rounded-md border transition-all hover:bg-zinc-800 ${chartView === 'area' ? 'bg-zinc-800 border-green-400/50 shadow-[0_0_8px_rgba(0,255,153,0.2)]' : 'bg-zinc-900/60 border-zinc-700'}`}
        onClick={() => onChartViewChange('area')}
        title="Gráfico de Área"
      >
        <PieChart className="w-4 h-4 text-green-300" />
      </button>
    </div>
  );
};

export default ChartTypeSelector; 