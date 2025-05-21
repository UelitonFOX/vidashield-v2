import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Shield } from 'lucide-react';
import { testApiConnection } from '../services/api';

const Callback = () => {
  const { isAuthenticated, isLoading, error, getAccessTokenSilently, handleRedirectCallback, user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [debugMessage, setDebugMessage] = useState<string[]>([]);
  const [processingAuth, setProcessingAuth] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;

  const addDebug = (message: string) => {
    setDebugMessage(prev => [...prev, `${new Date().toISOString().slice(11, 23)}: ${message}`]);
    console.log(`[Callback] ${message}`);
  };

  const checkApiConnection = async () => {
    try {
      setIsTestingApi(true);
      addDebug("Testando conexão com a API...");
      const isConnected = await testApiConnection();

      if (!isConnected) {
        setApiError("Não foi possível conectar à API. Verifique se o servidor está rodando.");
        addDebug("Falha na conexão com a API");
      } else {
        addDebug("Conexão com a API estabelecida com sucesso");
        setApiError(null);
      }
    } catch (error) {
      addDebug(`Erro ao testar conexão com a API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setApiError(`Erro ao conectar à API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsTestingApi(false);
    }
  };

  useEffect(() => {
    const attemptConnection = async () => {
      if (retryCount < 3) {
        await checkApiConnection();
        if (apiError) {
          setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        }
      }
    };

    if (!isTestingApi && (retryCount === 0 || apiError)) {
      attemptConnection();
    }
  }, [retryCount, apiError, isTestingApi]);

  useEffect(() => {
    const handleCallback = async () => {
      // Evitar processamento múltiplo
      if (processingAuth) return;
      
      addDebug(`Estado atual - isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, error: ${error ? "sim" : "não"}`);
      if (user) {
        addDebug(`Usuário autenticado: ${user.name || user.email}`);
      }
      
      if (apiError) {
        addDebug("Não foi possível completar autenticação devido a erro de API");
        return;
      }

      if (!isLoading) {
        if (isAuthenticated) {
          setProcessingAuth(true);
          addDebug("Usuário autenticado, processando callback e redirecionando para dashboard");
          
          try {
            // Processar o callback do Auth0 para lidar com o redirecionamento
            if (location.search) {
              addDebug("Detectado parâmetros na URL, processando callback");
              try {
                // Tenta processar o redirecionamento do Auth0
                const result = await handleRedirectCallback();
                addDebug(`Callback processado: ${JSON.stringify(result)}`);
                
                // Redirecionar para a página alvo ou dashboard
                const targetUrl = result?.appState?.returnTo || '/dashboard';
                addDebug(`Redirecionando para: ${targetUrl}`);
                
                // Usar navegação com replace para evitar problemas com o histórico
                window.location.replace(targetUrl);
                return;
              } catch (err) {
                addDebug(`Erro ao processar callback: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
                // Continuar com o fluxo normal caso falhe
              }
            }
            
            // Obter token para confirmar autenticação
            try {
              const token = await getAccessTokenSilently();
              addDebug("Token obtido com sucesso");
              setAuthToken(token.substring(0, 20) + "...");
              
              // Salvar token no localStorage para uso futuro
              localStorage.setItem('auth_token', token);
              
              // Redirecionar com força total (recarregar a página)
              window.location.href = '/dashboard';
            } catch (tokenErr) {
              addDebug(`Erro ao obter token: ${tokenErr instanceof Error ? tokenErr.message : 'Erro desconhecido'}`);
              if (tokenErr instanceof Error && tokenErr.message.includes('403')) {
                addDebug("ERRO 403 detectado! Verifique se a configuração do Auth0 está correta.");
                addDebug("- Verifique se a URL de callback está adicionada no Auth0 Dashboard");
                addDebug("- Verifique se o audience está correto");
                addDebug("- Verifique as origens permitidas no CORS");
              }
              throw tokenErr;
            }
          } catch (err) {
            addDebug(`Erro no fluxo de autenticação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
            setProcessingAuth(false);
          }
        } else if (!error) {
          addDebug("Usuário não autenticado, redirecionando para login");
          navigate('/login', { replace: true });
        }
      } else {
        addDebug("Ainda carregando autenticação...");
      }
    };

    if (!isTestingApi) {
      handleCallback();
    }
  }, [isLoading, isAuthenticated, navigate, error, apiError, isTestingApi, getAccessTokenSilently, processingAuth, location, handleRedirectCallback, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-4">
      <div className="text-center">
        <Shield className="mx-auto h-16 w-16 text-green-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-4">Autenticando...</h1>

        {isLoading && !apiError && (
          <div className="mt-8">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-zinc-400">Finalizando autenticação</p>
          </div>
        )}

        {apiError && (
          <div className="mt-8 text-center">
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg mx-auto max-w-md">
              <p className="text-red-300 font-medium">Erro na autenticação</p>
              <p className="text-red-300/70 text-sm mt-2">{apiError}</p>
              <p className="text-red-300/70 text-xs mt-2">Tentativas: {retryCount}/3</p>
              <button
                onClick={() => { setRetryCount(0); checkApiConnection(); }}
                className="mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white transition-colors"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 ml-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white transition-colors"
              >
                Voltar para login
              </button>
            </div>
          </div>
        )}

        {error && !apiError && (
          <div className="mt-8 text-center">
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg mx-auto max-w-md">
              <p className="text-red-300 font-medium">Erro na autenticação</p>
              <p className="text-red-300/70 text-sm mt-2">{error.message}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white transition-colors"
              >
                Voltar para login
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-zinc-800 rounded-lg text-left max-w-xl mx-auto">
          <h3 className="text-green-300 text-sm font-medium mb-2">Informações de Debug:</h3>
          <div className="max-h-48 overflow-y-auto text-xs font-mono">
            {debugMessage.map((msg, idx) => (
              <div key={idx} className="text-zinc-400 mb-1">{msg}</div>
            ))}
            {authToken && (
              <div className="text-zinc-300 mb-1 mt-2">Token: {authToken}</div>
            )}
            {debugMessage.length === 0 && <div className="text-zinc-500">Nenhuma informação disponível</div>}
          </div>
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-white transition-colors"
            >
              Voltar ao login
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors"
            >
              Forçar dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callback;
