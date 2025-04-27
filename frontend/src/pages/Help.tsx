import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  FiHelpCircle,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiAlertCircle,
  FiGithub,
  FiCode,
  FiUsers
} from 'react-icons/fi';
import './Dashboard.css';
import './Help.css';

interface FaqItem {
  question: string;
  answer: string;
}

const Help: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const packageVersion = '2.0.0'; // Normalmente obtido do package.json
  const supportEmail = 'suporte@vidashield.com';

  const faqItems: FaqItem[] = [
    {
      question: 'Como alterar minha senha?',
      answer: 'Acesse a página de Perfil no menu lateral, clique no botão "Alterar Senha" e siga as instruções para definir uma nova senha. Você precisará informar sua senha atual e a nova senha duas vezes para confirmação.'
    },
    {
      question: 'O que são os alertas críticos?',
      answer: 'Alertas críticos são notificações de alta prioridade que indicam possíveis ameaças à segurança, como múltiplas tentativas de login falhas, acessos de IPs não reconhecidos ou tentativas de acesso a áreas restritas. Esses alertas requerem atenção imediata.'
    },
    {
      question: 'Como exportar relatórios?',
      answer: 'Na página de Logs, você encontrará um botão "Exportar Logs" no canto superior direito. Clique nele para baixar um arquivo CSV com os registros de atividades filtrados. A mesma funcionalidade está disponível na página de Alertas.'
    },
    {
      question: 'Posso configurar notificações por email?',
      answer: 'Sim, usuários administradores podem configurar notificações por email na página de Configurações, na seção "Auditoria e Logs". Ative a opção "Notificar eventos críticos" para receber emails sobre alertas importantes.'
    },
    {
      question: 'Como adicionar um novo usuário ao sistema?',
      answer: 'Na página de Usuários, clique no botão "Novo Usuário" e preencha o formulário com o nome, email e função do novo usuário. Uma senha temporária será gerada e enviada por email para o novo usuário fazer seu primeiro acesso.'
    },
    {
      question: 'O que fazer quando um alerta crítico aparecer?',
      answer: 'Quando um alerta crítico for exibido, acesse a página de Alertas, verifique os detalhes do alerta para entender a natureza da ameaça, investigue as circunstâncias e, se necessário, tome medidas como bloquear IPs, redefinir senhas ou revogar permissões. Após resolver, marque o alerta como resolvido.'
    }
  ];

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  return (
    <DashboardLayout title="Ajuda">
      <div className="help-page">
        {/* Cabeçalho */}
        <div className="page-header">
          <h2 className="section-title">Central de Ajuda</h2>
        </div>

        <div className="help-content">
          {/* Seção de Suporte */}
          <section className="help-section chart-container">
            <div className="help-section-header">
              <FiUsers color="#339999" size={24} />
              <h3>Contato de Suporte</h3>
            </div>

            <div className="help-section-content">
              <p>Precisa de ajuda? Entre em contato com nossa equipe de suporte:</p>

              <div className="support-contact">
                <FiMail size={24} color="#339999" />
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </div>

              <div className="support-hours">
                <strong>Horário de atendimento:</strong> Segunda a Sexta, das 9h às 18h
              </div>

              <div className="report-button">
                <a
                  href={`mailto:${supportEmail}?subject=Reportar%20Problema%20-%20VidaShield&body=Descreva%20o%20problema%20que%20encontrou%3A%0A%0A%0ASistema%3A%20${packageVersion}%0A%0A`}
                  className="action-button danger"
                >
                  <FiAlertCircle size={18} />
                  Reportar um problema
                </a>
              </div>
            </div>
          </section>

          {/* Perguntas Frequentes */}
          <section className="help-section chart-container">
            <div className="help-section-header">
              <FiHelpCircle color="#339999" size={24} />
              <h3>Perguntas Frequentes</h3>
            </div>

            <div className="help-section-content">
              <div className="faq-list">
                {faqItems.map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-item ${openFaqIndex === index ? 'active' : 'inactive'}`}
                  >
                    <div
                      className={`faq-question ${openFaqIndex === index ? 'active' : 'inactive'}`}
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.question}</span>
                      {openFaqIndex === index ? (
                        <FiChevronUp color="#339999" />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>

                    {openFaqIndex === index && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Informações do Sistema */}
          <section className="help-section chart-container">
            <div className="help-section-header">
              <FiCode color="#339999" size={24} />
              <h3>Informações do Sistema</h3>
            </div>

            <div className="help-section-content system-info">
              <div className="system-info-grid">
                <div className="info-item stat-card">
                  <span className="info-label">Versão:</span>
                  <span className="info-value">{packageVersion}</span>
                </div>

                <div className="info-item stat-card">
                  <span className="info-label">Data da versão:</span>
                  <span className="info-value">Julho 2024</span>
                </div>

                <div className="info-item stat-card">
                  <span className="info-label">Desenvolvido por:</span>
                  <span className="info-value">Equipe VidaShield</span>
                </div>
              </div>

              <div className="github-link">
                <a
                  href="https://github.com/UelitonFOX/vidashield"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button primary"
                >
                  <FiGithub size={18} />
                  Ver no GitHub
                </a>
              </div>
            </div>
          </section>

          {/* Documentação */}
          <section className="help-section chart-container">
            <div className="help-section-header">
              <FiFileText color="#339999" size={24} />
              <h3>Documentação</h3>
            </div>

            <div className="help-section-content">
              <p>Acesse a documentação completa para aprender mais sobre o sistema:</p>

              <div className="documentation-links">
                <a href="/docs/manual-usuario.pdf" target="_blank" className="documentation-link">
                  <FiFileText size={24} color="#339999" />
                  <div>
                    <div className="documentation-link-title">Manual do Usuário</div>
                    <div className="documentation-link-description">Guia completo para utilização do sistema</div>
                  </div>
                </a>

                <a href="/docs/guia-admin.pdf" target="_blank" className="documentation-link">
                  <FiFileText size={24} color="#339999" />
                  <div>
                    <div className="documentation-link-title">Guia de Administração</div>
                    <div className="documentation-link-description">Instruções para gerenciar o sistema</div>
                  </div>
                </a>

                <a href="/docs/procedimentos-seguranca.pdf" target="_blank" className="documentation-link">
                  <FiFileText size={24} color="#339999" />
                  <div>
                    <div className="documentation-link-title">Procedimentos de Segurança</div>
                    <div className="documentation-link-description">Boas práticas e protocolos de segurança</div>
                  </div>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Help; 