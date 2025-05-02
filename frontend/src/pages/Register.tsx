import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
// HCaptcha é importado dinamicamente mais tarde

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<any>(null);
  const [HCaptchaReady, setHCaptchaReady] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Obter a SiteKey do hCaptcha a partir das variáveis de ambiente
  const hcaptchaSiteKey = process.env.REACT_APP_HCAPTCHA_SITEKEY || 
                          '866663ec-b850-4a54-8884-8376d11051c4';
  
  // Componente HCaptcha importado dinamicamente para evitar problemas de tipagem
  useEffect(() => {
    const loadHCaptcha = async () => {
      try {
        await import('@hcaptcha/react-hcaptcha');
        setHCaptchaReady(true);
      } catch (error) {
        console.error('Erro ao carregar o componente HCaptcha:', error);
        setError('Não foi possível carregar o componente de verificação. Tente novamente mais tarde.');
      }
    };
    
    loadHCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!captchaToken) {
      setError('Por favor, confirme que você não é um robô');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        captchaToken
      });

      if (response.data.access_token) {
        await login(response.data.access_token);
        navigate('/dashboard');
      } else {
        throw new Error('Token não recebido');
      }
    } catch (err: any) {
      console.error('Erro ao registrar:', err);
      setError(err.response?.data?.msg || 'Erro ao criar conta');
      // Reset captcha após um erro
      if (captchaRef.current && typeof captchaRef.current.resetCaptcha === 'function') {
        captchaRef.current.resetCaptcha();
      }
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const onCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  const onCaptchaError = (err: any) => {
    console.error("Erro no hCaptcha:", err);
    setError('Erro ao verificar captcha. Por favor, tente novamente.');
    setCaptchaToken(null);
  };
  
  // Renderização do componente HCaptcha com importação dinâmica
  const renderHCaptcha = () => {
    if (!HCaptchaReady) {
      return (
        <div className="flex justify-center">
          <div className="p-4 text-gray-400 text-sm">Carregando verificação...</div>
        </div>
      );
    }
    
    // Usamos require para evitar problemas de tipagem com o TypeScript
    const HCaptcha = require('@hcaptcha/react-hcaptcha').default;
    
    return (
      <div className="flex justify-center">
        <HCaptcha
          sitekey={hcaptchaSiteKey}
          onVerify={onCaptchaVerify}
          onExpire={onCaptchaExpire}
          onError={onCaptchaError}
          ref={captchaRef}
          theme="dark"
          size="normal"
          languageOverride="pt-BR"
        />
      </div>
    );
  };

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
          Criar Nova Conta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-800/30 border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 bg-gray-800/30 border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
              placeholder="seuemail@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-800/30 border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-800/30 border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {renderHCaptcha()}

          {error && (
            <div className="text-red-500 text-sm text-center" role="alert">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || !captchaToken}
            className="w-full bg-teal-500 text-white py-2.5 px-4 rounded-lg hover:bg-teal-400 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Criando conta...</span>
              </>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Link 
            to="/login" 
            className="font-medium text-teal-400 hover:text-teal-300"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 