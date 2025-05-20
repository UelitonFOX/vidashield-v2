import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Menu, 
  Settings, 
  LogOut, 
  User,
  Bell,
  Shield,
  ChevronDown,
  Home,
  Users,
  BarChart2,
  AlertTriangle
} from 'lucide-react';

const NavBar = () => {
  const { user, logout, isAuthenticated } = useAuth0();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpar armazenamento local
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    
    // Limpar cookie de autenticação do Auth0
    document.cookie = 'auth0.is.authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Definir flag para indicar que acabamos de fazer logout
    sessionStorage.setItem('just_logged_out', 'true');
    
    // Usar o método de logout do Auth0 com redirecionamento para nossa página
    logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  };
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-zinc-800 border-b border-zinc-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e título */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-green-300 to-green-500 text-transparent bg-clip-text">VidaShield</span>
            </div>
            
            {/* Itens de navegação - Desktop */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link to="/users" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </Link>
              <Link to="/insights" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors flex items-center">
                <BarChart2 className="w-4 h-4 mr-2" />
                Insights
              </Link>
              <Link to="/alerts" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alertas
              </Link>
            </div>
          </div>
          
          {/* Área do usuário */}
          <div className="flex items-center">
            {isAuthenticated && (
              <>
                {/* Botão de notificações */}
                <button 
                  className="p-2 rounded-full text-zinc-400 hover:text-green-400 hover:bg-zinc-700 transition-colors"
                  title="Notificações"
                >
                  <Bell className="h-5 w-5" />
                </button>
                
                {/* Perfil do usuário */}
                <div className="ml-3 relative">
                  <div>
                    <button
                      type="button"
                      className="flex items-center max-w-xs rounded-full text-white focus:outline-none"
                      onClick={toggleProfileMenu}
                    >
                      <span className="sr-only">Abrir menu do usuário</span>
                      <div className="flex items-center p-1 rounded-lg hover:bg-zinc-700 transition-colors">
                        {user?.picture ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={user.picture}
                            alt={user.name || 'Usuário'}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-zinc-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-zinc-300" />
                          </div>
                        )}
                        <span className="ml-2 text-sm text-zinc-300 hidden sm:block">
                          {user?.name || 'Usuário'}
                        </span>
                        <ChevronDown className="ml-1 h-4 w-4 text-zinc-400" />
                      </div>
                    </button>
                  </div>
                  
                  {/* Menu dropdown */}
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-zinc-800 border border-zinc-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 border-b border-zinc-700">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/user-profile"
                        className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-green-400 transition-colors flex items-center"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-green-400 transition-colors flex items-center"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </Link>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-red-400 transition-colors flex items-center"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Botão do menu móvel */}
            <div className="ml-4 flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-zinc-400 hover:text-green-400 hover:bg-zinc-700 transition-colors focus:outline-none"
                title="Abrir menu"
              >
                <span className="sr-only">Abrir menu</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu móvel */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </span>
            </Link>
            <Link
              to="/users"
              className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Usuários
              </span>
            </Link>
            <Link
              to="/insights"
              className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <BarChart2 className="mr-2 h-5 w-5" />
                Insights
              </span>
            </Link>
            <Link
              to="/alerts"
              className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Alertas
              </span>
            </Link>
            
            {/* Opções do usuário em mobile */}
            {isAuthenticated && (
              <>
                <div className="border-t border-zinc-700 my-2"></div>
                
                <Link
                  to="/user-profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Meu Perfil
                  </span>
                </Link>
                
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-green-400 hover:bg-zinc-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Configurações
                  </span>
                </Link>
                
                <button
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-red-400 hover:bg-zinc-700 transition-colors"
                  onClick={handleLogout}
                >
                  <span className="flex items-center">
                    <LogOut className="mr-2 h-5 w-5" />
                    Sair
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar; 