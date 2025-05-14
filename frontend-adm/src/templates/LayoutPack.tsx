// src/templates/LayoutPack.tsx
import { useState } from "react";
import { MainLayout } from "../layout/MainLayout";

export const LayoutPack = () => {
  const [items] = useState<string[]>(["Alerta crítico", "Novo usuário", "Falha de login"]);

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-neon">🎁 Pack de Layout VidaShield</h1>

        {/* Botão neon */}
        <div className="flex gap-4">
          <button className="bg-neon text-black font-semibold px-5 py-2 rounded-full shadow-lg hover:scale-105 transition">
            Botão Neon
          </button>
          <button className="bg-transparent border border-neon text-neon px-5 py-2 rounded-full hover:bg-neon hover:text-black transition">
            Secundário
          </button>
        </div>

        {/* Lista de itens */}
        <div className="bg-zinc-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-neon mb-2">📋 Lista de Itens</h2>
          <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Menu de navegação */}
        <div className="bg-zinc-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-neon mb-3">📁 Menu</h2>
          <nav className="grid gap-2">
            <a href="#" className="block py-2 px-4 rounded-md hover:bg-zinc-700">Dashboard</a>
            <a href="#" className="block py-2 px-4 rounded-md hover:bg-zinc-700">Logs</a>
            <a href="#" className="block py-2 px-4 rounded-md hover:bg-zinc-700">Alertas</a>
          </nav>
        </div>

        {/* Card com info */}
        <div className="bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-800 p-6 rounded-xl shadow-xl text-center">
          <span className="text-4xl">📊</span>
          <p className="text-2xl font-bold mt-2">
            Total de acessos: <span className="text-neon">156</span>
          </p>
          <p className="text-sm text-zinc-400">Últimos 7 dias</p>
        </div>

        {/* Campo de input */}
        <div className="bg-zinc-800 p-6 rounded-xl shadow-xl">
          <label htmlFor="input-teste" className="block text-zinc-400 mb-2">📝 Campo de texto</label>
          <input
            id="input-teste"
            type="text"
            placeholder="Digite algo..."
            className="w-full px-4 py-2 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-neon"
          />
        </div>

        {/* Dropdown */}
        <div className="bg-zinc-800 p-6 rounded-xl shadow-xl">
          <label htmlFor="dropdown" className="block text-zinc-400 mb-2">⬇️ Selecionar opção</label>
          <select
            id="dropdown"
            title="Dropdown de exemplo"
            className="w-full px-4 py-2 rounded bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-neon"
          >
            <option>Selecione</option>
            <option>Opção 1</option>
            <option>Opção 2</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-zinc-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-neon mb-3">📑 Tabela</h2>
          <table className="min-w-full text-sm text-left text-white">
            <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-700 hover:bg-zinc-700">
                <td className="px-4 py-2">Usuário A</td>
                <td className="px-4 py-2 text-green-400">Ativo</td>
                <td className="px-4 py-2">08/05/2025</td>
              </tr>
              <tr className="border-b border-zinc-700 hover:bg-zinc-700">
                <td className="px-4 py-2">Usuário B</td>
                <td className="px-4 py-2 text-red-400">Inativo</td>
                <td className="px-4 py-2">06/05/2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};
