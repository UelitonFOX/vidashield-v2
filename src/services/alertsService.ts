import { supabase } from './supabaseClient';

export interface SecurityAlert {
  id: string;
  tipo: 'critical' | 'warning' | 'success' | 'info';
  titulo: string;
  mensagem: string;
  descricao: string;
  origem: string;
  ip_address?: string;
  details?: object;
  status: 'novo' | 'visualizado' | 'resolvido' | 'ignorado';
  severity_level: number; // 1-4 (info, warning, critical, severe)
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface AlertFilters {
  tipo?: string;
  status?: string;
  severity?: number;
  search?: string;
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
}

class AlertsService {
  async createAlert(alert: Omit<SecurityAlert, 'id' | 'created_at' | 'updated_at'>): Promise<SecurityAlert | null> {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .insert([{
          ...alert,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar alerta:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      return null;
    }
  }

  async getAlerts(filters: AlertFilters = {}): Promise<{ data: SecurityAlert[]; count: number }> {
    try {
      let query = supabase
        .from('security_alerts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.tipo && filters.tipo !== 'todos') {
        query = query.eq('tipo', filters.tipo);
      }

      if (filters.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      if (filters.severity) {
        query = query.eq('severity_level', filters.severity);
      }

      if (filters.search) {
        query = query.or(`titulo.ilike.%${filters.search}%, mensagem.ilike.%${filters.search}%, descricao.ilike.%${filters.search}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar alertas:', error);
        return { data: [], count: 0 };
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return { data: [], count: 0 };
    }
  }

  async getAlertById(id: string): Promise<SecurityAlert | null> {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar alerta:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar alerta:', error);
      return null;
    }
  }

  async updateAlertStatus(id: string, status: SecurityAlert['status'], resolvedBy?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolvido') {
        updateData.resolved_at = new Date().toISOString();
        if (resolvedBy) {
          updateData.resolved_by = resolvedBy;
        }
      }

      const { error } = await supabase
        .from('security_alerts')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status do alerta:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do alerta:', error);
      return false;
    }
  }

  async deleteAlert(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar alerta:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar alerta:', error);
      return false;
    }
  }

  async getAlertsStats(): Promise<{
    total: number;
    critical: number;
    warning: number;
    resolved: number;
    pending: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('tipo, status');

      if (error) {
        console.error('Erro ao buscar estatísticas de alertas:', error);
        return { total: 0, critical: 0, warning: 0, resolved: 0, pending: 0 };
      }

      const stats = {
        total: data.length,
        critical: data.filter(a => a.tipo === 'critical').length,
        warning: data.filter(a => a.tipo === 'warning').length,
        resolved: data.filter(a => a.status === 'resolvido').length,
        pending: data.filter(a => a.status === 'novo' || a.status === 'visualizado').length
      };

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de alertas:', error);
      return { total: 0, critical: 0, warning: 0, resolved: 0, pending: 0 };
    }
  }

  // Método para criar alertas automáticos do sistema
  async createSystemAlert(
    tipo: SecurityAlert['tipo'],
    titulo: string,
    mensagem: string,
    descricao: string,
    origem: string,
    details?: object,
    ipAddress?: string
  ): Promise<SecurityAlert | null> {
    const severityMap = {
      'info': 1,
      'success': 1,
      'warning': 2,
      'critical': 3
    };

    return this.createAlert({
      tipo,
      titulo,
      mensagem,
      descricao,
      origem,
      ip_address: ipAddress,
      details,
      status: 'novo',
      severity_level: severityMap[tipo] || 1
    });
  }

  // Método para marcar alertas como visualizados em lote
  async markAlertsAsViewed(alertIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ 
          status: 'visualizado',
          updated_at: new Date().toISOString()
        })
        .in('id', alertIds)
        .eq('status', 'novo');

      if (error) {
        console.error('Erro ao marcar alertas como visualizados:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao marcar alertas como visualizados:', error);
      return false;
    }
  }
}

export const alertsService = new AlertsService(); 