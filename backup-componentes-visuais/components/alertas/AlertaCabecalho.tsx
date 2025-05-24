import { Loader2, RefreshCw } from "lucide-react";

interface AlertaCabecalhoProps {
  onRefresh: () => void;
  refreshing: boolean;
}

/**
 * Componente para o cabeçalho da página de alertas
 */
const AlertaCabecalho = ({ onRefresh, refreshing }: AlertaCabecalhoProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-cyan-400 mb-2">Alertas de Segurança</h1>
        <p className="text-sm text-zinc-300">Monitore e gerencie todos os alertas do sistema.</p>
      </div>

      <button 
        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
        aria-label="Atualizar alertas"
        onClick={onRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Atualizar
      </button>
    </div>
  );
};

export default AlertaCabecalho; 