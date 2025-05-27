import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  BarChart3,
  Shield,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Globe,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { reportsService, SecurityReport, UsersReport, PerformanceReport, AnalyticsReport, ReportFilters } from '../services/reportsService';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [period, setPeriod] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados dos relatórios
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [usersReport, setUsersReport] = useState<UsersReport | null>(null);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);
  const [analyticsReport, setAnalyticsReport] = useState<AnalyticsReport | null>(null);

  const tabs: TabConfig[] = [
    {
      id: 'security',
      label: 'Segurança',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-red-400'
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-purple-400'
    }
  ];

  const periodOptions = [
    { value: '1d', label: 'Últimas 24h' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' }
  ];

  // Carregar dados dos relatórios
  const loadReports = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters: ReportFilters = { period };

      const [security, users, performance, analytics] = await Promise.all([
        reportsService.getSecurityReport(filters),
        reportsService.getUsersReport(filters),
        reportsService.getPerformanceReport(filters),
        reportsService.getAnalyticsReport(filters)
      ]);

      setSecurityReport(security);
      setUsersReport(users);
      setPerformanceReport(performance);
      setAnalyticsReport(analytics);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [period]);

  // Função para exportar relatório
  const handleExport = async (type: string) => {
    try {
      const reportData = await reportsService.exportReport(type, { period });
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type}-${period}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  // Cores para gráficos
  const chartColors = {
    primary: '#10b981',
    secondary: '#3b82f6',
    accent: '#8b5cf6',
    warning: '#f59e0b',
    danger: '#ef4444',
    success: '#10b981'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-400 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-blue-400/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
                <FileText className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  Relatórios
                </h1>
                <p className="text-zinc-400 mt-1">
                  Análises detalhadas e insights do sistema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Filtro de Período */}
              <div className="flex items-center gap-2 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700/50 p-1">
                <Calendar className="w-4 h-4 text-zinc-400 ml-2" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="bg-transparent text-zinc-300 text-sm border-none outline-none pr-3"
                  title="Selecionar período do relatório"
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-zinc-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão Refresh */}
              <button
                onClick={() => loadReports(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>

              {/* Botão Export */}
              <button
                onClick={() => handleExport(activeTab)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg border border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-blue-500/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>

          {/* Tabs Premium */}
          <div className="flex space-x-1 bg-zinc-800/30 backdrop-blur-sm rounded-xl p-1 border border-zinc-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 flex-1
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-zinc-300 hover:bg-white/5'
                  }
                `}
              >
                <span className={activeTab === tab.id ? tab.color : 'text-zinc-500'}>
                  {tab.icon}
                </span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'security' && securityReport && (
          <SecurityReportContent report={securityReport} chartColors={chartColors} />
        )}
        
        {activeTab === 'users' && usersReport && (
          <UsersReportContent report={usersReport} chartColors={chartColors} />
        )}
        
        {activeTab === 'performance' && performanceReport && (
          <PerformanceReportContent report={performanceReport} chartColors={chartColors} />
        )}
        
        {activeTab === 'analytics' && analyticsReport && (
          <AnalyticsReportContent report={analyticsReport} chartColors={chartColors} />
        )}
      </div>
    </div>
  );
};

// Componente do Relatório de Segurança
const SecurityReportContent: React.FC<{ report: SecurityReport; chartColors: any }> = ({ report, chartColors }) => (
  <div className="space-y-8">
    {/* Cards de Estatísticas */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Ameaças"
        value={report.total_threats}
        icon={<AlertTriangle className="w-6 h-6" />}
        color="from-red-500/20 to-orange-500/20"
        borderColor="border-red-500/30"
        textColor="text-red-400"
      />
      <StatCard
        title="IPs Bloqueados"
        value={report.blocked_ips}
        icon={<Shield className="w-6 h-6" />}
        color="from-yellow-500/20 to-orange-500/20"
        borderColor="border-yellow-500/30"
        textColor="text-yellow-400"
      />
      <StatCard
        title="Falhas de Auth"
        value={report.auth_failures}
        icon={<TrendingDown className="w-6 h-6" />}
        color="from-red-500/20 to-pink-500/20"
        borderColor="border-red-500/30"
        textColor="text-red-400"
      />
      <StatCard
        title="Taxa de Sucesso"
        value={`${Math.max(0, 100 - (report.auth_failures * 2))}%`}
        icon={<CheckCircle className="w-6 h-6" />}
        color="from-green-500/20 to-emerald-500/20"
        borderColor="border-green-500/30"
        textColor="text-green-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gráfico de Tendências */}
      <ChartCard title="Tendências de Segurança" subtitle="Ameaças e bloqueios nos últimos 7 dias">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={report.trend_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Area type="monotone" dataKey="threats" stackId="1" stroke={chartColors.danger} fill={chartColors.danger} fillOpacity={0.3} />
            <Area type="monotone" dataKey="blocks" stackId="1" stroke={chartColors.warning} fill={chartColors.warning} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Gráfico de Severidade */}
      <ChartCard title="Ameaças por Severidade" subtitle="Distribuição dos níveis de ameaça">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={report.threats_by_severity}
              dataKey="count"
              nameKey="severity"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
            >
              {report.threats_by_severity.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  entry.severity === 'critica' ? chartColors.danger :
                  entry.severity === 'alta' ? chartColors.warning :
                  entry.severity === 'media' ? chartColors.secondary :
                  chartColors.success
                } />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  </div>
);

// Componente do Relatório de Usuários
const UsersReportContent: React.FC<{ report: UsersReport; chartColors: any }> = ({ report, chartColors }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Usuários"
        value={report.total_users}
        icon={<Users className="w-6 h-6" />}
        color="from-green-500/20 to-emerald-500/20"
        borderColor="border-green-500/30"
        textColor="text-green-400"
      />
      <StatCard
        title="Usuários Ativos"
        value={report.active_users}
        icon={<TrendingUp className="w-6 h-6" />}
        color="from-blue-500/20 to-cyan-500/20"
        borderColor="border-blue-500/30"
        textColor="text-blue-400"
      />
      <StatCard
        title="Novos Hoje"
        value={report.new_users_today}
        icon={<Users className="w-6 h-6" />}
        color="from-purple-500/20 to-pink-500/20"
        borderColor="border-purple-500/30"
        textColor="text-purple-400"
      />
      <StatCard
        title="Taxa de Sucesso"
        value={`${report.auth_success_rate.toFixed(1)}%`}
        icon={<CheckCircle className="w-6 h-6" />}
        color="from-green-500/20 to-emerald-500/20"
        borderColor="border-green-500/30"
        textColor="text-green-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartCard title="Tentativas de Login" subtitle="Sucessos vs falhas nos últimos 7 dias">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={report.login_attempts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Bar dataKey="success" fill={chartColors.success} />
            <Bar dataKey="failed" fill={chartColors.danger} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Distribuição Geográfica" subtitle="Usuários por país">
        <div className="space-y-4">
          {report.geographic_data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-300">{item.country}</span>
              </div>
              <span className="text-green-400 font-medium">{item.users}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  </div>
);

// Componente do Relatório de Performance
const PerformanceReportContent: React.FC<{ report: PerformanceReport; chartColors: any }> = ({ report, chartColors }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Tempo Médio"
        value={`${report.avg_response_time}ms`}
        icon={<Clock className="w-6 h-6" />}
        color="from-blue-500/20 to-cyan-500/20"
        borderColor="border-blue-500/30"
        textColor="text-blue-400"
      />
      <StatCard
        title="Disponibilidade"
        value={`${report.uptime_percentage.toFixed(2)}%`}
        icon={<CheckCircle className="w-6 h-6" />}
        color="from-green-500/20 to-emerald-500/20"
        borderColor="border-green-500/30"
        textColor="text-green-400"
      />
      <StatCard
        title="Total Requests"
        value={report.total_requests}
        icon={<Activity className="w-6 h-6" />}
        color="from-purple-500/20 to-pink-500/20"
        borderColor="border-purple-500/30"
        textColor="text-purple-400"
      />
      <StatCard
        title="Taxa de Erro"
        value={`${report.error_rate}%`}
        icon={<AlertTriangle className="w-6 h-6" />}
        color="from-red-500/20 to-orange-500/20"
        borderColor="border-red-500/30"
        textColor="text-red-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartCard title="Métricas Diárias" subtitle="Performance dos últimos 7 dias">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={report.daily_metrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Line type="monotone" dataKey="requests" stroke={chartColors.primary} strokeWidth={2} />
            <Line type="monotone" dataKey="avg_time" stroke={chartColors.secondary} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Horários de Pico" subtitle="Distribuição de requests por hora">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={report.peak_usage_hours}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Bar dataKey="requests" fill={chartColors.accent} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  </div>
);

// Componente do Relatório de Analytics
const AnalyticsReportContent: React.FC<{ report: AnalyticsReport; chartColors: any }> = ({ report, chartColors }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Page Views"
        value={report.page_views}
        icon={<BarChart3 className="w-6 h-6" />}
        color="from-purple-500/20 to-pink-500/20"
        borderColor="border-purple-500/30"
        textColor="text-purple-400"
      />
      <StatCard
        title="Visitantes Únicos"
        value={report.unique_visitors}
        icon={<Users className="w-6 h-6" />}
        color="from-green-500/20 to-emerald-500/20"
        borderColor="border-green-500/30"
        textColor="text-green-400"
      />
      <StatCard
        title="Taxa de Rejeição"
        value={`${report.bounce_rate}%`}
        icon={<TrendingDown className="w-6 h-6" />}
        color="from-red-500/20 to-orange-500/20"
        borderColor="border-red-500/30"
        textColor="text-red-400"
      />
      <StatCard
        title="Duração Média"
        value={`${report.avg_session_duration}min`}
        icon={<Clock className="w-6 h-6" />}
        color="from-blue-500/20 to-cyan-500/20"
        borderColor="border-blue-500/30"
        textColor="text-blue-400"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartCard title="Páginas Mais Visitadas" subtitle="Top 5 páginas do sistema">
        <div className="space-y-4">
          {report.top_pages.map((page, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded border border-purple-500/30 flex items-center justify-center">
                  <span className="text-xs text-purple-400">{index + 1}</span>
                </div>
                <span className="text-zinc-300 font-mono text-sm">{page.page}</span>
              </div>
              <span className="text-purple-400 font-medium">{page.views}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Dispositivos" subtitle="Distribuição por tipo de dispositivo">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={report.device_breakdown}
              dataKey="percentage"
              nameKey="device"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
            >
              {report.device_breakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  index === 0 ? chartColors.primary :
                  index === 1 ? chartColors.secondary :
                  chartColors.accent
                } />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  </div>
);

// Componente de Card de Estatística Premium
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  textColor: string;
}> = ({ title, value, icon, color, borderColor, textColor }) => (
  <div className={`
    p-6 rounded-xl bg-gradient-to-br ${color} backdrop-blur-sm 
    border ${borderColor} transition-all duration-300 
    hover:shadow-lg hover:shadow-black/20 hover:scale-105
  `}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg bg-black/20 ${textColor}`}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-sm text-zinc-300">
      {title}
    </div>
  </div>
);

// Componente de Card de Gráfico Premium
const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="p-6 rounded-xl bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 hover:border-zinc-600/50 transition-all">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default Reports; 