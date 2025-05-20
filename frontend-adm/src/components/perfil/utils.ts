// Utilitários para o módulo de perfil do usuário

/**
 * Extrair iniciais do nome para o avatar
 */
export const getUserInitials = (name?: string): string => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/**
 * Formatar função do usuário para exibição
 */
export const formatUserRole = (role?: string): string => {
  if (!role) return 'Usuário';
  
  const roleMap: Record<string, string> = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'user': 'Usuário'
  };
  
  return roleMap[role.toLowerCase()] || role;
}; 