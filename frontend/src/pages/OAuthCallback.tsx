import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const processOAuthToken = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Obter token CSRF antes de qualquer operação
        try {
          const { fetchCSRFToken } = await import('../services/api');
          await fetchCSRFToken();
        } catch (csrfError) {
          console.error("Erro ao obter token CSRF na página de callback OAuth:", csrfError);
        }
        
        // Obter o token da URL
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        
        if (!token) {
          throw new Error('Token não encontrado na URL');
        }
        
        console.log("Token OAuth recebido:", token.substring(0, 15) + "...");
        
        // Validar e processar o token
        await login(token);
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Erro no callback OAuth:', error);
        let message = 'Erro durante autenticação. Tente novamente.';
        
        if (error.response?.data?.msg) {
          message = error.response.data.msg;
        } else if (error.message) {
          message = error.message;
        }
        
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    
    processOAuthToken();
  }, [login, navigate, location]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <p className="mb-4">Redirecionando para a página de login em alguns segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p>Autenticando...</p>
        {loading && <p className="text-xs text-gray-400 mt-2">Processando autenticação...</p>}
      </div>
    </div>
  );
};

export default OAuthCallback; 