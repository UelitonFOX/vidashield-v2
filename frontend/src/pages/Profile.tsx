import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FiUser, FiSave, FiKey, FiMail, FiUserCheck, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Dashboard.css';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showThemeToggle, setShowThemeToggle] = useState(false); // Para futura implementação de tema escuro
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validatePasswordForm = (): boolean => {
    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: 'Informe sua senha atual' });
      return false;
    }
    
    if (!passwordData.newPassword) {
      setMessage({ type: 'error', text: 'Informe a nova senha' });
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 8 caracteres' });
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não conferem' });
      return false;
    }
    
    return true;
  };
  
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar mensagem anterior
    setMessage(null);
    
    // Validar formulário
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // No ambiente real, esta seria uma chamada à API
      await api.post('/auth/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      // Mostrar mensagem de sucesso
      setMessage({ type: 'success', text: 'Senha alterada com sucesso' });
      
      // Limpar formulário
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Esconder seção de senha após alguns segundos
      setTimeout(() => {
        setShowPasswordSection(false);
        setMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setMessage({ type: 'error', text: 'Falha ao alterar senha. Verifique se a senha atual está correta.' });
    } finally {
      setLoading(false);
    }
  };
  
  const getRoleName = (role?: string): string => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'user':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };
  
  return (
    <DashboardLayout title="Meu Perfil">
      <div className="profile-page">
        {/* Cabeçalho */}
        <div className="page-header">
          <h2 className="section-title">Informações do Perfil</h2>
        </div>
        
        <div className="profile-content">
          <div className="profile-info-card">
            <div className="profile-avatar">
              <div className="avatar-container">
                <img src="/avatar.svg" alt="Avatar" className="avatar" />
              </div>
            </div>
            
            <div className="profile-details">
              <h3>{user?.name || 'Usuário'}</h3>
              
              <div className="profile-detail-item">
                <FiMail className="detail-icon" />
                <span>{user?.email || 'email@exemplo.com'}</span>
              </div>
              
              <div className="profile-detail-item">
                <FiUserCheck className="detail-icon" />
                <span>Função: {getRoleName(user?.role)}</span>
              </div>
              
              <div className="profile-detail-item">
                <FiShield className="detail-icon" />
                <span>Status: <span className="status-active">Ativo</span></span>
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className={`action-card ${showPasswordSection ? 'active' : ''}`}
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <FiKey size={24} />
              <div>
                <h4>Alterar Senha</h4>
                <p>Atualize sua senha de acesso</p>
              </div>
            </button>
            
            {showThemeToggle && (
              <button className="action-card">
                <FiEye size={24} />
                <div>
                  <h4>Preferências de tema</h4>
                  <p>Altere o tema da interface</p>
                </div>
              </button>
            )}
          </div>
          
          {showPasswordSection && (
            <div className="profile-password-section">
              <h3>Alterar Senha</h3>
              
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleSubmitPassword}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Senha Atual</label>
                  <div className="password-input-container">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <button 
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">Nova Senha</label>
                  <div className="password-input-container">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <button 
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <small className="form-hint">Mínimo de 8 caracteres</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowPasswordSection(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile; 