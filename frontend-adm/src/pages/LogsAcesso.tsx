import React, { useState } from "react";
import { Calendar, Download, Filter, Globe, MapPin, MonitorSmartphone, RefreshCw, Search, Clock, User } from "lucide-react";

export default function LogsAcesso() {
  const [filtroTipo, setFiltroTipo] = useState("todos");
  
  // Dados mockados
  const logs = [
    { id: 1, usuario: "ana.silva", tipo: "login", data: "12/06/2023 09:15:22", ip: "192.168.1.45", dispositivo: "Windows/Chrome", localizacao: "Curitiba, PR" },
    { id: 2, usuario: "carlos.moura", tipo: "logout", data: "12/06/2023 08:45:10", ip: "192.168.1.30", dispositivo: "Windows/Firefox", localizacao: "Curitiba, PR" },
    { id: 3, usuario: "Admin", tipo: "alteracao", data: "11/06/2023 17:30:45", ip: "192.168.1.100", dispositivo: "MacOS/Safari", localizacao: "Curitiba, PR" },
    { id: 4, usuario: "juliana.rocha", tipo: "login", data: "11/06/2023 14:22:31", ip: "192.168.1.75", dispositivo: "Android/Chrome", localizacao: "Paranavaí, PR" },
    { id: 5, usuario: "roberto.andrade", tipo: "alteracao", data: "11/06/2023 11:05:18", ip: "192.168.1.60", dispositivo: "Windows/Edge", localizacao: "Londrina, PR" },
    { id: 6, usuario: "paulo.mendes", tipo: "erro", data: "11/06/2023 08:40:05", ip: "192.168.1.90", dispositivo: "iOS/Safari", localizacao: "Palmital, PR" },
    { id: 7, usuario: "Desconhecido", tipo: "erro", data: "10/06/2023 22:15:33", ip: "201.45.67.89", dispositivo: "Linux/Firefox", localizacao: "São Paulo, SP" },
  ];

  const logsFiltrados = filtroTipo === "todos" 
    ? logs 
    : logs.filter(log => log.tipo === filtroTipo);

  // Função para obter classe de cores baseada no tipo
  const getLogTypeClass = (tipo: string) => {
    switch(tipo) {
      case "login":
        return "bg-green-800/30 text-green-400 border-green-700";
      case "logout":
        return "bg-blue-800/30 text-blue-400 border-blue-700";
      case "alteracao":
        return "bg-yellow-800/30 text-yellow-400 border-yellow-700";
      case "erro":
        return "bg-red-800/30 text-red-400 border-red-700";
      default:
        return "bg-zinc-800/30 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">Logs de Acesso</h1>
          <p className="text-sm text-zinc-300">Monitore todas as atividades no sistema.</p>
        </div>

        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            aria-label="Atualizar logs"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            aria-label="Exportar logs"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      {/* Área de busca e filtros */}
      <div className="bg-zinc-900/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Buscar nos logs..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-sm text-zinc-400">Período:</div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Data inicial" 
              className="bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600 w-32"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Data final" 
              className="bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600 w-32"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm text-zinc-400 mr-1">Tipo:</div>
          <button
            onClick={() => setFiltroTipo("todos")}
            className={`px-3 py-1 text-xs rounded-full border ${
              filtroTipo === "todos" 
                ? "bg-cyan-800/50 text-cyan-300 border-cyan-700" 
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroTipo("login")}
            className={`px-3 py-1 text-xs rounded-full border ${
              filtroTipo === "login" 
                ? "bg-green-800/50 text-green-300 border-green-700" 
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setFiltroTipo("logout")}
            className={`px-3 py-1 text-xs rounded-full border ${
              filtroTipo === "logout" 
                ? "bg-blue-800/50 text-blue-300 border-blue-700" 
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            Logout
          </button>
          <button
            onClick={() => setFiltroTipo("alteracao")}
            className={`px-3 py-1 text-xs rounded-full border ${
              filtroTipo === "alteracao" 
                ? "bg-yellow-800/50 text-yellow-300 border-yellow-700" 
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            Alteração
          </button>
          <button
            onClick={() => setFiltroTipo("erro")}
            className={`px-3 py-1 text-xs rounded-full border ${
              filtroTipo === "erro" 
                ? "bg-red-800/50 text-red-300 border-red-700" 
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            Erro
          </button>
        </div>
      </div>

      {/* Tabela de logs */}
      <div className="bg-zinc-900/80 rounded-2xl p-4 drop-shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Data/Hora
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" /> Usuário
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tipo</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> IP
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                <div className="flex items-center gap-1">
                  <MonitorSmartphone className="w-3 h-3" /> Dispositivo
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Localização
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {logsFiltrados.map(log => (
              <tr key={log.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-3 px-4 text-sm font-mono text-zinc-300">{log.data}</td>
                <td className="py-3 px-4 text-sm">{log.usuario}</td>
                <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-1 rounded-md text-xs border ${getLogTypeClass(log.tipo)}`}>
                    {log.tipo.charAt(0).toUpperCase() + log.tipo.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-mono text-zinc-400">{log.ip}</td>
                <td className="py-3 px-4 text-sm text-zinc-400">{log.dispositivo}</td>
                <td className="py-3 px-4 text-sm text-zinc-400">{log.localizacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 flex justify-between items-center text-sm text-zinc-400">
          <div>Mostrando {logsFiltrados.length} de {logs.length} entradas</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md">Anterior</button>
            <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
} 