import { Save } from "lucide-react";

/**
 * Componente para configurações do perfil de usuário
 */
const ConfigUsuario = () => {
  return (
    <div>
      <h2 className="text-xl font-medium text-white mb-4">Perfil de Usuário</h2>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Informações Pessoais</h3>
            <div className="bg-zinc-800/70 rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="nomeUsuario" className="text-sm text-zinc-400 block">Nome</label>
                <input 
                  id="nomeUsuario"
                  type="text" 
                  defaultValue="Administrador da Clínica" 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  aria-label="Nome do usuário"
                  title="Nome do usuário"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="emailUsuario" className="text-sm text-zinc-400 block">Email</label>
                <input 
                  id="emailUsuario"
                  type="email" 
                  defaultValue="admin@clinica.com" 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  aria-label="Email do usuário"
                  title="Email do usuário"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="cargoUsuario" className="text-sm text-zinc-400 block">Cargo</label>
                <input 
                  id="cargoUsuario"
                  type="text" 
                  defaultValue="Administrador de Sistemas" 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  aria-label="Cargo do usuário"
                  title="Cargo do usuário"
                />
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Segurança da Conta</h3>
            <div className="bg-zinc-800/70 rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="senhaAtual" className="text-sm text-zinc-400 block">Senha Atual</label>
                <input 
                  id="senhaAtual"
                  type="password" 
                  placeholder="••••••••••" 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  aria-label="Senha atual"
                  title="Digite sua senha atual"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="novaSenha" className="text-sm text-zinc-400 block">Nova Senha</label>
                <input 
                  id="novaSenha"
                  type="password" 
                  placeholder="••••••••••" 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  aria-label="Nova senha"
                  title="Digite sua nova senha"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmarSenha" className="text-sm text-zinc-400 block">Confirmar Nova Senha</label>
                <input 
                  id="confirmarSenha"
                  type="password" 
                  placeholder="••••••••••" 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                  aria-label="Confirmar nova senha"
                  title="Confirme sua nova senha"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-sm transition-colors"
            aria-label="Salvar alterações do perfil"
          >
            <Save className="w-4 h-4" /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigUsuario; 