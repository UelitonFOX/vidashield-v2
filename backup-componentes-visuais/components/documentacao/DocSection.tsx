import React from "react";
import { DocSectionProps } from "./types";

/**
 * Componente para exibir uma seção da documentação com título e conteúdo
 */
const DocSection: React.FC<DocSectionProps> = ({ id, title, icon, children }) => {
  return (
    <div id={id} className="card-dark shadow-glow-soft mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-green-400">{icon}</div>
        <h2 className="text-xl font-semibold text-green-300">{title}</h2>
      </div>
      <div className="text-zinc-300 space-y-4">
        {children}
      </div>
    </div>
  );
};

export default DocSection; 