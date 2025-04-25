import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUsers, 
  FiAlertTriangle, 
  FiSettings, 
  FiHelpCircle, 
  FiLogOut, 
  FiBell, 
  FiHome,
  FiList,
  FiUser
} from 'react-icons/fi';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
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

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">
          <img src="/logo.png" alt="VidaShield" />
        </div>
        <h1>{title}</h1>
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
              <span className="user-name">{user?.name || 'Admin'}</span>
              <span className="user-email">{user?.email || 'admin@vidashield.com'}</span>
            </div>
            {showUserDropdown && (
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">
                  <FiUser size={18} />
                  <span>Meu Perfil</span>
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <FiSettings size={18} />
                  <span>Configurações</span>
                </Link>
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
            <Link to="/dashboard" className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <FiHome size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/users" className={`menu-item ${location.pathname === '/users' ? 'active' : ''}`}>
              <FiUsers size={20} />
              <span>Usuários</span>
            </Link>
            <Link to="/logs" className={`menu-item ${location.pathname === '/logs' ? 'active' : ''}`}>
              <FiList size={20} />
              <span>Logs</span>
            </Link>
            <Link to="/alerts" className={`menu-item ${location.pathname === '/alerts' ? 'active' : ''}`}>
              <FiAlertTriangle size={20} />
              <span>Alertas</span>
            </Link>
            <Link to="/profile" className={`menu-item ${location.pathname === '/profile' ? 'active' : ''}`}>
              <FiUser size={20} />
              <span>Perfil</span>
            </Link>
            <Link to="/settings" className={`menu-item ${location.pathname === '/settings' ? 'active' : ''}`}>
              <FiSettings size={20} />
              <span>Configurações</span>
            </Link>
            <Link to="/help" className={`menu-item ${location.pathname === '/help' ? 'active' : ''}`}>
              <FiHelpCircle size={20} />
              <span>Ajuda</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
          
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

export default DashboardLayout; 