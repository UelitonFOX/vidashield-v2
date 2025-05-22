import api from '../api';
import { Report, ReportsResponse, ApiBaseResponse } from './types';

const reportsService = {
  // Obter lista de relatórios
  getReports: async (): Promise<Report[]> => {
    const response = await api.get<{reports: Report[]}>('/api/reports');
    return response.data.reports;
  },
  
  // Obter relatórios disponíveis para exportação
  getExportableReports: async (): Promise<string[]> => {
    const response = await api.get<{available_reports: string[]}>('/api/reports/export');
    return response.data.available_reports;
  },
  
  // Exportar um relatório específico
  exportReport: async (reportId: string): Promise<ApiBaseResponse> => {
    const response = await api.post<ApiBaseResponse>('/api/reports/export', { report_id: reportId });
    return response.data;
  },
  
  // Obter detalhes de um relatório específico
  getReportDetails: async (reportId: string): Promise<Report> => {
    const response = await api.get<{report: Report}>(`/api/reports/${reportId}`);
    return response.data.report;
  }
};

export default reportsService;
export type { Report }; 