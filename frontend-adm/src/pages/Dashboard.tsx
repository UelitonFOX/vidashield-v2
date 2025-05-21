import { useState, useEffect } from "react";import { useAuth0 } from "@auth0/auth0-react";import { useModal } from "../contexts/ModalContext";import "../styles/vidashield.css";import {   RefreshCw as Refresh,  Download,  FileIcon,  HelpCircle as Help} from "lucide-react";

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
import { 
  useDashboardService, 
  ExtendedDashboardData, 
  InsightsResponse
} from "../services/api/dashboardService";

export const Dashboard = () => {
  const { openModal } = useModal();
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
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

  // Evitar recrear o hook a cada renderização
  const { 
    fetchDashboardData, 
    exportReport,
    hasFetched,
    isLoading: dataLoading
  } = useDashboardService();

  // Carregar dados reais das APIs
  useEffect(() => {
    // Não fazer chamadas se não estiver autenticado ou se já buscou os dados
    if (!isAuthenticated || authLoading) return;
    
    const fetchData = async () => {
      if (hasFetched?.['/api/dashboard/data']) {
        // Se já buscou dados, não buscar novamente
        console.log("Dados já carregados previamente, pulando fetch");
        setLoading(false);
        return;
      }
      
      console.log("Iniciando carregamento de dados do dashboard");
      setLoading(true);
      
      try {
        // Utilizando o novo serviço com autenticação Auth0
        const dashboardData = await fetchDashboardData<ExtendedDashboardData>();
        console.log("Dados do dashboard carregados:", dashboardData);
        
        // Extrair os dados do dashboard carregados com o serviço
        setStatsData({
          total_usuarios: dashboardData.total_usuarios || 0,
          logins_hoje: dashboardData.logins_hoje || 0,
          alertas_criticos: dashboardData.alertas_criticos || 0,
          acessos_semana: dashboardData.acessos_semana || [0, 0, 0, 0, 0, 0, 0],
          tentativas_bloqueadas: dashboardData.tentativas_bloqueadas || [0, 0, 0, 0, 0, 0, 0]
        });
        
        // Criando mais alertas para exibição
        // Se tivermos alertas recentes no response, usar eles
        if (dashboardData.alertas_recentes && dashboardData.alertas_recentes.length > 0) {
          // Ampliando os alertas existentes para ter mais registros
          const alertasOriginais = dashboardData.alertas_recentes.map(alerta => ({
            id: alerta.id.toString(),
            tipo: alerta.tipo,
            mensagem: alerta.mensagem,
            data: alerta.tempo,
            status: Math.random() > 0.5 ? 'resolvido' : 'pendente' // Simulando status aleatório
          }));
          
          // Adicionando mais alertas simulados
          const alertasExtras = [
            { id: '4', tipo: 'warning', mensagem: 'Acesso em horário não usual', data: '09h40 - 10/05', status: 'pendente' },
            { id: '5', tipo: 'info', mensagem: 'Atualização de segurança disponível', data: '14h22 - 09/05', status: 'pendente' },
            { id: '6', tipo: 'critical', mensagem: 'Tentativa de acesso à área restrita', data: '08h15 - 09/05', status: 'resolvido' },
            { id: '7', tipo: 'warning', mensagem: 'Múltiplos downloads de arquivos', data: '16h53 - 08/05', status: 'pendente' },
            { id: '8', tipo: 'info', mensagem: 'Backup automático concluído', data: '03h00 - 08/05', status: 'resolvido' }
          ];
          
          setAlertas([...alertasOriginais, ...alertasExtras]);
        }
        
        // Buscando insights
        const insightsResponse = await fetchDashboardData<InsightsResponse>('/api/dashboard/insights/multiple?count=4');
        setInsights(insightsResponse.insights || []);
        
        // Aumentando o número de usuários bloqueados simulados
        const mockBlocked = [
          { ip: "192.168.1.105", motivo: "Múltiplas tentativas", timestamp: "08/05, 10:35", tentativas: 5 },
          { ip: "200.143.55.87", motivo: "IP suspeito", timestamp: "07/05, 18:42", tentativas: 3 },
          { ip: "187.35.143.22", motivo: "Tentativa de força bruta", timestamp: "07/05, 14:18", tentativas: 8 },
          { ip: "186.220.101.74", motivo: "Acesso a área restrita", timestamp: "06/05, 22:10", tentativas: 2 },
          { ip: "172.16.10.15", motivo: "Múltiplos logins falhos", timestamp: "06/05, 09:25", tentativas: 6 },
          { ip: "45.178.95.213", motivo: "Padrão de acesso suspeito", timestamp: "05/05, 16:40", tentativas: 4 }
        ];
        setUsuariosBloqueados(mockBlocked);
        
        // Atualizar timestamp de última atualização
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, authLoading, fetchDashboardData, hasFetched]);

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

  // Função para atualizar dados
  const handleRefresh = () => {
    setLoading(true);
    // Chamar a função de fetchData diretamente em vez de recarregar a página
    const fetchData = async () => {
      try {
        // Utilizando o novo serviço com autenticação Auth0
        const dashboardData = await fetchDashboardData<ExtendedDashboardData>();
        
        // Extrair os dados do dashboard carregados com o serviço
        setStatsData({
          total_usuarios: dashboardData.total_usuarios || 0,
          logins_hoje: dashboardData.logins_hoje || 0,
          alertas_criticos: dashboardData.alertas_criticos || 0,
          acessos_semana: dashboardData.acessos_semana || [0, 0, 0, 0, 0, 0, 0],
          tentativas_bloqueadas: dashboardData.tentativas_bloqueadas || [0, 0, 0, 0, 0, 0, 0]
        });
        
        // Se tivermos alertas recentes no response, usar eles
        if (dashboardData.alertas_recentes && dashboardData.alertas_recentes.length > 0) {
          const alertasFormatados = dashboardData.alertas_recentes.map(alerta => ({
            id: alerta.id.toString(),
            tipo: alerta.tipo,
            mensagem: alerta.mensagem,
            data: alerta.tempo,
            status: Math.random() > 0.5 ? 'resolvido' : 'pendente' // Simulando status aleatório
          }));
          setAlertas(alertasFormatados);
        }
        
        // Buscando insights
        const insightsResponse = await fetchDashboardData<InsightsResponse>('/api/dashboard/insights/multiple?count=4');
        setInsights(insightsResponse.insights || []);
        
        // Atualizar a hora da última atualização
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Erro ao atualizar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  };

  // Função para abrir modal de ajuda
  const handleOpenAjuda = () => {
    openModal("Central de Ajuda", <AjudaModalContent />, "xl");
  };
  
  // Função para abrir modal de exportação de relatórios
  const handleOpenExportModal = () => {
    openModal("Exportar Relatório", <ExportReportModalContent onExport={handleExportReport} />, "md");
  };
  
  // Função para exportar relatório
  const handleExportReport = async (reportId: string, format: string) => {
    try {
      setLoading(true);
      const result = await exportReport(reportId, format as any);
      
      if (result.success) {
        // Em um caso real, aqui você poderia oferecer o download do arquivo
        // Para demonstração, vamos apenas mostrar uma mensagem
        openModal("Sucesso", (
          <div className="p-4 text-center">
            <div className="text-green-400 flex justify-center mb-4">
              <FileIcon className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-medium text-green-300 mb-2">Relatório Gerado com Sucesso</h3>
            <p className="text-zinc-400 mb-4">
              Seu relatório foi gerado no formato {format.toUpperCase()}.
            </p>
            <button className="btn-primary px-4 py-2" onClick={() => {
              // Criar um link de download com o blob do arquivo
              if (result.data && (result.data.url === '#' || result.data.url.startsWith('blob:'))) {
                // Em ambiente de desenvolvimento, criar um arquivo falso para download
                const dummyContent = generateDummyContent(reportId, format, statsData, alertas);
                const blob = new Blob([dummyContent], { 
                  type: format === 'csv' 
                    ? 'text/csv' 
                    : format === 'json' 
                      ? 'application/json' 
                      : 'application/pdf' 
                });
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = result.data.filename || `relatorio_${reportId}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } else if (result.data && result.data.url) {
                // Em ambiente de produção, usar a URL real fornecida
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = result.data.url;
                a.download = result.data.filename || `relatorio_${reportId}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            }}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório
            </button>
          </div>
        ), "sm");
      }
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      openModal("Erro", (
        <div className="p-4 text-center">
          <h3 className="text-xl font-medium text-red-500 mb-2">Erro ao Exportar</h3>
          <p className="text-zinc-400">
            Ocorreu um erro ao gerar o relatório. Tente novamente mais tarde.
          </p>
        </div>
      ), "sm");
    } finally {
      setLoading(false);
    }
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
