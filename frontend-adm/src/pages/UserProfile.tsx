import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useModal } from '../contexts/ModalContext';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import { Loader2 } from 'lucide-react';

// Importando componentes modularizados
import {
  ProfileHeader,
  FeedbackMessage,
  ProfileSidebar,
  PersonalDataForm,
  PasswordForm,
  UserData
} from '../components/perfil';
import { FeedbackMessage as FeedbackMessageType } from '../components/perfil/types';

const UserProfile = () => {
  const { user, refreshUserData, logout } = useAuth();
  const { openModal } = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<FeedbackMessageType | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Atualizar dados do formulário quando user mudar
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: prev.phone
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUploadSuccess = async (photoUrl: string) => {
    setMessage({
      text: 'Foto de perfil atualizada com sucesso!',
      type: 'success'
    });
    
    await refreshUserData();
    
    // Limpar a mensagem após 5 segundos
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleSaveProfile = async () => {
    // Simular atualização de perfil
    setMessage({
      text: 'Perfil atualizado com sucesso!',
      type: 'success'
    });

    // Em uma implementação real, enviaríamos os dados para a API
    // await userService.updateProfile(formData);
    
    setIsEditing(false);
    
    // Limpar a mensagem após 5 segundos
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleSavePassword = async () => {
    // Validação simples
    if (!formData.currentPassword) {
      setMessage({
        text: 'Informe sua senha atual',
        type: 'error'
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        text: 'As senhas não conferem',
        type: 'error'
      });
      return;
    }

    // Simulação de atualização de senha
    setMessage({
      text: 'Senha atualizada com sucesso!',
      type: 'success'
    });

    // Limpar os campos de senha
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));

    // Limpar a mensagem após 5 segundos
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleOpenPhotoUpload = () => {
    openModal('Atualizar Foto de Perfil', (
      <div className="p-4">
        <ProfilePhotoUpload onSuccess={handlePhotoUploadSuccess} />
      </div>
    ), 'md');
  };

  // Função para confirmar logout
  const handleConfirmLogout = () => {
    openModal('Confirmar Logout', (
      <div className="p-4 text-center">
        <h3 className="text-lg font-medium text-green-300 mb-2">Deseja realmente sair?</h3>
        <p className="text-zinc-400 mb-4">Você será desconectado do sistema.</p>
        
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => logout({
              logoutParams: {
                returnTo: window.location.origin + '/login'
              }
            })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Sim, sair
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Não, continuar
          </button>
        </div>
      </div>
    ), 'sm');
  };

  // Converter user para formato compatível com os componentes
  const userData: UserData = user ? {
    name: user.name,
    email: user.email,
    photo: user.photo || user.avatar,
    role: user.role,
    createdAt: new Date().toISOString() // Como não temos createdAt, usamos a data atual
  } : {
    name: '',
    email: '',
    role: ''
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-0">
      {/* Cabeçalho */}
      <ProfileHeader onLogout={handleConfirmLogout} />
      
      {/* Mensagem de feedback */}
      <FeedbackMessage message={message} />
      
      {/* Área principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da esquerda - Foto e info básica */}
        <div className="lg:col-span-1">
          <ProfileSidebar 
            user={userData} 
            onPhotoUpload={handleOpenPhotoUpload} 
            onLogout={handleConfirmLogout}
          />
        </div>
        
        {/* Coluna da direita - Dados de perfil e senhas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formulário de dados pessoais */}
          <PersonalDataForm 
            formData={formData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onInputChange={handleInputChange}
            onSave={handleSaveProfile}
          />
          
          {/* Formulário de senha */}
          <PasswordForm 
            formData={formData}
            onInputChange={handleInputChange}
            onSave={handleSavePassword}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 