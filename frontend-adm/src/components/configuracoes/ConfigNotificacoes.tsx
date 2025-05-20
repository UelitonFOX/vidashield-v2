import { Mail, Save } from "lucide-react";

/**
 * Componente para configurações de notificações do sistema
 */
const ConfigNotificacoes = () => {
  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-4">Configurações de Notificações</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Alertas por Email</h3>
          <div className="bg-zinc-800/70 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="emailNotificacoes" className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-cyan-400" />
                Email para Notificações
              </label>
              <input 
                id="emailNotificacoes"
                type="email" 
                defaultValue="admin@clinica.com" 
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-sm w-64"
                aria-label="Email para receber notificações"
                title="Email para Notificações"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="alertasCriticos" className="text-sm">Alertas Críticos</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="alertasCriticos"
                  className="sr-only peer" 
                  defaultChecked
                  aria-label="Receber alertas críticos por email"
                  title="Receber alertas críticos por email"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="relatoriosDiarios" className="text-sm">Relatórios Diários</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="relatoriosDiarios"
                  className="sr-only peer"
                  aria-label="Receber relatórios diários por email"
                  title="Receber relatórios diários por email"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="relatoriosSemanais" className="text-sm">Relatórios Semanais</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="relatoriosSemanais"
                  className="sr-only peer" 
                  defaultChecked
                  aria-label="Receber relatórios semanais por email"
                  title="Receber relatórios semanais por email"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Notificações no Sistema</h3>
          <div className="bg-zinc-800/70 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="notificacoesTentativasLogin" className="text-sm">Notificações de Tentativas de Login</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="notificacoesTentativasLogin"
                  className="sr-only peer" 
                  defaultChecked
                  aria-label="Ativar notificações de tentativas de login"
                  title="Ativar notificações de tentativas de login"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="alertasSeguranca" className="text-sm">Alertas de Segurança</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="alertasSeguranca"
                  className="sr-only peer" 
                  defaultChecked
                  aria-label="Ativar alertas de segurança"
                  title="Ativar alertas de segurança"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="atualizacoesSistema" className="text-sm">Atualizações do Sistema</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="atualizacoesSistema"
                  className="sr-only peer"
                  aria-label="Ativar notificações de atualizações do sistema"
                  title="Ativar notificações de atualizações do sistema"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <label htmlFor="sonsNotificacao" className="text-sm">Sons de Notificação</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="sonsNotificacao"
                  className="sr-only peer" 
                  defaultChecked
                  aria-label="Ativar sons de notificação"
                  title="Ativar sons de notificação"
                />
                <div className="w-9 h-5 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-sm transition-colors"
            aria-label="Salvar configurações de notificações"
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigNotificacoes; 