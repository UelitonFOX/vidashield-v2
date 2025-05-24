import { useState, useEffect } from "react";import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";import { useModal } from "../contexts/ModalContext";import "../styles/vidashield.css";import {  RefreshCw as Refresh,  Download,  FileIcon,  HelpCircle as Help} from "lucide-react";

// Importando componentes modulares
import SystemStatusCards from "../components/dashboard/SystemStatusCards";
import StatisticsCards from "../components/dashboard/StatisticsCards";
import AccessChart from "../components/dashboard/AccessChart";
import SecurityInsights from "../components/dashboard/SecurityInsights";
import BlockedUsersList from "../components/dashboard/BlockedUsersList";
import RecentAlerts from "../components/dashboard/RecentAlerts";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import AjudaModalContent from "../components/dashboard/modals/AjudaModal";
import ExportReportModalContent from "../components/dashboard/modals/ExportReportModal";

// Importando tipos e utilitários
import { StatsData, Insight, Alerta, UsuarioBloqueado, SystemStatus, ChartPeriodType } from "../components/dashboard/types";
import { generateDummyContent } from "../components/dashboard/utils/exportUtils";
// Imports de API removidos para evitar loop// import { useDashboardService, ExtendedDashboardData, InsightsResponse } from "../services/api/dashboardService";

export const Dashboard = () => {
  const { openModal } = useModal();
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
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
  const [chartPeriod, setChartPeriod] = useState<ChartPeriodType>('7d');

  // Status do sistema
  const [systemStatus] = useState<SystemStatus>({
    api: "online",
    database: "PostgreSQL",
    auth: "online",
  });

    // Hook removido para evitar loop infinito  // const { fetchDashboardData, exportReport } = useDashboardService();

  // Carregar dados reais das APIs
  useEffect(() => {
    // Não fazer chamadas se não estiver autenticado ou se já buscou os dados
    if (!isAuthenticated || authLoading) return;
    
    console.log("Iniciando carregamento único de dados do dashboard");
    setLoading(true);
    
    // Usar dados mockados diretamente para evitar loop
    const mockData = {
      total_usuarios: 75,
      logins_hoje: 23,
      alertas_criticos: 3,
      acessos_semana: [15, 28, 18, 42, 30, 22, 37],
      tentativas_bloqueadas: [1, 0, 3, 5, 0, 4, 2],
      alertas_recentes: [
        { id: 1, tipo: "critical", mensagem: "Múltiplas falhas de login", tempo: "10h25 - 08/05" },
        { id: 2, tipo: "warning", mensagem: "Novo dispositivo detectado", tempo: "09h15 - 08/05" },
        { id: 3, tipo: "critical", mensagem: "Acesso de IP não autorizado", tempo: "18h42 - 07/05" }
      ]
    };
    
    const insights = [
      { type: "security", text: "192.168.1.105 teve 4 tentativas bloqueadas nas últimas 2h." },
      { type: "security", text: "Usuário pedro@clinica.com.br trocou a senha 2 vezes em 5 dias." },
      { type: "trend", text: "Aumento de 25% em acessos na última semana." },
      { type: "location", text: "Mais acessos vindos de Londrina nas últimas 24h." }
    ];
    
    // Configurar dados mockados
    setStatsData(mockData);
    setInsights(insights);
    
    // Alertas expandidos
    const alertasExpandidos = [
      ...mockData.alertas_recentes.map(alerta => ({
        id: alerta.id.toString(),
        tipo: alerta.tipo,
        mensagem: alerta.mensagem,
        data: alerta.tempo,
        status: Math.random() > 0.5 ? 'resolvido' : 'pendente'
      })),
      { id: '4', tipo: 'warning', mensagem: 'Acesso em horário não usual', data: '09h40 - 10/05', status: 'pendente' },
      { id: '5', tipo: 'info', mensagem: 'Atualização de segurança disponível', data: '14h22 - 09/05', status: 'pendente' },
      { id: '6', tipo: 'critical', mensagem: 'Tentativa de acesso à área restrita', data: '08h15 - 09/05', status: 'resolvido' }
    ];
    
    setAlertas(alertasExpandidos);
    
    // Usuários bloqueados mockados
    const mockBlocked = [
      { ip: "192.168.1.105", motivo: "Múltiplas tentativas", timestamp: "08/05, 10:35", tentativas: 5 },
      { ip: "200.143.55.87", motivo: "IP suspeito", timestamp: "07/05, 18:42", tentativas: 3 },
      { ip: "187.35.143.22", motivo: "Tentativa de força bruta", timestamp: "07/05, 14:18", tentativas: 8 }
    ];
    
    setUsuariosBloqueados(mockBlocked);
    setLastUpdate(new Date());
    setLoading(false);
    
    console.log("Dados mockados carregados com sucesso - Dashboard pronto!");
  }, [isAuthenticated, authLoading]); // Removido fetchDashboardData das dependências

  // Atualizar sempre que o período do gráfico mudar
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchChartData = async () => {
      try {
        // Requisição fictícia para atualização do gráfico
        console.log(`Atualizando dados do gráfico para período: ${chartPeriod}`);
        // Em um cenário real, chamaríamos uma API
      } catch (error) {
        console.error("Erro ao carregar dados do gráfico:", error);
      }
    };

    fetchChartData();
  }, [chartPeriod, isAuthenticated]);

  // Função para atualizar dados (DESABILITADA para evitar loop)
  const handleRefresh = () => {
    console.log("Refresh solicitado - usando dados mockados apenas");
    setLoading(true);
    
    // Simular pequeno delay
    setTimeout(() => {
      setLastUpdate(new Date());
      setLoading(false);
      console.log("Refresh concluído com dados mockados");
    }, 500);
  };

  // Função para abrir modal de ajuda
  const handleOpenAjuda = () => {
    openModal("Central de Ajuda", <AjudaModalContent />, "xl");
  };
  
  // Função para abrir modal de exportação de relatórios
  const handleOpenExportModal = () => {
    openModal("Exportar Relatório", <ExportReportModalContent onExport={handleExportReport} />, "md");
  };
  
  // Função para exportar relatório (DESABILITADA para evitar loop)
  const handleExportReport = async (reportId: string, format: string) => {
    console.log(`Export solicitado para ${reportId} em formato ${format} - SIMULADO`);
    setLoading(true);
    
    // Simular delay
    setTimeout(() => {
      setLoading(false);
      openModal("Sucesso", (
        <div className="p-4 text-center">
          <div className="text-green-400 flex justify-center mb-4">
            <FileIcon className="w-16 h-16" />
          </div>
          <h3 className="text-xl font-medium text-green-300 mb-2">Relatório Simulado Gerado</h3>
          <p className="text-zinc-400 mb-4">
            Em modo de desenvolvimento - formato {format.toUpperCase()}.
          </p>
        </div>
      ), "sm");
    }, 1000);
  };

  // Função para mudar o período do gráfico
  const handlePeriodChange = (period: ChartPeriodType) => {
    setChartPeriod(period);
  };

  return (
    <div className="space-y-2 sm:space-y-3 px-2 sm:px-4 md:px-0 pt-0 mt-0">
      {/* Cabeçalho do dashboard */}
      <DashboardHeader loading={loading} />

      {/* Status do sistema */}
      <SystemStatusCards 
        systemStatus={systemStatus} 
        lastUpdate={lastUpdate} 
        loading={loading} 
        onRefresh={handleRefresh} 
      />

      {/* Cards informativos principais */}
      <StatisticsCards 
        statsData={statsData} 
        blockedUsersCount={usuariosBloqueados.length}
      />

      {/* Layout principal em 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 min-h-[650px] max-w-full">
        <div className="lg:col-span-2 grid grid-rows-2 gap-2 sm:gap-3 h-full max-w-full">
          {/* Gráfico de acessos - ocupa 50% do espaço vertical */}
          <div className="w-full h-full transition-all duration-500 ease-in-out opacity-100 transform translate-y-0 animate-fadeIn overflow-hidden">
            <AccessChart 
              statsData={statsData} 
              chartPeriod={chartPeriod} 
              onPeriodChange={handlePeriodChange}
            />
          </div>

          {/* Insights de segurança - ocupa 50% do espaço vertical */}
          <div className="w-full h-full transition-all duration-500 ease-in-out opacity-100 transform translate-y-0 animate-fadeIn overflow-hidden" style={{animationDelay: "200ms"}}>
            <SecurityInsights insights={insights} />
          </div>
        </div>

        {/* Seção de Usuários Bloqueados - Mesma altura total dos dois cards */}
        <div className="lg:col-span-1 h-full transition-all duration-500 ease-in-out opacity-100 transform translate-y-0 animate-fadeIn overflow-hidden" style={{animationDelay: "300ms"}}>
          <BlockedUsersList usuariosBloqueados={usuariosBloqueados} />
        </div>
      </div>

      {/* Lista de alertas recentes */}
      <div className="w-full overflow-x-hidden">
        <RecentAlerts alertas={alertas} />
      </div>
    </div>
  );
};

export default Dashboard;
