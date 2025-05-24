import { DashboardData, DashboardResponse } from './types';
import { useAuthFetch } from '../../utils/useAuthFetch';

// Interface para extensão dos dados do dashboard
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
  [key: string]: unknown;
}

// Interface para resultados de insights
interface InsightsResponse {
  insights: Array<{
    type: string;
    text: string;
    id?: string;
    created_at?: string;
  }>;
}

// Interface para alertas do dashboard
interface AlertsResponse {
  alerts: Array<{
    id: number | string;
    type: string;
    severity: string;
    details?: Record<string, unknown>;
    timestamp: string;
    resolved: boolean;
  }>;
}

// Interface para métricas de segurança
interface SecurityMetrics {
  blocked_attempts: number;
  successful_logins: number;
  new_devices: number;
  suspicious_ips: string[];
}

// Interface para atividade recente
interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

// Interface para resposta de exportação
interface ExportResponse {
  data: {
    url: string;
    filename: string;
  };
  msg: string;
  success: boolean;
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
  },
  securityMetrics: {
    metrics: {
      blocked_attempts: 12,
      successful_logins: 234,
      new_devices: 3,
      suspicious_ips: ['192.168.1.105', '10.0.0.150']
    }
  },
  recentActivity: {
    activity: [
      { id: '1', user: 'João Silva', action: 'Login', timestamp: '2025-05-08T10:30:00', details: 'Acesso via navegador' },
      { id: '2', user: 'Maria Santos', action: 'Logout', timestamp: '2025-05-08T09:45:00', details: 'Sessão finalizada' }
    ]
  }
};

// Hook para serviço de dashboard com Supabase (DESABILITADO para evitar loop)
export const useDashboardService = () => {
  // const { authFetch } = useAuthFetch<ExtendedDashboardData>('/api/dashboard/data');
  
  // Função simulada sem chamadas de API
  const authFetch = async <T = any>(url: string = '', options: any = {}, mockData: any = {}): Promise<T> => {
    console.log(`[SIMULADO] authFetch chamado para: ${url}`);
    return mockData as T;
  };

  // Função para obter mock baseado no endpoint
  const getMockForEndpoint = (endpoint: string): unknown => {
    if (endpoint === '/api/dashboard/data' || endpoint === '/api/dashboard') {
      return mockData.dashboard;
    } else if (endpoint.includes('/api/dashboard/insights')) {
      return mockData.insights;
    } else if (endpoint.includes('/api/alerts')) {
      return mockData.alerts;
    } else if (endpoint.includes('/api/dashboard/security-metrics')) {
      return mockData.securityMetrics;
    } else if (endpoint.includes('/api/dashboard/activity')) {
      return mockData.recentActivity;
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
  const getSecurityMetrics = async (days: number = 7): Promise<SecurityMetrics> => {
    const endpoint = `/api/dashboard/security-metrics?days=${days}`;
    const response = await authFetch<{ metrics: SecurityMetrics }>(endpoint, {}, mockData.securityMetrics);
    return response.metrics;
  };

  // Obter atividades recentes
  const getRecentActivity = async (limit: number = 10): Promise<RecentActivity[]> => {
    const endpoint = `/api/dashboard/activity?limit=${limit}`;
    const response = await authFetch<{ activity: RecentActivity[] }>(endpoint, {}, mockData.recentActivity);
    return response.activity;
  };
  
  // Exportar relatórios
  const exportReport = async (reportId: string, format: 'csv' | 'pdf' | 'json' = 'csv'): Promise<ExportResponse> => {
    const endpoint = `/api/reports/export/${reportId}?format=${format}`;
    const mockResponse: ExportResponse = {
      data: { url: "#", filename: `relatorio_${reportId}.${format}` },
      msg: "Relatório exportado com sucesso!",
      success: true
    };
    
    return await authFetch<ExportResponse>(endpoint, {}, mockResponse);
  };

  return {
    fetchDashboardData,
    getDashboardData,
    getSecurityMetrics,
    getRecentActivity,
    exportReport
  };
};

// Exportando tipos
export type { ExtendedDashboardData, InsightsResponse, AlertsResponse, SecurityMetrics, RecentActivity, ExportResponse };
