import { 
  CircuitBoard as Api, 
  Database, 
  ShieldCheck as Authentication, 
  Clock as LastUpdate, 
  RefreshCw as Refresh 
} from "lucide-react";
import { SystemStatus } from "./types";

interface SystemStatusCardsProps {
  systemStatus: SystemStatus;
  lastUpdate: Date;
  loading: boolean;
  onRefresh: () => void;
}

const SystemStatusCards = ({ 
  systemStatus, 
  lastUpdate, 
  loading, 
  onRefresh 
}: SystemStatusCardsProps) => {
  return (
    <div className="card-dark p-3 sm:p-4 shadow-glow-soft">
      <h2 className="text-lg sm:text-xl font-semibold text-green-300 mb-3 sm:mb-4">Status do Sistema</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-glow-soft">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Api className="w-5 h-5 text-green-400" />
              <span className="text-zinc-300">API</span>
            </div>
            <span className="badge-ativo">Online</span>
          </div>
        </div>
        <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-glow-soft">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              <span className="text-zinc-300">Banco de Dados</span>
            </div>
            <span className="badge-ativo">{systemStatus.database}</span>
          </div>
        </div>
        <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-glow-soft">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Authentication className="w-5 h-5 text-green-400" />
              <span className="text-zinc-300">Autenticação</span>
            </div>
            <span className="badge-ativo">Online</span>
          </div>
        </div>
        <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 shadow-glow-soft">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <LastUpdate className="w-5 h-5 text-green-400" />
                <span className="text-zinc-300">Última atualização</span>
              </div>
              <div className="text-xs text-zinc-500 mt-1 ml-7">{lastUpdate.toLocaleTimeString('pt-BR')}</div>
            </div>
            <button onClick={onRefresh} disabled={loading} className="text-green-400 hover:text-green-300 transition-colors" title="Atualizar dados do sistema">
              <Refresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusCards; 