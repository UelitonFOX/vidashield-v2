import React, { useState } from "react";
import { MainLayout } from "../layout/MainLayout";
import { Search, Plus, RefreshCw, UserCheck, UserX, Edit, Trash2 } from "lucide-react";

export default function Usuarios() {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  
  // Dados mockados
  const users = [
    { id: 1, nome: "Ana Silva", email: "ana.silva@clinica.com", perfil: "Médico", status: "ativo", ultimoAcesso: "10/06/2023 15:30" },
    { id: 2, nome: "Carlos Moura", email: "carlos.moura@clinica.com", perfil: "Administrador", status: "ativo", ultimoAcesso: "11/06/2023 08:45" },
    { id: 3, nome: "Juliana Rocha", email: "juliana.rocha@clinica.com", perfil: "Enfermeiro", status: "inativo", ultimoAcesso: "05/05/2023 12:10" },
    { id: 4, nome: "Roberto Andrade", email: "roberto.andrade@clinica.com", perfil: "Médico", status: "ativo", ultimoAcesso: "11/06/2023 09:22" },
    { id: 5, nome: "Márcia Campos", email: "marcia.campos@clinica.com", perfil: "Recepcionista", status: "ativo", ultimoAcesso: "10/06/2023 17:05" },
    { id: 6, nome: "Paulo Mendes", email: "paulo.mendes@clinica.com", perfil: "Laboratório", status: "bloqueado", ultimoAcesso: "08/06/2023 14:30" },
  ];

  const usuariosFiltrados = filtroStatus === "todos" 
    ? users 
    : users.filter(user => user.status === filtroStatus);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 mb-2">Usuários do Sistema</h1>
            <p className="text-sm text-zinc-300">Gerencie os usuários e suas permissões de acesso.</p>
          </div>

          <div className="flex gap-3">
            <button 
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Atualizar
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
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Buscar usuários..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
          </div>
          
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

        {/* Tabela de usuários */}
        <div className="bg-zinc-900/80 rounded-2xl p-4 drop-shadow overflow-x-auto">
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
                  <td className="py-3 px-4 text-sm">{user.nome}</td>
                  <td className="py-3 px-4 text-sm text-zinc-400">{user.email}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs">
                      {user.perfil}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {user.status === "ativo" && (
                      <span className="flex items-center gap-1 text-green-400">
                        <UserCheck className="w-3 h-3" /> Ativo
                      </span>
                    )}
                    {user.status === "inativo" && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <UserX className="w-3 h-3" /> Inativo
                      </span>
                    )}
                    {user.status === "bloqueado" && (
                      <span className="flex items-center gap-1 text-red-400">
                        <UserX className="w-3 h-3" /> Bloqueado
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-zinc-400">{user.ultimoAcesso}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
                        title={`Editar ${user.nome}`}
                        aria-label={`Editar ${user.nome}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                        title={`Excluir ${user.nome}`}
                        aria-label={`Excluir ${user.nome}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 flex justify-between items-center text-sm text-zinc-400">
            <div>Mostrando {usuariosFiltrados.length} de {users.length} usuários</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md">Anterior</button>
              <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md">Próximo</button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 