// src/templates/StyledPack.tsx
import React from 'react';
import "../styles/vidashield.css";

export const StyleGuide: React.FC = () => {
  return (
    <div className="bg-black text-zinc-100 p-6 space-y-10">
      <h1 className="text-3xl font-bold text-green-300">Guia de Estilos VidaShield</h1>
      
      {/* Cores */}
      <section className="card-dark">
        <h2 className="text-xl font-semibold mb-4 text-green-300">🎨 Cores</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="w-full h-20 bg-green-400 rounded-md shadow-glow-soft"></div>
            <p className="text-sm text-center">Verde Principal</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-full h-20 bg-zinc-900 rounded-md"></div>
            <p className="text-sm text-center">Fundo Escuro</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-full h-20 bg-zinc-800 rounded-md"></div>
            <p className="text-sm text-center">Cinza Escuro</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-full h-20 bg-black rounded-md border border-zinc-800"></div>
            <p className="text-sm text-center">Preto</p>
          </div>
        </div>
      </section>
      
      {/* Tipografia */}
      <section className="card-dark">
        <h2 className="text-xl font-semibold mb-4 text-green-300">🔤 Tipografia</h2>
        
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Título h1</h1>
            <p className="text-sm text-zinc-400">text-4xl font-bold</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold">Título h2</h2>
            <p className="text-sm text-zinc-400">text-2xl font-semibold</p>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">Título h3</h3>
            <p className="text-sm text-zinc-400">text-xl font-medium</p>
          </div>
          
          <div>
            <p className="text-base">Texto padrão</p>
            <p className="text-sm text-zinc-400">text-base</p>
          </div>
          
          <div>
            <p className="text-sm text-zinc-400">Texto secundário</p>
            <p className="text-sm text-zinc-400">text-sm text-zinc-400</p>
          </div>
        </div>
      </section>
      
      {/* Componentes */}
      <section className="card-dark">
        <h2 className="text-xl font-semibold mb-4 text-green-300">🧩 Componentes</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg mb-2">Botões</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-neon">Botão Neon</button>
              <button className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-full">Botão Secundário</button>
              <button className="text-green-300 border border-green-400 px-4 py-2 rounded-full">Botão Outline</button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg mb-2">Inputs</h3>
            <div className="flex flex-col space-y-4 max-w-md">
              <input type="text" placeholder="Input padrão" className="input-dark w-full" />
              <div className="input-icon-container">
                <span className="input-icon">🔍</span>
                <input type="text" placeholder="Com ícone" className="input-dark input-with-icon w-full" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg mb-2">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-dark">
                <h4 className="font-medium">Card Padrão</h4>
                <p className="text-sm text-zinc-400 mt-2">Conteúdo do card com estilo padrão</p>
              </div>
              
              <div className="card-dark border border-green-400 shadow-glow-soft">
                <h4 className="font-medium text-green-300">Card Destacado</h4>
                <p className="text-sm text-zinc-400 mt-2">Conteúdo do card com destaque verde</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges com borda neon */}
      <section className="card-dark">
        <h2 className="text-xl font-semibold mb-4 text-green-300">🏷️ Badges</h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge-ativo">Ativo</span>
          <span className="badge-alerta">Alerta</span>
          <span className="badge-pendente">Pendente</span>
          <span className="badge-inativo">Inativo</span>
        </div>
      </section>
    </div>
  );
};