import {
  ArrowRightCircle as ViewAll,
  AlertTriangle as CriticalAlerts,
  AlertOctagon as Warning, 
  Shield
} from "lucide-react";
import { Alerta } from "./types";

interface RecentAlertsProps {
  alertas: Alerta[];
}

const RecentAlerts = ({ alertas }: RecentAlertsProps) => {
  // Mapear tipos de alerta para classes de badge
  const getSeverityBadgeClass = (severity: string): string => {
    const map: Record<string, string> = {
      critical: "badge-alerta",
      warning: "badge-pendente",
      info: "badge-ativo",
    };
    return map[severity] || "badge-inativo";
  };

  return (
    <div className="card-dark p-3 sm:p-4 shadow-glow-soft">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-green-300">Alertas Recentes</h2>
        <a 
          href="/alertas" 
          className="flex items-center gap-1 text-xs text-green-300 hover:text-green-400 transition-colors"
          title="Visualizar todos os alertas do sistema"
        >
          <ViewAll className="w-4 h-4" />
          Ver todos
        </a>
      </div>
      
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="min-w-full text-xs sm:text-sm text-left text-zinc-100">
          <thead className="text-[10px] xs:text-xs uppercase text-zinc-400 border-b border-zinc-700">
            <tr>
              <th className="px-2 sm:px-4 py-2">Tipo</th>
              <th className="px-2 sm:px-4 py-2">Severidade</th>
              <th className="px-2 sm:px-4 py-2">Mensagem</th>
              <th className="px-2 sm:px-4 py-2">Data</th>
              <th className="px-2 sm:px-4 py-2">Origem</th>
              <th className="px-2 sm:px-4 py-2">IP</th>
              <th className="px-2 sm:px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {alertas.length > 0 ? (
              alertas.map((alerta, index) => (
                <tr key={alerta.id || index} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-2 sm:px-4 py-2">
                    {alerta.tipo === 'critical' && <CriticalAlerts className="w-4 h-4 text-red-500" />}
                    {alerta.tipo === 'warning' && <Warning className="w-4 h-4 text-yellow-500" />}
                    {alerta.tipo === 'info' && <Shield className="w-4 h-4 text-green-500" />}
                  </td>
                  <td className="px-2 sm:px-4 py-2">
                    <span className={getSeverityBadgeClass(alerta.tipo)}>
                      {alerta.tipo === 'critical' ? 'Crítico' : 
                       alerta.tipo === 'warning' ? 'Alerta' : 'Informação'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 font-medium">{alerta.mensagem}</td>
                  <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{alerta.data.split(' - ')[0]}</span>
                      <span className="text-[10px] text-zinc-500">{alerta.data.split(' - ')[1]}</span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      index % 3 === 0 ? 'bg-purple-900/40 text-purple-400' : 
                      index % 3 === 1 ? 'bg-blue-900/40 text-blue-400' : 
                      'bg-teal-900/40 text-teal-400'
                    }`}>
                      {index % 3 === 0 ? 'Aplicativo Web' : index % 3 === 1 ? 'Desktop' : 'API'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 text-zinc-400 text-[10px]">
                    {index % 2 === 0 ? '192.168.1.' : '187.35.143.'}{Math.floor(Math.random() * 254) + 1}
                  </td>
                  <td className="px-2 sm:px-4 py-2">
                    <span className={alerta.status === 'resolvido' ? 'badge-ativo' : 'badge-pendente'}>
                      {alerta.status === 'resolvido' ? 'Resolvido' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-2 sm:px-4 py-4 text-center text-zinc-500">
                  Nenhum alerta recente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAlerts; 