import React, { ReactNode } from 'react'
import { Menu, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useSystemStatus } from '../../hooks/useSystemStatus'

interface PremiumLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  header?: ReactNode
  className?: string
  showSidebar?: boolean
  onToggleSidebar?: () => void
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({
  children,
  sidebar,
  header,
  className = '',
  showSidebar = true,
  onToggleSidebar
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const { systemOnline, loading } = useSystemStatus()

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
    if (onToggleSidebar) {
      onToggleSidebar()
    }
  }

  const handleSidebarMouseEnter = () => {
    if (sidebarCollapsed) {
      setSidebarHovered(true)
    }
  }

  const handleSidebarMouseLeave = () => {
    setSidebarHovered(false)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 ${className}`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(34,197,94,0.02)_50%,transparent_75%)] bg-[length:20px_20px]" />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-800/90 backdrop-blur-sm text-white"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="flex relative">
        {/* Sidebar */}
        {showSidebar && sidebar && (
          <>
            {/* Desktop Sidebar */}
            <aside 
              className={`hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-200 ease-in-out ${
                sidebarCollapsed && !sidebarHovered ? 'w-16' : 'w-80'
              }`}
              onMouseEnter={handleSidebarMouseEnter}
              onMouseLeave={handleSidebarMouseLeave}
            >
              {/* Sidebar Background */}
              <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-xl" />
              
              {/* Sidebar Content */}
              <div className="relative flex flex-col h-full">
                {/* Toggle Button */}
                <button
                  onClick={toggleSidebar}
                  className="absolute -right-3 top-20 z-10 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-200"
                  title={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                >
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                    sidebarCollapsed && !sidebarHovered ? 'rotate-0' : 'rotate-180'
                  }`} />
                </button>

                {/* Sidebar Content */}
                <div className={`flex-1 overflow-hidden transition-all duration-200 ${
                  sidebarCollapsed && !sidebarHovered ? 'opacity-0' : 'opacity-100'
                }`}>
                  {sidebar}
                </div>
              </div>
            </aside>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
              <>
                {/* Mobile Overlay */}
                <div 
                  className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                  onClick={() => setMobileMenuOpen(false)}
                />
                
                {/* Mobile Sidebar */}
                <aside className="lg:hidden fixed left-0 top-0 h-full w-80 z-40 bg-zinc-900/95 backdrop-blur-xl transform transition-transform duration-300">
                  {sidebar}
                </aside>
              </>
            )}
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 relative transition-all duration-200 ease-in-out ${
          showSidebar && sidebar 
            ? sidebarCollapsed && !sidebarHovered
              ? 'lg:ml-16' 
              : 'lg:ml-80'
            : ''
        }`}>
          {/* Header */}
          {header && (
            <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur-xl">
              <div className="px-6 py-4">
                {header}
              </div>
            </header>
          )}

          {/* Content Area */}
          <div className="relative">
            {/* Content Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-green-500/10 via-transparent to-transparent rounded-full blur-3xl" />
            
            {/* Main Content */}
            <div className="relative px-6 py-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Elements */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 backdrop-blur-sm rounded-full text-sm text-zinc-300">
          <div className={`w-2 h-2 rounded-full ${
            loading ? 'bg-yellow-400 animate-pulse' : 
            systemOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
          {loading ? 'Verificando...' : systemOnline ? 'Sistema Online' : 'Sistema Offline'}
        </div>
      </div>
    </div>
  )
}

export default PremiumLayout 