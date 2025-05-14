import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, SystemPermissions } from '../services/api/permissionService';
import { 
  FiHome, 
  FiUsers, 
  FiList, 
  FiAlertTriangle, 
  FiUser, 
  FiSettings, 
  FiHelpCircle 
} from 'react-icons/fi';

/**
 * Menu lateral condicional que só exibe as opções 
 * que o usuário tem permissão para acessar
 */
const ConditionalSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Mapeamento de permissões para cada item do menu
  const menuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <FiHome size={20} />, 
      permission: null // Todos podem acessar
    },
    { 
      path: '/users', 
      label: 'Usuários', 
      icon: <FiUsers size={20} />, 
      permission: SystemPermissions.VIEW_USERS
    },
    { 
      path: '/logs', 
      label: 'Logs', 
      icon: <FiList size={20} />, 
      permission: SystemPermissions.VIEW_LOGS
    },
    { 
      path: '/alerts', 
      label: 'Alertas', 
      icon: <FiAlertTriangle size={20} />, 
      permission: SystemPermissions.VIEW_ALERTS
    },
    { 
      path: '/profile', 
      label: 'Perfil', 
      icon: <FiUser size={20} />, 
      permission: null // Todos podem acessar
    },
    { 
      path: '/settings', 
      label: 'Configurações', 
      icon: <FiSettings size={20} />, 
      permission: SystemPermissions.VIEW_SETTINGS
    },
    { 
      path: '/help', 
      label: 'Ajuda', 
      icon: <FiHelpCircle size={20} />, 
      permission: null // Todos podem acessar
    }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          // Se o item requer permissão, verificamos se o usuário a possui
          if (item.permission && !hasPermission(user, item.permission)) {
            return null; // Não renderiza o item se não tiver permissão
          }

          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default ConditionalSidebar; 