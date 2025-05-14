import React, { useState } from "react";
import { BarChart3, LineChart, PieChart, RefreshCw } from "lucide-react";

export default function Estatisticas() {
  const [periodo, setPeriodo] = useState("7dias");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">Estatísticas de Segurança</h1>
          <p className="text-sm text-zinc-300">Visualize dados de segurança e performance do sistema.</p>
        </div>

        <button 
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Atualizar dados
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900/80 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="text-sm text-zinc-400">Período:</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriodo("7dias")}
            className={`px-3 py-1 text-xs rounded-full ${
              periodo === "7dias" 
                ? "bg-cyan-800/50 text-cyan-300 border border-cyan-700" 
                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriodo("30dias")}
            className={`px-3 py-1 text-xs rounded-full ${
              periodo === "30dias" 
                ? "bg-cyan-800/50 text-cyan-300 border border-cyan-700" 
                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            30 dias
          </button>
          <button
            onClick={() => setPeriodo("90dias")}
            className={`px-3 py-1 text-xs rounded-full ${
              periodo === "90dias" 
                ? "bg-cyan-800/50 text-cyan-300 border border-cyan-700" 
                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            90 dias
          </button>
        </div>
      </div>

      {/* Estatísticas em Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-zinc-900/80 rounded-2xl p-6 drop-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-white">Tentativas de Acesso</h3>
            <BarChart3 className="text-cyan-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-cyan-400 mb-2">248</p>
          <p className="text-sm text-zinc-400">Comparado ao período anterior: <span className="text-green-400">+12%</span></p>
        </div>

        <div className="bg-zinc-900/80 rounded-2xl p-6 drop-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-white">Alertas Gerados</h3>
            <LineChart className="text-cyan-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-cyan-400 mb-2">37</p>
          <p className="text-sm text-zinc-400">Comparado ao período anterior: <span className="text-red-400">+28%</span></p>
        </div>

        <div className="bg-zinc-900/80 rounded-2xl p-6 drop-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-white">Taxa de Segurança</h3>
            <PieChart className="text-cyan-400 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-cyan-400 mb-2">98.2%</p>
          <p className="text-sm text-zinc-400">Comparado ao período anterior: <span className="text-green-400">+1.5%</span></p>
        </div>
      </div>

      {/* Área para gráficos */}
      <div className="bg-zinc-900/80 rounded-2xl p-6 drop-shadow">
        <h3 className="text-lg font-medium text-white mb-4">Evolução de Métricas</h3>
        <div className="w-full h-64 flex items-center justify-center bg-zinc-800/50 rounded-xl border border-zinc-700">
          <p className="text-zinc-500">Gráfico de estatísticas será exibido aqui</p>
        </div>
      </div>
    </div>
  );
} 