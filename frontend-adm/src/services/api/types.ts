// Tipos básicos para respostas da API
export interface ApiBaseResponse {
  success?: boolean;
  message?: string;
  msg?: string;
}

// Tipos para autenticação
export interface AuthResponse extends ApiBaseResponse {
  access_token: string;
  refresh_token?: string;
  user?: User;
}

// Tipos para usuário
export interface User {
  id: string;
  name: string;
  email: string;
  status: 'pendente' | 'ativo' | 'recusado' | 'active' | 'inactive';
  role: 'admin' | 'gerente' | 'usuario';
  photo?: string;
  avatar?: string;
  lastLogin?: string;
  created_at?: string;
}

// Resposta para listas paginadas
export interface PaginatedResponse<T> extends ApiBaseResponse {
  items?: T[];
  page: number;
  limit: number;
  total: number;
}

// Respostas específicas
export interface UsersResponse extends ApiBaseResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages?: number;
}

export interface UserResponse extends ApiBaseResponse {
  user: User;
}

export interface PendingUsersResponse extends ApiBaseResponse {
  users: User[];
  count: number;
}

// Tipos para alertas
export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved';
  created_at: string;
  updated_at?: string;
}

export interface AlertsResponse extends ApiBaseResponse {
  alerts: Alert[];
  total: number;
}

// Tipos para logs
export interface LogEntry {
  id: string;
  user_id?: string;
  username?: string;
  action: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface LogsResponse extends ApiBaseResponse {
  logs: LogEntry[];
  total: number;
}

// Tipos para relatórios
export interface Report {
  id: string;
  name: string;
  description?: string;
  type: string;
  created_at: string;
}

export interface ReportsResponse extends ApiBaseResponse {
  reports: Report[];
  available_reports?: string[];
}

// Tipos para insights
export interface Insight {
  id?: string;
  text: string;
  type: string;
  icon?: string;
  created_at?: string;
}

export interface InsightsResponse extends ApiBaseResponse {
  insights: Insight[];
}

// Tipo para dashboard
export interface DashboardData {
  alerts_count: number;
  users_count: number;
  active_sessions: number;
  recent_activity: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
  security_score?: number;
}

export interface DashboardResponse extends ApiBaseResponse {
  data: DashboardData;
} 