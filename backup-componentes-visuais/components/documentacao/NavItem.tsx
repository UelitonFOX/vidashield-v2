import React from "react";
import { NavItemProps } from "./types";

/**
 * Componente para item de navegação na barra lateral da documentação
 */
const NavItem: React.FC<NavItemProps> = ({ id, label, icon, onClick }) => {
  return (
    <button 
      onClick={() => onClick(id)} 
      className="w-full text-left py-2 px-3 rounded transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-green-400 flex items-center gap-2"
    >
      {icon} {label}
    </button>
  );
};

export default NavItem; 