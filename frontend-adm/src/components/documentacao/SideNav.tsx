import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Layers, 
  LineChart, 
  Users, 
  Bell, 
  Download, 
  FileText,
  ExternalLink
} from "lucide-react";
import NavItem from "./NavItem";

interface SideNavProps {
  onSectionClick: (id: string) => void;
}

/**
 * Componente de navegação lateral para a documentação
 */
const SideNav: React.FC<SideNavProps> = ({ onSectionClick }) => {
  return (
    <div className="card-dark shadow-glow-soft sticky top-4">
      <h3 className="text-lg font-medium text-green-300 mb-4">Índice</h3>
      <nav className="space-y-1">
        <NavItem
          id="introducao"
          label="Introdução ao Sistema"
          icon={<BookOpen size={16} />}
          onClick={onSectionClick}
        />
        <NavItem
          id="fluxo"
          label="Fluxo de Acesso"
          icon={<Layers size={16} />}
          onClick={onSectionClick}
        />
        <NavItem
          id="painel"
          label="Painel de Controle"
          icon={<LineChart size={16} />}
          onClick={onSectionClick}
        />
        <NavItem
          id="usuarios"
          label="Gerenciamento de Usuários"
          icon={<Users size={16} />}
          onClick={onSectionClick}
        />
        <NavItem
          id="alertas"
          label="Alertas e Logs de Acesso"
          icon={<Bell size={16} />}
          onClick={onSectionClick}
        />
        <NavItem
          id="exportacao"
          label="Exportação de Dados"
          icon={<Download size={16} />}
          onClick={onSectionClick}
        />
        <NavItem
          id="faq"
          label="Perguntas Frequentes"
          icon={<FileText size={16} />}
          onClick={onSectionClick}
        />
      </nav>
      <div className="mt-6 pt-4 border-t border-zinc-700/50">
        <Link 
          to="/sobre-talento-tech" 
          className="flex items-center justify-between w-full text-left py-2 px-3 rounded transition-colors text-green-400 hover:bg-zinc-800"
        >
          <span>Sobre o Talento Tech PR 15</span>
          <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );
};

export default SideNav; 