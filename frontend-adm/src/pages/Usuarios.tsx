import React, { useState, useEffect, ReactElement } from "react";
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext";
import { Search, Plus, RefreshCw, UserCheck, UserX, Edit, Trash2, Loader2, Clock } from "lucide-react";
import { useUsersService } from "../services/api/usersService";
import { User } from "../services/api/types";
import { useNavigate } from "react-router-dom";

export default function Usuarios() {
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const { getUsers, hasFetched, isLoading, error: serviceError } = useUsersService();
  const navigate = useNavigate();

  // Carregar usuários da API
  useEffect(() => {
    // Se não estiver autenticado ou estiver carregando autenticação, não faz nada
    if (!isAuthenticated || authLoading) return;
    
    fetchUsers();
  }, [isAuthenticated, authLoading, page, filtroStatus]);

  const fetchUsers = async () => {
    // Se já carregou os dados com os filtros atuais e não está forçando refresh, não buscar de novo
    const endpoint = `/api/users?page=${page}&status=${filtroStatus !== "todos" ? filtroStatus : ""}`;
    
    if (hasFetched?.[endpoint] && !refreshing) {
      console.log(`Dados já carregados para ${endpoint}, pulando fetch`);
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
        status: filtroStatus !== "todos" ? filtroStatus : ""
      };
      
      // Buscar os usuários
      const response = await getUsers(filters);
      
      // Atualizar o estado
      setUsers(response.users || []);
      setTotalUsers(response.total || 0);
      
      // Limpar estado de erro e refreshing
      setError(null);
      setRefreshing(false);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      if (err instanceof Error && err.message.includes("Não autorizado")) {
        // Redirecionar para login em caso de erro de autenticação
        navigate("/login");
      } else {
        setError("Erro ao carregar usuários. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  // Filtrar por search term manualmente
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshing(true); // Força buscar novamente
    fetchUsers();
  };

  // Função para formatar última data de acesso
  const formatLastAccess = (date: string | undefined) => {
    if (!date) return "Nunca acessou";
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para mapear o status da API para o formato exibido na UI
  const mapStatusToUI = (status: string): { text: string, color: string, icon: ReactElement } => {
    switch(status) {
      case "ativo":
        return { text: "Ativo", color: "text-green-400", icon: <UserCheck className="w-3 h-3" /> };
      case "inactive":
        return { text: "Inativo", color: "text-yellow-400", icon: <UserX className="w-3 h-3" /> };
      case "pendente": 
        return { text: "Pendente", color: "text-blue-400", icon: <Clock className="w-3 h-3" /> };
      case "recusado":
        return { text: "Bloqueado", color: "text-red-400", icon: <UserX className="w-3 h-3" /> };
      default:
        return { text: status, color: "text-zinc-400", icon: <UserX className="w-3 h-3" /> };
    }
  };

  // Usuários filtrados para exibição
  const usuariosFiltrados = users;
  
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">Usuários do Sistema</h1>
          <p className="text-sm text-zinc-300">Gerencie os usuários e suas permissões de acesso.</p>
        </div>

        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Atualizar
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        </div>
      </div>

      {/* Área de busca e filtros */}
      <div className="bg-zinc-900/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Buscar usuários..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Buscar usuários"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-zinc-400">Status:</div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroStatus("todos")}
              className={`px-3 py-1 text-xs rounded-full ${
                filtroStatus === "todos" 
                  ? "bg-cyan-800/50 text-cyan-300 border border-cyan-700" 
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus("ativo")}
              className={`px-3 py-1 text-xs rounded-full ${
                filtroStatus === "ativo" 
                  ? "bg-green-800/50 text-green-300 border border-green-700" 
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFiltroStatus("inativo")}
              className={`px-3 py-1 text-xs rounded-full ${
                filtroStatus === "inativo" 
                  ? "bg-yellow-800/50 text-yellow-300 border border-yellow-700" 
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Inativos
            </button>
            <button
              onClick={() => setFiltroStatus("bloqueado")}
              className={`px-3 py-1 text-xs rounded-full ${
                filtroStatus === "bloqueado" 
                  ? "bg-red-800/50 text-red-300 border border-red-700" 
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Bloqueados
            </button>
          </div>
        </div>
      </div>

      {/* Exibir mensagem de erro se houver */}
      {error && (
        <div className="bg-red-950/50 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
          {error}
        </div>
      )}

      {/* Estado de carregamento */}
      {loading && (
        <div className="bg-zinc-900/80 rounded-2xl p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
            <p className="text-zinc-400">Carregando usuários...</p>
          </div>
        </div>
      )}

      {/* Tabela de usuários */}
      {!loading && (
        <div className="bg-zinc-900/80 rounded-2xl p-4 drop-shadow overflow-x-auto">
          {usuariosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Perfil</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Último Acesso</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map(user => (
                  <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="py-3 px-4 text-sm">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-zinc-400">{user.email}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {(() => {
                        const statusUI = mapStatusToUI(user.status);
                        return (
                          <span className={`flex items-center gap-1 ${statusUI.color}`}>
                            {statusUI.icon} {statusUI.text}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-400">{formatLastAccess(user.lastLogin)}</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
                          title={`Editar ${user.name}`}
                          aria-label={`Editar ${user.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                          title={`Excluir ${user.name}`}
                          aria-label={`Excluir ${user.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <div className="mt-4 flex justify-between items-center text-sm text-zinc-400">
            <div>Mostrando {usuariosFiltrados.length} de {totalUsers} usuários</div>
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <button 
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md"
                onClick={() => setPage(prev => prev + 1)}
                disabled={usuariosFiltrados.length < 10}
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 