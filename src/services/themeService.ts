export type ThemeMode = 'dark' | 'light' | 'auto' | 'neon' | 'ocean'

export interface Theme {
  id: ThemeMode
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    accent: string
    success: string
    warning: string
    error: string
    border: string
  }
}

export const themes: Record<ThemeMode, Theme> = {
  dark: {
    id: 'dark',
    name: 'Escuro',
    description: 'Tema escuro padrão',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#374151'
    }
  },
  light: {
    id: 'light',
    name: 'Claro',
    description: 'Tema claro moderno',
    colors: {
      primary: '#2563eb',
      secondary: '#4f46e5',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      accent: '#0891b2',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      border: '#e2e8f0'
    }
  },
  auto: {
    id: 'auto',
    name: 'Sistema',
    description: 'Segue o tema do sistema',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#374151'
    }
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Tema futurista com cores vibrantes',
    colors: {
      primary: '#ff0080',
      secondary: '#00ff80',
      background: '#000000',
      surface: '#0a0a0a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      accent: '#00ffff',
      success: '#39ff14',
      warning: '#ffff00',
      error: '#ff073a',
      border: '#333333'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Inspirado no oceano profundo',
    colors: {
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      background: '#0c1e2e',
      surface: '#1e3a5f',
      text: '#e0f2fe',
      textSecondary: '#a7c7e7',
      accent: '#06b6d4',
      success: '#14b8a6',
      warning: '#f59e0b',
      error: '#f87171',
      border: '#2563eb'
    }
  }
}

class ThemeService {
  private currentTheme: ThemeMode = 'dark'
  private mediaQuery: MediaQueryList | null = null

  constructor() {
    this.initializeTheme()
    this.setupSystemThemeListener()
  }

  private initializeTheme() {
    // Carregar tema salvo ou usar dark como padrão
    const savedTheme = localStorage.getItem('vidashield-theme') as ThemeMode
    if (savedTheme && themes[savedTheme]) {
      this.currentTheme = savedTheme
    }
    this.applyTheme(this.currentTheme)
  }

  private setupSystemThemeListener() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.mediaQuery.addEventListener('change', () => {
        if (this.currentTheme === 'auto') {
          this.applyTheme('auto')
        }
      })
    }
  }

  setTheme(theme: ThemeMode) {
    this.currentTheme = theme
    localStorage.setItem('vidashield-theme', theme)
    this.applyTheme(theme)
  }

  getCurrentTheme(): ThemeMode {
    return this.currentTheme
  }

  getThemeConfig(themeId: ThemeMode): Theme {
    if (themeId === 'auto') {
      const isSystemDark = this.mediaQuery?.matches ?? true
      return themes[isSystemDark ? 'dark' : 'light']
    }
    return themes[themeId]
  }

  getAllThemes(): Theme[] {
    return Object.values(themes)
  }

  private applyTheme(themeId: ThemeMode) {
    const theme = this.getThemeConfig(themeId)
    const root = document.documentElement

    // Aplicar CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // Aplicar classes CSS baseadas no tema
    root.className = `theme-${theme.id}`
    
    // Para temas especiais, adicionar classes extras
    if (themeId === 'neon') {
      document.body.classList.add('neon-glow')
    } else {
      document.body.classList.remove('neon-glow')
    }

    if (themeId === 'ocean') {
      document.body.classList.add('ocean-waves')
    } else {
      document.body.classList.remove('ocean-waves')
    }

    // Atualizar meta theme-color para mobile
    this.updateMetaThemeColor(theme.colors.primary)
  }

  private updateMetaThemeColor(color: string) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.setAttribute('content', color)
  }

  // Método para criar animações específicas do tema
  addThemeAnimations() {
    const style = document.createElement('style')
    style.textContent = `
      /* Neon Theme Effects */
      .neon-glow {
        background: radial-gradient(circle at 50% 50%, #ff008020 0%, transparent 50%);
      }
      
      .neon-glow .bg-gray-800 {
        background: linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%) !important;
        border: 1px solid #ff0080;
        box-shadow: 0 0 20px #ff008050;
      }

      .neon-glow .text-white {
        text-shadow: 0 0 10px currentColor;
      }

      /* Ocean Theme Effects */
      .ocean-waves {
        background: linear-gradient(180deg, #0c1e2e 0%, #1e3a5f 100%);
        position: relative;
      }

      .ocean-waves::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          radial-gradient(circle at 20% 80%, #0ea5e920 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, #3b82f620 0%, transparent 50%);
        pointer-events: none;
        z-index: -1;
      }

      /* Tema transitions */
      * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
      }
    `
    
    // Remove estilo anterior se existir
    const oldStyle = document.getElementById('theme-animations')
    if (oldStyle) {
      oldStyle.remove()
    }
    
    style.id = 'theme-animations'
    document.head.appendChild(style)
  }
}

export const themeService = new ThemeService()
export { ThemeService } 