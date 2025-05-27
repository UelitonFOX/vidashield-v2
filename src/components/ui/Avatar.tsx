import React, { useState } from 'react';
import { AvatarProps } from '../../types/users';
import { userService } from '../../services/userService';

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl'
};

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackUrl = userService.generateAvatarUrl(name, 200);
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full bg-gray-500 text-white font-medium
    flex-shrink-0 select-none overflow-hidden
    ${sizeClasses[size]}
    ${className}
  `;

  // Se há uma imagem src válida e não houve erro
  if (src && !imageError) {
    return (
      <div className={baseClasses}>
        {isLoading && (
          <div className="animate-pulse bg-gray-300 w-full h-full rounded-full" />
        )}
        <img
          src={src}
          alt={name}
          className={`w-full h-full object-cover rounded-full ${isLoading ? 'hidden' : 'block'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // Fallback para UI Avatars
  return (
    <div className={baseClasses}>
      <img
        src={fallbackUrl}
        alt={name}
        className="w-full h-full object-cover rounded-full"
        onError={() => {
          // Se até o fallback der erro, mostrar iniciais
          const img = document.createElement('div');
          img.className = 'w-full h-full flex items-center justify-center bg-gray-500 text-white';
          img.textContent = initials;
        }}
      />
    </div>
  );
};

export default Avatar; 