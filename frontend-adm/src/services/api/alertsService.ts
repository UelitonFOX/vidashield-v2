import { AlertsResponse, Alert } from './types';
import { useAuthFetch } from '../../utils/useAuthFetch';

interface AlertFilters {
  page?: number;
  limit?: number;
  search?: string;
  severity?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

// Dados mockados para o ambiente de desenvolvimento com tipagem correta
const mockData = {
  alerts: {
    alerts: [
      { id: '1', title: 'Tentativa de acesso bloqueada', message: 'Múltiplas falhas de login', severity: 'critical' as const, status: 'new' as const, created_at: '2025-05-08T10:25:00', updated_at: '2025-05-08T10:30:00' },
      { id: '2', title: 'Novo dispositivo detectado', message: 'Login de dispositivo não reconhecido', severity: 'medium' as const, status: 'resolved' as const, created_at: '2025-05-08T09:15:00', updated_at: '2025-05-08T11:20:00' },
      { id: '3', title: 'Acesso suspeito', message: 'Acesso de IP não autorizado', severity: 'critical' as const, status: 'new' as const, created_at: '2025-05-07T18:42:00', updated_at: '2025-05-07T18:50:00' },
      { id: '4', title: 'Senha fraca detectada', message: 'Usuário com senha vulnerável', severity: 'medium' as const, status: 'acknowledged' as const, created_at: '2025-05-07T15:30:00', updated_at: '2025-05-07T15:35:00' },
      { id: '5', title: 'Backup concluído', message: 'Backup automático concluído com sucesso', severity: 'low' as const, status: 'resolved' as const, created_at: '2025-05-07T12:15:00', updated_at: '2025-05-07T12:20:00' },
      { id: '6', title: 'Usuário bloqueado', message: 'Conta temporariamente bloqueada', severity: 'high' as const, status: 'resolved' as const, created_at: '2025-05-06T14:10:00', updated_at: '2025-05-06T16:30:00' },
      { id: '7', title: 'Atualização disponível', message: 'Nova versão de segurança disponível', severity: 'low' as const, status: 'new' as const, created_at: '2025-05-06T09:05:00', updated_at: '2025-05-06T09:10:00' },
      { id: '8', title: 'Vazamento de dados potencial', message: 'Atividade de download anormal', severity: 'critical' as const, status: 'acknowledged' as const, created_at: '2025-05-05T17:20:00', updated_at: '2025-05-05T17:40:00' },
      { id: '9', title: 'Erro de sincronização', message: 'Falha na sincronização com servidor de dados', severity: 'medium' as const, status: 'new' as const, created_at: '2025-05-05T11:30:00', updated_at: '2025-05-05T11:45:00' },
      { id: '10', title: 'Sessão expirada', message: 'Múltiplas sessões expiradas detectadas', severity: 'low' as const, status: 'resolved' as const, created_at: '2025-05-04T15:00:00', updated_at: '2025-05-04T15:10:00' }
    ] as Alert[],
    total: 10,
    page: 1,
    limit: 10,
    total_pages: 1
  },
  alert_details: {
    alert: {
      id: '1',
      title: 'Tentativa de acesso bloqueada',
      message: 'Múltiplas falhas de login',
      severity: 'critical' as const,
      status: 'new' as const,
      created_at: '2025-05-08T10:25:00',
      updated_at: '2025-05-08T10:30:00'
    } as Alert
  }
};

// Hook para serviço de alertas com Auth0
export const useAlertsService = () => {
  const { authFetch } = useAuthFetch<AlertsResponse>('/api/alerts');

  // Filtragem dos dados mockados
  const filterMockAlerts = (filters: AlertFilters): AlertsResponse => {
    const { page = 1, limit = 10, search = '', severity = '', status = '' } = filters;
    
    let filteredAlerts = [...mockData.alerts.alerts];
    
    if (search) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.title.toLowerCase().includes(search.toLowerCase()) || 
        alert.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => {
        if (status === 'resolved') return alert.status === 'resolved';
        if (status === 'new' || status === 'pending') return alert.status === 'new';
        if (status === 'acknowledged') return alert.status === 'acknowledged';
        return true;
      });
    }
    
    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);
    
    return {
      alerts: paginatedAlerts,
      total: filteredAlerts.length
    };
  };

  // Obter alertas com filtros
  const getAlerts = async (filters: AlertFilters = {}): Promise<AlertsResponse> => {
    const {
      page = 1,
      limit = 10,
      search = '',
      severity = '',
      status = '',
      type = '',
      startDate = '',
      endDate = ''
    } = filters;

    // Construir query string
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (search) params.append('search', search);
    if (severity) params.append('severity', severity);
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    // Criar mock baseado nos filtros
    const mockResponse = filterMockAlerts(filters);
    
    return await authFetch<AlertsResponse>(`/api/alerts?${params.toString()}`, {}, mockResponse);
  };

  // Obter um alerta específico por ID
  const getAlertById = async (alertId: string | number): Promise<Alert> => {
    const response = await authFetch<{ alert: Alert }>(`/api/alerts/${alertId}`, {}, mockData.alert_details);
    return response.alert;
  };

  // Resolver um alerta
  const resolveAlert = async (alertId: string | number): Promise<void> => {
    await authFetch<void>(`/api/alerts/${alertId}/resolve`, {
      method: 'PUT'
    }, {});
  };

  // Arquivar um alerta
  const archiveAlert = async (alertId: string | number): Promise<void> => {
    await authFetch<void>(`/api/alerts/${alertId}/archive`, {
      method: 'PUT'
    }, {});
  };

  return {
    getAlerts,
    getAlertById,
    resolveAlert,
    archiveAlert
  };
}; 