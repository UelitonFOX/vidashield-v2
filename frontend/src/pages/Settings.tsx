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
  FiCheck,
  FiList,
  FiUser,
  FiUsers,
  FiLayers,
  FiServer,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Dashboard.css';
import './Settings.css';
import { hasPermission, SystemPermissions, isAdmin, isManagerOrAdmin } from '../services/api/permissionService';

// Interfaces para configurações
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
  require_mfa: boolean;
  prevent_concurrent_sessions: boolean;
}

interface SmtpSettings {
  host: string;
  port: number;
  use_tls: boolean;
  username: string;
  password: string;
  sender_name: string;
  from_email: string;
  from_name: string;
}

interface AuditSettings {
  log_user_actions: boolean;
  log_retention_days: number;
  notify_critical_events: boolean;
  log_logins: boolean;
  log_data_access: boolean;
  log_configuration: boolean;
}

interface UserSettings {
  default_dashboard: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  session_autosave: boolean;
  theme: string;
}

interface ManagerSettings {
  auto_assign_users: boolean;
  approval_required: boolean;
  report_schedule: string;
  alert_threshold: number;
}

interface SystemSettings {
  password_policy: PasswordPolicy;
  security: SecuritySettings;
  smtp: SmtpSettings;
  audit: AuditSettings;
  user_preferences: UserSettings;
  management: ManagerSettings;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('user'); // 'user', 'manager', ou 'admin'
  
  // Verificar permissões
  const canViewSettings = hasPermission(user, SystemPermissions.VIEW_SETTINGS);
  const canEditSettings = hasPermission(user, SystemPermissions.EDIT_SETTINGS);
  const isUserAdmin = isAdmin(user);
  const isUserManager = isManagerOrAdmin(user);
  
  useEffect(() => {
    if (canViewSettings) {
      fetchSettings();
    }
    
    // Definir a aba ativa com base no papel do usuário
    if (isUserAdmin) {
      setActiveTab('admin');
    } else if (isUserManager) {
      setActiveTab('manager');
    } else {
      setActiveTab('user');
    }
  }, [canViewSettings, isUserAdmin, isUserManager]);
  
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
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
  
  if (!canViewSettings) {
    return (
      <DashboardLayout title="Configurações">
        <div className="access-denied-container">
          <div className="access-denied-icon">
            <FiAlertTriangle size={80} />
          </div>
          <h1 className="access-denied-title">Acesso Restrito</h1>
          <p className="access-denied-message">
            Você não possui permissão para acessar as configurações do sistema.
          </p>
          <p className="access-denied-submessage">
            Entre em contato com um administrador caso precise fazer alterações.
          </p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (loading) {
    return (
      <DashboardLayout title="Configurações">
        <div className="settings-container">
          <div className="loading-container">
            <p>Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Configurações">
        <div className="settings-container">
          <div className="error-container">
            <p>Erro ao carregar configurações: {error}</p>
            <button onClick={fetchSettings}>Tentar novamente</button>
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
          
          {canEditSettings && (
            <button 
              className="action-button" 
              onClick={handleSubmit}
              disabled={loading || isSaving}
            >
              <FiSave size={18} />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          )}
        </div>
        
        {saveMessage && (
          <div className={`message ${saveMessage.type}`}>
            {saveMessage.type === 'success' ? <FiCheck size={18} /> : <FiAlertTriangle size={18} />}
            {saveMessage.text}
          </div>
        )}
        
        {settings && (
          <>
            {/* Navegação por abas */}
            <div className="settings-tabs">
              <button 
                className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => handleTabChange('user')}
              >
                <FiUser size={18} />
                <span>Perfil de Usuário</span>
              </button>
              
              {isUserManager && (
                <button 
                  className={`tab-button ${activeTab === 'manager' ? 'active' : ''}`}
                  onClick={() => handleTabChange('manager')}
                >
                  <FiUsers size={18} />
                  <span>Gestão</span>
                </button>
              )}
              
              {isUserAdmin && (
                <button 
                  className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => handleTabChange('admin')}
                >
                  <FiSettings size={18} />
                  <span>Administração</span>
                </button>
              )}
            </div>
            
            <form className="settings-form" onSubmit={handleSubmit}>
              {/* Configurações do Usuário comum */}
              {activeTab === 'user' && (
                <div className="settings-tab-content">
                  <div className="settings-section chart-container">
                    <div className="settings-section-header">
                      <FiUser size={20} color="#339999" />
                      <h3>Preferências Pessoais</h3>
                    </div>
                    
                    <div className="settings-section-content">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="default_dashboard">Dashboard Padrão</label>
                          <select 
                            id="default_dashboard"
                            value={settings.user_preferences?.default_dashboard || 'main'}
                            onChange={(e) => handleChange('user_preferences', 'default_dashboard', e.target.value)}
                            className="form-select"
                          >
                            <option value="main">Dashboard Principal</option>
                            <option value="security">Dashboard de Segurança</option>
                            <option value="reports">Dashboard de Relatórios</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="theme">Tema da Interface</label>
                          <select 
                            id="theme"
                            value={settings.user_preferences?.theme || 'light'}
                            onChange={(e) => handleChange('user_preferences', 'theme', e.target.value)}
                            className="form-select"
                          >
                            <option value="light">Claro</option>
                            <option value="dark">Escuro</option>
                            <option value="system">Padrão do Sistema</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="checkbox-group">
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="notifications_enabled"
                            checked={settings.user_preferences?.notifications_enabled ?? true}
                            onChange={() => handleCheckboxChange('user_preferences', 'notifications_enabled')}
                            className="form-checkbox"
                          />
                          <label htmlFor="notifications_enabled">Receber notificações no navegador</label>
                        </div>
                        
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="email_notifications"
                            checked={settings.user_preferences?.email_notifications ?? false}
                            onChange={() => handleCheckboxChange('user_preferences', 'email_notifications')}
                            className="form-checkbox"
                          />
                          <label htmlFor="email_notifications">Receber alertas por email</label>
                        </div>
                        
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="session_autosave"
                            checked={settings.user_preferences?.session_autosave ?? true}
                            onChange={() => handleCheckboxChange('user_preferences', 'session_autosave')}
                            className="form-checkbox"
                          />
                          <label htmlFor="session_autosave">Autosalvar configurações da sessão</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Configurações de Gerenciamento (para gerentes e admins) */}
              {activeTab === 'manager' && isUserManager && (
                <div className="settings-tab-content">
                  <div className="settings-section chart-container">
                    <div className="settings-section-header">
                      <FiUsers size={20} color="#339999" />
                      <h3>Gerenciamento de Usuários</h3>
                    </div>
                    
                    <div className="settings-section-content">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="alert_threshold">Limite de Alertas</label>
                          <input 
                            type="number" 
                            id="alert_threshold"
                            min="1"
                            max="100"
                            value={settings.management?.alert_threshold || 10}
                            onChange={(e) => handleChange('management', 'alert_threshold', parseInt(e.target.value))}
                            className="form-input"
                          />
                          <small className="form-hint">Número de alertas para notificação</small>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="report_schedule">Agendamento de Relatórios</label>
                          <select 
                            id="report_schedule"
                            value={settings.management?.report_schedule || 'weekly'}
                            onChange={(e) => handleChange('management', 'report_schedule', e.target.value)}
                            className="form-select"
                          >
                            <option value="daily">Diário</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="checkbox-group">
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="auto_assign_users"
                            checked={settings.management?.auto_assign_users ?? false}
                            onChange={() => handleCheckboxChange('management', 'auto_assign_users')}
                            className="form-checkbox"
                          />
                          <label htmlFor="auto_assign_users">Atribuir usuários automaticamente</label>
                        </div>
                        
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="approval_required"
                            checked={settings.management?.approval_required ?? true}
                            onChange={() => handleCheckboxChange('management', 'approval_required')}
                            className="form-checkbox"
                          />
                          <label htmlFor="approval_required">Exigir aprovação para novos usuários</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="settings-section chart-container">
                    <div className="settings-section-header">
                      <FiClock size={20} color="#339999" />
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
                          className="form-input"
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
                            className="form-checkbox"
                          />
                          <label htmlFor="log_user_actions">Registrar ações dos usuários</label>
                        </div>
                        
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="notify_critical_events"
                            checked={settings.audit.notify_critical_events}
                            onChange={() => handleCheckboxChange('audit', 'notify_critical_events')}
                            className="form-checkbox"
                          />
                          <label htmlFor="notify_critical_events">Notificar eventos críticos</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Configurações de Administração (somente para admins) */}
              {activeTab === 'admin' && isUserAdmin && (
                <div className="settings-tab-content">
                  {/* Seção: Política de senha */}
                  <div className="settings-section chart-container">
                    <div className="settings-section-header">
                      <FiLock size={20} color="#339999" />
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
                            className="form-input"
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
                            className="form-input"
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
                            className="form-checkbox"
                          />
                          <label htmlFor="require_uppercase">Exigir letra maiúscula</label>
                        </div>
                        
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="require_lowercase"
                            checked={settings.password_policy.require_lowercase}
                            onChange={() => handleCheckboxChange('password_policy', 'require_lowercase')}
                            className="form-checkbox"
                          />
                          <label htmlFor="require_lowercase">Exigir letra minúscula</label>
                        </div>
                        
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="require_numbers"
                            checked={settings.password_policy.require_numbers}
                            onChange={() => handleCheckboxChange('password_policy', 'require_numbers')}
                            className="form-checkbox"
                          />
                          <label htmlFor="require_numbers">Exigir números</label>
                        </div>
                        
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="require_special_chars"
                            checked={settings.password_policy.require_special_chars}
                            onChange={() => handleCheckboxChange('password_policy', 'require_special_chars')}
                            className="form-checkbox"
                          />
                          <label htmlFor="require_special_chars">Exigir caracteres especiais</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seção: Segurança */}
                  <div className="settings-section chart-container">
                    <div className="settings-section-header">
                      <FiShield size={20} color="#339999" />
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
                            className="form-input"
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
                            className="form-input"
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
                            className="form-input"
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
                            className="form-input"
                          />
                          <small className="form-hint">Opção "Lembrar de mim"</small>
                        </div>
                      </div>
                      
                      <div className="checkbox-group">
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="require_mfa"
                            checked={settings.security.require_mfa}
                            onChange={() => handleCheckboxChange('security', 'require_mfa')}
                            className="form-checkbox"
                          />
                          <label htmlFor="require_mfa">Exigir autenticação de dois fatores</label>
                        </div>
                        
                        <div className="checkbox-item">
                          <input 
                            type="checkbox" 
                            id="prevent_concurrent_sessions"
                            checked={settings.security.prevent_concurrent_sessions}
                            onChange={() => handleCheckboxChange('security', 'prevent_concurrent_sessions')}
                            className="form-checkbox"
                          />
                          <label htmlFor="prevent_concurrent_sessions">Impedir sessões simultâneas</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seção: Configurações SMTP */}
                  <div className="settings-section chart-container">
                    <div className="settings-section-header">
                      <FiMail size={20} color="#339999" />
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
                            className="form-input"
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
                            className="form-input"
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
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="smtp_password">Senha</label>
                          <input 
                            type="password" 
                            id="smtp_password"
                            value={settings.smtp.password}
                            onChange={(e) => handleChange('smtp', 'password', e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="smtp_sender_name">Nome do Remetente</label>
                          <input 
                            type="text" 
                            id="smtp_sender_name"
                            value={settings.smtp.sender_name}
                            onChange={(e) => handleChange('smtp', 'sender_name', e.target.value)}
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="smtp_from_email">Email de Origem</label>
                          <input 
                            type="email" 
                            id="smtp_from_email"
                            value={settings.smtp.from_email}
                            onChange={(e) => handleChange('smtp', 'from_email', e.target.value)}
                            className="form-input"
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
                            className="form-checkbox"
                          />
                          <label htmlFor="smtp_use_tls">Usar TLS</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botão de salvar flutuante para telas pequenas */}
              {canEditSettings && (
                <div className="form-actions settings-actions">
                  <button 
                    type="submit" 
                    className="action-button"
                    disabled={isSaving}
                  >
                    <FiSave size={18} />
                    {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings; 