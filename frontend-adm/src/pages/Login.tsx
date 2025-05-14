import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/api/authService';
import '../styles/vidashield.css';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Shield,
  AlertCircle,
  Eye,
  EyeOff 
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Função para lidar com o login por email e senha
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Chamar o serviço de autenticação
      const response = await authService.login(email, password);
      
      if (response && response.access_token) {
        // Se login bem-sucedido, salvar o token no contexto e no localStorage
        await login(response.access_token);
        
        if (rememberMe) {
          localStorage.setItem('email', email);
        } else {
          localStorage.removeItem('email');
        }
        
        // Redirecionar para o dashboard
        navigate('/dashboard');
      } else {
        setError('Resposta de autenticação inválida');
      }
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      
      if (err.response?.status === 401) {
        setError('Credenciais inválidas. Por favor, verifique seu email e senha.');
      } else if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Erro ao conectar com o servidor. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com o login do Google
  const handleGoogleLogin = () => {
    // Este endpoint no backend DEVE aceitar GET e redirecionar para o Google.
    // A URL será resolvida pelo proxy do Vite para http://localhost:5000/api/auth/google
    const backendGoogleAuthInitiationUrl = '/api/auth/google';
    
    // URL de callback no frontend para onde o Google (via backend) deve redirecionar após a autenticação.
    // Usamos window.location.origin para garantir que a porta atual seja usada
    const currentOrigin = window.location.origin;
    console.log("URL de origem atual para callback:", currentOrigin);
    
    // URL completa incluindo o caminho de callback
    const frontendCallbackUrl = `${currentOrigin}/auth/callback`;
    console.log("URL de callback completa:", frontendCallbackUrl);
    
    // Codificar a URL para uso na query string
    const encodedCallbackUrl = encodeURIComponent(frontendCallbackUrl);
    
    // Construir a URL completa com o redirect_uri para que o backend saiba 
    // para onde redirecionar após processar o callback do Google
    const fullUrl = `${backendGoogleAuthInitiationUrl}?redirect_uri=${encodedCallbackUrl}`;

    console.log("Redirecionando para o backend para iniciar autenticação Google:", fullUrl);
    window.location.href = fullUrl;
  };

  // Verificar se há email salvo no localStorage (Remember me)
  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Logo e nome do produto */}
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
      
      {/* Card de login */}
      <div className="w-full max-w-md bg-zinc-800 rounded-xl shadow-xl border border-zinc-700 overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-green-300">Login Administrativo</h2>
          <p className="text-zinc-400 text-sm mt-1">Acesse a plataforma de administração</p>
        </div>
        
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 flex items-center text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Campo de Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg bg-zinc-900 border border-zinc-700 py-2.5 pl-10 pr-3 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-500"
                placeholder="nome@clinica.com.br"
                required
              />
            </div>
          </div>
          
          {/* Campo de Senha */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg bg-zinc-900 border border-zinc-700 py-2.5 pl-10 pr-10 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Lembrar-me e Esqueci minha senha */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-green-500 focus:ring-green-500 focus:ring-offset-zinc-800"
              />
              <label htmlFor="remember-me" className="ml-2 text-zinc-400">
                Lembrar-me
              </label>
            </div>
            <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
              Esqueci minha senha
            </a>
          </div>
          
          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-2"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Entrar
              </>
            )}
          </button>
          
          {/* Separador */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-zinc-800 text-zinc-500 text-sm">Ou continue com</span>
            </div>
          </div>
          
          {/* Botão de Login com Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center py-2.5 px-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 focus:ring-offset-zinc-800"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Google
          </button>
        </form>
        
        {/* Rodapé */}
        <div className="p-6 border-t border-zinc-700 bg-zinc-850 text-center text-zinc-400 text-sm">
          Não possui uma conta?{' '}
          <a href="#" className="text-green-400 hover:text-green-300 transition-colors">
            Entre em contato
          </a>
        </div>
      </div>
      
      {/* Rodapé com informações legais */}
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