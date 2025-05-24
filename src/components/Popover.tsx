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
 * Componente Popover para exibir conteúdo flutuante
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
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Posiciona o popover baseado na posição do trigger
  const calculatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return {};
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    // Espaço entre o trigger e o popover
    const gap = 8;
    
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = -contentRect.height - gap;
        left = (triggerRect.width - contentRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.height + gap;
        left = (triggerRect.width - contentRect.width) / 2;
        break;
      case 'left':
        top = (triggerRect.height - contentRect.height) / 2;
        left = -contentRect.width - gap;
        break;
      case 'right':
        top = (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.width + gap;
        break;
    }
    
    return { top, left };
  };
  
  // Fecha o popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
  
  const pos = calculatePosition();
  
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
          ref={contentRef}
          className={`absolute z-50 ${contentClassName}`}
          style={{
            top: pos.top,
            left: pos.left,
            width: width,
            maxHeight: '80vh',
            overflow: 'auto'
          }}
        >
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
              {content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popover; 