import api from '../api';
import { LogEntry, LogsResponse, ApiBaseResponse } from './types';

interface LogFilters {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

const logsService = {
  // Obter lista de logs com paginação e filtros
  getLogs: async (filters: LogFilters = {}): Promise<LogsResponse> => {
    const { page = 1, limit = 10, search = '', startDate = '', endDate = '', userId = '' } = filters;
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (search) params.append('search', search);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (userId) params.append('user_id', userId);
    
    const response = await api.get<LogsResponse>(`/logs?${params.toString()}`);
    return response.data;
  },
  
  // Exportar logs
  exportLogs: async (filters: LogFilters = {}): Promise<ApiBaseResponse> => {
    const { startDate = '', endDate = '', userId = '' } = filters;
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (userId) params.append('user_id', userId);
    
    const response = await api.get<ApiBaseResponse>(`/logs/export?${params.toString()}`);
    return response.data;
  }
};

export default logsService;
export type { LogEntry, LogsResponse, LogFilters }; 