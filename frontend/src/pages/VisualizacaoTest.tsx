import React, { useState } from 'react';
import { StyledPack } from '../templates/StyledPack';
import { Link } from 'react-router-dom';
import { StyleGuide } from '../components/StyleGuide';
import './teste.css';

const VisualizacaoTest: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>('styleguide');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'styled':
        return <StyledPack />;
      case 'styleguide':
        return <StyleGuide />;
      default:
        return <div className="p-10 text-center text-white">Componente não encontrado</div>;
    }
  };

  return (
    <div className="test-container">
      <header className="test-header bg-zinc-900 p-4 mb-6 text-white">
        <h1 className="text-2xl font-bold text-green-300">VidaShield - Teste de Visualização</h1>
        <p className="text-sm text-zinc-400">Este é um ambiente de teste para visualizar componentes</p>
        
        <nav className="mt-4 flex gap-4">
          <Link to="/" className="text-sm text-green-300 hover:underline">← Voltar para Home</Link>
          <button 
            onClick={() => setActiveComponent('styleguide')}
            className={`px-3 py-1 text-sm ${activeComponent === 'styleguide' ? 'btn-neon' : 'text-white bg-zinc-800 rounded'}`}
          >
            Guia de Estilos
          </button>
          <button 
            onClick={() => setActiveComponent('styled')}
            className={`px-3 py-1 text-sm ${activeComponent === 'styled' ? 'btn-neon' : 'text-white bg-zinc-800 rounded'}`}
          >
            StyledPack
          </button>
        </nav>
      </header>
      
      <div className="test-content">
        {renderComponent()}
      </div>
      
      <footer className="test-footer mt-8 p-4 text-center text-zinc-500 text-sm">
        <p>VidaShield © 2025 - Ambiente de Testes</p>
      </footer>
    </div>
  );
};

export default VisualizacaoTest; 