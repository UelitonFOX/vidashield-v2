import { useState, useEffect } from "react";
import { useModal } from "../contexts/ModalContext";
import { Ajuda } from "./Ajuda";
import "../styles/vidashield.css";
import { 
  CircuitBoard as Api, 
  Database, 
  ShieldCheck as Authentication, 
  Clock as LastUpdate, 
  RefreshCw as Refresh,
  Users2 as UserActive,
  KeyRound as LoginToday,
  ShieldX as BlockedAttempts,
  AlertTriangle as CriticalAlerts,
  ArrowRightCircle as ViewAll,
  ServerCrash as IpAlert,
  RotateCw as PasswordChange,
  TrendingUp as AccessTrend,
  MapPin as Location,
  Globe as Browser,
  MonitorSmartphone as OS,
  AlertOctagon as Warning,
  HelpCircle as Help,
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart,
  Shield,
  Calendar
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  LineChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  LabelList
} from "recharts";
import type { TooltipProps } from "recharts";

// Definindo interfaces para os tipos de dados
interface StatsData {
  total_usuarios: number;
  logins_hoje: number;
  alertas_criticos: number;
  acessos_semana: number[];
  tentativas_bloqueadas?: number[]; // Nova propriedade para tentativas bloqueadas
}

interface Insight {
  type: string;
  text: string;
}

interface Alerta {
  id: number;
  tipo: string;
  severidade: string;
  mensagem: string;
  data: string;
  resolvido: boolean;
}

interface UsuarioBloqueado {
  id: number;
  email: string;
  nome?: string;
  ip: string;
  local: string;
  timestamp: string;
  sistema: string;
  tentativas: number;
}

interface ChartData {
  name: string;
  acessos: number;
  tentativas: number;
}

type ChartViewType = 'bar' | 'line' | 'area';
type ChartPeriodType = '7d' | '15d' | '30d';

// Componente para conteúdo da ajuda em modal
const AjudaModalContent = () => {
  return <Ajuda modalView={true} />;
};

export const Dashboard = () => {
  const { openModal } = useModal();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsData>({
    total_usuarios: 0,
    logins_hoje: 0,
    alertas_criticos: 0,
    acessos_semana: [0, 0, 0, 0, 0, 0, 0],
    tentativas_bloqueadas: [0, 0, 0, 0, 0, 0, 0]
  });
  const [insights, setInsights] = useState<Insight[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [usuariosBloqueados, setUsuariosBloqueados] = useState<UsuarioBloqueado[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [chartView, setChartView] = useState<ChartViewType>('bar');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriodType>('7d');
  const [visibleSeries, setVisibleSeries] = useState<{
    acessos: boolean;
    tentativas: boolean;
  }>({
    acessos: true,
    tentativas: true
  });

  // Status do sistema
  const [systemStatus] = useState({
    api: "online",
    database: "PostgreSQL",
    auth: "online",
  });

  // Carregar dados reais das APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tentativa de buscar dados reais - utilizando endpoints relativos
        const statsResponse = await fetch("/api/dashboard/data");
        
        if (!statsResponse.ok) {
          throw new Error(`Erro na requisição: ${statsResponse.status} ${statsResponse.statusText}`);
        }
        
        const contentType = statsResponse.headers.get("content-type");
        // Log para verificar o tipo de conteúdo
        console.log("Content-Type da API:", contentType);

        if (!contentType || !contentType.includes("application/json")) {
          // Log do corpo da resposta como texto para depuração
          const responseText = await statsResponse.text();
          console.error("Corpo da resposta não JSON:", responseText);
          throw new Error("Resposta da API não está no formato JSON esperado");
        }

        // Processando resposta como JSON
        const statsData = await statsResponse.json();
        
        // Buscando insights e alertas apenas se a primeira chamada for bem-sucedida
        const [insightsResponse, alertasResponse] = await Promise.all([
          fetch("/api/dashboard/insights/multiple?count=4"),
          fetch("/api/alerts?limit=5&resolved=false")
        ]);

        // Verificar se as requisições foram bem-sucedidas
        if (!insightsResponse.ok || !alertasResponse.ok) {
          throw new Error("Falha ao obter dados adicionais da API");
        }

        // Processar os dados obtidos
        const insightsData = await insightsResponse.json();
        const alertasData = await alertasResponse.json();

        // Mapear/formatar os dados conforme necessário
        setStatsData({
          total_usuarios: statsData.total_usuarios || 0,
          logins_hoje: statsData.logins_hoje || 0,
          alertas_criticos: statsData.alertas_criticos || 0,
          acessos_semana: statsData.acessos_semana || [0, 0, 0, 0, 0, 0, 0],
          tentativas_bloqueadas: statsData.tentativas_bloqueadas || [0, 0, 0, 0, 0, 0, 0]
        });

        setInsights(insightsData || []);
        
        // Formatar alertas para o formato esperado pela interface
        const alertasFormatados = alertasData.alerts?.map((alerta: any) => ({
          id: alerta.id,
          tipo: alerta.type,
          severidade: alerta.severity,
          mensagem: alerta.details?.message || alerta.type,
          data: new Date(alerta.timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          resolvido: alerta.resolved
        })) || [];
        
        setAlertas(alertasFormatados);

        // Obter usuários bloqueados - filtrar alertas do tipo "Tentativa de intrusão"
        try {
          const usuariosBlockResponse = await fetch("/api/alerts?type=Tentativa de intrusão&limit=10");
          
          if (usuariosBlockResponse.ok) {
            const bloqueadosData = await usuariosBlockResponse.json();
            
            // Mapear dados de alertas para o formato de usuários bloqueados
            const usuariosBloqueados = bloqueadosData.alerts?.map((alerta: any) => ({
              id: alerta.id,
              email: alerta.details?.email || "email@desconhecido.com",
              nome: alerta.details?.user_name,
              ip: alerta.details?.ip_address || "0.0.0.0",
              local: alerta.details?.location || "Local desconhecido",
              timestamp: new Date(alerta.timestamp).toLocaleString('pt-BR'),
              sistema: alerta.details?.user_agent || "Sistema desconhecido",
              tentativas: alerta.details?.attempts || 3
            })) || [];
            
            setUsuariosBloqueados(usuariosBloqueados);
          }
        } catch (e) {
          console.warn("Erro ao carregar dados de usuários bloqueados, usando dados mockados:", e);
          // Usa dados mockados apenas para usuários bloqueados se falhar
          setUsuariosBloqueados(getMockUsuariosBloqueados());
        }

        setLastUpdate(new Date());
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        
        // Em caso de falha, usar dados mockados como fallback
        usarDadosMockados();
      } finally {
        setLoading(false);
      }
    };

    // Função para obter dados mockados de usuários bloqueados
    const getMockUsuariosBloqueados = (): UsuarioBloqueado[] => {
      return [
        { 
          id: 1, 
          email: "usuario.suspeito@mail.com", 
          nome: "Usuário Desconhecido", 
          ip: "45.67.89.123", 
          local: "Kiev, Ucrânia", 
          timestamp: "08/05/2025, 10:25:43", 
          sistema: "Windows 10, Chrome",
          tentativas: 5
        },
        { 
          id: 2, 
          email: "teste@hackers.net", 
          ip: "178.154.200.58", 
          local: "Moscou, Rússia", 
          timestamp: "08/05/2025, 09:17:22", 
          sistema: "Linux, Firefox",
          tentativas: 8
        },
        { 
          id: 3, 
          email: "admin@clinica.com.br", 
          nome: "Tentativa em conta admin", 
          ip: "111.90.151.94", 
          local: "Pequim, China", 
          timestamp: "07/05/2025, 22:56:04", 
          sistema: "MacOS, Safari",
          tentativas: 4
        }
      ];
    };

    // Função de fallback com dados mockados
    const usarDadosMockados = () => {
      // Simulando resposta da API
      const mockStatsData: StatsData = {
        total_usuarios: 75,
        logins_hoje: 23,
        alertas_criticos: 3,
        acessos_semana: [15, 28, 18, 42, 30, 22, 37],
        tentativas_bloqueadas: [1, 0, 3, 5, 0, 4, 2] // Dados mockados para tentativas bloqueadas
      };
      
      // Mockando dados de insights
      const mockInsights: Insight[] = [
        { type: "security", text: "192.168.1.105 teve 4 tentativas bloqueadas nas últimas 2h." },
        { type: "security", text: "Usuário pedro@clinica.com.br trocou a senha 2 vezes em 5 dias." },
        { type: "trend", text: "Aumento de 25% em acessos na última semana." },
        { type: "location", text: "Mais acessos vindos de Londrina nas últimas 24h." }
      ];
      
      // Mockando alertas recentes
      const mockAlertas: Alerta[] = [
        { id: 1, tipo: "critical", severidade: "critical", mensagem: "Múltiplas falhas de login", data: "08/05, 10:25", resolvido: false },
        { id: 2, tipo: "warning", severidade: "warning", mensagem: "Novo dispositivo detectado", data: "08/05, 09:15", resolvido: true },
        { id: 3, tipo: "critical", severidade: "critical", mensagem: "Acesso de IP não autorizado", data: "07/05, 18:42", resolvido: false },
        { id: 4, tipo: "warning", severidade: "warning", mensagem: "Senha fraca detectada", data: "07/05, 15:30", resolvido: false },
        { id: 5, tipo: "info", severidade: "info", mensagem: "Backup concluído com sucesso", data: "07/05, 12:15", resolvido: true }
      ];

      setStatsData(mockStatsData);
      setInsights(mockInsights);
      setAlertas(mockAlertas);
      setUsuariosBloqueados(getMockUsuariosBloqueados());
      setLastUpdate(new Date());
    };

    fetchData();
  }, []);

  // Função para atualizar dados
  const handleRefresh = () => {
    setLoading(true);
    // Recarregar dados usando o useEffect
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Função para abrir modal de ajuda
  const handleOpenAjuda = () => {
    openModal("Central de Ajuda", <AjudaModalContent />, "xl");
  };

  // Mapear tipos de alerta para classes de badge
  const getSeverityBadgeClass = (severity: string): string => {
    const map: Record<string, string> = {
      critical: "badge-alerta",
      warning: "badge-pendente",
      info: "badge-ativo",
    };
    return map[severity] || "badge-inativo";
  };

  // Gerar rótulos para o gráfico de acessos baseado no período selecionado
  const getDaysLabels = (days: number) => {
    const labels: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('pt-BR', {weekday: 'short'}));
    }
    return labels;
  };

  // Gerar dados simulados de acesso baseados no período
  const getSimulatedAccessData = (days: number) => {
    // Dados para 7 dias - usamos os mesmos dados existentes
    if (days === 7) {
      return {
        acessos: statsData.acessos_semana,
        tentativas: statsData.tentativas_bloqueadas || []
      };
    }
    
    // Dados para 15 dias - extendendo os dados existentes
    if (days === 15) {
      const acessos = [12, 19, 24, 31, 15, 26, 33, 18];
      const tentativas = [0, 2, 0, 1, 3, 0, 1, 0];
      
      return {
        acessos: [...acessos, ...statsData.acessos_semana],
        tentativas: [...tentativas, ...(statsData.tentativas_bloqueadas || [])]
      };
    }
    
    // Dados para 30 dias - extendendo ainda mais
    if (days === 30) {
      const acessos = [
        18, 22, 17, 20, 28, 19, 25, 30, 21, 16, 
        23, 27, 19, 24, 22, 25, 31, 20, 19, 26,
        18, 24, 29
      ];
      const tentativas = [
        1, 0, 2, 0, 3, 1, 0, 0, 4, 1,
        0, 2, 1, 0, 0, 3, 0, 2, 1, 0,
        1, 0, 2
      ];
      
      return {
        acessos: [...acessos, ...statsData.acessos_semana],
        tentativas: [...tentativas, ...(statsData.tentativas_bloqueadas || [])]
      };
    }
    
    return {
      acessos: statsData.acessos_semana,
      tentativas: statsData.tentativas_bloqueadas || []
    };
  };
  
  // Função para obter o número de dias baseado no período selecionado
  const getDaysFromPeriod = (period: ChartPeriodType): number => {
    switch (period) {
      case '7d': return 7;
      case '15d': return 15;
      case '30d': return 30;
      default: return 7;
    }
  };

  // Gerar dados formatados para o gráfico, filtrando séries ocultas
  const getChartData = (): ChartData[] => {
    const days = getDaysFromPeriod(chartPeriod);
    const labels = getDaysLabels(days);
    const data = getSimulatedAccessData(days);
    
    return data.acessos.map((acessos, index) => {
      const chartData: ChartData = {
        name: labels[index],
        acessos: visibleSeries.acessos ? acessos : 0,
        tentativas: visibleSeries.tentativas ? (data.tentativas[index] || 0) : 0
      };
      
      // Se a série estiver oculta, definimos um valor indefinido para que não seja renderizada
      if (!visibleSeries.acessos) {
        // @ts-ignore - Forçando ausência da propriedade para que o Recharts não a renderize
        chartData.acessos = undefined;
      }
      
      if (!visibleSeries.tentativas) {
        // @ts-ignore - Forçando ausência da propriedade para que o Recharts não a renderize
        chartData.tentativas = undefined;
      }
      
      return chartData;
    });
  };

  // Função para mudar o período de visualização do gráfico
  const handlePeriodChange = (period: ChartPeriodType) => {
    setChartPeriod(period);
  };

  // Função para alternar a visibilidade das séries
  const toggleSeries = (dataKey: any) => {
    if (!dataKey || (dataKey !== 'acessos' && dataKey !== 'tentativas')) return;
    
    setVisibleSeries(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof typeof prev]
    }));
  };

  // Componente customizado para o tooltip do gráfico
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800/90 backdrop-blur-sm border border-green-400/30 p-2 text-xs rounded-md shadow-[0_0_10px_rgba(0,255,153,0.2)] transition-all duration-200">
          <p className="font-semibold text-zinc-300 mb-2 border-b border-zinc-700 pb-1 text-center">
            {label}
          </p>
          <p className="text-green-300 mb-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
            <span className="font-medium">{payload[0]?.value}</span>
            <span className="text-zinc-400 ml-1">acessos validados</span>
          </p>
          <p className="text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full inline-block"></span>
            <span className="font-medium">{payload[1]?.value}</span>
            <span className="text-zinc-400 ml-1">tentativas bloqueadas</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Função para renderizar o gráfico de barras com efeito neon
  const renderBarChart = () => {
    // Encontrar o valor máximo para definir o domínio do eixo Y
    const data = getChartData();
    const maxAcessos = Math.max(...data.map(item => item.acessos || 0));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={getChartData()}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFAA" stopOpacity={1} />
              <stop offset="100%" stopColor="#00FF99" stopOpacity={0.7} />
            </linearGradient>
            <filter id="glow" height="300%" width="300%" x="-75%" y="-75%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            stroke="#666" 
            fontSize={11}
            tick={{ fill: '#999' }}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12}
            tick={{ fill: '#DDD' }}
            allowDecimals={false}
            tickCount={5}
            domain={[0, maxAcessos * 1.2]}
          />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: 15, 
              fontSize: 12, 
              color: '#888'
            }}
            onClick={(data) => toggleSeries(data.dataKey)}
            formatter={(value, entry, index) => {
              // Aplicar estilo de opacidade reduzida à legenda se a série estiver oculta
              const isVisible = visibleSeries[entry.dataKey as keyof typeof visibleSeries];
              return <span style={{ color: isVisible ? undefined : '#666', opacity: isVisible ? 1 : 0.5 }}>{value}</span>;
            }}
          />
          <Bar 
            dataKey="acessos" 
            name="Acessos Validados" 
            fill="url(#barGradient)" 
            filter="url(#glow)"
            radius={[4, 4, 0, 0]}
            barSize={30} 
            animationDuration={1000}
            animationBegin={100}
            animationEasing="ease-out"
          />
          {/* Linha conectando as colunas */}
          <Line 
            type="monotone" 
            dataKey="acessos" 
            name="Conexão de Acessos" 
            stroke="#00FFAA" 
            strokeWidth={2}
            dot={false}
            activeDot={false}
            legendType="none"
            strokeOpacity={0.6}
            filter="url(#glow)"
            animationDuration={1200}
          />
          <Line 
            type="monotone" 
            dataKey="tentativas" 
            name="Tentativas Bloqueadas" 
            stroke="#FF4444" 
            strokeWidth={2}
            dot={{ r: 5, fill: "#FF4444", stroke: "#FF0000", strokeWidth: 1 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#FF0000", fill: "#FF6666" }}
            animationDuration={1200}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Função para renderizar o gráfico de linha/onda com brilho
  const renderLineChart = () => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={getChartData()}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="lineGradientAccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFAA" stopOpacity={1} />
              <stop offset="100%" stopColor="#00FF99" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="lineGradientAttempts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6666" stopOpacity={1} />
              <stop offset="100%" stopColor="#FF4444" stopOpacity={0.3} />
            </linearGradient>
            <filter id="glowLine" height="300%" width="300%" x="-75%" y="-75%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            stroke="#666" 
            fontSize={11}
            tick={{ fill: '#999' }}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12}
            tick={{ fill: '#DDD' }}
            allowDecimals={false}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: 15, 
              fontSize: 12, 
              color: '#888'
            }}
            onClick={(data) => toggleSeries(data.dataKey)}
            formatter={(value, entry, index) => {
              // Aplicar estilo de opacidade reduzida à legenda se a série estiver oculta
              const isVisible = visibleSeries[entry.dataKey as keyof typeof visibleSeries];
              return <span style={{ color: isVisible ? undefined : '#666', opacity: isVisible ? 1 : 0.5 }}>{value}</span>;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="acessos" 
            name="Acessos Validados" 
            stroke="#00FF99" 
            strokeWidth={3}
            filter="url(#glowLine)"
            dot={{ r: 5, fill: "#00FF99", strokeWidth: 0 }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: "#00FFAA" }}
            animationDuration={1000}
          />
          <Line 
            type="monotone" 
            dataKey="tentativas" 
            name="Tentativas Bloqueadas" 
            stroke="#FF4444" 
            strokeWidth={3}
            filter="url(#glowLine)"
            dot={{ 
              r: 6, 
              fill: "#FF4444",
              strokeWidth: 2,
              stroke: "#FF2222"
            }}
            activeDot={{ r: 8, strokeWidth: 2, stroke: "#FF0000", fill: "#FF6666" }}
            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Função para renderizar o gráfico de área acumulada
  const renderAreaChart = () => {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={getChartData()}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="areaGradientAccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FFAA" stopOpacity={0.8} />
              <stop offset="75%" stopColor="#00FF99" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#00FF99" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaGradientAttempts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6666" stopOpacity={0.8} />
              <stop offset="75%" stopColor="#FF4444" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#FF4444" stopOpacity={0} />
            </linearGradient>
            <filter id="glowArea" height="300%" width="300%" x="-75%" y="-75%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            stroke="#666" 
            fontSize={11}
            tick={{ fill: '#999' }}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12}
            tick={{ fill: '#DDD' }}
            allowDecimals={false}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: 15, 
              fontSize: 12, 
              color: '#888'
            }}
            onClick={(data) => toggleSeries(data.dataKey)}
            formatter={(value, entry, index) => {
              // Aplicar estilo de opacidade reduzida à legenda se a série estiver oculta
              const isVisible = visibleSeries[entry.dataKey as keyof typeof visibleSeries];
              return <span style={{ color: isVisible ? undefined : '#666', opacity: isVisible ? 1 : 0.5 }}>{value}</span>;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="acessos" 
            name="Acessos Validados" 
            stroke="#00FF99" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#areaGradientAccess)" 
            filter="url(#glowArea)"
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#00FFAA" }}
            animationDuration={1000}
          />
          <Area 
            type="monotone" 
            dataKey="tentativas" 
            name="Tentativas Bloqueadas" 
            stroke="#FF4444" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#areaGradientAttempts)"
            filter="url(#glowArea)"
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#FF0000" }}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Função para renderizar o gráfico selecionado
  const renderSelectedChart = () => {
    switch (chartView) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  // Função para mudar o tipo de visualização do gráfico
  const handleChartViewChange = (view: ChartViewType) => {
    setChartView(view);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-0">
      {/* Título principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-300">Visão Geral</h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-1">Monitoramento de segurança digital da clínica</p>
        </div>
      </div>

      {/* Status do Sistema - Com ícones SVG modernos */}
      <div className="card-dark mb-4 sm:mb-6 p-3 sm:p-4">
        <h2 className="text-lg sm:text-xl font-semibold text-green-300 mb-3 sm:mb-4">Status do Sistema</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-glow-soft">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {/* API */}
                <Api className="w-5 h-5 text-green-400" />
                <span className="text-zinc-300">API</span>
              </div>
              <span className="badge-ativo">Online</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-glow-soft">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {/* Database */}
                <Database className="w-5 h-5 text-green-400" />
                <span className="text-zinc-300">Banco de Dados</span>
              </div>
              <span className="badge-ativo">{systemStatus.database}</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-glow-soft">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {/* Authentication */}
                <Authentication className="w-5 h-5 text-green-400" />
                <span className="text-zinc-300">Autenticação</span>
              </div>
              <span className="badge-ativo">Online</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-glow-soft">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {/* Update Time */}
                  <LastUpdate className="w-5 h-5 text-green-400" />
                  <span className="text-zinc-300">Última atualização</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1 ml-7">{lastUpdate.toLocaleTimeString('pt-BR')}</div>
              </div>
              <button onClick={handleRefresh} disabled={loading} className="text-green-400 hover:text-green-300 transition-colors" title="Atualizar dados do sistema">
                {/* Refresh Button */}
                <Refresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards informativos principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="card-dark text-center p-3 sm:p-4 shadow-glow-soft">
          {/* Usuários Ativos */}
          <div className="flex justify-center mb-2">
            <UserActive className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">Usuários Ativos</p>
          <p className="text-xl sm:text-2xl font-bold text-green-300">{statsData.total_usuarios}</p>
        </div>
        <div className="card-dark text-center p-3 sm:p-4 shadow-glow-soft">
          {/* Logins Hoje */}
          <div className="flex justify-center mb-2">
            <LoginToday className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">Logins Hoje</p>
          <p className="text-xl sm:text-2xl font-bold text-green-300">{statsData.logins_hoje}</p>
        </div>
        <div className="card-dark text-center p-3 sm:p-4 shadow-glow-soft">
          {/* Tentativas Bloqueadas */}
          <div className="flex justify-center mb-2">
            <BlockedAttempts className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">Tentativas Bloqueadas</p>
          <p className="text-xl sm:text-2xl font-bold text-red-500">{usuariosBloqueados.length}</p>
        </div>
        <div className="card-dark text-center p-3 sm:p-4 shadow-glow-soft">
          {/* Alertas Críticos */}
          <div className="flex justify-center mb-2">
            <CriticalAlerts className="w-7 h-7 text-yellow-500" />
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">Alertas Críticos</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-500">{statsData.alertas_criticos}</p>
        </div>
      </div>

      {/* Layout principal em 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Gráfico de acessos */}
          <div className="card-dark p-3 sm:p-4 shadow-glow-soft overflow-hidden relative backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-green-300">Acessos - Últimos {getDaysFromPeriod(chartPeriod)} dias</h2>
              <div className="flex items-center space-x-4">
                {/* Seletor de período */}
                <div className="flex items-center space-x-1 border border-zinc-700 rounded-md p-0.5 bg-zinc-900/60">
                  <button
                    className={`px-2 py-1 text-[10px] xs:text-xs transition-all rounded ${chartPeriod === '7d' ? 'bg-zinc-800 text-green-400 shadow-[0_0_8px_rgba(0,255,153,0.15)]' : 'text-zinc-400 hover:text-zinc-300'}`}
                    onClick={() => handlePeriodChange('7d')}
                    title="Últimos 7 dias"
                  >
                    7D
                  </button>
                  <button
                    className={`px-2 py-1 text-[10px] xs:text-xs transition-all rounded ${chartPeriod === '15d' ? 'bg-zinc-800 text-green-400 shadow-[0_0_8px_rgba(0,255,153,0.15)]' : 'text-zinc-400 hover:text-zinc-300'}`}
                    onClick={() => handlePeriodChange('15d')}
                    title="Últimos 15 dias"
                  >
                    15D
                  </button>
                  <button
                    className={`px-2 py-1 text-[10px] xs:text-xs transition-all rounded ${chartPeriod === '30d' ? 'bg-zinc-800 text-green-400 shadow-[0_0_8px_rgba(0,255,153,0.15)]' : 'text-zinc-400 hover:text-zinc-300'}`}
                    onClick={() => handlePeriodChange('30d')}
                    title="Últimos 30 dias"
                  >
                    30D
                  </button>
                </div>
                
                {/* Botões de tipo de gráfico */}
                <div className="flex items-center space-x-2">
                  <button 
                    className={`p-1.5 rounded-md border transition-all hover:bg-zinc-800 ${chartView === 'bar' ? 'bg-zinc-800 border-green-400/50 shadow-[0_0_8px_rgba(0,255,153,0.2)]' : 'bg-zinc-900/60 border-zinc-700'}`}
                    onClick={() => handleChartViewChange('bar')}
                    title="Gráfico de Barras"
                  >
                    <BarChart3 className="w-4 h-4 text-green-300" />
                  </button>
                  <button 
                    className={`p-1.5 rounded-md border transition-all hover:bg-zinc-800 ${chartView === 'line' ? 'bg-zinc-800 border-green-400/50 shadow-[0_0_8px_rgba(0,255,153,0.2)]' : 'bg-zinc-900/60 border-zinc-700'}`}
                    onClick={() => handleChartViewChange('line')}
                    title="Gráfico de Linha"
                  >
                    <LineChartIcon className="w-4 h-4 text-green-300" />
                  </button>
                  <button 
                    className={`p-1.5 rounded-md border transition-all hover:bg-zinc-800 ${chartView === 'area' ? 'bg-zinc-800 border-green-400/50 shadow-[0_0_8px_rgba(0,255,153,0.2)]' : 'bg-zinc-900/60 border-zinc-700'}`}
                    onClick={() => handleChartViewChange('area')}
                    title="Gráfico de Área"
                  >
                    <PieChart className="w-4 h-4 text-green-300" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos neon */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl pointer-events-none opacity-50"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-400/5 rounded-full blur-3xl pointer-events-none opacity-30"></div>
            
            {/* Gráfico usando Recharts */}
            <div className="h-64 w-full bg-zinc-900/60 rounded-lg backdrop-blur-sm p-2 transition-all duration-300">
              {getChartData().length > 0 && getChartData().some(item => item.acessos > 0 || item.tentativas > 0) ? (
                <div className="w-full h-full animate-fadeIn">
                  {renderSelectedChart()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400">
                  <p>Sem dados registrados neste período</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights de segurança */}
          <div className="card-dark p-3 sm:p-4 shadow-glow-soft">
            <h2 className="text-lg sm:text-xl font-semibold text-green-300 mb-3 sm:mb-4">Insights de Segurança</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="p-2 sm:p-3 bg-zinc-800 rounded-lg border-l-4 border-green-400"
                >
                  <div className="flex items-center gap-2">
                    {insight.type === "security" && (index % 2 === 0) && <IpAlert className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    {insight.type === "security" && (index % 2 === 1) && <PasswordChange className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    {insight.type === "trend" && <AccessTrend className="w-4 h-4 text-green-400 flex-shrink-0" />}
                    {insight.type === "location" && <Location className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                    <p className="text-xs sm:text-sm text-zinc-200">{insight.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seção de Usuários Bloqueados */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="card-dark p-3 sm:p-4 shadow-glow-soft">
            <div className="flex items-center mb-3 sm:mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-green-300">Usuários Bloqueados</h2>
              <span className="badge-alerta flex items-center text-xs">
                <Warning className="w-3 h-3 mr-1" /> {usuariosBloqueados.length}
              </span>
            </div>
            
            {usuariosBloqueados.length === 0 ? (
              <div className="text-center py-4 sm:py-6 text-zinc-400">
                <p>Nenhum usuário bloqueado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usuariosBloqueados.map((usuario) => (
                  <div 
                    key={usuario.id} 
                    className="p-2 sm:p-3 bg-zinc-800 rounded-lg border-l-4 border-red-500"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="font-medium text-xs sm:text-sm text-zinc-200 break-words max-w-full sm:max-w-[70%]">
                        {usuario.email}
                      </div>
                      <div>
                        <span className="badge-alerta text-xs">{usuario.tentativas}x</span>
                      </div>
                    </div>
                    
                    {usuario.nome && (
                      <div className="text-xs text-zinc-400 mt-1">
                        Nome: {usuario.nome}
                      </div>
                    )}
                    
                    <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1 sm:gap-2">
                      <Location className="w-3 h-3 text-blue-400" /> <span className="truncate max-w-[180px]">{usuario.local}</span>
                    </div>
                    
                    <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1 sm:gap-2">
                      <OS className="w-3 h-3 text-gray-400" /> <span className="truncate max-w-[180px]">{usuario.sistema}</span>
                    </div>
                    
                    <div className="text-[10px] sm:text-xs text-zinc-500 mt-2">
                      {usuario.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de alertas recentes */}
      <div className="card-dark p-3 sm:p-4 shadow-glow-soft">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-green-300">Alertas Recentes</h2>
          <a 
            href="/alertas" 
            className="flex items-center gap-1 text-xs text-green-300 hover:text-green-400 transition-colors"
            title="Visualizar todos os alertas do sistema"
          >
            <ViewAll className="w-4 h-4" />
            Ver todos
          </a>
        </div>
        
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="min-w-full text-xs sm:text-sm text-left text-zinc-100">
            <thead className="text-[10px] xs:text-xs uppercase text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-2 sm:px-4 py-2">Tipo</th>
                <th className="px-2 sm:px-4 py-2">Severidade</th>
                <th className="px-2 sm:px-4 py-2">Mensagem</th>
                <th className="px-2 sm:px-4 py-2">Data</th>
                <th className="px-2 sm:px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((alerta) => (
                <tr key={alerta.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{alerta.tipo}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    <span className={`${getSeverityBadgeClass(alerta.severidade)} text-[10px] xs:text-xs`}>
                      {alerta.severidade}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 max-w-[120px] sm:max-w-none truncate sm:whitespace-normal">
                    {alerta.mensagem}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{alerta.data}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                    <span className={`${alerta.resolvido ? "badge-ativo" : "badge-pendente"} text-[10px] xs:text-xs`}>
                      {alerta.resolvido ? "Resolvido" : "Pendente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
