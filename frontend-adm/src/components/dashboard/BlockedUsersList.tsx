import {
  AlertOctagon as Warning,
  MapPin as Location,
  MonitorSmartphone as OS
} from "lucide-react";
import { UsuarioBloqueado } from "./types";

interface BlockedUsersListProps {
  usuariosBloqueados: UsuarioBloqueado[];
}

const BlockedUsersList = ({ usuariosBloqueados }: BlockedUsersListProps) => {
  return (
    <div className="card-dark p-3 sm:p-4 shadow-glow-soft">
      <div className="flex items-center mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-green-300">Usuários Bloqueados</h2>
        <span className="badge-alerta flex items-center text-xs">
          <Warning className="w-3 h-3 mr-1" /> {usuariosBloqueados.length}
        </span>
      </div>
      
      {usuariosBloqueados.length === 0 ? (
        <div className="text-center py-4 sm:py-6 text-zinc-400">
          <p>Nenhum usuário bloqueado</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {usuariosBloqueados.map((usuario, index) => (
            <div 
              key={usuario.id || index} 
              className="p-2 sm:p-3 bg-zinc-800 rounded-lg border-l-4 border-red-500 hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="font-medium text-xs sm:text-sm text-zinc-200 break-words max-w-full sm:max-w-[70%]">
                  {usuario.email || `usuario${index+1}@vidashield.com`}
                </div>
                <div>
                  <span className="badge-alerta text-xs">{usuario.tentativas}x</span>
                </div>
              </div>
              
              {usuario.nome && (
                <div className="text-xs text-zinc-400 mt-1">
                  Nome: {usuario.nome || `Usuário ${index+1}`}
                </div>
              )}
              
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1 sm:gap-2">
                <Location className="w-3 h-3 text-blue-400" /> <span className="truncate max-w-[180px]">{usuario.ip}</span>
              </div>
              
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1 sm:gap-2">
                <OS className="w-3 h-3 text-gray-400" /> <span className="truncate max-w-[180px]">{usuario.motivo}</span>
              </div>
              
              <div className="text-[10px] sm:text-xs text-zinc-500 mt-2">
                {usuario.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockedUsersList; 