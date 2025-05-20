// Tipos para o módulo de alertas

// Interface para o alerta formatado para UI
export interface AlertaUI {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at?: string;
  status: string;
  // Campos específicos da UI
  severidade: string;
  dataFormatada: string;
}

// Interface para os filtros de alertas
export interface AlertFilters {
  page: number;
  limit: number;
  search: string;
  severity: string;
  status: string;
} 