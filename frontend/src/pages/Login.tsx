import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Para facilitar os testes, preenchemos com o usuário de teste
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setEmail('test@example.com');
      setPassword('password');
    }
  }, []);

  // Verificar se o servidor está online
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Tentamos uma chamada simples para verificar se o servidor está online
        await axios.get('http://localhost:5000/ping', { timeout: 5000 });
        console.log('Servidor backend está online');
        setServerStatus('online');
      } catch (error) {
        console.error('Servidor backend parece estar offline:', error);
        setServerStatus('offline');
      }
    };

    checkServerStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (serverStatus === 'offline') {
      setError('O servidor parece estar offline. Certifique-se de que o backend está rodando.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    console.log("Enviando requisição de login para:", email);
    
    try {
      // Tente uma chamada direta com axios primeiro para diagnóstico
      try {
        console.log("Teste direto com axios antes do login");
        const testResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log("Teste axios bem-sucedido:", testResponse.status, testResponse.data);
      } catch (axiosError: any) {
        console.error("Erro no teste direto com axios:", axiosError);
        console.error("Detalhes:", axiosError.response?.status, axiosError.response?.data);
      }
      
      // Continue com a API normal
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log("Resposta do login:", response.data);
      
      if (response.data.access_token) {
        console.log("Token recebido, realizando login");
        await login(response.data.access_token);
        console.log("Login bem-sucedido, redirecionando para dashboard");
        navigate('/dashboard');
      } else {
        console.error("Resposta sem token:", response.data);
        throw new Error('Token não recebido');
      }
    } catch (err: any) {
      console.error('Erro detalhado no login:', err.response?.data || err.message);
      
      // Mensagem de erro mais informativa
      if (err.response?.status === 401) {
        setError('E-mail ou senha incorretos. Para testar, use test@example.com / password');
      } else if (err.response?.status === 404) {
        setError('Serviço de autenticação indisponível. Verifique se o backend está em execução.');
      } else if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else if (!err.response) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      } else {
        setError('Erro ao fazer login. Tente novamente mais tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (serverStatus === 'offline') {
      setError('O servidor parece estar offline. Certifique-se de que o backend está rodando.');
      return;
    }
    
    setIsGoogleLoading(true);
    console.log("Redirecionando para login do Google");
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleGithubLogin = () => {
    if (serverStatus === 'offline') {
      setError('O servidor parece estar offline. Certifique-se de que o backend está rodando.');
      return;
    }
    
    setIsGithubLoading(true);
    console.log("Redirecionando para login do GitHub");
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 p-4">
      {/* Main Container */}
      <div className="login-container">
        {/* Left side - Login Form */}
        <div className="form-container">
          <div className="max-w-xs mx-auto space-y-6">
            {/* Logo */}
            <Link 
              to="/login" 
              className="flex justify-center mb-8"
              aria-label="Voltar para página inicial"
            >
              <img 
                src="/logo.png" 
                alt="VidaShield Logo" 
                title="VidaShield - Clique para voltar à página inicial"
                className="h-40 w-auto object-contain"
              />
            </Link>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="seuemail@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Digite seu e-mail"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Senha
                  </label>
                  <Link 
                    to="/recover" 
                    className="text-sm text-teal-400 hover:text-teal-300"
                    aria-label="Recuperar senha"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Digite sua senha"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center" role="alert">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="primary-button"
                aria-label="Entrar com e-mail e senha"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{isLoading ? 'Verificando...' : 'Entrar com segurança'}</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-500">ou</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="social-login-button"
                  aria-label="Entrar com Google"
                >
                  <img src="https://www.google.com/favicon.ico" alt="" className="h-5 w-5 mr-2" aria-hidden="true" />
                  {isGoogleLoading ? 'Conectando...' : 'Google'}
                </button>
                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={isGithubLoading}
                  className="social-login-button"
                  aria-label="Entrar com GitHub"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  {isGithubLoading ? 'Conectando...' : 'GitHub'}
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500">
              Não tem uma conta?{' '}
              <Link 
                to="/register" 
                className="font-medium text-teal-400 hover:text-teal-300"
                aria-label="Criar nova conta"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="illustration-container">
          {/* Gradient overlay for better integration */}
          <div className="gradient-overlay"></div>
          
          {/* Glow effects */}
          <div className="glow-orange"></div>
          <div className="glow-green"></div>
          
          {/* Illustration container */}
          <div className="h-full flex items-center justify-center p-6 relative z-10">
            <img
              src="/login-illustration.png"
              alt=""
              className="max-w-[85%] h-auto select-none login-illustration"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Security Information Footer */}
      <div className="mt-4 text-center space-y-6">
        <div className="space-y-1">
          <p className="flex items-center justify-center text-xs text-red-400/80">
            <span role="img" aria-label="aviso de segurança" className="mr-1">🚨</span>
            Nunca compartilhe sua senha.
          </p>
          <p className="text-xs text-gray-500/80">
            Este sistema é monitorado para garantir a segurança dos dados.
          </p>
        </div>

        {/* Project Banner */}
        <div className="pt-4 border-t border-gray-800">
          <a 
            href="https://ead.uepg.br/site/talento_tech"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visitar site do Talento Tech-PR"
          >
            <img 
              src="/images/footer-banner.svg" 
              alt="Projeto Integrador 15 - Talento Tech-PR" 
              className="max-w-[800px] w-full h-auto mx-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login; 