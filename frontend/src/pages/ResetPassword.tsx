import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem');
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        password
      });
      setMessage(response.data.msg);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.msg || 'Erro ao redefinir a senha');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
        <div className="text-center">
          <Link to="/login" className="inline-block">
            <img 
              src="/logo.png" 
              alt="VidaShield Logo" 
              className="h-24 w-auto mx-auto mb-4"
            />
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Redefinir Senha</h2>
          <p className="text-gray-400 text-sm">
            Digite sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Nova Senha
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent"
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
            />
          </div>

          {message && (
            <div 
              className={`p-3 rounded-lg text-sm ${
                isSuccess ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}
              role="alert"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-400 transition-colors font-medium disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>

          <div className="text-center">
            <Link 
              to="/login" 
              className="text-sm text-teal-400 hover:text-teal-300"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 