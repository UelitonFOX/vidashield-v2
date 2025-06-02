import React, { useState, useEffect } from 'react'
import { Bell, BellRing, X, CheckCheck, Trash2, AlertTriangle, Shield, User, Server, Wifi, WifiOff, RefreshCw, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import { RealTimeNotification } from '../../hooks/useRealTimeNotifications'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NotificationCenterProps {
  className?: string
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const {
    notifications,
    stats,
    loading,
    connected,
    markAsRead,
    markAllAsRead,
    clearOldNotifications,
    refreshNotifications,
    runDiagnostic,
    testDelete,
    testCreateAndDelete
  } = useNotifications()

  // Auto-refresh a cada 30 segundos se ativo
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      refreshNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshNotifications])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await refreshNotifications()
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleNotificationClick = async (notification: RealTimeNotification) => {
    console.log('🔗 Clicou na notificação:', notification.title)
    
    // Marcar como lida
    await markAsRead(notification.id)
    
    // Redirecionar se tiver action_url
    if (notification.action_url) {
      console.log('🚀 Redirecionando para:', notification.action_url)
      setIsOpen(false) // Fechar o painel
      navigate(notification.action_url)
    } else {
      console.log('⚠️ Notificação sem action_url definido')
    }
  }

  const getNotificationIcon = (type: RealTimeNotification['type']) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="w-5 h-5" />
      case 'security': return <Shield className="w-5 h-5" />
      case 'auth': return <User className="w-5 h-5" />
      case 'system': return <Server className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: RealTimeNotification['severity']) => {
    switch (severity) {
      case 'critica': return 'text-red-400 bg-red-500/20 border-red-500/40'
      case 'alta': return 'text-orange-400 bg-orange-500/20 border-orange-500/40'
      case 'media': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40'
      case 'baixa': return 'text-blue-400 bg-blue-500/20 border-blue-500/40'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'critical') return notification.severity === 'critica'
    return true
  })

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Agora'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-700 border border-zinc-600/50 hover:from-zinc-700 hover:to-zinc-600 transition-all duration-300 group shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center gap-2">
          {stats.unread > 0 ? (
            <BellRing className="w-5 h-5 text-amber-400 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
          )}
          
          {/* Connection Status */}
          {connected ? (
            <Wifi className="w-3 h-3 text-emerald-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-400 animate-pulse" />
          )}
        </div>

        {/* Notification Badge */}
        {stats.unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold animate-bounce shadow-lg">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>

      {/* Modern Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Enhanced Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modern Panel */}
          <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-600/50 rounded-2xl shadow-2xl w-[520px] max-h-[800px] m-6 overflow-hidden backdrop-blur-xl">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-zinc-700/50 bg-gradient-to-r from-zinc-800/90 to-zinc-700/90 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-700/50 rounded-xl border border-zinc-600/50">
                    <Bell className="w-6 h-6 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">Central de Notificações</h3>
                    <p className="text-sm text-zinc-400 mt-1">Mantenha-se atualizado com seus alertos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Auto-refresh Toggle */}
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      autoRefresh 
                        ? 'text-zinc-200 bg-zinc-600 border border-zinc-500' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 border border-zinc-600/30'
                    }`}
                    title={autoRefresh ? 'Auto-refresh ativo (30s)' : 'Auto-refresh desativo'}
                  >
                    <Wifi className="w-4 h-4" />
                  </button>
                  
                  {/* Manual Refresh */}
                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="p-2.5 hover:bg-zinc-700/50 rounded-xl text-zinc-400 hover:text-white transition-all duration-300 disabled:opacity-50 border border-zinc-600/30"
                    title="Atualizar notificações"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  
                                     {/* Settings */}
                   <button
                     className="p-2.5 hover:bg-zinc-700/50 rounded-xl text-zinc-400 hover:text-white transition-all duration-300 border border-zinc-600/30"
                     title="Configurações de notificações"
                     aria-label="Configurações de notificações"
                   >
                     <Settings className="w-4 h-4" />
                   </button>
                  
                                     {/* Close */}
                   <button
                     onClick={() => setIsOpen(false)}
                     className="p-2.5 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-all duration-300 border border-zinc-600/30 hover:border-red-500/30"
                     title="Fechar painel de notificações"
                     aria-label="Fechar"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-zinc-400">Total</div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-400">{stats.unread}</div>
                  <div className="text-xs text-blue-300">Não lidas</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                  <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
                  <div className="text-xs text-red-300">Críticas</div>
                </div>
                <div className={`rounded-lg p-3 border ${connected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    {connected ? (
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className={`text-xs ${connected ? 'text-emerald-300' : 'text-red-300'}`}>
                    {connected ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="flex gap-2 mb-4">
                {(['all', 'unread', 'critical'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === filterType
                        ? 'bg-zinc-600 text-white border border-zinc-500'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300 border border-zinc-700/50'
                    }`}
                  >
                    {filterType === 'all' && `Todas (${notifications.length})`}
                    {filterType === 'unread' && `Não lidas (${stats.unread})`}
                    {filterType === 'critical' && `Críticas (${stats.critical})`}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {stats.unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 hover:text-white text-sm rounded-lg transition-all duration-300 border border-zinc-600"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Marcar todas como lidas
                  </button>
                )}
                
                {/* Botão de Diagnóstico */}
                <button
                  onClick={() => runDiagnostic()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 text-sm rounded-lg transition-all duration-300 border border-blue-500/30"
                  title="Executar diagnóstico completo das notificações"
                >
                  <Settings className="w-4 h-4" />
                  Diagnóstico
                </button>
                
                {/* Botão de Teste DELETE */}
                <button
                  onClick={() => testDelete()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 text-sm rounded-lg transition-all duration-300 border border-red-500/30"
                  title="Testar DELETE em uma notificação específica"
                >
                  <Trash2 className="w-4 h-4" />
                  Teste DELETE
                </button>
                
                {autoRefresh && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 text-zinc-400 text-sm rounded-lg border border-zinc-700/50">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" />
                    Auto-refresh ativo
                  </div>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-12 text-center text-zinc-400">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-lg">Carregando notificações...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">Nenhuma notificação encontrada</p>
                  <p className="text-sm opacity-75">Você está em dia com seus alertas!</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 m-2 rounded-xl transition-all duration-300 cursor-pointer group ${
                        !notification.read 
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 hover:from-blue-500/20 hover:to-purple-500/20' 
                          : 'bg-zinc-800/30 hover:bg-zinc-700/50 border border-zinc-700/50'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-xl border ${getSeverityColor(notification.severity)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-base font-semibold ${
                              !notification.read ? 'text-white' : 'text-zinc-300'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            )}
                          </div>
                          
                          <p className={`text-sm mb-3 ${
                            !notification.read ? 'text-zinc-300' : 'text-zinc-400'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.severity === 'critica' ? 'bg-red-500/20 text-red-300' :
                              notification.severity === 'alta' ? 'bg-orange-500/20 text-orange-300' :
                              notification.severity === 'media' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {notification.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            {notifications.length > 0 && (
              <div className="p-6 border-t border-zinc-700/50 bg-gradient-to-r from-zinc-800/90 to-zinc-700/90">
                <button
                  onClick={clearOldNotifications}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 hover:text-white font-medium rounded-xl transition-all duration-300 group border border-zinc-600"
                  title="Remove notificações lidas primeiro, depois as antigas"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Limpar Notificações</span>
                  {stats.total > 0 && (
                    <span className="px-3 py-1 bg-zinc-600 text-zinc-300 text-sm rounded-lg border border-zinc-500 font-medium">
                      {stats.total}
                    </span>
                  )}
                </button>
                
                {/* Dica de funcionamento */}
                <p className="text-xs text-zinc-400 text-center mt-3 opacity-75">
                  💡 Remove notificações lidas primeiro, depois as antigas
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      
    </div>
  )
}

export default NotificationCenter 