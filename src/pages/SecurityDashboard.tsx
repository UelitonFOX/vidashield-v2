import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Eye,
  Ban,
  Users,
  Globe,
  Activity,
  Clock,
  TrendingUp,
  Target,
  Lock,
  Unlock,
  Settings,
  Loader2,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { securityService, AuthLog, ThreatDetection, DynamicFirewallRule } from '../services/securityService';

interface SecurityMetrics {
  totalLogs: number;
  successfulLogins: number;
  failedLogins: number;
  blockedAttempts: number;
  activeThreats: number;
  riskScore: number;
}

const SecurityDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalLogs: 0,
    successfulLogins: 0,
    failedLogins: 0,
    blockedAttempts: 0,
    activeThreats: 0,
    riskScore: 0
  });
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [firewallRules, setFirewallRules] = useState<DynamicFirewallRule[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'auth' | 'threats' | 'firewall'>('overview');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // Conectado ao Supabase real - dados em tempo real
      const [dashboardResult, authLogsResult, threatsResult, firewallResult] = await Promise.all([
        securityService.getSecurityDashboard(),
        securityService.authLogs.getAuthLogs({ limit: 10 }),
        securityService.threats.getThreats({ limit: 10 }),
        securityService.firewall.getRules({ limit: 10, is_active: true })
      ]);

      if (dashboardResult.data) {
        setMetrics({
          totalLogs: dashboardResult.data.totalAuthLogs,
          successfulLogins: dashboardResult.data.successfulLogins,
          failedLogins: dashboardResult.data.failedLogins,
          blockedAttempts: dashboardResult.data.blockedIPs,
          activeThreats: dashboardResult.data.activeThreats,
          riskScore: dashboardResult.data.riskScore
        });
      } else {
        // Fallback se houver problema nas consultas
        setMetrics({
          totalLogs: 0,
          successfulLogins: 0,
          failedLogins: 0,
          blockedAttempts: 0,
          activeThreats: 0,
          riskScore: 0
        });
      }

      setAuthLogs(authLogsResult.data || []);
      setThreats(threatsResult.data || []);
      setFirewallRules(firewallResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-green-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critica': return 'text-red-400 bg-red-500/20';
      case 'alta': return 'text-red-400 bg-red-500/10';
      case 'media': return 'text-yellow-400 bg-yellow-500/20';
      case 'baixa': return 'text-green-400 bg-green-500/20';
      default: return 'text-zinc-400 bg-zinc-500/20';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login': return <Users className="w-4 h-4 text-green-400" />;
      case 'logout': return <Unlock className="w-4 h-4 text-blue-400" />;
      case 'failed_login': return <Lock className="w-4 h-4 text-red-400" />;
      case 'password_reset': return <Settings className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-6 bg-green-400 rounded-full"></div>
          <h1 className="text-2xl font-bold text-white">Segurança Avançada</h1>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
            <p className="text-zinc-400">Carregando dados de segurança...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 bg-green-400 rounded-full"></div>
          <h1 className="text-2xl font-bold text-white">Segurança Avançada</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSecurityData}
            className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-zinc-400">24h</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{metrics.totalLogs}</div>
          <div className="text-xs text-zinc-400">Total de Logs</div>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-xs text-zinc-400">Sucesso</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{metrics.successfulLogins}</div>
          <div className="text-xs text-zinc-400">Logins OK</div>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <Lock className="w-5 h-5 text-red-400" />
            <span className="text-xs text-zinc-400">Falha</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{metrics.failedLogins}</div>
          <div className="text-xs text-zinc-400">Tentativas</div>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <Ban className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-zinc-400">Ativo</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">{metrics.blockedAttempts}</div>
          <div className="text-xs text-zinc-400">IPs Bloqueados</div>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-zinc-400">Ativo</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{metrics.activeThreats}</div>
          <div className="text-xs text-zinc-400">Ameaças</div>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-zinc-400">Geral</span>
          </div>
          <div className={`text-2xl font-bold ${getRiskColor(metrics.riskScore)}`}>
            {metrics.riskScore}%
          </div>
          <div className="text-xs text-zinc-400">Risco</div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="border-b border-zinc-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: <Eye className="w-4 h-4" /> },
            { id: 'auth', label: 'Logs de Autenticação', icon: <Users className="w-4 h-4" /> },
            { id: 'threats', label: 'Ameaças Detectadas', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'firewall', label: 'Firewall Dinâmico', icon: <Shield className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                selectedTab === tab.id
                  ? 'border-green-400 text-green-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      <div className="space-y-6">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ameaças Recentes */}
            <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Ameaças Recentes
              </h3>
              <div className="space-y-3">
                {threats.slice(0, 5).map((threat) => (
                  <div key={threat.id} className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-200">{threat.threat_type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">{threat.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{threat.source_ip}</span>
                      <span className="text-xs text-zinc-500">{formatDateTime(threat.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Firewall Ativo */}
            <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Regras Ativas do Firewall
              </h3>
              <div className="space-y-3">
                {firewallRules.slice(0, 5).map((rule) => (
                  <div key={rule.id} className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-zinc-200">{rule.ip_address}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rule.rule_type === 'block' ? 'text-red-400 bg-red-500/20' :
                        rule.rule_type === 'rate_limit' ? 'text-yellow-400 bg-yellow-500/20' :
                        rule.rule_type === 'monitor' ? 'text-blue-400 bg-blue-500/20' :
                        'text-green-400 bg-green-500/20'
                      }`}>
                        {rule.rule_type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">{rule.reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        Bloqueios: {rule.attempts_blocked || 0}
                      </span>
                      <span className="text-xs text-zinc-500">{formatDateTime(rule.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'auth' && (
          <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Logs de Autenticação Recentes
            </h3>
            <div className="space-y-3">
              {authLogs.map((log) => (
                <div key={log.id} className="p-4 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium text-zinc-200">
                        {log.email || 'Usuário desconhecido'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.success ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                      }`}>
                        {log.success ? 'Sucesso' : 'Falha'}
                      </span>
                      {log.risk_score && (
                        <span className={`text-xs px-2 py-1 rounded ${getRiskColor(log.risk_score)} bg-zinc-700/50`}>
                          Risco: {log.risk_score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>IP: {log.ip_address || 'N/A'}</span>
                    <span>{log.country && log.city ? `${log.city}, ${log.country}` : 'Localização desconhecida'}</span>
                    <span>{formatDateTime(log.created_at)}</span>
                  </div>
                  {log.failure_reason && (
                    <p className="text-xs text-red-400 mt-1">Motivo: {log.failure_reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'threats' && (
          <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Ameaças Detectadas
            </h3>
            <div className="space-y-4">
              {threats.map((threat) => (
                <div key={threat.id} className="p-4 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${
                        threat.severity === 'critica' ? 'text-red-400' : 
                        threat.severity === 'alta' ? 'text-yellow-400' : 
                        'text-orange-400'
                      }`} />
                      <span className="text-lg font-medium text-zinc-200">{threat.threat_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        threat.status === 'detected' ? 'text-red-400 bg-red-500/20' :
                        threat.status === 'investigating' ? 'text-yellow-400 bg-yellow-500/20' :
                        threat.status === 'mitigated' ? 'text-green-400 bg-green-500/20' :
                        'text-zinc-400 bg-zinc-500/20'
                      }`}>
                        {threat.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 mb-2">{threat.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-400">
                    <div>
                      <span className="text-zinc-500">IP Origem:</span>
                      <br />
                      <span className="font-mono">{threat.source_ip}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Tentativas:</span>
                      <br />
                      <span>1</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Detectado em:</span>
                      <br />
                      <span>{formatDateTime(threat.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Auto-bloqueado:</span>
                      <br />
                      <span className={threat.auto_blocked ? 'text-red-400' : 'text-zinc-400'}>
                        {threat.auto_blocked ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'firewall' && (
          <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Regras do Firewall Dinâmico
            </h3>
            <div className="space-y-4">
              {firewallRules.map((rule) => (
                <div key={rule.id} className="p-4 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono text-zinc-200">{rule.ip_address}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rule.rule_type === 'block' ? 'text-red-400 bg-red-500/20' :
                        rule.rule_type === 'rate_limit' ? 'text-yellow-400 bg-yellow-500/20' :
                        rule.rule_type === 'monitor' ? 'text-blue-400 bg-blue-500/20' :
                        'text-green-400 bg-green-500/20'
                      }`}>
                        {rule.rule_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        rule.severity >= 4 ? 'text-red-400 bg-red-500/20' :
                        rule.severity >= 3 ? 'text-yellow-400 bg-yellow-500/20' :
                        'text-green-400 bg-green-500/20'
                      }`}>
                        Nível {rule.severity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rule.is_active ? 'text-green-400 bg-green-500/20' : 'text-zinc-400 bg-zinc-500/20'
                      }`}>
                        {rule.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 mb-2">{rule.reason}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-400">
                    <div>
                      <span className="text-zinc-500">Tentativas Bloqueadas:</span>
                      <br />
                      <span className="text-red-400 font-medium">{rule.attempts_blocked || 0}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Criado em:</span>
                      <br />
                      <span>{formatDateTime(rule.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Expira em:</span>
                      <br />
                      <span>{rule.expires_at ? formatDateTime(rule.expires_at) : 'Permanente'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Auto-gerado:</span>
                      <br />
                      <span className={rule.auto_generated ? 'text-blue-400' : 'text-zinc-400'}>
                        {rule.auto_generated ? 'Sim' : 'Manual'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard; 