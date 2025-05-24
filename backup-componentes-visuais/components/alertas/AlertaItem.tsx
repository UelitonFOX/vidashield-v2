import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { AlertaUI } from "./types";
import { getSeverityClass } from "./utils";

interface AlertaItemProps {
  alerta: AlertaUI;
  onResolve: (id: string) => void;
}

/**
 * Componente para exibir um item de alerta individual
 */
const AlertaItem = ({ alerta, onResolve }: AlertaItemProps) => {
  return (
    <li className="py-4 px-2 hover:bg-zinc-800/30 rounded-lg transition-colors">
      <div className="flex items-start gap-4">
        <div className="pt-1">
          {alerta.severidade === "crítico" && <AlertTriangle className="w-5 h-5 text-red-500" />}
          {alerta.severidade === "alto" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
          {alerta.severidade === "médio" && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {alerta.severidade === "baixo" && <AlertTriangle className="w-5 h-5 text-blue-500" />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-white">
                {alerta.title}
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                {alerta.message}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-md text-xs border ${getSeverityClass(alerta.severidade)}`}>
              {alerta.severidade}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {alerta.dataFormatada}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {alerta.status === "pendente" ? (
                <button 
                  onClick={() => onResolve(alerta.id)}
                  className="flex items-center px-2 py-1 text-xs bg-green-800/20 text-green-400 rounded-md hover:bg-green-800/40 transition-colors"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Resolver
                </button>
              ) : (
                <span className="flex items-center px-2 py-1 text-xs bg-green-800/20 text-green-400 rounded-md">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Resolvido
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default AlertaItem; 