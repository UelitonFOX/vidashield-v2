import { Eye, EyeOff, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { ProfileFormData } from './types';

interface PasswordFormProps {
  formData: ProfileFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

/**
 * Componente de formulário para alteração de senha
 */
const PasswordForm: React.FC<PasswordFormProps> = ({
  formData,
  onInputChange,
  onSave
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <div className="card-dark p-6">
      <h2 className="text-xl font-semibold text-green-300 mb-6">Alterar Senha</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="text-sm text-zinc-400 block">Senha atual</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={onInputChange}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-10 py-2.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button 
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm text-zinc-400 block">Nova senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={onInputChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-10 py-2.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm text-zinc-400 block">Confirmar nova senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                id="confirmPassword"
                name="confirmPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={onInputChange}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-10 py-2.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            onClick={onSave}
            className="btn-primary py-2 px-4"
          >
            Atualizar Senha
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordForm; 