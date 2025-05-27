import { useState, useEffect } from 'react'

interface SystemStatusResponse {
  api: 'online' | 'offline' | 'warning'
  database: 'online' | 'offline' | 'warning'
  auth: 'online' | 'offline' | 'warning'
  lastUpdate: string | null
  loading: boolean
  error: string | null
  systemOnline: boolean
}

export const useSystemStatus = (): SystemStatusResponse => {
  const [api, setApi] = useState<'online' | 'offline' | 'warning'>('online')
  const [database, setDatabase] = useState<'online' | 'offline' | 'warning'>('online')
  const [auth, setAuth] = useState<'online' | 'offline' | 'warning'>('online')
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSystemStatus = async () => {
    try {
      setLoading(true)
      
      // Simular verificação real dos serviços
      const startTime = Date.now()
      
      // Verificar API
      try {
        // Em produção, fazer uma chamada real para health check
        await new Promise(resolve => setTimeout(resolve, 200))
        setApi('online')
      } catch {
        setApi('offline')
      }

      // Verificar Database (Supabase)
      try {
        // Em produção, verificar conexão com Supabase
        await new Promise(resolve => setTimeout(resolve, 300))
        setDatabase('online')
      } catch {
        setDatabase('offline')
      }

      // Verificar Auth
      try {
        // Em produção, verificar serviço de autenticação
        await new Promise(resolve => setTimeout(resolve, 150))
        setAuth('online')
      } catch {
        setAuth('offline')
      }

      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Se demorou muito, marcar como warning
      if (responseTime > 2000) {
        setApi('warning')
      }

      setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
      setError(null)
    } catch (err) {
      console.error('Erro ao verificar status do sistema:', err)
      setError('Erro ao verificar status')
      setApi('offline')
      setDatabase('offline')
      setAuth('offline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Verificação inicial
    checkSystemStatus()

    // Verificar a cada 30 segundos
    const interval = setInterval(checkSystemStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  // Sistema é considerado online se pelo menos API e Auth estiverem funcionando
  const systemOnline = api === 'online' && auth === 'online'

  return {
    api,
    database,
    auth,
    lastUpdate,
    loading,
    error,
    systemOnline
  }
} 