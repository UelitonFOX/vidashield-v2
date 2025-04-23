import React from 'react';
import { Link } from 'react-router-dom';

export const Recover: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-2xl shadow-2xl space-y-6">
        <Link 
          to="/login" 
          className="flex justify-center mb-8"
          aria-label="Voltar para página inicial"
        >
          <img 
            src="/logo.png" 
            alt="VidaShield Logo" 
            title="VidaShield - Clique para voltar à página inicial"
            className="h-20 w-auto object-contain"
          />
        </Link>

        <h1 className="text-2xl font-bold text-center text-white">
          Recuperação de Senha
        </h1>
        
        <p className="text-gray-400 text-center">
          Esta funcionalidade estará disponível em breve.
        </p>

        <Link 
          to="/login"
          className="block w-full bg-teal-500 text-white py-2.5 px-4 rounded-lg hover:bg-teal-400 transition-colors font-medium text-center"
        >
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
};

export default Recover; 