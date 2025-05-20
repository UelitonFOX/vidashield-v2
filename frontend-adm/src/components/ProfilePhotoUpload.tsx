import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import userProfileService from '../services/api/userProfileService';

interface ProfilePhotoUploadProps {
  onSuccess?: (photoUrl: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ onSuccess }) => {
  const { user, refreshUserData } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Apenas imagens são permitidas.');
        return;
      }
      
      // Verificar tamanho do arquivo (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem muito grande. Tamanho máximo: 5MB.');
        return;
      }
      
      // Criar prévia da imagem
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!preview) {
      setError('Selecione uma imagem primeiro.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userProfileService.updateProfilePhoto(preview);
      const photoUrl = response.photo_url;
      
      // Atualizar os dados do usuário no contexto
      await refreshUserData();
      
      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess(photoUrl);
      }
      
      // Limpar prévia
      setPreview(null);
      
      // Limpar input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err: any) {
      console.error('Erro ao fazer upload da foto:', err);
      setError(err.response?.data?.msg || 'Erro ao fazer upload da foto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Atualizar Foto de Perfil</h2>
      
      <div className="mb-4 flex justify-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
          {preview ? (
            <img 
              src={preview} 
              alt="Prévia" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">
                {user?.photo ? (
                  <img 
                    src={user.photo} 
                    alt="Foto atual" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="profile-photo-input" className="block text-sm font-medium text-gray-700 mb-2">
          Selecionar nova foto
        </label>
        <input
          id="profile-photo-input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          aria-label="Selecionar foto de perfil"
          title="Selecione um arquivo de imagem para usar como foto de perfil"
          className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
        />
      </div>
      
      {error && (
        <div className="mb-4 text-sm text-red-600 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={!preview || isLoading}
          className={`flex-1 py-2 px-4 rounded-md text-white font-medium
                    ${!preview || isLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Enviando...' : 'Salvar Foto'}
        </button>
        {preview && (
          <button
            onClick={handleCancel}
            className="py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoUpload; 