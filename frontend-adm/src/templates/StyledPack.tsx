// src/templates/StyledPack.tsx
import { useState } from "react";
import "../styles/vidashield.css";

export const StyledPack = () => {
  const [users] = useState([
    { name: "Usuário A", status: "Ativo", date: "08/05/2025" },
    { name: "Usuário B", status: "Inativo", date: "06/05/2025" },
  ]);

  return (
    <>
      <p className="text-green-500 text-xl">🚨 Renderizando página!</p>
      <div className="min-h-screen bg-black text-zinc-100 p-6 space-y-10">
        <h1 className="text-3xl font-bold text-green-300">🎨 Pack de Componentes Estilizados</h1>

        {/* Sidebar */}
        <aside className="w-64 card-dark space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-black font-bold shadow-glow-soft">VS</div>
            <div>
              <p className="font-semibold text-green-300">Zihad Fox</p>
              <p className="text-xs text-zinc-400">Administrador</p>
            </div>
          </div>
          <nav className="mt-4 space-y-2 text-sm">
            <a href="#" className="block py-2 px-3 rounded hover:bg-zinc-800">Dashboard</a>
            <a href="#" className="block py-2 px-3 rounded hover:bg-zinc-800">Usuários</a>
            <a href="#" className="block py-2 px-3 rounded hover:bg-zinc-800">Alertas</a>
          </nav>
        </aside>

        {/* Header */}
        <header className="card-dark flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-100">Painel da Clínica</h2>
          <div className="flex items-center gap-4">
            <div className="input-icon-container">
              <span className="input-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar..."
                className="input-dark input-with-icon"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-black font-bold shadow-glow-soft">F</div>
          </div>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-dark text-center">
            <p className="text-sm text-zinc-400">Usuários Ativos</p>
            <p className="text-2xl font-bold text-green-300">58</p>
          </div>
          <div className="card-dark text-center">
            <p className="text-sm text-zinc-400">Tentativas Bloqueadas</p>
            <p className="text-2xl font-bold text-red-500">12</p>
          </div>
          <div className="card-dark text-center">
            <p className="text-sm text-zinc-400">Alertas Críticos</p>
            <p className="text-2xl font-bold text-yellow-400">4</p>
          </div>
        </div>

        {/* Input e Botão */}
        <div className="card-dark space-y-4">
          <input
            type="text"
            placeholder="Digite algo..."
            className="input-dark w-full"
          />
          <button className="btn-neon">Enviar</button>
        </div>

        {/* Tabela */}
        <div className="card-dark">
          <h2 className="text-xl font-semibold mb-4 text-green-300">📊 Tabela de Usuários</h2>
          <table className="min-w-full text-sm text-left text-zinc-100">
            <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i} className="border-b border-zinc-700 hover:bg-zinc-800">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">
                    <span className={user.status === "Ativo" ? "badge-ativo" : "badge-inativo"}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{user.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Badges - Todos os tipos */}
        <div className="card-dark">
          <h2 className="text-xl font-semibold mb-4 text-green-300">🏷️ Status Badges</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge-ativo">Ativo</span>
            <span className="badge-alerta">Alerta</span>
            <span className="badge-pendente">Pendente</span>
            <span className="badge-inativo">Inativo</span>
          </div>
        </div>
      </div>
    </>
  );
};
