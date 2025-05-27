import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface PopoverProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  contentClassName?: string;
  width?: string;
  trigger?: 'click' | 'hover';
}

/**
 * Componente Popover para exibir conteúdo flutuante com posicionamento inteligente
 */
const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  position = 'bottom',
  className = '',
  contentClassName = '',
  width = '320px',
  trigger = 'click'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Fecha o popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        // Verifica se não clicou no popover
        const popoverElement = document.querySelector('[data-popover-content]');
        if (!popoverElement || !popoverElement.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Lida com o clique no trigger
  const handleToggle = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
  };
  
  // Lida com hover
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsOpen(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsOpen(false);
    }
  };
  
  // Calcula as classes do conteúdo baseado na posição
  const getContentClasses = () => {
    const baseClasses = 'absolute z-50';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-full mt-2 right-0 ${contentClassName}`;
      case 'left':
        return `${baseClasses} right-full mr-2 top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-full ml-2 top-1/2 transform -translate-y-1/2`;
      default:
        return `${baseClasses} top-full mt-2 right-0 ${contentClassName}`;
    }
  };
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      ref={triggerRef}
      onClick={handleToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isOpen && (
        <div 
          data-popover-content
          className={getContentClasses()}
          style={{ width: width, maxWidth: 'calc(100vw - 16px)' }}
        >
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popover; 