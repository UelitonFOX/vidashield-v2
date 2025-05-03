import api from '../api';
import { DashboardData, DashboardResponse } from './types';

const dashboardService = {
  // Obter dados do dashboard
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardResponse>('/dashboard');
    return response.data.data;
  },
  
  // Obter dados de segurança recentes
  getSecurityMetrics: async (days: number = 7): Promise<any> => {
    const response = await api.get<{metrics: any}>(`/dashboard/security-metrics?days=${days}`);
    return response.data.metrics;
  },
  
  // Obter dados de atividade recente
  getRecentActivity: async (limit: number = 10): Promise<any[]> => {
    const response = await api.get<{activity: any[]}>(`/dashboard/activity?limit=${limit}`);
    return response.data.activity;
  }
};

export default dashboardService;
export type { DashboardData }; 