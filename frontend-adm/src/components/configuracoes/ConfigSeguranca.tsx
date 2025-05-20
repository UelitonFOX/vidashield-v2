import { Save } from "lucide-react";

/**
 * Componente para configurações de segurança do sistema
 */
const ConfigSeguranca = () => {
  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-4">Configurações de Segurança</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Autenticação</h3>
          <div className="bg-zinc-800/70 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="autenticacaoDoisFatores" className="text-sm">Autenticação de Dois Fatores (2FA)</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="autenticacaoDoisFatores"
                  className="sr-only peer" 
                  defaultChecked
                  aria-label="Ativar autenticação de dois fatores"
                  title="Ativar autenticação de dois fatores"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="tempoSessao" className="text-sm">Tempo de Expiração da Sessão</label>
              <select 
                id="tempoSessao"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm"
                aria-label="Selecione o tempo de expiração da sessão"
                title="Tempo de Expiração da Sessão"
              >
                <option>30 minutos</option>
                <option>1 hora</option>
                <option>4 horas</option>
                <option>8 horas</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="complexidadeSenha" className="text-sm">Complexidade da Senha</label>
              <select 
                id="complexidadeSenha"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm"
                aria-label="Selecione o nível de complexidade da senha"
                title="Complexidade da Senha"
              >
                <option>Muito Alta</option>
                <option>Alta</option>
                <option>Média</option>
                <option>Básica</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Registro e Monitoramento</h3>
          <div className="bg-zinc-800/70 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="registrarTentativas" className="text-sm">Registrar Tentativas de Login</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="registrarTentativas"
                  className="sr-only peer" 
                  defaultChecked
                  aria-label="Ativar registro de tentativas de login"
                  title="Ativar registro de tentativas de login"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="deteccaoIPs" className="text-sm">Detecção de IPs Suspeitos</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="deteccaoIPs"
                  className="sr-only peer" 
                  defaultChecked
                  aria-label="Ativar detecção de IPs suspeitos"
                  title="Ativar detecção de IPs suspeitos"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="bloqueioAutomatico" className="text-sm">Bloqueio Automático após Tentativas</label>
              <select 
                id="bloqueioAutomatico"
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm"
                aria-label="Selecione o número de tentativas antes do bloqueio"
                title="Bloqueio Automático após Tentativas"
              >
                <option>3 tentativas</option>
                <option>5 tentativas</option>
                <option>10 tentativas</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-sm transition-colors"
            aria-label="Salvar configurações de segurança"
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigSeguranca; 