import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/vidashield.css';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import authService from '../services/api/authService';
import { 
  Shield, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock
} from 'lucide-react';

const Login = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoginError, setLocalLoginError] = useState<string | null>(null);
  const [attemptingLogin, setAttemptingLogin] = useState(false);
  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [verifyingCaptcha, setVerifyingCaptcha] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    // Verificar se o usuário acabou de fazer logout
    const checkLogoutState = () => {
      const logoutFlag = sessionStorage.getItem('just_logged_out');
      if (logoutFlag) {
        console.log('Usuário acabou de fazer logout, mantendo na tela de login');
        setJustLoggedOut(true);
        // Limpar a flag após usá-la
        sessionStorage.removeItem('just_logged_out');
        
        // Garantir que qualquer sessão persistente do Auth0 seja limpa
        document.cookie = 'auth0.is.authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    };
    
    checkLogoutState();
  }, []);

  useEffect(() => {
    // Só redirecionar para o dashboard se estiver autenticado E não acabou de fazer logout
    if (isAuthenticated && !isLoading && !justLoggedOut) {
      console.log("[Login] Usuário já autenticado, redirecionando para dashboard");
      // Substituir redirecionamento automático com um botão para continuar para o dashboard
      // navigate('/dashboard', { replace: true });
    } else if (isAuthenticated && justLoggedOut) {
      // Se acabou de fazer logout mas ainda está autenticado, forçar novo logout
      console.log("[Login] Usuário ainda autenticado após logout, forçando nova limpeza");
      document.cookie = 'auth0.is.authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }, [isAuthenticated, isLoading, navigate, justLoggedOut]);

  const handleGoogleLogin = async () => {
    if (!captchaToken) {
      setLocalLoginError('Por favor, resolva o captcha antes de continuar');
      return;
    }
    
    setVerifyingCaptcha(true);
    
    try {
      // Verificar o captcha no backend
      const isCaptchaValid = await authService.verifyCaptcha(captchaToken);
      
      if (!isCaptchaValid) {
        setLocalLoginError('Verificação de captcha falhou. Tente novamente.');
        captchaRef.current?.resetCaptcha();
        setVerifyingCaptcha(false);
        return;
      }
      
      setAttemptingLogin(true);
      setLocalLoginError(null);
      
      console.log("[Login] Iniciando login com Google");
      
      // Usando Auth0 loginWithRedirect com configuração para o Google
      loginWithRedirect({
        appState: { returnTo: '/dashboard' },
        authorizationParams: {
          connection: 'google-oauth2',
          redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin + '/auth-callback',
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      });
    } catch (error) {
      console.error("[Login] Erro ao iniciar login com Google:", error);
      setAttemptingLogin(false);
      setVerifyingCaptcha(false);
      setLocalLoginError('Erro ao iniciar autenticação com Google. Tente novamente.');
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLocalLoginError('Preencha todos os campos');
      return;
    }

    if (!captchaToken) {
      setLocalLoginError('Por favor, resolva o captcha antes de continuar');
      return;
    }
    
    setVerifyingCaptcha(true);
    
    try {
      // Verificar o captcha no backend
      const isCaptchaValid = await authService.verifyCaptcha(captchaToken);
      
      if (!isCaptchaValid) {
        setLocalLoginError('Verificação de captcha falhou. Tente novamente.');
        captchaRef.current?.resetCaptcha();
        setVerifyingCaptcha(false);
        return;
      }
      
      setAttemptingLogin(true);
      setLocalLoginError(null);
      
      console.log("[Login] Iniciando login com email e senha");
      
      loginWithRedirect({
        appState: { returnTo: '/dashboard' },
        authorizationParams: {
          connection: 'Username-Password-Authentication',
          login_hint: email,
          redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin + '/auth-callback',
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        },
      });
    } catch (error) {
      console.error("[Login] Erro ao iniciar login com email e senha:", error);
      setAttemptingLogin(false);
      setVerifyingCaptcha(false);
      setLocalLoginError('Erro ao iniciar autenticação. Tente novamente.');
    }
  };

  const handleCaptchaVerify = (token: string) => {
    console.log('Token hCaptcha recebido:', token);
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = () => {
    console.log('Token hCaptcha expirado');
    setCaptchaToken(null);
  };

  const handleCaptchaError = (event: string) => {
    console.error("[Login] Erro no captcha:", event);
    setLocalLoginError('Erro ao validar captcha. Tente novamente.');
    setCaptchaToken(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading || attemptingLogin || verifyingCaptcha) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-4">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-green-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            {verifyingCaptcha ? 'Verificando captcha...' : 'Autenticando...'}
          </h1>
          <div className="mt-8">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-zinc-400">
              {verifyingCaptcha ? 'Validando sua verificação' : 'Verificando suas credenciais'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

      {isAuthenticated && !justLoggedOut && (
        <div className="mb-6 p-4 bg-green-900/40 border border-green-700 rounded-lg text-center max-w-md">
          <p className="text-green-300 font-medium mb-2">Você já está autenticado!</p>
          <p className="text-green-200/80 text-sm mb-3">Você já fez login e pode acessar o sistema.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Continuar para Dashboard
          </button>
        </div>
      )}

      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-green-400 mr-2" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-green-500 text-transparent bg-clip-text">
            VidaShield
          </h1>
        </div>
        <p className="text-zinc-400 text-center max-w-md">
          Sistema de Gerenciamento de Segurança Digital para Clínicas Médicas
        </p>
      </div>

      <div className="w-full max-w-md bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 overflow-hidden">
        <div className="p-6 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-green-300">Login Administrativo</h2>
          <p className="text-zinc-400 text-sm mt-1">Acesse a plataforma de administração</p>
        </div>

        <div className="p-6 space-y-5">
          {(error || localLoginError) && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 flex items-center text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{localLoginError || 'Erro na autenticação. Tente novamente.'}</span>
            </div>
          )}

          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-300 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-10 py-2.5 text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-zinc-300 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-10 py-2.5 text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-400">
                  Lembrar-me
                </label>
              </div>
              
              <a href="#" className="text-sm text-green-400 hover:text-green-300 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            <div className="flex justify-center my-4">
              <HCaptcha
                ref={captchaRef}
                sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
                onError={handleCaptchaError}
                theme="dark"
                size="normal"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-zinc-800"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Entrar
            </button>
          </form>

          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-zinc-800 text-zinc-500 text-sm">Ou continue com</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex justify-center items-center py-2.5 px-6 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 focus:ring-offset-zinc-800"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Entrar com Google
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-700 bg-zinc-850 text-center text-zinc-400 text-sm">
          Não possui uma conta?{' '}
          <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
            Entre em contato
          </a>
        </div>
      </div>

      <div className="mt-8 text-center text-zinc-500 text-xs">
        <p>© 2025 VidaShield. Todos os direitos reservados.</p>
        <p className="mt-1">
          <a href="#" className="underline hover:text-zinc-400 transition-colors">
            Política de Privacidade
          </a>
          {' | '}
          <a href="#" className="underline hover:text-zinc-400 transition-colors">
            Termos de Serviço
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
