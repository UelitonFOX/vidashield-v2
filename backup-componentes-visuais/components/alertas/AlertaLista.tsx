import { Bell } from "lucide-react";
import { AlertaUI } from "./types";
import AlertaItem from "./AlertaItem";

interface AlertaListaProps {
  alertas: AlertaUI[];
  onResolve: (id: string) => void;
  totalAlertas: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Componente para exibir a lista de alertas
 */
const AlertaLista = ({ 
  alertas, 
  onResolve, 
  totalAlertas, 
  page, 
  setPage 
}: AlertaListaProps) => {
  if (alertas.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Nenhum alerta encontrado com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-zinc-800">
        {alertas.map(alerta => (
          <AlertaItem 
            key={alerta.id} 
            alerta={alerta} 
            onResolve={onResolve}
          />
        ))}
      </ul>
      
      <div className="mt-4 flex justify-between items-center text-sm text-zinc-400">
        <div>
          Mostrando {alertas.length} de {totalAlertas} alertas
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          <button 
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md"
            onClick={() => setPage(prev => prev + 1)}
            disabled={alertas.length < 10}
          >
            Próximo
          </button>
        </div>
      </div>
    </>
  );
};

export default AlertaLista; 