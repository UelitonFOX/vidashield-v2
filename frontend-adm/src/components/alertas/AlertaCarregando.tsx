import { Loader2 } from "lucide-react";

/**
 * Componente para exibir o estado de carregamento da página de alertas
 */
const AlertaCarregando = () => {
  return (
    <div className="bg-zinc-900/80 rounded-2xl p-8 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-zinc-400">Carregando alertas...</p>
      </div>
    </div>
  );
};

export default AlertaCarregando;
