import React from 'react';
import { Loader2 } from 'lucide-react';

// === CONTAINERS E LAYOUTS PADRÃO ===

interface VidaCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  fullHeight?: boolean;
}

export const VidaCard: React.FC<VidaCardProps> = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  fullHeight = false 
}) => {
  return (
    <div className={`card-dark shadow-glow-soft ${fullHeight ? 'h-full flex flex-col' : ''} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-green-300">{title}</h3>}
          {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={fullHeight ? 'flex-1' : ''}>
        {children}
      </div>
    </div>
  );
};

interface VidaWidgetProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
  actions?: React.ReactNode;
  fullHeight?: boolean;
}

export const VidaWidget: React.FC<VidaWidgetProps> = ({
  title,
  children,
  loading = false,
  error = null,
  className = '',
  actions,
  fullHeight = false
}) => {
  if (loading) {
    return (
      <VidaCard className={className} fullHeight={fullHeight}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-300">{title}</h3>
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm">Carregando...</p>
          </div>
        </div>
      </VidaCard>
    );
  }

  if (error) {
    return (
      <VidaCard className={className} fullHeight={fullHeight}>
        <h3 className="text-lg font-semibold text-green-300 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-8 h-8 text-red-400 mx-auto mb-2">⚠️</div>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </VidaCard>
    );
  }

  return (
    <VidaCard className={className} fullHeight={fullHeight}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-300">{title}</h3>
        {actions}
      </div>
      <div className={fullHeight ? 'flex-1 flex flex-col' : ''}>
        {children}
      </div>
    </VidaCard>
  );
};

// === CARDS INTERNOS PADRÃO ===

interface VidaInnerCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const VidaInnerCard: React.FC<VidaInnerCardProps> = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  return (
    <div className={`p-3 bg-zinc-800 rounded-lg ${hover ? 'hover:bg-zinc-700' : ''} transition-all ${className}`}>
      {children}
    </div>
  );
};

// === CARDS DE ESTATÍSTICAS PADRÃO ===

interface VidaStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  iconColor?: string;
  valueColor?: string;
  className?: string;
}

export const VidaStatCard: React.FC<VidaStatCardProps> = ({
  icon,
  title,
  value,
  iconColor = 'text-green-400',
  valueColor = 'text-green-300',
  className = ''
}) => {
  return (
    <div className={`card-dark text-center p-3 sm:p-4 shadow-glow-soft ${className}`}>
      <div className="flex justify-center mb-2">
        <div className={`w-7 h-7 ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs sm:text-sm text-zinc-400">{title}</p>
      <p className={`text-xl sm:text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
};

// === BADGES PADRÃO ===

interface VidaBadgeProps {
  children: React.ReactNode;
  variant?: 'ativo' | 'alerta' | 'pendente' | 'inativo' | 'success' | 'warning' | 'critical' | 'info';
  className?: string;
}

export const VidaBadge: React.FC<VidaBadgeProps> = ({ 
  children, 
  variant = 'ativo', 
  className = '' 
}) => {
  const variantClasses = {
    ativo: 'badge-ativo',
    alerta: 'badge-alerta', 
    pendente: 'badge-pendente',
    inativo: 'badge-inativo',
    success: 'text-green-400 bg-green-500/20',
    warning: 'text-yellow-400 bg-yellow-500/20',
    critical: 'text-red-400 bg-red-500/20',
    info: 'text-blue-400 bg-blue-500/20'
  };

  const baseClasses = variant.includes('badge-') 
    ? variantClasses[variant as keyof typeof variantClasses]
    : `text-xs px-2 py-1 rounded-full ${variantClasses[variant as keyof typeof variantClasses]}`;

  return (
    <span className={`${baseClasses} ${className}`}>
      {children}
    </span>
  );
};

// === BOTÕES PADRÃO ===

interface VidaButtonProps {
  children: React.ReactNode;
  variant?: 'neon' | 'badge' | 'secundario' | 'link';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const VidaButton: React.FC<VidaButtonProps> = ({
  children,
  variant = 'neon',
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const variantClasses = {
    neon: 'btn-neon',
    badge: 'btn-badge', 
    secundario: 'btn-secundario',
    link: 'text-green-400 hover:text-green-300 transition-colors text-sm'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// === LINKS PADRÃO ===

interface VidaLinkProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const VidaLink: React.FC<VidaLinkProps> = ({ 
  children, 
  to, 
  href, 
  className = '', 
  icon 
}) => {
  const baseClasses = "flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors";
  
  if (to) {
    // Para React Router Link - seria necessário importar Link do react-router-dom
    return (
      <a href={to} className={`${baseClasses} ${className}`}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={`${baseClasses} ${className}`}>
      {icon}
      {children}
    </a>
  );
};

// === CONTAINERS DE SCROLL PADRÃO ===

interface VidaScrollContainerProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

export const VidaScrollContainer: React.FC<VidaScrollContainerProps> = ({
  children,
  maxHeight = 'max-h-56',
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${maxHeight} overflow-y-auto custom-scrollbar ${className}`}>
      {children}
    </div>
  );
};

// === GRID PADRÃO ===

interface VidaGridProps {
  children: React.ReactNode;
  cols?: '1' | '2' | '3' | '4' | '6';
  gap?: '2' | '3' | '4' | '6';
  className?: string;
}

export const VidaGrid: React.FC<VidaGridProps> = ({
  children,
  cols = '4',
  gap = '4',
  className = ''
}) => {
  const gridClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    '6': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gapClasses = {
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '6': 'gap-6'
  };

  return (
    <div className={`grid ${gridClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// === SEPARADORES PADRÃO ===

export const VidaSeparator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`border-t border-zinc-600 ${className}`} />;
};

// === STATUS INDICATOR PADRÃO ===

interface VidaStatusProps {
  status: 'online' | 'offline' | 'warning';
  text: string;
  className?: string;
}

export const VidaStatus: React.FC<VidaStatusProps> = ({ status, text, className = '' }) => {
  const statusClasses = {
    online: 'text-green-400',
    offline: 'text-red-400', 
    warning: 'text-yellow-400'
  };

  const dotClasses = {
    online: 'bg-green-400',
    offline: 'bg-red-400',
    warning: 'bg-yellow-400'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${dotClasses[status]} ${status === 'online' ? 'animate-pulse' : ''}`} />
      <span className={`text-sm font-medium ${statusClasses[status]}`}>{text}</span>
    </div>
  );
};

// === TREND INDICATOR PADRÃO ===

interface VidaTrendProps {
  value: number;
  type: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const VidaTrend: React.FC<VidaTrendProps> = ({ value, type, icon, className = '' }) => {
  const typeClasses = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-zinc-400'
  };

  const sinal = type === 'positive' ? '+' : type === 'negative' ? '' : '';

  return (
    <div className={`flex items-center gap-1 ${typeClasses[type]} ${className}`}>
      {icon}
      <span className="text-xs font-medium">
        {sinal}{Math.abs(value)}%
      </span>
    </div>
  );
};

// === EMPTY STATE PADRÃO ===

interface VidaEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const VidaEmptyState: React.FC<VidaEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-16 ${className}`}>
      {icon && <div className="w-12 h-12 text-green-400 mx-auto mb-2">{icon}</div>}
      <p className="text-green-400 text-sm font-medium">{title}</p>
      {description && <p className="text-zinc-400 text-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}; 