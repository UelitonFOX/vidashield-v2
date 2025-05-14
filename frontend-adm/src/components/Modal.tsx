import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Bloquear scroll quando o modal estiver aberto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      // Restaurar scroll quando o modal fechar
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95%] h-[95%]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
      <div 
        className={`relative ${sizeClasses[size]} w-full card-dark shadow-glow-soft overflow-hidden max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-green-300">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className={`px-6 py-4 overflow-y-auto ${size === 'full' ? 'max-h-[calc(95vh-8rem)]' : 'max-h-[calc(90vh-9.5rem)]'}`}>
          {children}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-zinc-700">
          <button onClick={onClose} className="btn-secundario">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}; 