// Definindo interfaces para os tipos de dados do dashboard
export interface StatsData {
  total_usuarios: number;
  logins_hoje: number;
  alertas_criticos: number;
  acessos_semana: number[];
  tentativas_bloqueadas?: number[];
}

export interface Insight {
  type: string;
  text: string;
  id?: string;
  created_at?: string;
}

export interface Alerta {
  id: string | number;
  tipo: string;
  severidade?: string;
  mensagem: string;
  data: string;
  status?: string;
  resolvido?: boolean;
}

export interface UsuarioBloqueado {
  id?: number | string;
  email?: string;
  nome?: string;
  ip: string;
  local?: string;
  motivo: string;
  timestamp: string;
  sistema?: string;
  tentativas?: number;
}

export interface ChartData {
  name: string;
  acessos: number;
  tentativas: number;
}

export interface SystemStatus {
  api: string;
  database: string;
  auth: string;
}

export type ChartViewType = 'bar' | 'line' | 'area';
export type ChartPeriodType = '7d' | '15d' | '30d';

export interface ChartVisibleSeries {
  acessos: boolean;
  tentativas: boolean;
} 