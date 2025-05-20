import { Search } from "lucide-react";
import React from "react";

interface AlertaFiltrosProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtroSeveridade: string;
  setFiltroSeveridade: (severidade: string) => void;
  filtroStatus: string;
  setFiltroStatus: (status: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

/**
 * Componente para filtrar alertas por busca, severidade e status
 */
const AlertaFiltros = ({
  searchTerm,
  setSearchTerm,
  filtroSeveridade,
  setFiltroSeveridade,
  filtroStatus,
  setFiltroStatus,
  onSearch
}: AlertaFiltrosProps) => {
  return (
    <div className="bg-zinc-900/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
      <form onSubmit={onSearch} className="relative flex-1 min-w-[250px]">
        <input
          type="text"
          placeholder="Buscar alertas..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          type="submit" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500"
          aria-label="Buscar alertas"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <div className="text-sm text-zinc-400 mb-1">Severidade:</div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroSeveridade("todos")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filtroSeveridade === "todos" 
                  ? "bg-cyan-800/50 text-cyan-300 border-cyan-700" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroSeveridade("critical")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filtroSeveridade === "critical" 
                  ? "bg-red-800/50 text-red-300 border-red-700" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Crítico
            </button>
            <button
              onClick={() => setFiltroSeveridade("high")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filtroSeveridade === "high" 
                  ? "bg-orange-800/50 text-orange-300 border-orange-700" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Alto
            </button>
            <button
              onClick={() => setFiltroSeveridade("medium")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filtroSeveridade === "medium" 
                  ? "bg-yellow-800/50 text-yellow-300 border-yellow-700" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Médio
            </button>
            <button
              onClick={() => setFiltroSeveridade("low")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filtroSeveridade === "low" 
                  ? "bg-blue-800/50 text-blue-300 border-blue-700" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Baixo
            </button>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-zinc-400 mb-1">Status:</div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroStatus("todos")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filtroStatus === "todos" 
                  ? "bg-cyan-800/50 text-cyan-300 border-cyan-700" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus("pendentes")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filtroStatus === "pendentes" 
                  ? "bg-yellow-800/50 text-yellow-300 border-yellow-700" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFiltroStatus("resolvidos")}
              className={`px-3 py-1 text-xs rounded-full border ${
                filtroStatus === "resolvidos" 
                  ? "bg-green-800/50 text-green-300 border-green-700" 
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              Resolvidos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertaFiltros; 