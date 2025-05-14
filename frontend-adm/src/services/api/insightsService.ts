import api from '../api';
import { Insight, InsightsResponse } from './types';

const insightsService = {
  // Obter todos os insights
  getInsights: async (): Promise<Insight[]> => {
    const response = await api.get<InsightsResponse>('/insights');
    return response.data.insights;
  },
  
  // Obter um insight aleatório
  getRandomInsight: async (): Promise<Insight> => {
    const response = await api.get<{text: string; type: string; icon?: string}>('/insights/random');
    return {
      text: response.data.text,
      type: response.data.type,
      icon: response.data.icon
    };
  },
  
  // Obter insights por tipo
  getInsightsByType: async (type: string): Promise<Insight[]> => {
    const response = await api.get<InsightsResponse>(`/insights/type/${type}`);
    return response.data.insights;
  }
};

export default insightsService;
export type { Insight }; 