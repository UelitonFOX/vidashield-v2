import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  AlertCircle, 
  HelpCircle,
  Users,
  Settings,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { UserProfileSidebar } from './UserProfileSidebar';
import "../styles/vidashield.css";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} className="text-green-400" /> },
    { path: '/relatorios', label: 'Relatórios', icon: <BarChart3 size={20} className="text-green-400" /> },
    { path: '/alertas', label: 'Alertas', icon: <AlertCircle size={20} className="text-green-400" /> },
    { path: '/usuarios', label: 'Usuários', icon: <Users size={20} className="text-green-400" /> },
    { path: '/configuracoes', label: 'Configurações', icon: <Settings size={20} className="text-green-400" /> },
    { path: '/ajuda', label: 'Ajuda', icon: <HelpCircle size={20} className="text-green-400" /> },
  ];

  return (
    <div className="h-screen bg-zinc-900 text-white w-64 flex flex-col shadow-[0_0_25px_rgba(0,0,0,0.5)] border-r border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-green-400" />
            <h1 className="text-xl font-bold text-green-300">VidaShield</h1>
          </div>
          <p className="text-xs text-zinc-500">v1.0.0-alpha</p>
        </div>
      </div>
      
      {/* Componente de perfil do usuário */}
      <UserProfileSidebar />
      
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-all ${
                    isActive 
                      ? 'bg-zinc-800 text-green-300 border-l-2 border-green-400 shadow-[0_0_10px_rgba(0,255,153,0.15)]' 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-green-300'
                  }`}
                >
                  <span className="mr-3">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-3 mt-auto mb-2">
        <div className="text-[10px] text-center text-zinc-500 mb-2">
          © 2025 VidaShield Security
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 