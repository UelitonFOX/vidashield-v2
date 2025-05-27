import { supabase } from './supabaseClient';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// ===== INTERFACES =====

export interface AuthLog {
  id: string;
  user_id?: string;
  action: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'account_locked' | 'session_expired';
  email?: string;
  provider?: string;
  ip_address?: string;
  user_agent?: string;
  location?: any;
  device_info?: any;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  session_id?: string;
  success?: boolean;
  failure_reason?: string;
  session_duration?: number;
  risk_score?: number;
  metadata?: any;
  created_at: string;
}

export interface ThreatDetection {
  id: string;
  threat_type: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  source_ip: string;
  country?: string;
  city?: string;
  description: string;
  attack_pattern?: string;
  status: 'detected' | 'investigating' | 'confirmed' | 'false_positive' | 'mitigated';
  auto_blocked?: boolean;
  user_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface DynamicFirewallRule {
  id: string;
  ip_address: string;
  rule_type: 'block' | 'rate_limit' | 'monitor' | 'whitelist';
  reason: string;
  threat_id?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  auto_generated?: boolean;
  is_active?: boolean;
  expires_at?: string;
  attempts_blocked?: number;
  last_attempt_at?: string;
  whitelist_reason?: string;
  created_by?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface SecurityConfig {
  id: string;
  config_key: string;
  config_value: any;
  description?: string;
  category?: string;
  is_active?: boolean;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SecurityStats {
  totalAuthLogs: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueIPs: number;
  activeThreats: number;
  blockedIPs: number;
  riskScore: number;
  topThreats: Array<{
    threat_type: string;
    count: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    count: number;
    risk_level: number;
  }>;
}

export interface SecurityLog {
  id: string;
  user_id: string;
  event: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface ActiveSession {
  id: string;
  user_id: string;
  device: string;
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
  user_agent: string;
}

export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

// ===== SERVIÇO DE LOGS DE AUTENTICAÇÃO =====

export const authLogsService = {
  // Criar log de autenticação
  async createAuthLog(log: Partial<AuthLog>): Promise<{ data: AuthLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('auth_logs')
        .insert([log])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar log de autenticação:', error);
      return { data: null, error };
    }
  },

  // Buscar logs de autenticação com filtros
  async getAuthLogs(filters: {
    limit?: number;
    offset?: number;
    action?: string;
    success?: boolean;
    email?: string;
    ip_address?: string;
    start_date?: string;
    end_date?: string;
    risk_threshold?: number;
  } = {}): Promise<{ data: AuthLog[]; error: any; count?: number }> {
    try {
      let query = supabase
        .from('auth_logs')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.success !== undefined) {
        query = query.eq('success', filters.success);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.ip_address) {
        query = query.eq('ip_address', filters.ip_address);
      }
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      if (filters.risk_threshold) {
        query = query.gte('risk_score', filters.risk_threshold);
      }

      // Ordenação e paginação
      query = query.order('created_at', { ascending: false });
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error, count } = await query;
      return { data: data || [], error, count: count || 0 };
    } catch (error) {
      console.error('Erro ao buscar logs de autenticação:', error);
      return { data: [], error };
    }
  },

  // Estatísticas de autenticação
  async getAuthStats(days: number = 7): Promise<{ data: any; error: any }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('auth_logs')
        .select('action, success, country, risk_score, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Processar estatísticas
      const stats = {
        total_logs: data.length,
        successful_logins: data.filter(log => log.action === 'login' && log.success).length,
        failed_logins: data.filter(log => log.action === 'failed_login' || (log.action === 'login' && !log.success)).length,
        unique_countries: [...new Set(data.map(log => log.country).filter(Boolean))].length,
        average_risk_score: data.reduce((acc, log) => acc + (log.risk_score || 0), 0) / data.length,
        high_risk_attempts: data.filter(log => (log.risk_score || 0) >= 70).length
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de autenticação:', error);
      return { data: null, error };
    }
  }
};

// ===== SERVIÇO DE DETECÇÃO DE AMEAÇAS =====

export const threatDetectionService = {
  // Criar detecção de ameaça
  async createThreat(threat: Partial<ThreatDetection>): Promise<{ data: ThreatDetection | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('threats')
        .insert([threat])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar detecção de ameaça:', error);
      return { data: null, error };
    }
  },

  // Buscar ameaças detectadas
  async getThreats(filters: {
    limit?: number;
    threat_type?: string;
    severity_level?: number;
    status?: string;
    source_ip?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{ data: ThreatDetection[]; error: any }> {
    try {
      let query = supabase
        .from('threats')
        .select('*');

      // Aplicar filtros
      if (filters.threat_type) {
        query = query.eq('threat_type', filters.threat_type);
      }
      if (filters.severity_level) {
        // Mapear severity_level para severity
        const severityMap: { [key: number]: string } = {
          1: 'baixa',
          2: 'baixa', 
          3: 'media',
          4: 'alta',
          5: 'critica'
        };
        const severity = severityMap[filters.severity_level] || 'media';
        query = query.eq('severity', severity);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.source_ip) {
        query = query.eq('source_ip', filters.source_ip);
      }
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      query = query.order('created_at', { ascending: false });
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar ameaças:', error);
      return { data: [], error };
    }
  },

  // Atualizar status da ameaça
  async updateThreatStatus(id: string, status: ThreatDetection['status']): Promise<{ data: ThreatDetection | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('threats')
        .update({ 
          status,
          resolved_at: status === 'mitigated' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar status da ameaça:', error);
      return { data: null, error };
    }
  },

  // Estatísticas de ameaças
  async getThreatStats(): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('threats')
        .select('threat_type, severity, status, created_at');

      if (error) throw error;

      const stats = {
        total_threats: data.length,
        active_threats: data.filter(t => t.status === 'detected' || t.status === 'investigating').length,
        critical_threats: data.filter(t => t.severity === 'critica' || t.severity === 'alta').length,
        resolved_threats: data.filter(t => t.status === 'mitigated').length,
        threat_types: data.reduce((acc: any, threat) => {
          acc[threat.threat_type] = (acc[threat.threat_type] || 0) + 1;
          return acc;
        }, {})
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de ameaças:', error);
      return { data: null, error };
    }
  }
};

// ===== SERVIÇO DE FIREWALL DINÂMICO =====

export const firewallService = {
  // Criar regra de firewall
  async createRule(rule: Partial<DynamicFirewallRule>): Promise<{ data: DynamicFirewallRule | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('dynamic_firewall')
        .insert([rule])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar regra de firewall:', error);
      return { data: null, error };
    }
  },

  // Buscar regras de firewall
  async getRules(filters: {
    limit?: number;
    rule_type?: string;
    is_active?: boolean;
    ip_address?: string;
    severity?: number;
  } = {}): Promise<{ data: DynamicFirewallRule[]; error: any }> {
    try {
      let query = supabase
        .from('dynamic_firewall')
        .select('*');

      if (filters.rule_type) {
        query = query.eq('rule_type', filters.rule_type);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.ip_address) {
        query = query.eq('ip_address', filters.ip_address);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      query = query.order('created_at', { ascending: false });
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar regras de firewall:', error);
      return { data: [], error };
    }
  },

  // Ativar/desativar regra
  async toggleRule(id: string, is_active: boolean): Promise<{ data: DynamicFirewallRule | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('dynamic_firewall')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao alterar status da regra:', error);
      return { data: null, error };
    }
  },

  // Deletar regra
  async deleteRule(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('dynamic_firewall')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar regra de firewall:', error);
      return { error };
    }
  }
};

// ===== SERVIÇO DE CONFIGURAÇÕES =====

export const securityConfigService = {
  // Buscar todas as configurações
  async getConfigs(category?: string): Promise<{ data: SecurityConfig[]; error: any }> {
    try {
      let query = supabase
        .from('security_config')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('category');
      return { data: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return { data: [], error };
    }
  },

  // Atualizar configuração
  async updateConfig(key: string, value: any): Promise<{ data: SecurityConfig | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('security_config')
        .update({ config_value: value })
        .eq('config_key', key)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      return { data: null, error };
    }
  }
};

// ===== SERVIÇO PRINCIPAL DE SEGURANÇA =====

export const securityService = {
  authLogs: authLogsService,
  threats: threatDetectionService,
  firewall: firewallService,
  config: securityConfigService,

  // Dashboard de segurança unificado
  async getSecurityDashboard(): Promise<{ data: SecurityStats | null; error: any }> {
    try {
      const [authStats, threatStats, firewallRules] = await Promise.all([
        authLogsService.getAuthStats(7),
        threatDetectionService.getThreatStats(),
        firewallService.getRules({ is_active: true })
      ]);

      if (authStats.error || threatStats.error || firewallRules.error) {
        throw new Error('Erro ao buscar dados do dashboard');
      }

      const dashboard: SecurityStats = {
        totalAuthLogs: authStats.data?.total_logs || 0,
        successfulLogins: authStats.data?.successful_logins || 0,
        failedLogins: authStats.data?.failed_logins || 0,
        uniqueIPs: authStats.data?.unique_countries || 0,
        activeThreats: threatStats.data?.active_threats || 0,
        blockedIPs: firewallRules.data?.filter(r => r.rule_type === 'block').length || 0,
        riskScore: Math.round(authStats.data?.average_risk_score || 0),
        topThreats: Object.entries(threatStats.data?.threat_types || {}).map(([type, count]) => ({
          threat_type: type,
          count: count as number
        })),
        geographicDistribution: []
      };

      return { data: dashboard, error: null };
    } catch (error) {
      console.error('Erro ao buscar dashboard de segurança:', error);
      return { data: null, error };
    }
  },

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword
      })

      if (signInError) {
        throw new Error('Senha atual incorreta')
      }

      // Alterar para nova senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      // Log da alteração
      await this.addSecurityLog('Senha alterada', 'warning')
      
      return true
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      await this.addSecurityLog('Tentativa de alteração de senha falhada', 'error')
      return false
    }
  },

  // Configurar 2FA
  async setup2FA(): Promise<TwoFactorSetup | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return null

      // Gerar secret usando otplib
      const secret = authenticator.generateSecret()
      const qrCode = await this.generateQRCode(user.user.email!, secret)
      const backupCodes = this.generateBackupCodes()

      // Salvar temporariamente na tabela two_factor_auth (ainda não ativado)
      const { error } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: user.user.id,
          secret: secret,
          backup_codes: backupCodes,
          enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Erro ao salvar configuração 2FA:', error)
        return null
      }
      
      await this.addSecurityLog('Configuração 2FA iniciada', 'info')

      return {
        secret,
        qr_code: qrCode,
        backup_codes: backupCodes
      }
    } catch (error) {
      console.error('Erro ao configurar 2FA:', error)
      return null
    }
  },

  // Ativar 2FA
  async enable2FA(token: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return false

      // Buscar o secret salvo na configuração
      const { data: twoFactorData, error: fetchError } = await supabase
        .from('two_factor_auth')
        .select('secret')
        .eq('user_id', user.user.id)
        .single()

      if (fetchError || !twoFactorData) {
        console.error('Secret não encontrado:', fetchError)
        return false
      }

      // Verificar token usando o secret real
      const isValid = authenticator.verify({
        token: token,
        secret: twoFactorData.secret
      })

      if (!isValid) {
        await this.addSecurityLog('Token 2FA inválido fornecido', 'warning')
        return false
      }

      // Ativar 2FA nas duas tabelas
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          two_factor_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id)

      const { error: twoFactorError } = await supabase
        .from('two_factor_auth')
        .update({
          enabled: true,
          enabled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)

      if (profileError || twoFactorError) {
        console.error('Erro ao ativar 2FA:', profileError || twoFactorError)
        return false
      }
      
      await this.addSecurityLog('2FA ativado com sucesso', 'success')
      return true
    } catch (error) {
      console.error('Erro ao ativar 2FA:', error)
      return false
    }
  },

  // Desativar 2FA
  async disable2FA(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return false

      // Desativar 2FA nas duas tabelas
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          two_factor_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id)

      const { error: twoFactorError } = await supabase
        .from('two_factor_auth')
        .update({
          enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)

      if (profileError || twoFactorError) {
        console.error('Erro ao desativar 2FA:', profileError || twoFactorError)
        return false
      }
      
      await this.addSecurityLog('2FA desativado', 'warning')
      return true
    } catch (error) {
      console.error('Erro ao desativar 2FA:', error)
      return false
    }
  },

  // Verificar status do 2FA
  async get2FAStatus(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return false

      const { data, error } = await supabase
        .from('user_profiles')
        .select('two_factor_enabled')
        .eq('id', user.user.id)
        .single()

      if (error) {
        console.error('Erro ao verificar status 2FA:', error)
        return false
      }

      return data?.two_factor_enabled || false
    } catch (error) {
      console.error('Erro ao verificar status 2FA:', error)
      return false
    }
  },

  // Obter sessões ativas
  async getActiveSessions(): Promise<ActiveSession[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return []

      // Buscar sessões ativas do banco de dados
      const { data: sessions, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false })

      if (error) {
        console.error('Erro ao buscar sessões:', error)
        return []
      }

      // Transformar dados do banco para o formato esperado
      return sessions.map(session => ({
        id: session.id,
        user_id: session.user_id,
        device: session.device || this.parseUserAgent(session.user_agent || ''),
        location: session.location || 'Local Desconhecido',
        ip_address: session.ip_address || 'IP Desconhecido',
        last_active: session.last_activity || session.login_at || new Date().toISOString(),
        is_current: session.is_current || false,
        user_agent: session.user_agent || 'User Agent Desconhecido'
      }))
    } catch (error) {
      console.error('Erro ao obter sessões:', error)
      return []
    }
  },

  // Revogar sessão
  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return false

      // Chamar função SQL para revogar sessão
      const { error } = await supabase.rpc('revoke_user_session', {
        session_id: sessionId,
        user_id_param: user.user.id
      })

      if (error) {
        console.error('Erro ao revogar sessão:', error)
        return false
      }

      await this.addSecurityLog(`Sessão ${sessionId} revogada`, 'warning')
      return true
    } catch (error) {
      console.error('Erro ao revogar sessão:', error)
      return false
    }
  },

  // Revogar todas as outras sessões
  async revokeAllOtherSessions(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return false

      // Chamar função SQL para revogar todas as outras sessões
      const { error } = await supabase.rpc('revoke_all_other_sessions', {
        user_id_param: user.user.id
      })

      if (error) {
        console.error('Erro ao revogar todas as sessões:', error)
        return false
      }

      await this.addSecurityLog('Todas as outras sessões foram revogadas', 'warning')
      return true
    } catch (error) {
      console.error('Erro ao revogar sessões:', error)
      return false
    }
  },

  // Obter logs de segurança
  async getSecurityLogs(limit: number = 10): Promise<SecurityLog[]> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return []

      // Buscar logs reais do banco de dados
      const { data: logs, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user.user.id)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Erro ao buscar logs de segurança:', error)
        return []
      }

      // Transformar dados do banco para o formato esperado
      return logs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        event: log.event,
        ip_address: log.ip_address || 'IP Desconhecido',
        user_agent: log.user_agent || 'User Agent Desconhecido',
        timestamp: log.timestamp,
        type: log.type
      }))
    } catch (error) {
      console.error('Erro ao obter logs:', error)
      return []
    }
  },

  // Adicionar log de segurança
  async addSecurityLog(event: string, type: SecurityLog['type']): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const ip = await this.getCurrentIP()
      
      // Salvar log no banco de dados
      const { error } = await supabase
        .from('security_logs')
        .insert({
          user_id: user.user.id,
          event: event,
          type: type,
          ip_address: ip,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })

      if (error) {
        console.error('Erro ao salvar log de segurança:', error)
      }

      console.log(`[SECURITY LOG] ${type.toUpperCase()}: ${event} - IP: ${ip}`)
    } catch (error) {
      console.error('Erro ao adicionar log:', error)
    }
  },

  // Métodos utilitários privados

  async generateQRCode(email: string, secret: string): Promise<string> {
    try {
      const issuer = 'VidaShield'
      const otpauth = authenticator.keyuri(email, issuer, secret)
      
      // Gerar QR Code real usando a biblioteca qrcode
      const qrCodeDataURL = await QRCode.toDataURL(otpauth)
      return qrCodeDataURL
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      // Fallback para API externa se houver erro
      const issuer = 'VidaShield'
      const otpauth = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`
    }
  },

  generateBackupCodes(): string[] {
    const codes = []
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push(code)
    }
    return codes
  },

  async verify2FAToken(token: string, secret?: string): Promise<boolean> {
    try {
      if (!secret) {
        // Se não foi fornecido o secret, buscar do usuário atual
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) return false

        const { data: twoFactorData, error } = await supabase
          .from('two_factor_auth')
          .select('secret')
          .eq('user_id', user.user.id)
          .eq('enabled', true)
          .single()

        if (error || !twoFactorData) return false
        secret = twoFactorData.secret
      }

      // Validar token TOTP real usando otplib
      if (!secret) return false
      
      return authenticator.verify({
        token: token,
        secret: secret
      })
    } catch (error) {
      console.error('Erro ao verificar token 2FA:', error)
      return false
    }
  },

  async getCurrentIP(): Promise<string> {
    try {
      // Em produção, você obteria o IP real
      return '192.168.1.100'
    } catch {
      return 'Unknown'
    }
  },

  parseUserAgent(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome - Windows'
    if (userAgent.includes('Firefox')) return 'Firefox - Windows'
    if (userAgent.includes('Safari')) return 'Safari - macOS'
    if (userAgent.includes('Edge')) return 'Edge - Windows'
    return 'Navegador Desconhecido'
  }
}; 