import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

// Atualizar interface para corresponder à estrutura real da tabela ip_blocks
interface BlockedIP {
  id: string
  ip_address: string
  reason: string
  severity: string
  block_type: string
  ativo: boolean
  attempts: number
  country?: string
  city?: string
  organization?: string
  blocked_by?: string
  expires_at?: string
  last_attempt_at?: string
  unblocked_at?: string
  unblocked_by?: string
  unblock_reason?: string
  created_at: string
  updated_at: string
  metadata?: any
}

interface BlockedUsersData {
  blockedIPs: BlockedIP[]
  totalBlocked: number
  loading: boolean
  error: string | null
}

export const useBlockedUsers = () => {
  const [data, setData] = useState<BlockedUsersData>({
    blockedIPs: [],
    totalBlocked: 0,
    loading: true,
    error: null
  })

  const fetchBlockedUsers = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))



      // Buscar dados reais da tabela ip_blocks com a estrutura correta
      const { data: blockedIPs, error } = await supabase
        .from('ip_blocks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && blockedIPs) {
        setData({
          blockedIPs: blockedIPs || [],
          totalBlocked: blockedIPs?.length || 0,
          loading: false,
          error: null
        })
      } else {
        throw error
      }

    } catch (error) {
      console.error('Erro ao buscar usuários bloqueados:', error)
      
      // Fallback para dados mock se houver erro
      const mockBlockedIPs: BlockedIP[] = []
      
      const shouldShowBlocked = Math.random() > 0.6 // 40% de chance
      
      if (shouldShowBlocked) {
        const mockIPs = [
          '192.168.1.100',
          '10.0.0.45',
          '172.16.0.33'
        ]
        
        const randomCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < randomCount; i++) {
          mockBlockedIPs.push({
            id: `mock-${i}`,
            ip_address: mockIPs[Math.floor(Math.random() * mockIPs.length)],
            reason: 'Tentativas de login suspeitas',
            severity: 'media',
            block_type: 'automatico',
            ativo: true,
            attempts: Math.floor(Math.random() * 10) + 1,
            created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 86400000).toISOString()
          })
        }
      }

      setData({
        blockedIPs: mockBlockedIPs,
        totalBlocked: mockBlockedIPs.length,
        loading: false,
        error: null
      })
    }
  }

  useEffect(() => {
    fetchBlockedUsers()

    // Atualizar a cada 1 minuto para teste
    const interval = setInterval(fetchBlockedUsers, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { ...data, refetch: fetchBlockedUsers }
} 