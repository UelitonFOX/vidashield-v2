import { useState } from "react";
import { MainLayout } from "../layout/MainLayout";
import { Link } from "react-router-dom";
import "../styles/vidashield.css";
import { 
  BookOpen, 
  Layers, 
  Users, 
  LineChart, 
  Bell, 
  FileText, 
  Download, 
  ChevronRight, 
  ArrowLeft,
  ExternalLink
} from "lucide-react";

// Exemplo de imagens placeholder (serão substituídas por imagens reais posteriormente)
const loginPlaceholder = "https://placehold.co/600x400/1e1e1e/4ade80?text=Tela+de+Login+VidaShield";
// Imagem real do dashboard na pasta pública
const dashboardImage = "/images/dashboard.png";

// Componente de seção da documentação
interface DocSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const DocSection: React.FC<DocSectionProps> = ({ id, title, icon, children }) => {
  return (
    <div id={id} className="card-dark shadow-glow-soft mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-green-400">{icon}</div>
        <h2 className="text-xl font-semibold text-green-300">{title}</h2>
      </div>
      <div className="text-zinc-300 space-y-4">
        {children}
      </div>
    </div>
  );
};

// Componente de accordion para FAQs
interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqAccordion: React.FC<{ items: FaqItemProps[] }> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-zinc-700 rounded-lg overflow-hidden">
          <button
            className="w-full text-left p-4 bg-zinc-800 hover:bg-zinc-700 flex justify-between items-center"
            onClick={() => toggleAccordion(index)}
          >
            <span className="text-zinc-100">{item.question}</span>
            <ChevronRight 
              className={`text-green-400 transition-transform ${activeIndex === index ? 'rotate-90' : ''}`} 
              size={18} 
            />
          </button>
          {activeIndex === index && (
            <div className="p-4 bg-zinc-800/50 text-zinc-300 border-t border-zinc-700">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Componente da página de Documentação
const Documentacao: React.FC = () => {
  // Lista de FAQs
  const faqItems: FaqItemProps[] = [
    { 
      question: "Como posso alterar minha senha?", 
      answer: "Acesse o painel de controle, clique em seu perfil no canto superior direito e selecione 'Configurações'. Na seção 'Segurança', você encontrará a opção para alterar sua senha." 
    },
    { 
      question: "O que significam os níveis de alerta?", 
      answer: "Os alertas são classificados em três níveis: Informativo (verde), Alerta (amarelo) e Crítico (vermelho). Os alertas críticos exigem atenção imediata, enquanto os alertas amarelos precisam de monitoramento. Os informativos são apenas para registro." 
    },
    { 
      question: "Como exportar logs de acesso?", 
      answer: "Na seção 'Logs de Acesso', utilize os filtros para selecionar o período desejado. Em seguida, clique no botão 'Exportar' no canto superior direito e escolha o formato (CSV, PDF ou XLSX)." 
    },
    { 
      question: "Posso configurar alertas por e-mail?", 
      answer: "Sim. Vá para 'Configurações' e na seção 'Notificações', você pode definir quais eventos devem disparar alertas por e-mail e para quais endereços." 
    },
    { 
      question: "Quais são os requisitos mínimos do sistema?", 
      answer: "O VidaShield foi projetado para funcionar em qualquer navegador moderno (Chrome, Firefox, Safari, Edge) com JavaScript habilitado. Recomenda-se uma conexão de internet estável para melhor desempenho." 
    }
  ];

  // Função para facilitar a navegação suave entre as seções
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <MainLayout>
      <div className="p-6 bg-zinc-900 min-h-screen">
        {/* Cabeçalho da página */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-300">Documentação do VidaShield</h1>
            <p className="text-zinc-400 mt-2">Guia rápido de uso do sistema, fluxos e funcionalidades.</p>
          </div>
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 px-4 py-2 rounded transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Link>
        </div>

        {/* Menu de navegação rápida */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="card-dark shadow-glow-soft sticky top-4">
              <h3 className="text-lg font-medium text-green-300 mb-4">Índice</h3>
              <nav className="space-y-1">
                <button 
                  onClick={() => scrollToSection('introducao')} 
                  className="w-full text-left py-2 px-3 rounded transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-green-400 flex items-center gap-2"
                >
                  <BookOpen size={16} /> Introdução ao Sistema
                </button>
                <button 
                  onClick={() => scrollToSection('fluxo')} 
                  className="w-full text-left py-2 px-3 rounded transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-green-400 flex items-center gap-2"
                >
                  <Layers size={16} /> Fluxo de Acesso
                </button>
                <button 
                  onClick={() => scrollToSection('painel')} 
                  className="w-full text-left py-2 px-3 rounded transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-green-400 flex items-center gap-2"
                >
                  <LineChart size={16} /> Painel de Controle
                </button>
                <button 
                  onClick={() => scrollToSection('usuarios')} 
                  className="w-full text-left py-2 px-3 rounded transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-green-400 flex items-center gap-2"
                >
                  <Users size={16} /> Gerenciamento de Usuários
                </button>
                <button 
                  onClick={() => scrollToSection('alertas')} 
                  className="w-full text-left py-2 px-3 rounded transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-green-400 flex items-center gap-2"
                >
                  <Bell size={16} /> Alertas e Logs de Acesso
                </button>
                <button 
                  onClick={() => scrollToSection('exportacao')} 
                  className="w-full text-left py-2 px-3 rounded transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-green-400 flex items-center gap-2"
                >
                  <Download size={16} /> Exportação de Dados
                </button>
                <button 
                  onClick={() => scrollToSection('faq')} 
                  className="w-full text-left py-2 px-3 rounded transition-colors text-zinc-300 hover:bg-zinc-800 hover:text-green-400 flex items-center gap-2"
                >
                  <FileText size={16} /> Perguntas Frequentes
                </button>
              </nav>
              <div className="mt-6 pt-4 border-t border-zinc-700/50">
                <Link 
                  to="/sobre-talento-tech" 
                  className="flex items-center justify-between w-full text-left py-2 px-3 rounded transition-colors text-green-400 hover:bg-zinc-800"
                >
                  <span>Sobre o Talento Tech PR 15</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="md:col-span-4 space-y-6">
            <DocSection id="introducao" title="Introdução ao Sistema" icon={<BookOpen size={20} />}>
              <p>
                O VidaShield é um sistema de segurança e monitoramento projetado especificamente para proteger
                dados sensíveis de clínicas e estabelecimentos de saúde. Utilizando tecnologia de ponta, o sistema 
                oferece proteção robusta contra ameaças cibernéticas e controle de acesso completo para garantir 
                a confidencialidade dos dados de pacientes.
              </p>
              
              <h3 className="text-lg font-medium text-green-200 mt-6 mb-2">Funcionalidades Principais</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-green-300 font-medium">Login Seguro:</span> Autenticação de dois fatores e proteção contra tentativas de acesso não autorizado.</li>
                <li><span className="text-green-300 font-medium">Dashboard:</span> Visão geral dos principais indicadores de segurança em tempo real.</li>
                <li><span className="text-green-300 font-medium">Logs:</span> Registro detalhado de todas as ações realizadas no sistema.</li>
                <li><span className="text-green-300 font-medium">Alertas:</span> Notificações imediatas sobre comportamentos suspeitos ou anormais.</li>
                <li><span className="text-green-300 font-medium">Relatórios:</span> Geração de relatórios personalizados para análise de segurança.</li>
              </ul>
            </DocSection>

            <DocSection id="fluxo" title="Fluxo de Acesso" icon={<Layers size={20} />}>
              <p>
                O acesso ao VidaShield segue um fluxo seguro para garantir que apenas usuários autorizados possam
                interagir com o sistema. Abaixo, detalhamos o processo passo a passo:
              </p>

              <ol className="list-decimal pl-5 space-y-3 my-4">
                <li>
                  <span className="text-green-300 font-medium">Tela de Login:</span> Acesse o sistema através da URL fornecida pelo administrador, que abrirá a tela de login.
                </li>
                <li>
                  <span className="text-green-300 font-medium">Credenciais:</span> Insira seu nome de usuário e senha nos campos correspondentes.
                </li>
                <li>
                  <span className="text-green-300 font-medium">Verificação:</span> Se configurada, será solicitada a autenticação de dois fatores (código enviado por e-mail ou SMS).
                </li>
                <li>
                  <span className="text-green-300 font-medium">Redirecionamento:</span> Após autenticação bem-sucedida, você será redirecionado para o Dashboard principal.
                </li>
              </ol>

              <div className="mt-6 p-1 bg-zinc-800 rounded-lg shadow-glow-soft">
                <img 
                  src={loginPlaceholder} 
                  alt="Tela de Login VidaShield" 
                  className="w-full rounded-lg"
                />
                <p className="text-center text-xs text-zinc-500 mt-2">Exemplo da tela de login do VidaShield</p>
              </div>
            </DocSection>

            <DocSection id="painel" title="Painel de Controle" icon={<LineChart size={20} />}>
              <p>
                O Dashboard é o centro de controle do VidaShield, oferecendo uma visão completa e em tempo real
                do status de segurança do sistema. Ele é dividido em várias seções, cada uma com informações específicas:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-2">Visão Geral</h4>
                  <p className="text-zinc-300 text-sm">
                    Cards com indicadores de usuários ativos, tentativas bloqueadas, alertas críticos e status do sistema.
                  </p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-2">Gráficos de Atividade</h4>
                  <p className="text-zinc-300 text-sm">
                    Visualização gráfica de acessos, alertas e tentativas de invasão ao longo do tempo.
                    <a href="#painel" className="text-green-400 block mt-1 text-xs" onClick={() => scrollToSection('estatisticas')}>Ver detalhes dos gráficos →</a>
                  </p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-2">Alertas Recentes</h4>
                  <p className="text-zinc-300 text-sm">
                    Lista dos últimos alertas gerados pelo sistema, categorizados por severidade.
                  </p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-2">Status dos Serviços</h4>
                  <p className="text-zinc-300 text-sm">
                    Indicadores de funcionamento dos componentes principais: API, Banco de Dados e Serviços.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-1 bg-zinc-800 rounded-lg shadow-glow-soft">
                <img 
                  src={dashboardImage} 
                  alt="Dashboard VidaShield" 
                  className="w-full rounded-lg"
                />
                <p className="text-center text-xs text-zinc-500 mt-2">Visão geral do Dashboard do VidaShield</p>
              </div>
            </DocSection>

            <DocSection id="usuarios" title="Gerenciamento de Usuários" icon={<Users size={20} />}>
              <p>
                O módulo de gerenciamento de usuários permite controlar todos os aspectos relacionados
                às contas e permissões no sistema VidaShield.
              </p>

              <h3 className="text-lg font-medium text-green-200 mt-6 mb-2">Visualização de Usuários</h3>
              <p>
                Na tela de Usuários, você encontrará uma tabela com todos os usuários cadastrados no sistema,
                exibindo informações como:
              </p>
              <ul className="list-disc pl-5 space-y-1 my-3">
                <li>Nome completo e e-mail</li>
                <li>Nível de acesso/função</li>
                <li>Status (Ativo, Inativo, Bloqueado)</li>
                <li>Data do último acesso</li>
                <li>Ações disponíveis (editar, desativar, redefinir senha)</li>
              </ul>

              <h3 className="text-lg font-medium text-green-200 mt-6 mb-2">Tipos de Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="badge-ativo inline-block mb-2">Ativo</span>
                  <p className="text-zinc-300 text-sm">
                    Usuários com acesso normal ao sistema.
                  </p>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="badge-inativo inline-block mb-2">Inativo</span>
                  <p className="text-zinc-300 text-sm">
                    Contas desativadas manualmente pelo administrador.
                  </p>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <span className="badge-alerta inline-block mb-2">Bloqueado</span>
                  <p className="text-zinc-300 text-sm">
                    Contas temporariamente bloqueadas por questões de segurança.
                  </p>
                </div>
              </div>
            </DocSection>

            <DocSection id="alertas" title="Alertas e Logs de Acesso" icon={<Bell size={20} />}>
              <p>
                O sistema VidaShield mantém registros detalhados de todas as atividades e 
                gera alertas quando comportamentos potencialmente perigosos são detectados.
              </p>

              <h3 className="text-lg font-medium text-green-200 mt-6 mb-2">Interpretação de Alertas</h3>
              <p>
                Os alertas são classificados em três níveis de severidade, cada um exigindo
                um tipo diferente de atenção:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="bg-zinc-800 p-3 rounded-lg border-l-4 border-green-500">
                  <h4 className="text-green-300 font-medium mb-1">Informativo</h4>
                  <p className="text-zinc-300 text-sm">
                    Eventos normais registrados para fins de auditoria.
                  </p>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="text-yellow-300 font-medium mb-1">Alerta</h4>
                  <p className="text-zinc-300 text-sm">
                    Eventos que requerem atenção, mas não são emergenciais.
                  </p>
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg border-l-4 border-red-500">
                  <h4 className="text-red-400 font-medium mb-1">Crítico</h4>
                  <p className="text-zinc-300 text-sm">
                    Eventos que exigem ação imediata do administrador.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-green-200 mt-6 mb-2">Acesso aos Logs</h3>
              <p>
                Para acessar e filtrar os logs do sistema:
              </p>
              <ol className="list-decimal pl-5 space-y-2 my-3">
                <li>Navegue até a seção "Logs de Acesso" no menu lateral</li>
                <li>Utilize os filtros disponíveis para refinar sua busca:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Período (data e hora)</li>
                    <li>Usuário específico</li>
                    <li>Tipo de ação (login, visualização, alteração)</li>
                    <li>Status (sucesso, falha)</li>
                  </ul>
                </li>
                <li>Clique em "Aplicar Filtros" para visualizar os resultados</li>
                <li>Utilize as opções de exportação para salvar os logs filtrados</li>
              </ol>
            </DocSection>

            <DocSection id="exportacao" title="Exportação de Dados" icon={<Download size={20} />}>
              <p>
                O VidaShield permite a exportação de diversos dados para análise externa
                e geração de relatórios personalizados.
              </p>

              <h3 className="text-lg font-medium text-green-200 mt-6 mb-2">Formatos Disponíveis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-2">CSV</h4>
                  <p className="text-zinc-300 text-sm">
                    Formato ideal para importação em ferramentas de planilha como Excel ou Google Sheets.
                  </p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-2">PDF</h4>
                  <p className="text-zinc-300 text-sm">
                    Formato de documento para visualização e compartilhamento seguro com formatação preservada.
                  </p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-green-300 font-medium mb-2">XLSX</h4>
                  <p className="text-zinc-300 text-sm">
                    Planilha Excel nativa com formatação, fórmulas e múltiplas abas quando aplicável.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-green-200 mt-6 mb-2">Como Exportar Dados</h3>
              <p>
                O processo de exportação é simples e pode ser realizado em diferentes seções do sistema:
              </p>
              <ol className="list-decimal pl-5 space-y-2 my-3">
                <li>Navegue até a seção desejada (Logs, Alertas, Usuários, etc.)</li>
                <li>Aplique os filtros necessários para selecionar os dados específicos</li>
                <li>Clique no botão "Exportar" localizado geralmente no canto superior direito</li>
                <li>Selecione o formato desejado (CSV, PDF ou XLSX)</li>
                <li>Confirme a exportação e aguarde o download do arquivo</li>
              </ol>
            </DocSection>

            <DocSection id="faq" title="Perguntas Frequentes" icon={<FileText size={20} />}>
              <p className="mb-4">
                Abaixo estão respostas para as dúvidas mais comuns sobre o sistema VidaShield:
              </p>
              
              <FaqAccordion items={faqItems} />
            </DocSection>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Documentacao; 