import React, { useEffect, useRef, useState } from "react";
import { 
  BookOpen, 
  Layers, 
  LineChart, 
  Users, 
  Bell, 
  Download, 
  FileText,
  Shield
} from "lucide-react";

// Importando componentes modulares
import DocHeader from "../components/documentacao/DocHeader";
import SideNav from "../components/documentacao/SideNav";
import DocSection from "../components/documentacao/DocSection";
import FaqAccordion from "../components/documentacao/FaqAccordion";
import { FaqItemProps } from "../components/documentacao/types";

/**
 * Página de documentação principal do sistema
 */
const Documentacao: React.FC = () => {
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Função para rolar até uma seção específica
  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -80; // Ajuste para considerar o header fixo
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Configurar as referências de seção ao montar o componente
  useEffect(() => {
    // Nada a fazer, as refs serão configuradas via callback refs
  }, []);

  // Perguntas frequentes para o componente FaqAccordion
  const faqItems: FaqItemProps[] = [
    {
      question: "Como alterar minha senha de acesso?",
      answer: "Para alterar sua senha, acesse seu perfil clicando no avatar no canto superior direito, selecione 'Configurações' e depois 'Alterar Senha'. Você precisará informar sua senha atual e a nova senha."
    },
    {
      question: "O que fazer ao receber um alerta crítico?",
      answer: "Alertas críticos devem ser verificados imediatamente. Acesse a página de Alertas para ver os detalhes, analise o tipo de evento que gerou o alerta e tome as medidas necessárias conforme o protocolo de segurança estabelecido."
    },
    {
      question: "Como adicionar um novo usuário ao sistema?",
      answer: "Para adicionar um novo usuário, vá até a seção 'Usuários', clique em 'Adicionar Usuário', preencha os dados necessários como nome, email e perfil de acesso e clique em Salvar. Um email será enviado ao novo usuário com instruções para definir sua senha."
    },
    {
      question: "Como exportar relatórios de acesso?",
      answer: "Para exportar relatórios, acesse o Dashboard, clique no botão 'Exportar Relatório' no canto superior direito. Selecione o tipo de relatório desejado, o período e o formato (PDF, CSV ou JSON) e clique em 'Gerar Relatório'."
    },
    {
      question: "É possível configurar alertas personalizados?",
      answer: "Sim. Acesse a seção 'Configurações > Alertas', onde você poderá criar regras de alerta personalizadas baseadas em diferentes critérios como horário de acesso, número de tentativas falhas, acessos a áreas restritas, entre outros."
    }
  ];

  return (
    <div className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <DocHeader />

      {/* Conteúdo principal em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Barra lateral */}
        <div className="lg:col-span-1">
          <SideNav onSectionClick={scrollToSection} />
        </div>

        {/* Seções de documentação */}
        <div className="lg:col-span-3">
          {/* Seção Introdução */}
          <div ref={(el) => { sectionRefs.current["introducao"] = el; }}>
            <DocSection 
              id="introducao" 
              title="Introdução ao Sistema" 
              icon={<BookOpen size={20} />}
            >
              <p>
                O VidaShield é uma plataforma de segurança de acesso projetada para proteger dados sensíveis 
                e garantir que apenas usuários autorizados tenham acesso às informações. Desenvolvido com as 
                mais recentes tecnologias, o sistema oferece uma interface intuitiva para monitoramento 
                e gerenciamento de segurança.
              </p>
              <p>
                Este painel administrativo permite visualizar métricas importantes, gerenciar usuários, 
                configurar políticas de segurança e responder a alertas em tempo real.
              </p>
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 mt-4">
                <div className="flex items-center text-green-300 mb-2">
                  <Shield size={18} className="mr-2" />
                  <h3 className="font-medium">Principais Recursos</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-zinc-300">
                  <li>Monitoramento em tempo real de tentativas de acesso</li>
                  <li>Detecção de atividades suspeitas e bloqueio automático</li>
                  <li>Gestão completa de usuários e níveis de acesso</li>
                  <li>Relatórios detalhados e exportáveis</li>
                  <li>Alertas personalizáveis para diferentes cenários de segurança</li>
                </ul>
              </div>
            </DocSection>
          </div>

          {/* Seção Fluxo de Acesso */}
          <div ref={(el) => { sectionRefs.current["fluxo"] = el; }}>
            <DocSection 
              id="fluxo" 
              title="Fluxo de Acesso" 
              icon={<Layers size={20} />}
            >
              <p>
                O sistema utiliza um processo de autenticação em múltiplas camadas para garantir 
                a segurança dos dados. Abaixo está o fluxo básico de como um usuário acessa o sistema:
              </p>
              <ol className="list-decimal list-inside space-y-2 mt-4">
                <li className="p-3 bg-zinc-800 rounded-lg">
                  <span className="font-medium text-green-300">Autenticação Inicial</span>
                  <p className="mt-1 text-sm text-zinc-400">
                    O usuário fornece suas credenciais (email e senha) na tela de login.
                  </p>
                </li>
                <li className="p-3 bg-zinc-800 rounded-lg">
                  <span className="font-medium text-green-300">Verificação de Identidade</span>
                  <p className="mt-1 text-sm text-zinc-400">
                    Dependendo das configurações, pode ser solicitada uma segunda verificação 
                    (autenticação de dois fatores).
                  </p>
                </li>
                <li className="p-3 bg-zinc-800 rounded-lg">
                  <span className="font-medium text-green-300">Avaliação de Risco</span>
                  <p className="mt-1 text-sm text-zinc-400">
                    O sistema avalia fatores como localização, dispositivo e padrões de acesso.
                  </p>
                </li>
                <li className="p-3 bg-zinc-800 rounded-lg">
                  <span className="font-medium text-green-300">Autorização</span>
                  <p className="mt-1 text-sm text-zinc-400">
                    Após autenticação bem-sucedida, o usuário recebe acesso apenas aos recursos 
                    permitidos para seu nível de permissão.
                  </p>
                </li>
                <li className="p-3 bg-zinc-800 rounded-lg">
                  <span className="font-medium text-green-300">Monitoramento Contínuo</span>
                  <p className="mt-1 text-sm text-zinc-400">
                    Durante toda a sessão, o sistema monitora atividades em busca de comportamentos suspeitos.
                  </p>
                </li>
              </ol>
            </DocSection>
          </div>

          {/* Seção Painel de Controle */}
          <div ref={(el) => { sectionRefs.current["painel"] = el; }}>
            <DocSection 
              id="painel" 
              title="Painel de Controle" 
              icon={<LineChart size={20} />}
            >
              <p>
                O painel de controle (Dashboard) é a principal interface para visualização do status 
                do sistema e métricas importantes. Nele você encontra:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <h4 className="font-medium text-green-300 mb-2">Indicadores em Tempo Real</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
                    <li>Total de usuários ativos</li>
                    <li>Logins realizados hoje</li>
                    <li>Alertas críticos pendentes</li>
                    <li>Tentativas de acesso bloqueadas</li>
                  </ul>
                </div>
                <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <h4 className="font-medium text-green-300 mb-2">Gráficos e Visualizações</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
                    <li>Tendências de acesso semanal</li>
                    <li>Distribuição de tentativas bloqueadas</li>
                    <li>Mapa de acessos por localização</li>
                    <li>Horários de pico de utilização</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4">
                Para atualizar os dados em tempo real, clique no botão "Atualizar" no canto superior 
                direito do dashboard. Você também pode exportar relatórios detalhados em diversos formatos.
              </p>
            </DocSection>
          </div>

          {/* Seção Gerenciamento de Usuários */}
          <div ref={(el) => { sectionRefs.current["usuarios"] = el; }}>
            <DocSection 
              id="usuarios" 
              title="Gerenciamento de Usuários" 
              icon={<Users size={20} />}
            >
              <p>
                O módulo de gerenciamento de usuários permite controlar quem tem acesso ao sistema 
                e quais permissões cada usuário possui.
              </p>
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <h4 className="font-medium text-green-300">Criar Novo Usuário</h4>
                  <p className="text-sm text-zinc-300 mt-1">
                    Para adicionar um novo usuário, acesse a seção "Usuários" e clique em "Adicionar Usuário". 
                    Preencha os dados necessários como nome, email, cargo e defina o perfil de acesso adequado.
                  </p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <h4 className="font-medium text-green-300">Editar Perfil de Acesso</h4>
                  <p className="text-sm text-zinc-300 mt-1">
                    Você pode modificar as permissões de um usuário a qualquer momento acessando a página 
                    de detalhes do usuário e selecionando "Editar Permissões".
                  </p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <h4 className="font-medium text-green-300">Desativar Usuário</h4>
                  <p className="text-sm text-zinc-300 mt-1">
                    Em vez de excluir usuários, recomenda-se desativá-los. Isso mantém o histórico de atividades 
                    para fins de auditoria enquanto impede novos acessos.
                  </p>
                </div>
              </div>
            </DocSection>
          </div>

          {/* Seção Alertas e Logs */}
          <div ref={(el) => { sectionRefs.current["alertas"] = el; }}>
            <DocSection 
              id="alertas" 
              title="Alertas e Logs de Acesso" 
              icon={<Bell size={20} />}
            >
              <p>
                O sistema gera alertas baseados em regras de segurança predefinidas e comportamentos suspeitos. 
                Estes alertas são classificados por nível de severidade:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="p-3 bg-zinc-800 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-medium text-green-300">Informativo</h4>
                  <p className="text-sm text-zinc-300 mt-1">
                    Notificações sobre eventos normais do sistema como backups, atualizações e manutenções.
                  </p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-medium text-yellow-300">Atenção</h4>
                  <p className="text-sm text-zinc-300 mt-1">
                    Eventos que não representam riscos imediatos, mas merecem atenção como acessos fora do horário comum.
                  </p>
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg border-l-4 border-red-400">
                  <h4 className="font-medium text-red-300">Crítico</h4>
                  <p className="text-sm text-zinc-300 mt-1">
                    Situações que exigem ação imediata, como múltiplas tentativas de login falhas ou acessos não autorizados.
                  </p>
                </div>
              </div>
              <p>
                Todos os alertas e logs podem ser consultados na seção "Alertas". Você pode filtrar por data, tipo, 
                usuário e severidade para facilitar a análise.
              </p>
            </DocSection>
          </div>

          {/* Seção Exportação de Dados */}
          <div ref={(el) => { sectionRefs.current["exportacao"] = el; }}>
            <DocSection 
              id="exportacao" 
              title="Exportação de Dados" 
              icon={<Download size={20} />}
            >
              <p>
                O VidaShield permite gerar e exportar diferentes tipos de relatórios para análise externa, 
                auditoria ou arquivamento.
              </p>
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <h4 className="font-medium text-green-300">Formatos Disponíveis</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 text-xs rounded bg-zinc-700 text-zinc-200">PDF</span>
                    <span className="px-2 py-1 text-xs rounded bg-zinc-700 text-zinc-200">CSV</span>
                    <span className="px-2 py-1 text-xs rounded bg-zinc-700 text-zinc-200">JSON</span>
                    <span className="px-2 py-1 text-xs rounded bg-zinc-700 text-zinc-200">XLSX</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <h4 className="font-medium text-green-300">Tipos de Relatórios</h4>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-zinc-300">
                    <li>Resumo de atividades do sistema</li>
                    <li>Logs de acesso detalhados</li>
                    <li>Histórico de alertas</li>
                    <li>Tentativas de acesso bloqueadas</li>
                    <li>Auditoria de ações administrativas</li>
                  </ul>
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <h4 className="font-medium text-green-300">Configuração de Relatórios</h4>
                  <p className="text-sm text-zinc-300 mt-1">
                    Você pode personalizar seus relatórios selecionando o período de dados, 
                    campos específicos e aplicar filtros para obter exatamente as informações necessárias.
                  </p>
                </div>
              </div>
            </DocSection>
          </div>

          {/* Seção FAQ */}
          <div ref={(el) => { sectionRefs.current["faq"] = el; }}>
            <DocSection 
              id="faq" 
              title="Perguntas Frequentes" 
              icon={<FileText size={20} />}
            >
              <p className="mb-4">
                Abaixo estão as respostas para as dúvidas mais comuns sobre o uso do sistema:
              </p>
              <FaqAccordion items={faqItems} />
            </DocSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentacao; 