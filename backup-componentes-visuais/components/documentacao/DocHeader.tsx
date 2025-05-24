import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Componente para o cabeçalho da página de documentação
 */
const DocHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-green-300">Documentação do VidaShield</h1>
        <p className="text-zinc-400 mt-2">Guia rápido de uso do sistema, fluxos e funcionalidades.</p>
      </div>
      <Link 
        to="/dashboard" 
        className="flex items-center gap-2 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 px-4 py-2 rounded transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar ao Dashboard
      </Link>
    </div>
  );
};

export default DocHeader; 