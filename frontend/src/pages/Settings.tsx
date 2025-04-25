import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  FiSettings, 
  FiSave, 
  FiLock, 
  FiShield, 
  FiMail, 
  FiClock,
  FiAlertTriangle,
  FiCheck 
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Dashboard.css';

interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  expiration_days: number;
}

interface SecuritySettings {
  max_login_attempts: number;
  lockout_duration_minutes: number;
  session_timeout_minutes: number;
  remember_me_days: number;
}

interface SmtpSettings {
  host: string;
  port: number;
  use_tls: boolean;
  username: string;
  sender_name: string;
}

interface AuditSettings {
  log_user_actions: boolean;
  log_retention_days: number;
  notify_critical_events: boolean;
}

interface SystemSettings {
  password_policy: PasswordPolicy;
  security: SecuritySettings;
  smtp: SmtpSettings;
  audit: AuditSettings;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Verificar se o usuário é administrador
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get<SystemSettings>('/settings');
      setSettings(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      setError('Falha ao carregar as configurações do sistema.');
      setLoading(false);
    }
  };
  
  const handleChange = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };
  
  const handleCheckboxChange = (section: keyof SystemSettings, field: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: !settings[section][field as keyof typeof settings[typeof section]]
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings) return;
    
    try {
      setIsSaving(true);
      setSaveMessage(null);
      
      const response = await api.put('/settings', settings);
      
      setSaveMessage({
        type: 'success',
        text: 'Configurações salvas com sucesso!'
      });
      
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setSaveMessage({
        type: 'error',
        text: 'Erro ao salvar configurações. Tente novamente.'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!isAdmin) {
    return (
      <DashboardLayout title="Configurações">
        <div className="settings-page">
          <div className="page-header">
            <h2 className="section-title">Configurações do Sistema</h2>
          </div>
          
          <div className="access-denied">
            <FiAlertTriangle size={64} className="access-denied-icon" />
            <h3>Acesso Restrito</h3>
            <p>Você não possui permissão para acessar as configurações do sistema.</p>
            <p>Entre em contato com um administrador caso precise fazer alterações.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Configurações">
      <div className="settings-page">
        {/* Cabeçalho */}
        <div className="page-header">
          <h2 className="section-title">Configurações do Sistema</h2>
          
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={loading || isSaving}
          >
            <FiSave size={18} />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
        
        {saveMessage && (
          <div className={`message ${saveMessage.type}`}>
            {saveMessage.type === 'success' ? <FiCheck /> : <FiAlertTriangle />}
            {saveMessage.text}
          </div>
        )}
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando configurações...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button"
              onClick={fetchSettings}
            >
              Tentar novamente
            </button>
          </div>
        ) : settings && (
          <form className="settings-form" onSubmit={handleSubmit}>
            {/* Seção: Política de senha */}
            <div className="settings-section">
              <div className="settings-section-header">
                <FiLock size={20} />
                <h3>Política de Senha</h3>
              </div>
              
              <div className="settings-section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="min_length">Tamanho mínimo (caracteres)</label>
                    <input 
                      type="number" 
                      id="min_length"
                      min="6"
                      max="20"
                      value={settings.password_policy.min_length}
                      onChange={(e) => handleChange('password_policy', 'min_length', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="expiration_days">Expiração de senha (dias)</label>
                    <input 
                      type="number" 
                      id="expiration_days"
                      min="0"
                      max="365"
                      value={settings.password_policy.expiration_days}
                      onChange={(e) => handleChange('password_policy', 'expiration_days', parseInt(e.target.value))}
                    />
                    <small className="form-hint">0 = sem expiração</small>
                  </div>
                </div>
                
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="require_uppercase"
                      checked={settings.password_policy.require_uppercase}
                      onChange={() => handleCheckboxChange('password_policy', 'require_uppercase')}
                    />
                    <label htmlFor="require_uppercase">Exigir letra maiúscula</label>
                  </div>
                  
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="require_lowercase"
                      checked={settings.password_policy.require_lowercase}
                      onChange={() => handleCheckboxChange('password_policy', 'require_lowercase')}
                    />
                    <label htmlFor="require_lowercase">Exigir letra minúscula</label>
                  </div>
                  
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="require_numbers"
                      checked={settings.password_policy.require_numbers}
                      onChange={() => handleCheckboxChange('password_policy', 'require_numbers')}
                    />
                    <label htmlFor="require_numbers">Exigir números</label>
                  </div>
                  
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="require_special_chars"
                      checked={settings.password_policy.require_special_chars}
                      onChange={() => handleCheckboxChange('password_policy', 'require_special_chars')}
                    />
                    <label htmlFor="require_special_chars">Exigir caracteres especiais</label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção: Segurança */}
            <div className="settings-section">
              <div className="settings-section-header">
                <FiShield size={20} />
                <h3>Segurança</h3>
              </div>
              
              <div className="settings-section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="max_login_attempts">Tentativas de login</label>
                    <input 
                      type="number" 
                      id="max_login_attempts"
                      min="1"
                      max="10"
                      value={settings.security.max_login_attempts}
                      onChange={(e) => handleChange('security', 'max_login_attempts', parseInt(e.target.value))}
                    />
                    <small className="form-hint">Antes do bloqueio</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lockout_duration_minutes">Duração do bloqueio (minutos)</label>
                    <input 
                      type="number" 
                      id="lockout_duration_minutes"
                      min="5"
                      max="1440"
                      value={settings.security.lockout_duration_minutes}
                      onChange={(e) => handleChange('security', 'lockout_duration_minutes', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="session_timeout_minutes">Timeout da sessão (minutos)</label>
                    <input 
                      type="number" 
                      id="session_timeout_minutes"
                      min="5"
                      max="1440"
                      value={settings.security.session_timeout_minutes}
                      onChange={(e) => handleChange('security', 'session_timeout_minutes', parseInt(e.target.value))}
                    />
                    <small className="form-hint">Inatividade até logout</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="remember_me_days">Lembrar login (dias)</label>
                    <input 
                      type="number" 
                      id="remember_me_days"
                      min="1"
                      max="30"
                      value={settings.security.remember_me_days}
                      onChange={(e) => handleChange('security', 'remember_me_days', parseInt(e.target.value))}
                    />
                    <small className="form-hint">Opção "Lembrar de mim"</small>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção: Configurações SMTP */}
            <div className="settings-section">
              <div className="settings-section-header">
                <FiMail size={20} />
                <h3>Configurações de Email (SMTP)</h3>
              </div>
              
              <div className="settings-section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="smtp_host">Servidor SMTP</label>
                    <input 
                      type="text" 
                      id="smtp_host"
                      value={settings.smtp.host}
                      onChange={(e) => handleChange('smtp', 'host', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="smtp_port">Porta</label>
                    <input 
                      type="number" 
                      id="smtp_port"
                      min="1"
                      max="65535"
                      value={settings.smtp.port}
                      onChange={(e) => handleChange('smtp', 'port', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="smtp_username">Usuário SMTP</label>
                    <input 
                      type="text" 
                      id="smtp_username"
                      value={settings.smtp.username}
                      onChange={(e) => handleChange('smtp', 'username', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="smtp_sender_name">Nome do Remetente</label>
                    <input 
                      type="text" 
                      id="smtp_sender_name"
                      value={settings.smtp.sender_name}
                      onChange={(e) => handleChange('smtp', 'sender_name', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="smtp_use_tls"
                      checked={settings.smtp.use_tls}
                      onChange={() => handleCheckboxChange('smtp', 'use_tls')}
                    />
                    <label htmlFor="smtp_use_tls">Usar TLS</label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção: Configurações de Auditoria */}
            <div className="settings-section">
              <div className="settings-section-header">
                <FiClock size={20} />
                <h3>Auditoria e Logs</h3>
              </div>
              
              <div className="settings-section-content">
                <div className="form-group">
                  <label htmlFor="log_retention_days">Retenção de logs (dias)</label>
                  <input 
                    type="number" 
                    id="log_retention_days"
                    min="7"
                    max="365"
                    value={settings.audit.log_retention_days}
                    onChange={(e) => handleChange('audit', 'log_retention_days', parseInt(e.target.value))}
                  />
                  <small className="form-hint">Tempo que os logs são armazenados</small>
                </div>
                
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="log_user_actions"
                      checked={settings.audit.log_user_actions}
                      onChange={() => handleCheckboxChange('audit', 'log_user_actions')}
                    />
                    <label htmlFor="log_user_actions">Registrar ações dos usuários</label>
                  </div>
                  
                  <div className="checkbox-item">
                    <input 
                      type="checkbox" 
                      id="notify_critical_events"
                      checked={settings.audit.notify_critical_events}
                      onChange={() => handleCheckboxChange('audit', 'notify_critical_events')}
                    />
                    <label htmlFor="notify_critical_events">Notificar eventos críticos</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-actions settings-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSaving}
              >
                <FiSave size={18} />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings; 