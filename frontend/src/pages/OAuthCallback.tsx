import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await axios.get('http://localhost:5000/ping', { timeout: 5000 });
        console.log('Servidor está online, prosseguindo com o callback OAuth');
        return true;
      } catch (error) {
        console.error('Erro ao verificar status do servidor:', error);
        setError('Servidor não está respondendo. Verifique se o backend está rodando.');
        setDetailedError(JSON.stringify(error));
        return false;
      }
    };

    const handleCallback = async () => {
      const token = searchParams.get('token');
      console.log("Token recebido:", token ? "Token presente" : "Token ausente");
      
      // Verifica primeiro se o servidor está online
      const serverOnline = await checkServerStatus();
      if (!serverOnline) {
        setTimeout(() => navigate('/login'), 5000);
        return;
      }
      
      if (token) {
        try {
          console.log("Iniciando login com token OAuth");
          
          // Tente validar o token diretamente com o servidor primeiro
          try {
            const validateResponse = await axios.get('http://localhost:5000/api/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Validação de token bem-sucedida:", validateResponse.data);
          } catch (validationError: any) {
            console.error("Erro ao validar token:", validationError);
            // Continua mesmo com erro para tentar o login normal
          }
          
          // Tenta o login normal
          await login(token);
          console.log("Login com token OAuth bem-sucedido");
          navigate('/dashboard');
        } catch (error: any) {
          console.error('Erro ao fazer login:', error);
          setError('Falha na autenticação. Tente novamente.');
          setDetailedError(JSON.stringify(error.response?.data || error.message));
          setTimeout(() => navigate('/login'), 5000);
        }
      } else {
        console.error("Callback OAuth sem token");
        setError('Não foi possível completar o login. Token não encontrado.');
        setTimeout(() => navigate('/login'), 5000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, login]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <p className="mb-4">Redirecionando para a página de login em alguns segundos...</p>
          
          {detailedError && (
            <div className="mt-6 bg-gray-800 p-4 rounded-lg text-left text-xs overflow-auto max-h-40">
              <p className="text-gray-400 mb-2">Detalhes técnicos:</p>
              <pre className="text-gray-400 whitespace-pre-wrap">{detailedError}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p>Autenticando...</p>
      </div>
    </div>
  );
};

export default OAuthCallback; 