import React from 'react';

interface ProfileHeaderProps {
  onLogout: () => void;
}

/**
 * Componente de cabeçalho da página de perfil
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onLogout }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-green-300">Meu Perfil</h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-1">Gerencie suas informações e preferências</p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onLogout}
          className="btn-outline-red py-1.5 px-3 flex items-center gap-1.5"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader; 