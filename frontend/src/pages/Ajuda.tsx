import { useState } from "react";
import { MainLayout } from "../layout/MainLayout";
import "../styles/vidashield.css";
import { 
  Settings, 
  AlertTriangle as Warning, 
  ShieldX as BlockedAttempts, 
  Bot, 
  HelpCircle as HelpIcon 
} from "lucide-react";

interface AjudaProps {
  modalView?: boolean;
}

export const Ajuda = ({ modalView = false }: AjudaProps) => {
  const [activeTab, setActiveTab] = useState<string>("sistema");

  // Se for renderizado como um modal, retorna apenas o conteúdo sem o MainLayout
  const AjudaContent = () => (
    <div className={`${modalView ? 'max-h-full' : 'space-y-6'}`}>
      {!modalView && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-300">Central de Ajuda</h1>
            <p className="text-zinc-400 mt-1">Guia completo do sistema VidaShield</p>
          </div>
        </div>
      )}

      <div className={`${modalView ? 'flex flex-col md:flex-row gap-6 h-full' : 'grid grid-cols-1 lg:grid-cols-4 gap-6'}`}>
        {/* Menu lateral da ajuda */}
        <div className={`${modalView ? 'md:w-64 flex-shrink-0' : 'lg:col-span-1'}`}>
          <div className="card-dark shadow-glow-soft">
            <h2 className="text-xl font-semibold text-green-300 mb-4">Tópicos</h2>
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab("sistema")}
                className={`w-full text-left py-2 px-3 rounded transition-colors flex items-center gap-2 ${activeTab === "sistema" ? "bg-zinc-700 text-green-400" : "hover:bg-zinc-700/50"}`}
              >
                <Settings className="w-4 h-4" /> Dados do Sistema
              </button>
              <button 
                onClick={() => setActiveTab("alertas")}
                className={`w-full text-left py-2 px-3 rounded transition-colors flex items-center gap-2 ${activeTab === "alertas" ? "bg-zinc-700 text-green-400" : "hover:bg-zinc-700/50"}`}
              >
                <Warning className="w-4 h-4" /> Níveis de Alerta
              </button>
              <button 
                onClick={() => setActiveTab("bloqueados")}
                className={`w-full text-left py-2 px-3 rounded transition-colors flex items-center gap-2 ${activeTab === "bloqueados" ? "bg-zinc-700 text-green-400" : "hover:bg-zinc-700/50"}`}
              >
                <BlockedAttempts className="w-4 h-4" /> Usuários Bloqueados
              </button>
              <button 
                onClick={() => setActiveTab("automacao")}
                className={`w-full text-left py-2 px-3 rounded transition-colors flex items-center gap-2 ${activeTab === "automacao" ? "bg-zinc-700 text-green-400" : "hover:bg-zinc-700/50"}`}
              >
                <Bot className="w-4 h-4" /> Automação
              </button>
              <button 
                onClick={() => setActiveTab("suporte")}
                className={`w-full text-left py-2 px-3 rounded transition-colors flex items-center gap-2 ${activeTab === "suporte" ? "bg-zinc-700 text-green-400" : "hover:bg-zinc-700/50"}`}
              >
                <HelpIcon className="w-4 h-4" /> Contato Suporte
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo da ajuda */}
        <div className={`${modalView ? 'flex-1 overflow-y-auto pr-1 modal-content-wrapper' : 'lg:col-span-3'}`}>
          <div className={`${modalView ? "bg-zinc-800/50 p-5 rounded-lg shadow-glow-soft" : "card-dark shadow-glow-soft"}`}>
            {activeTab === "sistema" && (
              <div>
                <h2 className="text-xl font-semibold text-green-300 mb-4">Dados do Sistema</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Visão Geral</h3>
                    <p className="text-zinc-300">
                      O VidaShield é um sistema de segurança digital projetado para proteger os dados da Clínica VidaMais. 
                      Ele monitora constantemente todas as atividades no sistema, detectando possíveis ameaças e alertando 
                      sobre comportamentos suspeitos.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Dashboard Principal</h3>
                    <p className="text-zinc-300">
                      O Dashboard exibe informações críticas de segurança em tempo real:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li><span className="text-green-300">Usuários Ativos:</span> Total de contas com acesso ao sistema</li>
                      <li><span className="text-green-300">Logins Hoje:</span> Quantidade de acessos realizados no dia</li>
                      <li><span className="text-green-300">Tentativas Bloqueadas:</span> Acessos suspeitos impedidos</li>
                      <li><span className="text-green-300">Alertas Críticos:</span> Situações que requerem atenção imediata</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Status do Sistema</h3>
                    <p className="text-zinc-300">
                      A seção de Status mostra a condição atual dos componentes essenciais:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li><span className="text-green-300">API:</span> Interface de programação que conecta o frontend ao banco de dados</li>
                      <li><span className="text-green-300">Banco de Dados:</span> PostgreSQL que armazena os dados de forma segura</li>
                      <li><span className="text-green-300">Autenticação:</span> Sistema responsável pela validação de identidade dos usuários</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Insights de Segurança</h3>
                    <p className="text-zinc-300">
                      Os insights mostram padrões e anomalias detectados pelo sistema, como tentativas de acesso 
                      fora do horário normal, múltiplas tentativas de login e comportamentos incomuns.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "alertas" && (
              <div>
                <h2 className="text-xl font-semibold text-green-300 mb-4">Níveis de Alerta</h2>
                <div className="space-y-4">
                  <p className="text-zinc-300">
                    O VidaShield classifica os alertas em diferentes níveis de severidade para facilitar a priorização:
                  </p>

                  <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-red-500">
                    <h3 className="flex items-center gap-2 text-lg font-medium text-red-400">
                      <span className="badge-alerta">Crítico</span> Atenção Imediata
                    </h3>
                    <p className="mt-2 text-zinc-300">
                      Alertas críticos indicam possíveis ataques em andamento ou violações graves de segurança. Requerem ação imediata.
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li>Múltiplas tentativas falhas de login</li>
                      <li>Acesso de localidade suspeita/incomum</li>
                      <li>Tentativa de escalonamento de privilégios</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-yellow-500">
                    <h3 className="flex items-center gap-2 text-lg font-medium text-yellow-400">
                      <span className="badge-pendente">Alerta</span> Atenção Elevada
                    </h3>
                    <p className="mt-2 text-zinc-300">
                      Situações que não representam um perigo imediato, mas exigem análise e monitoramento.
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li>Novo dispositivo detectado em uma conta</li>
                      <li>Alterações recentes de senha</li>
                      <li>Acessos fora do horário comercial</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="flex items-center gap-2 text-lg font-medium text-green-400">
                      <span className="badge-ativo">Informativo</span> Monitoramento Normal
                    </h3>
                    <p className="mt-2 text-zinc-300">
                      Eventos normais que são registrados para fins de auditoria e análise.
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li>Login bem-sucedido</li>
                      <li>Exportação de relatórios</li>
                      <li>Backup realizado com sucesso</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bloqueados" && (
              <div>
                <h2 className="text-xl font-semibold text-green-300 mb-4">Usuários Bloqueados</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">O que são Usuários Bloqueados?</h3>
                    <p className="text-zinc-300">
                      Usuários bloqueados são contas ou endereços IP que foram temporariamente impedidos de acessar 
                      o sistema devido a comportamentos suspeitos, principalmente múltiplas tentativas falhas de login.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Como Funcionam os Bloqueios</h3>
                    <p className="text-zinc-300">
                      O sistema VidaShield bloqueia automaticamente qualquer tentativa de acesso após 3 falhas de 
                      autenticação consecutivas em um período de 10 minutos. Isso ajuda a prevenir ataques de força bruta.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">O que Fazer com Usuários Bloqueados</h3>
                    <p className="text-zinc-300">
                      Quando um usuário legítimo for bloqueado, siga estas diretrizes:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-2 text-zinc-300">
                      <li><span className="text-green-300">Verificar a legitimidade:</span> Confirme se é realmente o usuário tentando acessar ou um atacante</li>
                      <li><span className="text-green-300">Investigar o contexto:</span> Verifique a localização geográfica e o dispositivo de acesso</li>
                      <li><span className="text-green-300">Redefinir credenciais:</span> Se for legítimo, ajude o usuário a redefinir sua senha</li>
                      <li><span className="text-green-300">Monitorar após desbloqueio:</span> Mantenha vigilância sobre a conta após a restauração do acesso</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-zinc-800 rounded-lg border-l-4 border-yellow-500">
                    <h3 className="text-lg font-medium text-yellow-400 mb-2">⚠️ Atenção</h3>
                    <p className="text-zinc-300">
                      Bloqueios frequentes na mesma conta podem indicar um problema maior de segurança. 
                      Considere implementar autenticação de dois fatores (2FA) para contas sensíveis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "automacao" && (
              <div>
                <h2 className="text-xl font-semibold text-green-300 mb-4">Detalhes da Automação</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Como Funciona a Automação</h3>
                    <p className="text-zinc-300">
                      O VidaShield implementa diversos sistemas automatizados para detectar, alertar e responder a possíveis ameaças:
                    </p>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-200 mb-2">1. Detecção de Tentativas de Intrusão</h3>
                    <p className="text-zinc-300">
                      O sistema monitora continuamente todas as tentativas de login e:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li>Registra cada tentativa com detalhes (IP, user-agent, timestamp)</li>
                      <li>Conta falhas consecutivas em um período configurável (10 minutos)</li>
                      <li>Identifica padrões suspeitos como múltiplas tentativas rápidas</li>
                      <li>Gera alertas automaticamente após 3 tentativas falhas</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-200 mb-2">2. Bloqueio Automático</h3>
                    <p className="text-zinc-300">
                      Quando um limiar de segurança é ultrapassado:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li>A combinação de IP/email é bloqueada temporariamente</li>
                      <li>Um alerta de severidade "critical" é gerado</li>
                      <li>Detalhes completos da tentativa são registrados para análise</li>
                      <li>O administrador é notificado no dashboard</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-200 mb-2">3. Análise de Localização</h3>
                    <p className="text-zinc-300">
                      O sistema analisa a origem geográfica das tentativas de acesso:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li>Identifica acessos de localizações incomuns</li>
                      <li>Compara com o histórico de acessos do usuário</li>
                      <li>Alerta sobre mudanças significativas de localização</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-200 mb-2">4. Insights Automatizados</h3>
                    <p className="text-zinc-300">
                      O sistema gera insights automáticos baseados em dados coletados:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-300">
                      <li>Identifica padrões de uso e anomalias</li>
                      <li>Sugere melhorias de segurança</li>
                      <li>Detecta comportamentos potencialmente arriscados</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "suporte" && (
              <div>
                <h2 className="text-xl font-semibold text-green-300 mb-4">Contato de Suporte</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Suporte Técnico</h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
                          <span className="text-green-300 text-xl">📞</span>
                        </div>
                        <div>
                          <p className="text-zinc-300 font-medium">Central de Suporte VidaShield</p>
                          <p className="text-zinc-400 text-sm">(42) 3333-4444 (horário comercial)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
                          <span className="text-green-300 text-xl">✉️</span>
                        </div>
                        <div>
                          <p className="text-zinc-300 font-medium">Email de Suporte</p>
                          <p className="text-zinc-400 text-sm">suporte@vidashield.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
                          <span className="text-green-300 text-xl">💬</span>
                        </div>
                        <div>
                          <p className="text-zinc-300 font-medium">Chat Online</p>
                          <p className="text-zinc-400 text-sm">Disponível 24/7 via Portal do Cliente</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Emergências de Segurança</h3>
                    <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-red-500">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center">
                          <span className="text-red-300 text-xl">🚨</span>
                        </div>
                        <div>
                          <p className="text-zinc-300 font-medium">Linha Direta de Emergência</p>
                          <p className="text-zinc-400 text-sm">(42) 99999-8888 (plantão 24h)</p>
                        </div>
                      </div>
                      <p className="text-zinc-300 text-sm mt-2">
                        Use este contato apenas para incidentes críticos de segurança que exijam 
                        intervenção imediata, como suspeita de invasão ou vazamento de dados.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-green-200 mb-2">Solicitações e Dúvidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="btn-neon py-3 flex items-center justify-center gap-2">
                        <span className="text-lg">📝</span> Abrir Chamado
                      </button>
                      <button className="btn-outline py-3 flex items-center justify-center gap-2">
                        <span className="text-lg">📋</span> Consultar Base de Conhecimento
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-200 mb-3">Feedback</h3>
                    <p className="text-zinc-300 mb-4">
                      Ajude-nos a melhorar o VidaShield compartilhando sugestões ou relatando problemas.
                    </p>
                    <a href="#" className="btn-secundario inline-block">Enviar Feedback</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Se estiver em modo modal, retorna apenas o conteúdo
  if (modalView) {
    return <AjudaContent />;
  }

  // Se for a página completa, envolve com o MainLayout
  return (
    <MainLayout>
      <AjudaContent />
    </MainLayout>
  );
}; 