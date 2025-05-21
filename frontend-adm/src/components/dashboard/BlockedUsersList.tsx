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
    <div className="card-dark p-3 sm:p-4 shadow-glow-soft relative overflow-hidden flex flex-col h-full w-full">
      {/* Cabeçalho */}
      <div className="flex items-center mb-3 sm:mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-green-300">Usuários Bloqueados</h2>
        <span className="badge-alerta flex items-center text-xs">
          <Warning className="w-3 h-3 mr-1" /> {usuariosBloqueados.length}
        </span>
      </div>

      {/* Timestamp inicial do primeiro bloqueio */}
      {usuariosBloqueados.length > 0 && (
        <div className="text-[10px] text-zinc-500 ml-1 mb-2">
          {usuariosBloqueados[0].timestamp}
        </div>
      )}

      {/* Lista ou mensagem vazia */}
      <div className="flex-1 overflow-auto space-y-4 py-1 pr-1">
        {usuariosBloqueados.length === 0 ? (
          <div className="text-center py-4 sm:py-6 text-zinc-400">
            <p>Nenhum usuário bloqueado</p>
          </div>
        ) : (
          usuariosBloqueados.map((usuario, index) => (
            <div key={usuario.id || index} className="border-l-2 border-red-500 pl-2 relative">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium text-white text-sm">
                  {usuario.email || `usuario${index + 1}@vidashield.com`}
                </div>
                <span className="badge-alerta text-xs ml-auto">{usuario.tentativas}x</span>
              </div>

              <div className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                <Location className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span className="truncate">{usuario.ip}</span>
              </div>

              <div className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                <OS className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                <span className="truncate">{usuario.motivo}</span>
              </div>

              <div className="text-[10px] text-zinc-500 mt-1">
                {usuario.timestamp}
              </div>

              {/* Conector visual para a linha temporal */}
              {index < usuariosBloqueados.length - 1 && (
                <div className="absolute h-4 w-0.5 bg-zinc-800 bottom-0 left-[-4px] translate-y-full"></div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Efeitos de fundo para o estilo cyber glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-400/5 rounded-full blur-3xl pointer-events-none opacity-30"></div>
    </div>
  );
};

export default BlockedUsersList;
