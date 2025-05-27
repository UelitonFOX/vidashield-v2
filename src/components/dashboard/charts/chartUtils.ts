import { ChartData, ChartPeriodType, ChartVisibleSeries, StatsData } from "../../../types/dashboard";

/**
 * Gera rótulos para o gráfico de acessos baseado no período selecionado
 */
export const getDaysLabels = (days: number): string[] => {
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('pt-BR', {weekday: 'short'}));
  }
  return labels;
};

/**
 * Gera dados simulados de acesso baseados no período
 */
export const getSimulatedAccessData = (days: number, statsData: StatsData) => {
  // Dados para 7 dias - usamos os mesmos dados existentes
  if (days === 7) {
    return {
      acessos: statsData.acessos_semana,
      tentativas: statsData.tentativas_bloqueadas || []
    };
  }
  
  // Dados para 15 dias - extendendo os dados existentes
  if (days === 15) {
    const acessos = [12, 19, 24, 31, 15, 26, 33, 18];
    const tentativas = [0, 2, 0, 1, 3, 0, 1, 0];
    
    return {
      acessos: [...acessos, ...statsData.acessos_semana],
      tentativas: [...tentativas, ...(statsData.tentativas_bloqueadas || [])]
    };
  }
  
  // Dados para 30 dias - extendendo ainda mais
  if (days === 30) {
    const acessos = [
      18, 22, 17, 20, 28, 19, 25, 30, 21, 16, 
      23, 27, 19, 24, 22, 25, 31, 20, 19, 26,
      18, 24, 29
    ];
    const tentativas = [
      1, 0, 2, 0, 3, 1, 0, 0, 4, 1,
      0, 2, 1, 0, 0, 3, 0, 2, 1, 0,
      1, 0, 2
    ];
    
    return {
      acessos: [...acessos, ...statsData.acessos_semana],
      tentativas: [...tentativas, ...(statsData.tentativas_bloqueadas || [])]
    };
  }
  
  return {
    acessos: statsData.acessos_semana,
    tentativas: statsData.tentativas_bloqueadas || []
  };
};

/**
 * Obtém o número de dias baseado no período selecionado
 */
export const getDaysFromPeriod = (period: ChartPeriodType): number => {
  switch (period) {
    case '7d': return 7;
    case '15d': return 15;
    case '30d': return 30;
    default: return 7;
  }
};

/**
 * Gera dados formatados para o gráfico, filtrando séries ocultas
 */
export const getChartData = (
  chartPeriod: ChartPeriodType, 
  statsData: StatsData, 
  visibleSeries: ChartVisibleSeries
): ChartData[] => {
  const days = getDaysFromPeriod(chartPeriod);
  const labels = getDaysLabels(days);
  const data = getSimulatedAccessData(days, statsData);
  
  return data.acessos.map((acessos, index) => {
    const chartData: ChartData = {
      name: labels[index],
      acessos: visibleSeries.acessos ? acessos : 0,
      tentativas: visibleSeries.tentativas ? (data.tentativas[index] || 0) : 0
    };
    
    // Se a série estiver oculta, definimos um valor indefinido para que não seja renderizada
    if (!visibleSeries.acessos) {
      // @ts-ignore - Forçando ausência da propriedade para que o Recharts não a renderize
      chartData.acessos = undefined;
    }
    
    if (!visibleSeries.tentativas) {
      // @ts-ignore - Forçando ausência da propriedade para que o Recharts não a renderize
      chartData.tentativas = undefined;
    }
    
    return chartData;
  });
}; 