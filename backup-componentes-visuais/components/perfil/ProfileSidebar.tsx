import { Calendar, Camera, Mail, Shield } from 'lucide-react';
import { UserData } from './types';
import { formatUserRole, getUserInitials } from './utils';

interface ProfileSidebarProps {
  user: UserData | null;
  onPhotoUpload: () => void;
  onLogout: () => void;
}

/**
 * Componente de barra lateral do perfil com foto e informações básicas
 */
const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  user, 
  onPhotoUpload, 
  onLogout 
}) => {
  return (
    <div className="card-dark p-6 text-center space-y-4">
      {/* Foto de perfil */}
      <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-700 bg-zinc-800">
        {user?.photo ? (
          <img 
            src={user.photo} 
            alt={`Foto de ${user.name}`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-700 text-zinc-300 text-3xl font-bold">
            {getUserInitials(user?.name)}
          </div>
        )}
        
        <button 
          onClick={onPhotoUpload}
          className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 p-2 rounded-full transition-colors"
          title="Alterar foto"
        >
          <Camera className="w-4 h-4 text-white" />
        </button>
      </div>
      
      {/* Informações básicas */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white">
          {user?.name || 'Usuário'}
        </h2>
        <p className="text-zinc-400 flex items-center justify-center gap-1">
          <Shield className="w-4 h-4 text-green-400" />
          {formatUserRole(user?.role)}
        </p>
      </div>
      
      {/* Detalhes de contato */}
      <div className="space-y-3 pt-4 border-t border-zinc-700">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-300 text-sm">{user?.email}</span>
        </div>
        
        {user?.createdAt && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <span className="text-zinc-300 text-sm">
              Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>
      
      {/* Botão de logout */}
      <button
        onClick={onLogout}
        className="w-full mt-4 py-2 px-4 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
      >
        Sair do Sistema
      </button>
    </div>
  );
};

export default ProfileSidebar; 