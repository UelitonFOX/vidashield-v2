import React, { useState } from "react";
import { MainLayout } from "../layout/MainLayout";
import { Calendar, Check, ChevronDown, Database, Download, FileArchive, FileSpreadsheet, FileText, Filter, History, RefreshCw } from "lucide-react";

export default function Exportacoes() {
  const [tipoExportacao, setTipoExportacao] = useState("todos");
  
  // Dados mockados
  const exportacoes = [
    { id: 1, nome: "Logs de Acesso - Junho/2023", tipo: "logs", data: "01/07/2023", status: "concluido", formato: "CSV", tamanho: "2.4 MB" },
    { id: 2, nome: "Backup da Base de Dados", tipo: "backup", data: "30/06/2023", status: "concluido", formato: "SQL", tamanho: "156 MB" },
    { id: 3, nome: "Relatório de Atividades - Junho/2023", tipo: "relatorio", data: "30/06/2023", status: "concluido", formato: "XLSX", tamanho: "1.8 MB" },
    { id: 4, nome: "Dados de Usuário - Carlos Moura", tipo: "usuario", data: "25/06/2023", status: "concluido", formato: "JSON", tamanho: "240 KB" },
    { id: 5, nome: "Logs de Segurança - Q2 2023", tipo: "logs", data: "24/06/2023", status: "concluido", formato: "CSV", tamanho: "8.7 MB" },
    { id: 6, nome: "Backup Incremental da Base de Dados", tipo: "backup", data: "15/06/2023", status: "concluido", formato: "SQL", tamanho: "45 MB" },
    { id: 7, nome: "Exportação Completa - Maio/2023", tipo: "completo", data: "01/06/2023", status: "concluido", formato: "ZIP", tamanho: "320 MB" },
  ];

  // Exportações em progresso (mockadas)
  const exportacoesProgresso = [
    { id: 101, nome: "Backup Completo da Base de Dados", tipo: "backup", inicio: "10:25:32", progresso: 45, formato: "SQL", estimativa: "25 min" },
    { id: 102, nome: "Exportação de Logs - Julho/2023", tipo: "logs", inicio: "10:40:15", progresso: 78, formato: "CSV", estimativa: "3 min" },
  ];

  const exportacoesFiltradas = tipoExportacao === "todos" 
    ? exportacoes 
    : exportacoes.filter(exp => exp.tipo === tipoExportacao);

  // Função para obter ícone com base no formato
  const getFormatIcon = (formato: string) => {
    switch(formato) {
      case "CSV":
      case "XLSX":
        return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
      case "SQL":
        return <Database className="w-4 h-4 text-blue-400" />;
      case "JSON":
        return <FileText className="w-4 h-4 text-yellow-400" />;
      case "ZIP":
        return <FileArchive className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 mb-2">Exportações de Dados</h1>
            <p className="text-sm text-zinc-300">Exporte, baixe e gerencie dados do sistema.</p>
          </div>

          <div className="flex gap-3">
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
              aria-label="Atualizar lista de exportações"
            >
              <RefreshCw className="w-4 h-4" /> Atualizar
            </button>
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-sm transition-colors"
              aria-label="Nova exportação"
            >
              <Download className="w-4 h-4" /> Nova Exportação
            </button>
          </div>
        </div>

        {/* Exportações em progresso */}
        {exportacoesProgresso.length > 0 && (
          <div className="bg-zinc-900/80 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" /> Exportações em Andamento
            </h2>
            
            <div className="space-y-4">
              {exportacoesProgresso.map(exp => (
                <div key={exp.id} className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {getFormatIcon(exp.formato)}
                        <span className="font-medium text-sm">{exp.nome}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Iniciado às {exp.inicio} • Formato: {exp.formato} • Tempo restante: {exp.estimativa}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs ${
                      exp.tipo === "backup" ? "bg-blue-800/30 text-blue-400 border border-blue-700" :
                      exp.tipo === "logs" ? "bg-green-800/30 text-green-400 border border-green-700" :
                      "bg-zinc-800/30 text-zinc-400 border border-zinc-700"
                    }`}>
                      {exp.tipo.charAt(0).toUpperCase() + exp.tipo.slice(1)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-zinc-700 rounded-full h-1.5">
                    <div 
                      className={`progress-bar progress-bar-blue progress-${Math.round(exp.progresso / 10) * 10}`}
                      aria-label={`${exp.progresso}% completo`}
                    ></div>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 text-right">{exp.progresso}% concluído</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Área de filtros */}
        <div className="bg-zinc-900/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400">Tipo:</div>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoExportacao("todos")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoExportacao === "todos" 
                    ? "bg-cyan-800/50 text-cyan-300 border border-cyan-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTipoExportacao("logs")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoExportacao === "logs" 
                    ? "bg-green-800/50 text-green-300 border border-green-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Logs
              </button>
              <button
                onClick={() => setTipoExportacao("backup")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoExportacao === "backup" 
                    ? "bg-blue-800/50 text-blue-300 border border-blue-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Backup
              </button>
              <button
                onClick={() => setTipoExportacao("relatorio")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoExportacao === "relatorio" 
                    ? "bg-yellow-800/50 text-yellow-300 border border-yellow-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Relatórios
              </button>
              <button
                onClick={() => setTipoExportacao("usuario")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoExportacao === "usuario" 
                    ? "bg-purple-800/50 text-purple-300 border border-purple-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Usuários
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-400">Período:</div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Data inicial" 
                className="bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600 w-32"
                aria-label="Data inicial para filtro"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Data final" 
                className="bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600 w-32"
                aria-label="Data final para filtro"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Tabela de exportações concluídas */}
        <div className="bg-zinc-900/80 rounded-2xl p-4 drop-shadow overflow-x-auto">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-cyan-400" /> Exportações Concluídas
          </h2>
          
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Data</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Formato</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tamanho</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {exportacoesFiltradas.map(exp => (
                <tr key={exp.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="py-3 px-4 text-sm">{exp.nome}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs ${
                      exp.tipo === "logs" ? "bg-green-800/30 text-green-400 border border-green-700" :
                      exp.tipo === "backup" ? "bg-blue-800/30 text-blue-400 border border-blue-700" :
                      exp.tipo === "relatorio" ? "bg-yellow-800/30 text-yellow-400 border border-yellow-700" :
                      exp.tipo === "usuario" ? "bg-purple-800/30 text-purple-400 border border-purple-700" :
                      exp.tipo === "completo" ? "bg-red-800/30 text-red-400 border border-red-700" :
                      "bg-zinc-800/30 text-zinc-400 border border-zinc-700"
                    }`}>
                      {exp.tipo.charAt(0).toUpperCase() + exp.tipo.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-400">{exp.data}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-1">
                      {getFormatIcon(exp.formato)}
                      <span className="text-zinc-400">{exp.formato}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-400">{exp.tamanho}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <button 
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs flex items-center gap-1 mx-auto"
                      aria-label={`Baixar ${exp.nome}`}
                    >
                      <Download className="w-3 h-3" /> Baixar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 flex justify-between items-center text-sm text-zinc-400">
            <div>Mostrando {exportacoesFiltradas.length} de {exportacoes.length} exportações</div>
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button 
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md"
                aria-label="Próxima página"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 