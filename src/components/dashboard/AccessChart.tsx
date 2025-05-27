import { useState } from "react";
import { ChartPeriodType, ChartViewType, ChartVisibleSeries, StatsData } from "../../types/dashboard";

// Componentes modularizados
import PeriodSelector from "./charts/PeriodSelector";
import ChartTypeSelector from "./charts/ChartTypeSelector";
import BarChartView from "./charts/BarChartView";
import LineChartView from "./charts/LineChartView";
import AreaChartView from "./charts/AreaChartView";

// Utilitários para as funções do gráfico
import { getChartData, getDaysFromPeriod } from "./charts/chartUtils";

interface AccessChartProps {
  statsData: StatsData;
  chartPeriod: ChartPeriodType;
  onPeriodChange: (period: ChartPeriodType) => void;
}

/**
 * Componente de gráfico de acessos principal - versão modularizada
 */
const AccessChart = ({ statsData, chartPeriod, onPeriodChange }: AccessChartProps) => {
  // Estado para controlar o tipo de visualização do gráfico
  const [chartView, setChartView] = useState<ChartViewType>('bar');
  
  // Estado para controlar a visibilidade das séries do gráfico
  const [visibleSeries, setVisibleSeries] = useState<ChartVisibleSeries>({
    acessos: true,
    tentativas: true
  });

  // Função para mudar o tipo de visualização do gráfico
  const handleChartViewChange = (view: ChartViewType) => {
    setChartView(view);
  };

  // Função para alternar a visibilidade das séries
  const toggleSeries = (dataKey: string) => {
    if (!dataKey || (dataKey !== 'acessos' && dataKey !== 'tentativas')) return;
    
    setVisibleSeries(prev => ({
      ...prev,
      [dataKey as keyof typeof prev]: !prev[dataKey as keyof typeof prev]
    }));
  };

  // Função para renderizar o gráfico selecionado
  const renderSelectedChart = () => {
    // Preparar os dados processados para o gráfico
    const data = getChartData(chartPeriod, statsData, visibleSeries);
    
    switch (chartView) {
      case 'bar':
        return (
          <BarChartView 
            data={data} 
            visibleSeries={visibleSeries} 
            toggleSeries={toggleSeries} 
          />
        );
      case 'line':
        return (
          <LineChartView 
            data={data} 
            visibleSeries={visibleSeries} 
            toggleSeries={toggleSeries} 
          />
        );
      case 'area':
        return (
          <AreaChartView 
            data={data} 
            visibleSeries={visibleSeries} 
            toggleSeries={toggleSeries} 
          />
        );
      default:
        return (
          <BarChartView 
            data={data} 
            visibleSeries={visibleSeries} 
            toggleSeries={toggleSeries} 
          />
        );
    }
  };

  return (
    <div className="card-dark p-3 sm:p-4 shadow-glow-soft overflow-hidden relative backdrop-blur-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-green-300">
          Acessos - Últimos {getDaysFromPeriod(chartPeriod)} dias
        </h2>
        <div className="flex items-center space-x-4">
          {/* Seletor de período - componente modular */}
          <PeriodSelector 
            chartPeriod={chartPeriod} 
            onPeriodChange={onPeriodChange} 
          />
          
          {/* Botões de tipo de gráfico - componente modular */}
          <ChartTypeSelector 
            chartView={chartView} 
            onChartViewChange={handleChartViewChange} 
          />
        </div>
      </div>
      
      {/* Elementos decorativos neon */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl pointer-events-none opacity-50"></div>
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-400/5 rounded-full blur-3xl pointer-events-none opacity-30"></div>
      
      {/* Gráfico usando componentes modularizados */}
      <div className="flex-1 w-full bg-zinc-900/60 rounded-lg backdrop-blur-sm p-2 transition-all duration-300">
        {getChartData(chartPeriod, statsData, visibleSeries).length > 0 && 
         getChartData(chartPeriod, statsData, visibleSeries).some(item => item.acessos > 0 || item.tentativas > 0) ? (
          <div className="w-full h-full animate-fadeIn">
            {renderSelectedChart()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400">
            <p>Sem dados registrados neste período</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessChart; 