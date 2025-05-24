import React, { useState, useEffect } from "react";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";
import { Loader2 } from "lucide-react";
import { useAlertsService } from "../services/api/alertsService";
import { useNavigate } from "react-router-dom";
import { Alert } from "../services/api/types";

// Importando componentes modularizados
import {
  AlertaFiltros,
  AlertaLista,
  AlertaCarregando,
  AlertaMensagemErro,
  AlertaCabecalho,
  mapSeverityToUI,
  mapStatusToUI,
  formatDate,
  AlertaUI
} from "../components/alertas";

export default function Alertas() {
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  const [filtroSeveridade, setFiltroSeveridade] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("pendentes");
  const [alertas, setAlertas] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalAlertas, setTotalAlertas] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const { getAlerts, resolveAlert, hasFetched, isLoading, error: serviceError } = useAlertsService();
  const navigate = useNavigate();

  // Carregar alertas da API
  useEffect(() => {
    // Se não estiver autenticado ou estiver carregando autenticação, não faz nada
    if (!isAuthenticated || authLoading) return;
    
    fetchAlertas();
  }, [isAuthenticated, authLoading, page, filtroSeveridade, filtroStatus]);

  const fetchAlertas = async () => {
    // Se já carregou os dados com os filtros atuais e não está forçando refresh, não buscar de novo
    const endpoint = `/api/alerts?page=${page}&severity=${filtroSeveridade !== "todos" ? filtroSeveridade : ""}&status=${filtroStatus !== "todos" ? (filtroStatus === "pendentes" ? "new" : "resolved") : ""}`;
    
    if (hasFetched?.[endpoint] && !refreshing) {
      console.log(`Dados já carregados para ${endpoint}, pulando fetch`);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Preparar filtros
      const filters = {
        page,
        limit: 10,
        search: searchTerm,
        severity: filtroSeveridade !== "todos" ? filtroSeveridade : "",
        status: filtroStatus !== "todos" ? 
          (filtroStatus === "pendentes" ? "new" : "resolved") : ""
      };
      
      // Buscar os alertas
      const response = await getAlerts(filters);
      
      // Atualizar o estado
      setAlertas(response.alerts || []);
      setTotalAlertas(response.total || 0);
      
      // Limpar estado de erro e refreshing
      setError(null);
      setRefreshing(false);
    } catch (err) {
      console.error("Erro ao buscar alertas:", err);
      if (err instanceof Error && err.message.includes("Não autorizado")) {
        // Redirecionar para login em caso de erro de autenticação
        navigate("/login");
      } else {
        setError("Erro ao carregar alertas. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resolver um alerta
  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      // Recarregar a lista após resolver o alerta
      setRefreshing(true);
      fetchAlertas();
    } catch (err) {
      console.error("Erro ao resolver alerta:", err);
      setError("Erro ao resolver o alerta. Tente novamente.");
    }
  };

  // Atualizar dados
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlertas();
  };

  // Filtrar por search term manualmente
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshing(true); // Força buscar novamente
    fetchAlertas();
  };

  // Transformar alertas da API para formato de UI
  const alertasFormatados: AlertaUI[] = alertas.map(alerta => ({
    ...alerta,
    severidade: mapSeverityToUI(alerta.severity),
    status: mapStatusToUI(alerta.status),
    dataFormatada: formatDate(alerta.created_at)
  }));
  
  // Se estiver carregando autenticação, mostrar loading
  if (authLoading) {
    return (
      <div className="p-6">
        <div className="bg-zinc-900/80 rounded-2xl p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
            <p className="text-zinc-400">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="p-6">
      {/* Cabeçalho modularizado */}
      <AlertaCabecalho 
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Área de busca e filtros modularizada */}
      <AlertaFiltros
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filtroSeveridade={filtroSeveridade}
        setFiltroSeveridade={setFiltroSeveridade}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        onSearch={handleSearch}
      />

      {/* Exibir mensagem de erro se houver */}
      {error && <AlertaMensagemErro mensagem={error} />}

      {/* Estado de carregamento */}
      {loading && <AlertaCarregando />}

      {/* Lista de alertas */}
      {!loading && (
        <div className="bg-zinc-900/80 rounded-2xl p-4 drop-shadow">
          <AlertaLista 
            alertas={alertasFormatados}
            onResolve={handleResolveAlert}
            totalAlertas={totalAlertas}
            page={page}
            setPage={setPage}
          />
        </div>
      )}
    </div>
  );
}

