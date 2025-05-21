import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAuth0 } from '@auth0/auth0-react';
import authService from '../services/api/authService';

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isAuthenticated, handleRedirectCallback, getAccessTokenSilently, user } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<string[]>([]);
  const [tokenDetails, setTokenDetails] = useState<string | null>(null);
  
  // Função para adicionar mensagens de debug
  const addDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toISOString().slice(11, 23)}: ${message}`]);
    console.log(`[AuthCallback] ${message}`);
  };

  useEffect(() => {
    const processCallback = async () => {
      setLoading(true);
      addDebug(`Processando callback: ${location.search}`);
      addDebug(`URL completa: ${window.location.href}`);
      
      // Imprimir dados do usuário se disponíveis
      if (user) {
        addDebug(`Usuário: ${user.name || user.email}`);
      }
      
      // 1. Verificar se há um erro na URL
      const params = new URLSearchParams(location.search);
      const error = params.get('error');
      
      if (error) {
        const errorDescription = params.get('error_description') || 'Erro desconhecido';
        addDebug(`Erro recebido: ${error} - ${errorDescription}`);
        setTimeout(() => navigate('/login', { state: { error: errorDescription } }), 2000);
        return;
      }

      // 2. Processar o callback do Auth0
      try {
        if (location.search) {
          addDebug('Callback do Auth0 detectado, processando...');
          try {
            const result = await handleRedirectCallback();
            addDebug(`Callback processado com sucesso: ${JSON.stringify(result)}`);
            
            // Obter token para uso no sistema
            try {
              const token = await getAccessTokenSilently();
              const tokenPreview = token.substring(0, 20) + "...";
              setTokenDetails(tokenPreview);
              addDebug(`Token obtido: ${tokenPreview}`);
              
              // Salvar o token no localStorage
              localStorage.setItem('auth_token', token);
              
              // Fazer login no sistema com o token
              await login(token);
              
              // Redirecionar para o dashboard
              const targetUrl = result?.appState?.returnTo || '/dashboard';
              addDebug(`Redirecionando para: ${targetUrl}`);
              setTimeout(() => navigate(targetUrl, { replace: true }), 1000);
              return;
            } catch (tokenErr) {
              addDebug(`Erro ao obter token: ${tokenErr instanceof Error ? tokenErr.message : 'Erro desconhecido'}`);
              if (tokenErr instanceof Error && tokenErr.message.includes('403')) {
                addDebug("ERRO 403: Verifique a configuração do Auth0!");
                addDebug("- Verifique se a URL de callback está registrada no Auth0 Dashboard");
                addDebug("- Verifique se o 'audience' está configurado corretamente");
                addDebug("- Verifique se o domínio está nas origens permitidas");
                addDebug("- Verifique as permissões do token (scopes)");
              }
              throw tokenErr;
            }
          } catch (err) {
            addDebug(`Erro ao processar callback do Auth0: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
          }
        }
        
        // 3. Verificar se temos um token JWT (callback direto do backend)
        const token = params.get('token');
        if (token) {
          try {
            addDebug('Token JWT recebido diretamente na URL');
            const tokenPreview = token.substring(0, 20) + "...";
            setTokenDetails(tokenPreview);
            addDebug(`Token: ${tokenPreview}`);
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
        
        // 4. Se já estiver autenticado pelo Auth0, tenta obter o token
        if (isAuthenticated) {
          try {
            addDebug('Usuário já autenticado pelo Auth0, obtendo token...');
            const token = await getAccessTokenSilently();
            const tokenPreview = token.substring(0, 20) + "...";
            setTokenDetails(tokenPreview);
            addDebug(`Token obtido com sucesso: ${tokenPreview}`);
            await login(token);
            addDebug('Login realizado com sucesso');
            setTimeout(() => navigate('/dashboard'), 1000);
            return;
          } catch (err) {
            addDebug(`Erro ao obter token do usuário autenticado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            if (err instanceof Error && err.message.includes('403')) {
              addDebug("ERRO 403: Verifique a configuração do Auth0!");
              addDebug("- Verifique as configurações no Auth0 Dashboard");
            }
          }
        }
        
        // Nenhum dos métodos funcionou
        addDebug('Nenhum método de autenticação bem-sucedido. Redirecionando para login.');
        setTimeout(() => navigate('/login', { 
          state: { error: 'Parâmetros de autenticação não encontrados ou inválidos' } 
        }), 2000);
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [location, navigate, login, handleRedirectCallback, getAccessTokenSilently, isAuthenticated, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-900">
      <div className="w-full max-w-md p-6 bg-zinc-800 rounded-lg shadow-md border border-zinc-700">
        <h1 className="text-xl font-semibold text-center mb-4 text-green-400">
          {loading ? 'Processando autenticação...' : 'Redirecionando...'}
        </h1>
        <div className="flex justify-center my-4">
          <svg className="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        {/* Informações de debug sempre visíveis */}
        <div className="mt-6 p-3 bg-zinc-900 rounded text-xs font-mono overflow-auto max-h-60 border border-zinc-700">
          <p className="font-semibold mb-1 text-green-400">Informações de Debug:</p>
          {tokenDetails && (
            <div className="text-green-300 mb-2 pb-2 border-b border-zinc-700">Token: {tokenDetails}</div>
          )}
          {debug.length > 0 ? (
            debug.map((msg, i) => <div key={i} className="text-zinc-400 mb-1">{msg}</div>)
          ) : (
            <p className="text-zinc-500">Inicializando...</p>
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white transition-colors"
          >
            Voltar ao login
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors"
          >
            Forçar dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 