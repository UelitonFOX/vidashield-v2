import React, { useState } from "react";
import { MainLayout } from "../layout/MainLayout";
import { Bell, Calendar, Database, Mail, Save, Settings, Shield, User, UserCog } from "lucide-react";

export default function Configuracoes() {
  const [tabAtiva, setTabAtiva] = useState("sistema");
  
  // Renderiza o conteúdo da aba selecionada
  const renderConteudoTab = () => {
    switch(tabAtiva) {
      case "sistema":
        return <ConfigSistema />;
      case "seguranca":
        return <ConfigSeguranca />;
      case "notificacoes":
        return <ConfigNotificacoes />;
      case "usuario":
        return <ConfigUsuario />;
      default:
        return <ConfigSistema />;
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cyan-400 mb-2">Configurações</h1>
          <p className="text-sm text-zinc-300">Personalize o sistema de acordo com suas preferências.</p>
        </div>

        {/* Abas de configuração */}
        <div className="flex border-b border-zinc-800 mb-6">
          <button
            onClick={() => setTabAtiva("sistema")}
            className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition-colors ${
              tabAtiva === "sistema" 
                ? "border-cyan-400 text-cyan-400" 
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            <Settings className="w-4 h-4" /> Sistema
          </button>
          <button
            onClick={() => setTabAtiva("seguranca")}
            className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition-colors ${
              tabAtiva === "seguranca" 
                ? "border-cyan-400 text-cyan-400" 
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            <Shield className="w-4 h-4" /> Segurança
          </button>
          <button
            onClick={() => setTabAtiva("notificacoes")}
            className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition-colors ${
              tabAtiva === "notificacoes" 
                ? "border-cyan-400 text-cyan-400" 
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            <Bell className="w-4 h-4" /> Notificações
          </button>
          <button
            onClick={() => setTabAtiva("usuario")}
            className={`px-4 py-2 flex items-center gap-2 text-sm border-b-2 transition-colors ${
              tabAtiva === "usuario" 
                ? "border-cyan-400 text-cyan-400" 
                : "border-transparent text-zinc-400 hover:text-zinc-300"
            }`}
          >
            <UserCog className="w-4 h-4" /> Perfil de Usuário
          </button>
        </div>

        {/* Conteúdo da aba selecionada */}
        <div className="bg-zinc-900/80 rounded-2xl p-6 drop-shadow">
          {renderConteudoTab()}
        </div>
      </div>
    </MainLayout>
  );
};

// Componentes para as diferentes abas de configuração
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