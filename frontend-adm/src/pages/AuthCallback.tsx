import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import authService from '../services/api/authService';

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<string[]>([]);
  
  // Função para adicionar mensagens de debug
  const addDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 23)}: ${message}`]);
    console.log(`[AuthCallback] ${message}`);
  };

  useEffect(() => {
    const processCallback = async () => {
      setLoading(true);
      addDebug(`Processando callback: ${location.search}`);
      
      // 1. Verificar se há um erro na URL
      const params = new URLSearchParams(location.search);
      const error = params.get('error');
      
      if (error) {
        const errorDescription = params.get('error_description') || 'Erro desconhecido';
        addDebug(`Erro recebido: ${error} - ${errorDescription}`);
        setTimeout(() => navigate('/login', { state: { error: errorDescription } }), 2000);
        return;
      }
      
      // 2. Verificar se temos um token JWT (callback direto do backend)
      const token = params.get('token');
      if (token) {
        try {
          addDebug('Token JWT recebido diretamente na URL');
          addDebug(`Token: ${token.substring(0, 15)}...`);
          await login(token);
          addDebug(`Login bem-sucedido com token JWT`);
          setTimeout(() => navigate('/dashboard'), 1000);
          return;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Token inválido ou expirado';
          addDebug(`Erro ao processar token: ${errorMsg}`);
          setTimeout(() => navigate('/login', { state: { error: errorMsg } }), 2000);
          return;
        }
      }
      
      // Não esperamos mais receber um código aqui, pois o backend deve ter 
      // já processado o código e redirecionado com o token
      addDebug('Nenhum token encontrado na URL. Verifique a configuração do callback do backend.');
      setTimeout(() => navigate('/login', { 
        state: { error: 'Parâmetros de autenticação não encontrados ou inválidos' } 
      }), 2000);
    };

    processCallback();
  }, [location, navigate, login]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-center mb-4">
          {loading ? 'Processando autenticação...' : 'Redirecionando...'}
        </h1>
        <div className="flex justify-center my-4">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        {/* Informações de debug sempre visíveis */}
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60">
          <p className="font-semibold mb-1">Informações de Debug:</p>
          {debug.length > 0 ? (
            debug.map((msg, i) => <div key={i} className="text-gray-700">{msg}</div>)
          ) : (
            <p>Inicializando...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 