import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';
import AccessChart from '../components/AccessChart';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiSettings, 
  FiHelpCircle, 
  FiLogOut, 
  FiBell, 
  FiUserPlus, 
  FiDownload, 
  FiKey,
  FiHome,
  FiList,
  FiUser,
  FiShield,
  FiActivity,
  FiFileText,
  FiUserX,
  FiLock
} from 'react-icons/fi';

interface DashboardData {
  total_usuarios: number;
  logins_hoje: number;
  alertas_criticos: number;
  relatorios_exportados: number;
  usuarios_inativos: number;
  tentativas_bloqueadas: number;
  acessos_semana: number[];
  alertas_recentes: Array<{
    id: number;
    tipo: 'critical' | 'warning' | 'success';
    mensagem: string;
    tempo: string;
  }>;
  user?: {
    name: string;
    email: string;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    total_usuarios: 0,
    logins_hoje: 0,
    alertas_criticos: 0,
    relatorios_exportados: 0,
    usuarios_inativos: 0,
    tentativas_bloqueadas: 0,
    acessos_semana: [0, 0, 0, 0, 0, 0, 0],
    alertas_recentes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const diasSemana = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const maxAcessos = Math.max(...data.acessos_semana);

  const getBarHeightClass = (valor: number): string => {
    if (maxAcessos === 0) return 'chart-bar-height-0';
    const percentage = Math.round((valor / maxAcessos) * 100 / 10) * 10;
    return `chart-bar chart-bar-height-${percentage}`;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('Carregando dados do dashboard...');
        const dashboardResponse = await api.get('/dashboard/data');
        
        if (dashboardResponse.data) {
          console.log('Dados recebidos:', dashboardResponse.data);
          setData(dashboardResponse.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <FiAlertTriangle size={48} className="error-icon" />
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">
          <img src="/logo.png" alt="VidaShield" />
        </div>
        <h1>Dashboard</h1>
        <div className="user-menu">
          <FiBell size={24} className="notification-icon" />
          <div 
            className={`user-profile ${showUserDropdown ? 'active' : ''}`} 
            onClick={toggleUserDropdown}
            ref={dropdownRef}
          >
            <div className="user-avatar-container">
              <img src="/avatar.svg" alt="User" className="user-avatar" />
            </div>
            <div className="user-info">
              <span className="user-name">{data.user?.name || 'Admin'}</span>
              <span className="user-email">{data.user?.email || 'admin@vidashield.com'}</span>
            </div>
            {showUserDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-item">
                  <FiUser size={18} />
                  <span>Meu Perfil</span>
                </div>
                <div className="dropdown-item">
                  <FiSettings size={18} />
                  <span>Configurações</span>
                </div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut size={18} />
                  <span>Sair</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <a href="#" className="menu-item active">
              <FiHome size={20} />
              <span>Dashboard</span>
            </a>
            <a href="#" className="menu-item">
              <FiUsers size={20} />
              <span>Usuários</span>
            </a>
            <a href="#" className="menu-item">
              <FiList size={20} />
              <span>Logs</span>
            </a>
            <a href="#" className="menu-item">
              <FiAlertTriangle size={20} />
              <span>Alertas</span>
            </a>
            <a href="#" className="menu-item">
              <FiUser size={20} />
              <span>Perfil</span>
            </a>
            <a href="#" className="menu-item">
              <FiSettings size={20} />
              <span>Configurações</span>
            </a>
            <a href="#" className="menu-item">
              <FiHelpCircle size={20} />
              <span>Ajuda</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Stats Grid */}
          <section className="stats-grid">
            <div className="stat-card">
              <FiUsers className="stat-icon" />
              <div className="stat-content">
                <div className="stat-title">Usuários Ativos</div>
                <div className="stat-value">120</div>
                <div className="description">Total de contas ativas no sistema</div>
              </div>
            </div>
            <div className="stat-card">
              <FiUserX className="stat-icon" />
              <div className="stat-content">
                <div className="stat-title">Usuários Inativos</div>
                <div className="stat-value">4</div>
                <div className="description">Contas que não acessam o sistema há 30 dias</div>
              </div>
            </div>
            <div className="stat-card">
              <FiCheckCircle className="stat-icon" />
              <div className="stat-content">
                <div className="stat-title">Logins Hoje</div>
                <div className="stat-value">5</div>
                <div className="description">Quantidade de logins realizados nas últimas 24h</div>
              </div>
            </div>
            <div className="stat-card">
              <FiAlertTriangle className="stat-icon" />
              <div className="stat-content">
                <div className="stat-title">Alertas Críticos</div>
                <div className="stat-value">3</div>
                <div className="description">Falhas de login, acessos de IP desconhecido ou comportamentos suspeitos</div>
              </div>
            </div>
            <div className="stat-card">
              <FiLock className="stat-icon" />
              <div className="stat-content">
                <div className="stat-title">Tentativas de invasão bloqueadas</div>
                <div className="stat-value">9</div>
                <div className="description">Acessos rejeitados por IPs ou usuários previamente bloqueados</div>
              </div>
            </div>
            <div className="stat-card">
              <FiFileText className="stat-icon" />
              <div className="stat-content">
                <div className="stat-title">Relatórios Exportados</div>
                <div className="stat-value">7</div>
                <div className="description">Total de relatórios gerados e baixados no sistema</div>
              </div>
            </div>
          </section>

          <div className="dashboard-lower-section">
            {/* Chart */}
            <AccessChart weekData={data.acessos_semana} />

            {/* Alerts */}
            <section className="alerts-container">
              <h2 className="section-title">Alertas Recentes</h2>
              <div className="alerts-list">
                <div className="alert-item">
                  <div className="alert-icon critical">
                    <FiAlertTriangle />
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">Múltiplas falhas de login</div>
                    <div className="alert-time">há 2 minutos</div>
                  </div>
                </div>
                <div className="alert-item">
                  <div className="alert-icon warning">
                    <FiAlertTriangle />
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">Senha do usuário alterada</div>
                    <div className="alert-time">há 1 hora</div>
                  </div>
                </div>
                <div className="alert-item">
                  <div className="alert-icon success">
                    <FiCheckCircle />
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">Novo usuário cadastrado</div>
                    <div className="alert-time">há 3 horas</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-button">
              <FiUserPlus size={20} />
              <span>Adicionar usuário</span>
            </button>
            <button className="action-button">
              <FiDownload size={20} />
              <span>Exportar relatório</span>
            </button>
            <button className="action-button">
              <FiKey size={20} />
              <span>Resetar senha</span>
            </button>
          </div>

          {/* Footer */}
          <footer className="dashboard-footer">
            <p>Desenvolvido por Ueliton Fox, Beatriz e Camili</p>
            <p>Talento Tech PR, Polo Jardim Alegre</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 