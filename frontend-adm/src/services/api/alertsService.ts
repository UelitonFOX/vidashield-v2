import api from '../api';
import { Alert, AlertsResponse } from './types';

interface AlertFilters {
  page?: number;
  limit?: number;
  severity?: string;
  status?: string;
}

const alertsService = {
  // Obter lista de alertas com paginação e filtros
  getAlerts: async (filters: AlertFilters = {}): Promise<AlertsResponse> => {
    const { page = 1, limit = 10, severity = '', status = '' } = filters;
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    
    const response = await api.get<AlertsResponse>(`/alerts?${params.toString()}`);
    return response.data;
  },
  
  // Obter alertas recentes
  getRecentAlerts: async (limit: number = 5): Promise<Alert[]> => {
    const response = await api.get<{alerts: Alert[]}>(`/alerts/recent?limit=${limit}`);
    return response.data.alerts;
  },
  
  // Marcar um alerta como reconhecido
  acknowledgeAlert: async (alertId: string): Promise<Alert> => {
    const response = await api.patch<{alert: Alert}>(`/alerts/${alertId}/acknowledge`);
    return response.data.alert;
  },
  
  // Marcar um alerta como resolvido
  resolveAlert: async (alertId: string): Promise<Alert> => {
    const response = await api.patch<{alert: Alert}>(`/alerts/${alertId}/resolve`);
    return response.data.alert;
  }
};

export default alertsService;
export type { Alert, AlertsResponse, AlertFilters }; 