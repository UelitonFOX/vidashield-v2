import { Database, Calendar, Save } from "lucide-react";

/**
 * Componente para configurações gerais do sistema
 */
const ConfigSistema = () => {
  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-4">Configurações do Sistema</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Banco de Dados</h3>
          <div className="bg-zinc-800/70 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="tipoBanco" className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-cyan-400" />
                Tipo de Banco de Dados
              </label>
              <select 
                id="tipoBanco"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm"
                aria-label="Selecione o tipo de banco de dados"
                title="Tipo de Banco de Dados"
              >
                <option>PostgreSQL</option>
                <option>MySQL</option>
                <option>SQLite</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="backupAutomatico" className="text-sm">Backup Automático</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="backupAutomatico"
                  className="sr-only peer" 
                  defaultChecked 
                  aria-label="Ativar backup automático"
                  title="Ativar backup automático"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="intervaloBackup" className="text-sm">Intervalo de Backup</label>
              <select 
                id="intervaloBackup"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm"
                aria-label="Selecione o intervalo de backup"
                title="Intervalo de Backup"
              >
                <option>6 horas</option>
                <option>12 horas</option>
                <option>Diário</option>
                <option>Semanal</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Formato e Região</h3>
          <div className="bg-zinc-800/70 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="formatoData" className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Formato de Data
              </label>
              <select 
                id="formatoData"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm"
                aria-label="Selecione o formato de data"
                title="Formato de Data"
              >
                <option>DD/MM/AAAA</option>
                <option>MM/DD/AAAA</option>
                <option>AAAA-MM-DD</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="fusoHorario" className="text-sm">Fuso Horário</label>
              <select 
                id="fusoHorario"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm"
                aria-label="Selecione o fuso horário"
                title="Fuso Horário"
              >
                <option>Brasília (GMT-3)</option>
                <option>GMT</option>
                <option>GMT-4</option>
                <option>GMT-5</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-sm transition-colors"
            aria-label="Salvar configurações do sistema"
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigSistema; 