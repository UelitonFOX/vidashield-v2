import React, { useState, useRef, useEffect } from 'react'
import { 
  Settings, 
  Bell, 
  BellOff, 
  Moon, 
  Sun, 
  Shield, 
  Monitor, 
  ExternalLink,
  Palette,
  Volume2,
  VolumeX
} from 'lucide-react'

interface QuickSettingsPopoverProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
}

const QuickSettingsPopover: React.FC<QuickSettingsPopoverProps> = ({
  isOpen,
  onClose,
  triggerRef
}) => {
  const popoverRef = useRef<HTMLDivElement>(null)
  
  // Estados das configurações
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [securityMode, setSecurityMode] = useState<'normal' | 'high' | 'paranoid'>('high')

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, triggerRef])

  if (!isOpen) return null

  const getSecurityModeColor = (mode: string) => {
    switch (mode) {
      case 'normal': return 'text-blue-400'
      case 'high': return 'text-orange-400'
      case 'paranoid': return 'text-red-400'
      default: return 'text-orange-400'
    }
  }

  const getSecurityModeLabel = (mode: string) => {
    switch (mode) {
      case 'normal': return 'Normal'
      case 'high': return 'Alto'
      case 'paranoid': return 'Paranóico'
      default: return 'Alto'
    }
  }

  return (
    <div 
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Configurações Rápidas</h3>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-4">
        
        {/* Notificações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {notifications ? (
              <Bell className="w-5 h-5 text-green-400" />
            ) : (
              <BellOff className="w-5 h-5 text-zinc-500" />
            )}
            <div>
              <p className="text-sm font-medium text-white">Notificações</p>
              <p className="text-xs text-zinc-400">Alertas em tempo real</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              notifications ? 'bg-green-500' : 'bg-zinc-600'
            }`}
            title={`${notifications ? 'Desativar' : 'Ativar'} notificações`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Som */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-blue-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-zinc-500" />
            )}
            <div>
              <p className="text-sm font-medium text-white">Sons de Alerta</p>
              <p className="text-xs text-zinc-400">Notificações sonoras</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              soundEnabled ? 'bg-blue-500' : 'bg-zinc-600'
            }`}
            title={`${soundEnabled ? 'Desativar' : 'Ativar'} sons`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Tema */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-purple-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
            <div>
              <p className="text-sm font-medium text-white">Tema Escuro</p>
              <p className="text-xs text-zinc-400">Modo noturno</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-purple-500' : 'bg-zinc-600'
            }`}
            title={`Alternar para tema ${darkMode ? 'claro' : 'escuro'}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Separador */}
        <div className="border-t border-zinc-700" />

        {/* Modo de Segurança */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Shield className={`w-5 h-5 ${getSecurityModeColor(securityMode)}`} />
            <div>
              <p className="text-sm font-medium text-white">Nível de Segurança</p>
              <p className="text-xs text-zinc-400">Controle de proteção</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'high', 'paranoid'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSecurityMode(mode)}
                className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                  securityMode === mode
                    ? `${getSecurityModeColor(mode)} bg-zinc-800 border border-zinc-600`
                    : 'text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800'
                }`}
              >
                {getSecurityModeLabel(mode)}
              </button>
            ))}
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-zinc-700" />

        {/* Acesso Rápido */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Acesso Rápido
          </p>
          
          <button 
            onClick={() => window.location.href = '/configuracoes'}
            className="w-full flex items-center gap-3 p-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Todas as Configurações</span>
            <ExternalLink className="w-3 h-3 ml-auto" />
          </button>
          
          <button className="w-full flex items-center gap-3 p-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
            <Palette className="w-4 h-4" />
            <span>Personalização</span>
          </button>

          <button className="w-full flex items-center gap-3 p-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
            <Monitor className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-700 bg-zinc-800/50">
        <p className="text-xs text-zinc-500 text-center">
          VidaShield Security v2.0 • Última atualização: agora
        </p>
      </div>
    </div>
  )
}

export default QuickSettingsPopover 