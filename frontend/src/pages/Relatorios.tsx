import React, { useState } from "react";
import { MainLayout } from "../layout/MainLayout";
import { Calendar, ChevronDown, Download, FileSpreadsheet, FileText, Filter, PieChart, RefreshCw } from "lucide-react";

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState("todos");
  
  // Dados mockados
  const relatorios = [
    { id: 1, nome: "Relatório de Acessos - Junho/2023", tipo: "acesso", data: "01/07/2023", autor: "Sistema", formato: "PDF" },
    { id: 2, nome: "Relatório de Segurança - Maio/2023", tipo: "seguranca", data: "05/06/2023", autor: "Administrador", formato: "XLSX" },
    { id: 3, nome: "Relatório de Tentativas de Invasão - Maio/2023", tipo: "seguranca", data: "03/06/2023", autor: "Sistema", formato: "PDF" },
    { id: 4, nome: "Auditoria de Usuários - Q2 2023", tipo: "auditoria", data: "15/06/2023", autor: "Carlos Moura", formato: "PDF" },
    { id: 5, nome: "Relatório de Acessos - Maio/2023", tipo: "acesso", data: "01/06/2023", autor: "Sistema", formato: "PDF" },
    { id: 6, nome: "Relatório de Desempenho - Maio/2023", tipo: "desempenho", data: "02/06/2023", autor: "Sistema", formato: "XLSX" },
    { id: 7, nome: "Auditoria de Atividades - Q1 2023", tipo: "auditoria", data: "10/04/2023", autor: "Administrador", formato: "PDF" },
  ];

  const relatoriosFiltrados = tipoRelatorio === "todos" 
    ? relatorios 
    : relatorios.filter(relatorio => relatorio.tipo === tipoRelatorio);

  // Função para obter ícone com base no formato
  const getFormatIcon = (formato: string) => {
    switch(formato) {
      case "PDF":
        return <FileText className="w-4 h-4 text-red-400" />;
      case "XLSX":
        return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
      default:
        return <FileText className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 mb-2">Relatórios</h1>
            <p className="text-sm text-zinc-300">Acesse e gerencie todos os relatórios do sistema.</p>
          </div>

          <div className="flex gap-3">
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
              aria-label="Atualizar lista de relatórios"
            >
              <RefreshCw className="w-4 h-4" /> Atualizar
            </button>
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-sm transition-colors"
              aria-label="Gerar novo relatório"
            >
              <PieChart className="w-4 h-4" /> Gerar Relatório
            </button>
          </div>
        </div>

        {/* Área de busca e filtros */}
        <div className="bg-zinc-900/80 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400">Tipo:</div>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoRelatorio("todos")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoRelatorio === "todos" 
                    ? "bg-cyan-800/50 text-cyan-300 border border-cyan-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTipoRelatorio("acesso")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoRelatorio === "acesso" 
                    ? "bg-blue-800/50 text-blue-300 border border-blue-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Acessos
              </button>
              <button
                onClick={() => setTipoRelatorio("seguranca")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoRelatorio === "seguranca" 
                    ? "bg-green-800/50 text-green-300 border border-green-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Segurança
              </button>
              <button
                onClick={() => setTipoRelatorio("auditoria")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoRelatorio === "auditoria" 
                    ? "bg-yellow-800/50 text-yellow-300 border border-yellow-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Auditoria
              </button>
              <button
                onClick={() => setTipoRelatorio("desempenho")}
                className={`px-3 py-1 text-xs rounded-full ${
                  tipoRelatorio === "desempenho" 
                    ? "bg-purple-800/50 text-purple-300 border border-purple-700" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                Desempenho
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
                aria-label="Data inicial"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Data final" 
                className="bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600 w-32"
                aria-label="Data final"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Tabela de relatórios */}
        <div className="bg-zinc-900/80 rounded-2xl p-4 drop-shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Nome do Relatório</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Data</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Autor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Formato</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {relatoriosFiltrados.map(relatorio => (
                <tr key={relatorio.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="py-3 px-4 text-sm">{relatorio.nome}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs ${
                      relatorio.tipo === "acesso" ? "bg-blue-800/30 text-blue-400 border border-blue-700" :
                      relatorio.tipo === "seguranca" ? "bg-green-800/30 text-green-400 border border-green-700" :
                      relatorio.tipo === "auditoria" ? "bg-yellow-800/30 text-yellow-400 border border-yellow-700" :
                      relatorio.tipo === "desempenho" ? "bg-purple-800/30 text-purple-400 border border-purple-700" :
                      "bg-zinc-800/30 text-zinc-400 border border-zinc-700"
                    }`}>
                      {relatorio.tipo.charAt(0).toUpperCase() + relatorio.tipo.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-400">{relatorio.data}</td>
                  <td className="py-3 px-4 text-sm text-zinc-400">{relatorio.autor}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-1">
                      {getFormatIcon(relatorio.formato)}
                      <span className="text-zinc-400">{relatorio.formato}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <button 
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs flex items-center gap-1 mx-auto"
                      aria-label={`Baixar relatório ${relatorio.nome}`}
                    >
                      <Download className="w-3 h-3" /> Baixar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 flex justify-between items-center text-sm text-zinc-400">
            <div>Mostrando {relatoriosFiltrados.length} de {relatorios.length} relatórios</div>
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