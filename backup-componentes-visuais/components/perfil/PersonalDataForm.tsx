import { Edit, Mail, Save, User as UserIcon } from 'lucide-react';
import React from 'react';
import { ProfileFormData } from './types';

interface PersonalDataFormProps {
  formData: ProfileFormData;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

/**
 * Componente de formulário para dados pessoais
 */
const PersonalDataForm: React.FC<PersonalDataFormProps> = ({
  formData,
  isEditing,
  setIsEditing,
  onInputChange,
  onSave
}) => {
  return (
    <div className="card-dark p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-green-300">Dados Pessoais</h2>
        
        {isEditing ? (
          <button
            onClick={onSave}
            className="btn-primary py-1.5 px-3 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-outline py-1.5 px-3 flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-zinc-400 block">Nome completo</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                id="name"
                name="name"
                type="text" 
                value={formData.name}
                onChange={onInputChange}
                disabled={!isEditing}
                className={`w-full bg-zinc-900 border border-zinc-700 rounded-lg px-10 py-2.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-green-500 ${!isEditing && 'opacity-70'}`}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-zinc-400 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input 
                id="email"
                name="email"
                type="email" 
                value={formData.email}
                onChange={onInputChange}
                disabled={!isEditing}
                className={`w-full bg-zinc-900 border border-zinc-700 rounded-lg px-10 py-2.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-green-500 ${!isEditing && 'opacity-70'}`}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm text-zinc-400 block">Telefone</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              id="phone"
              name="phone"
              type="tel" 
              value={formData.phone}
              onChange={onInputChange}
              disabled={!isEditing}
              className={`w-full bg-zinc-900 border border-zinc-700 rounded-lg px-10 py-2.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-green-500 ${!isEditing && 'opacity-70'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDataForm; 