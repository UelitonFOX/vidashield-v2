import { DashboardData, DashboardResponse } from './types';
import { useAuthFetch } from '../../utils/useAuthFetch';

// Interface para extenção dos dados do dashboard
interface ExtendedDashboardData {
  total_usuarios: number;
  logins_hoje: number;
  alertas_criticos: number;
  acessos_semana: number[];
  tentativas_bloqueadas?: number[];
  alertas_recentes?: Array<{
    id: number | string;
    tipo: string;
    mensagem: string;
    tempo: string;
  }>;
  labels_dias?: string[];
  [key: string]: any;
}

// Interface para resultados de insights
interface InsightsResponse {
  insights: Array<{
    type: string;
    text: string;
    id?: string;
    created_at?: string;
  }>;
  [key: string]: any;
}

// Interface para resultados de alertas
interface AlertsResponse {
  alerts: Array<{
    id: number | string;
    type: string;
    severity: string;
    details?: Record<string, any>;
    timestamp: string;
    resolved: boolean;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// Dados mockados
const mockData = {
  dashboard: {
    total_usuarios: 75,
    logins_hoje: 23,
    alertas_criticos: 3,
    acessos_semana: [15, 28, 18, 42, 30, 22, 37],
    tentativas_bloqueadas: [1, 0, 3, 5, 0, 4, 2],
    alertas_recentes: [
      { id: 1, tipo: "critical", mensagem: "Múltiplas falhas de login", tempo: "10h25 - 08/05" },
      { id: 2, tipo: "warning", mensagem: "Novo dispositivo detectado", tempo: "09h15 - 08/05" },
      { id: 3, tipo: "critical", mensagem: "Acesso de IP não autorizado", tempo: "18h42 - 07/05" }
    ],
    labels_dias: ['01/05', '02/05', '03/05', '04/05', '05/05', '06/05', '07/05']
  },
  insights: {
    insights: [
      { type: "security", text: "192.168.1.105 teve 4 tentativas bloqueadas nas últimas 2h." },
      { type: "security", text: "Usuário pedro@clinica.com.br trocou a senha 2 vezes em 5 dias." },
      { type: "trend", text: "Aumento de 25% em acessos na última semana." },
      { type: "location", text: "Mais acessos vindos de Londrina nas últimas 24h." }
    ]
  },
  alerts: {
    alerts: [
      { id: 1, type: "critical", severity: "critical", details: { message: "Múltiplas falhas de login" }, timestamp: "2025-05-08T10:25:00", resolved: false },
      { id: 2, type: "warning", severity: "warning", details: { message: "Novo dispositivo detectado" }, timestamp: "2025-05-08T09:15:00", resolved: true },
      { id: 3, type: "critical", severity: "critical", details: { message: "Acesso de IP não autorizado" }, timestamp: "2025-05-07T18:42:00", resolved: false }
    ]
  }
};

// Hook para serviço de dashboard com Auth0
export const useDashboardService = () => {
  const { authFetch, hasFetched, isLoading, error } = useAuthFetch();

  // Função para obter mock baseado no endpoint
  const getMockForEndpoint = (endpoint: string): any => {
    if (endpoint === '/api/dashboard/data' || endpoint === '/api/dashboard') {
      return mockData.dashboard;
    } else if (endpoint.includes('/api/dashboard/insights')) {
      return mockData.insights;
    } else if (endpoint.includes('/api/alerts')) {
      return mockData.alerts;
    }
    return {};
  };

  const fetchDashboardData = async <T = ExtendedDashboardData>(
    url: string = '/api/dashboard/data'
  ): Promise<T> => {
    return await authFetch<T>(url, {}, getMockForEndpoint(url));
  };

  // Obter dados do dashboard principal
  const getDashboardData = async (): Promise<DashboardData> => {
    const response = await authFetch<DashboardResponse>('/api/dashboard', {}, mockData.dashboard);
    return response.data;
  };

  // Obter métricas de segurança
  const getSecurityMetrics = async (days: number = 7): Promise<any> => {
    const endpoint = `/api/dashboard/security-metrics?days=${days}`;
    const mockResponse = { metrics: { /*... dados mock aqui */ } };
    const response = await authFetch<{ metrics: any }>(endpoint, {}, mockResponse);
    return response.metrics;
  };

  // Obter atividades recentes
  const getRecentActivity = async (limit: number = 10): Promise<any[]> => {
    const endpoint = `/api/dashboard/activity?limit=${limit}`;
    const mockResponse = { activity: [] };
    const response = await authFetch<{ activity: any[] }>(endpoint, {}, mockResponse);
    return response.activity;
  };
  
  // Exportar relatórios
  const exportReport = async (reportId: string, format: 'csv' | 'pdf' | 'json' = 'csv'): Promise<any> => {
    const endpoint = `/api/reports/export/${reportId}?format=${format}`;
    const mockResponse = {
      data: { url: "#", filename: `relatorio_${reportId}.${format}` },
      msg: "Relatório exportado com sucesso!",
      success: true
    };
    
    return await authFetch(endpoint, {}, mockResponse);
  };

  return {
    fetchDashboardData,
    getDashboardData,
    getSecurityMetrics,
    getRecentActivity,
    exportReport,
    hasFetched,
    isLoading,
    error
  };
};

// Exportando tipos
export type { ExtendedDashboardData, InsightsResponse, AlertsResponse };
