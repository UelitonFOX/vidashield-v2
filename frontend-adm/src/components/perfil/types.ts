// Tipos para o módulo de perfil do usuário

export interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  photo?: string;
  createdAt?: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface FeedbackMessage {
  text: string;
  type: 'success' | 'error';
} 