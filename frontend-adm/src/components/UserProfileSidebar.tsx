import { useAuth } from "../contexts/AuthContext.jsx";
import { UserCircle, LogOut, RefreshCw } from "lucide-react";
import "../styles/vidashield.css";
import { useEffect } from "react";

export const UserProfileSidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("UserProfileSidebar - Estado do usuário:", user);
    console.log("UserProfileSidebar - Autenticado:", isAuthenticated);
  }, [user, isAuthenticated]);
  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };
  if (isAuthenticated && !user) {
    console.warn("UserProfileSidebar - Usuário autenticado mas sem dados!");
  }

  return (
    <div className="user-profile-sidebar p-4 border-b border-zinc-800">
      <div className="flex items-center space-x-3 mb-3">
        {user?.photo ? (
          <img 
            src={user.photo} 
            alt="Foto de perfil" 
            className="w-12 h-12 rounded-full border-2 border-green-400/30 shadow-[0_0_15px_rgba(0,255,153,0.2)]"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-green-400/30 shadow-[0_0_15px_rgba(0,255,153,0.2)]">
            <UserCircle className="w-8 h-8 text-green-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-green-300 truncate">{user?.name || "Usuário"}</h3>
          <p className="text-xs text-zinc-400 truncate">{user?.email || "email@exemplo.com"}</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={handleLogout}
          className="flex-1 py-1.5 px-3 text-xs rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-all hover:text-green-300 hover:border-green-400/30 hover:shadow-[0_0_10px_rgba(0,255,153,0.15)] flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
        
        <button 
          onClick={handleRefresh}
          className="py-1.5 px-3 text-xs rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-all hover:text-green-300 hover:border-green-400/30 hover:shadow-[0_0_10px_rgba(0,255,153,0.15)] flex items-center justify-center"
          title="Atualizar dados"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
