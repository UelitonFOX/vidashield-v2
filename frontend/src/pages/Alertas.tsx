import React, { useState } from "react";
import { MainLayout } from "../layout/MainLayout";
import { AlertTriangle, Bell, CheckCircle, Clock, Filter, RefreshCw, Search, Shield, User, XCircle } from "lucide-react";

export default function Alertas() {
  const [filtroSeveridade, setFiltroSeveridade] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("pendentes");
  
  // Dados mockados
  const alertas = [
    { 
      id: 1, 
      tipo: "Tentativa de login", 
      mensagem: "Múltiplas tentativas de login com falha detectadas", 
      severidade: "crítico", 
      usuario: "carlos.moura@clinica.com", 
      data: "12/06/2023 08:15:22", 
      status: "pendente" 
    },
    { 
      id: 2, 
      tipo: "Acesso não autorizado", 
      mensagem: "Tentativa de acesso a área restrita", 
      severidade: "alto", 
      usuario: "roberto.andrade@clinica.com", 
      data: "12/06/2023 07:45:10", 
      status: "resolvido" 
    },
    { 
      id: 3, 
      tipo: "Senha fraca", 
      mensagem: "Usuário utilizando senha considerada fraca", 
      severidade: "médio", 
      usuario: "juliana.rocha@clinica.com", 
      data: "11/06/2023 16:30:45", 
      status: "pendente" 
    },
    { 
      id: 4, 
      tipo: "Compartilhamento de credenciais", 
      mensagem: "Possível compartilhamento de credenciais detectado", 
      severidade: "alto", 
      usuario: "ana.silva@clinica.com", 
      data: "11/06/2023 14:22:31", 
      status: "pendente" 
    },
    { 
      id: 5, 
      tipo: "Malware detectado", 
      mensagem: "Possível malware detectado no dispositivo", 
      severidade: "crítico", 
      usuario: "sistema", 
      data: "11/06/2023 10:05:18", 
      status: "resolvido" 
    },
    { 
      id: 6, 
      tipo: "Atualização necessária", 
      mensagem: "Sistema operacional desatualizado", 
      severidade: "baixo", 
      usuario: "paulo.mendes@clinica.com", 
      data: "11/06/2023 08:40:05", 
      status: "pendente" 
    },
    { 
      id: 7, 
      tipo: "IP não reconhecido", 
      mensagem: "Acesso de IP fora do padrão habitual", 
      severidade: "médio", 
      usuario: "marcia.campos@clinica.com", 
      data: "10/06/2023 22:15:33", 
      status: "pendente" 
    },
  ];

  // Filtragem dos alertas
  const alertasFiltrados = alertas.filter(alerta => {
    const matchesSeveridade = filtroSeveridade === "todos" || alerta.severidade === filtroSeveridade;
    const matchesStatus = filtroStatus === "todos" || 
                         (filtroStatus === "pendentes" && alerta.status === "pendente") || 
                         (filtroStatus === "resolvidos" && alerta.status === "resolvido");
    return matchesSeveridade && matchesStatus;
  });

  // Função para obter classe de cores baseada na severidade
  const getSeverityClass = (severidade: string) => {
    switch(severidade) {
      case "crítico":
        return "bg-red-800/30 text-red-400 border-red-700";
      case "alto":
        return "bg-orange-800/30 text-orange-400 border-orange-700";
      case "médio":
        return "bg-yellow-800/30 text-yellow-400 border-yellow-700";
      case "baixo":
        return "bg-blue-800/30 text-blue-400 border-blue-700";
      default:
        return "bg-zinc-800/30 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 mb-2">Alertas de Segurança</h1>
            <p className="text-sm text-zinc-300">Monitore e gerencie todos os alertas do sistema.</p>
          </div>

          <button 
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            aria-label="Atualizar alertas"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
        </div>

        {/* Área de busca e filtros */}
        <div className="bg-zinc-900/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Buscar alertas..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
          </div>
          
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
                  onClick={() => setFiltroSeveridade("crítico")}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    filtroSeveridade === "crítico" 
                      ? "bg-red-800/50 text-red-300 border-red-700" 
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  Crítico
                </button>
                <button
                  onClick={() => setFiltroSeveridade("alto")}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    filtroSeveridade === "alto" 
                      ? "bg-orange-800/50 text-orange-300 border-orange-700" 
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  Alto
                </button>
                <button
                  onClick={() => setFiltroSeveridade("médio")}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    filtroSeveridade === "médio" 
                      ? "bg-yellow-800/50 text-yellow-300 border-yellow-700" 
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  Médio
                </button>
                <button
                  onClick={() => setFiltroSeveridade("baixo")}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    filtroSeveridade === "baixo" 
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

        {/* Lista de alertas */}
        <div className="bg-zinc-900/80 rounded-2xl p-4 drop-shadow">
          {alertasFiltrados.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum alerta encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {alertasFiltrados.map(alerta => (
                <li key={alerta.id} className="py-4 px-2 hover:bg-zinc-800/30 rounded-lg transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      {alerta.severidade === "crítico" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      {alerta.severidade === "alto" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                      {alerta.severidade === "médio" && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                      {alerta.severidade === "baixo" && <AlertTriangle className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-white">{alerta.tipo}</h3>
                          <p className="text-sm text-zinc-400 mt-1">{alerta.mensagem}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs border ${getSeverityClass(alerta.severidade)}`}>
                          {alerta.severidade}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-3 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {alerta.usuario}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {alerta.data}
                        </div>
                        <div className="flex items-center gap-1">
                          {alerta.status === "pendente" ? (
                            <XCircle className="w-3 h-3 text-yellow-500" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                          {alerta.status.charAt(0).toUpperCase() + alerta.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {alerta.status === "pendente" ? (
                        <button 
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs"
                          aria-label="Marcar como resolvido"
                        >
                          Resolver
                        </button>
                      ) : (
                        <button 
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs"
                          aria-label="Ver detalhes"
                        >
                          Detalhes
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {alertasFiltrados.length > 0 && (
            <div className="mt-4 flex justify-between items-center text-sm text-zinc-400">
              <div>Mostrando {alertasFiltrados.length} de {alertas.length} alertas</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md">Anterior</button>
                <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md">Próximo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 