import { Bell, Settings, Shield, UserCog } from "lucide-react";

interface ConfigTabsProps {
  tabAtiva: string;
  onTabChange: (tab: string) => void;
}

/**
 * Componente para exibir e manipular as abas de configuração
 */
const ConfigTabs = ({ tabAtiva, onTabChange }: ConfigTabsProps) => {
  return (
    <div className="flex border-b border-zinc-800 mb-6">
      <button
        onClick={() => onTabChange("sistema")}
        className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition-colors ${
          tabAtiva === "sistema" 
            ? "border-cyan-400 text-cyan-400" 
            : "border-transparent text-zinc-400 hover:text-zinc-300"
        }`}
        aria-label="Configurações do Sistema"
        title="Configurações do Sistema"
      >
        <Settings className="w-4 h-4" /> Sistema
      </button>
      <button
        onClick={() => onTabChange("seguranca")}
        className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition-colors ${
          tabAtiva === "seguranca" 
            ? "border-cyan-400 text-cyan-400" 
            : "border-transparent text-zinc-400 hover:text-zinc-300"
        }`}
        aria-label="Configurações de Segurança"
        title="Configurações de Segurança"
      >
        <Shield className="w-4 h-4" /> Segurança
      </button>
      <button
        onClick={() => onTabChange("notificacoes")}
        className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition-colors ${
          tabAtiva === "notificacoes" 
            ? "border-cyan-400 text-cyan-400" 
            : "border-transparent text-zinc-400 hover:text-zinc-300"
        }`}
        aria-label="Configurações de Notificações"
        title="Configurações de Notificações"
      >
        <Bell className="w-4 h-4" /> Notificações
      </button>
      <button
        onClick={() => onTabChange("usuario")}
        className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition-colors ${
          tabAtiva === "usuario" 
            ? "border-cyan-400 text-cyan-400" 
            : "border-transparent text-zinc-400 hover:text-zinc-300"
        }`}
        aria-label="Perfil de Usuário"
        title="Perfil de Usuário"
      >
        <UserCog className="w-4 h-4" /> Perfil de Usuário
      </button>
    </div>
  );
};

export default ConfigTabs; 