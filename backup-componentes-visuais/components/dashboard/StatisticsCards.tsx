import { 
  Users2 as UserActive,
  KeyRound as LoginToday,
  ShieldX as BlockedAttempts,
  AlertTriangle as CriticalAlerts
} from "lucide-react";
import { StatsData } from "./types";

interface StatisticsCardsProps {
  statsData: StatsData;
  blockedUsersCount: number;
}

const StatisticsCards = ({ statsData, blockedUsersCount }: StatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 max-w-full overflow-hidden">
      <div className="card-dark text-center p-3 sm:p-4 shadow-glow-soft">
        {/* Usuários Ativos */}
        <div className="flex justify-center mb-2">
          <UserActive className="w-7 h-7 text-green-400" />
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">Usuários Ativos</p>
        <p className="text-xl sm:text-2xl font-bold text-green-300">{statsData.total_usuarios}</p>
      </div>
      <div className="card-dark text-center p-3 sm:p-4 shadow-glow-soft">
        {/* Logins Hoje */}
        <div className="flex justify-center mb-2">
          <LoginToday className="w-7 h-7 text-green-400" />
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">Logins Hoje</p>
        <p className="text-xl sm:text-2xl font-bold text-green-300">{statsData.logins_hoje}</p>
      </div>
      <div className="card-dark text-center p-3 sm:p-4 shadow-glow-soft">
        {/* Tentativas Bloqueadas */}
        <div className="flex justify-center mb-2">
          <BlockedAttempts className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">Tentativas Bloqueadas</p>
        <p className="text-xl sm:text-2xl font-bold text-red-500">{blockedUsersCount}</p>
      </div>
      <div className="card-dark text-center p-3 sm:p-4 shadow-glow-soft">
        {/* Alertas Críticos */}
        <div className="flex justify-center mb-2">
          <CriticalAlerts className="w-7 h-7 text-yellow-500" />
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">Alertas Críticos</p>
        <p className="text-xl sm:text-2xl font-bold text-yellow-500">{statsData.alertas_criticos}</p>
      </div>
    </div>
  );
};

export default StatisticsCards; 