import React, { useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import ActionButton from '../components/ActionButton';

const faqData = [
  { question: 'Como posso resetar minha senha?', answer: 'Para resetar sua senha, vá até a página de login e clique em "Esqueceu a senha?".' },
  { question: 'Como reportar um problema?', answer: 'Você pode reportar um problema clicando no botão "Reportar Problema" nesta página.' },
  { question: 'Onde encontro o manual do usuário?', answer: 'O manual do usuário está disponível na seção de Documentação abaixo.' },
];

const Help: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <SectionTitle title="Ajuda e Suporte" />
      <div className="mb-6">
        <h3 className="text-xl text-white mb-4">FAQ</h3>
        {faqData.map((item, index) => (
          <div key={index} className="mb-2">
            <button
              className="w-full text-left text-white bg-gray-800 p-3 rounded-lg"
              onClick={() => toggleFAQ(index)}
            >
              {item.question}
            </button>
            {activeIndex === index && (
              <div className="p-3 text-gray-300 bg-gray-700 rounded-lg">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mb-6">
        <h3 className="text-xl text-white mb-4">Contato de Suporte</h3>
        <p className="text-gray-300">Email: suporte@vidashield.com</p>
        <ActionButton label="Reportar Problema" onClick={() => alert('Funcionalidade de reporte em desenvolvimento')} />
      </div>
      <div className="mb-6">
        <h3 className="text-xl text-white mb-4">Informações da Versão</h3>
        <p className="text-gray-300">Versão: 1.0.0</p>
        <p className="text-gray-300">Data: 2023-10-15</p>
        <p className="text-gray-300">Desenvolvedor: Equipe VidaShield</p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl text-white mb-4">Documentação</h3>
        <ActionButton label="Manual do Usuário" onClick={() => window.open('/docs/manual_usuario.pdf', '_blank')} />
        <ActionButton label="Guia de Administração" onClick={() => window.open('/docs/guia_administracao.pdf', '_blank')} />
        <ActionButton label="Procedimentos de Segurança" onClick={() => window.open('/docs/procedimentos_seguranca.pdf', '_blank')} />
      </div>
    </div>
  );
};

export default Help;
