import { useState } from "react";

// Importando componentes modularizados
import {
  ConfigSistema,
  ConfigSeguranca,
  ConfigNotificacoes,
  ConfigUsuario,
  ConfigTabs
} from "../components/configuracoes";

/**
 * Página de configurações do sistema - versão modularizada
 */
export default function Configuracoes() {
  const [tabAtiva, setTabAtiva] = useState("sistema");
  
  // Função para mudar a aba ativa
  const handleTabChange = (tab: string) => {
    setTabAtiva(tab);
  };

  // Renderiza o conteúdo da aba selecionada
  const renderConteudoTab = () => {
    switch(tabAtiva) {
      case "sistema":
        return <ConfigSistema />;
      case "seguranca":
        return <ConfigSeguranca />;
      case "notificacoes":
        return <ConfigNotificacoes />;
      case "usuario":
        return <ConfigUsuario />;
      default:
        return <ConfigSistema />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cyan-400 mb-2">Configurações</h1>
        <p className="text-sm text-zinc-300">Personalize o sistema de acordo com suas preferências.</p>
      </div>

      {/* Abas de configuração - Componente modularizado */}
      <ConfigTabs 
        tabAtiva={tabAtiva} 
        onTabChange={handleTabChange} 
      />

      {/* Conteúdo da aba selecionada */}
      <div className="bg-zinc-900/80 rounded-2xl p-6 drop-shadow">
        {renderConteudoTab()}
      </div>
    </div>
  );
} 

