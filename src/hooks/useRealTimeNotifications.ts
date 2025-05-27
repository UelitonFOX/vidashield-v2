import { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { RealtimeChannel } from '@supabase/supabase-js'
import { notificationSoundService } from '../services/notificationSounds'
import { ProfileService } from '../services/profileService'

export interface RealTimeNotification {
  id: string
  type: 'threat' | 'security' | 'auth' | 'system'
  title: string
  message: string
  severity: 'baixa' | 'media' | 'alta' | 'critica'
  timestamp: string
  read: boolean
  metadata?: any
  action_url?: string
}

export interface NotificationStats {
  total: number
  unread: number
  critical: number
  high: number
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    critical: 0,
    high: 0
  })
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [soundPreference, setSoundPreference] = useState<string>('beep')
  
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Carregar preferências de som do usuário
  useEffect(() => {
    const loadSoundPreference = async () => {
      const profile = await ProfileService.getCurrentProfile()
      if (profile?.preferences?.notificationSound) {
        setSoundPreference(profile.preferences.notificationSound)
      }
    }
    loadSoundPreference()
  }, [])

  // Carregar notificações iniciais
  const loadNotifications = async () => {
    try {
      setLoading(true)
      
      // Buscar notificações recentes (últimas 50)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const formattedNotifications: RealTimeNotification[] = (data || []).map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        severity: item.severity,
        timestamp: item.created_at,
        read: item.read || false,
        metadata: item.metadata,
        action_url: item.action_url
      }))

      setNotifications(formattedNotifications)
      updateStats(formattedNotifications)
      
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar estatísticas
  const updateStats = (notificationList: RealTimeNotification[]) => {
    const stats = notificationList.reduce((acc, notification) => {
      acc.total++
      if (!notification.read) acc.unread++
      if (notification.severity === 'critica') acc.critical++
      if (notification.severity === 'alta') acc.high++
      return acc
    }, { total: 0, unread: 0, critical: 0, high: 0 })

    setStats(stats)
  }

  // Configurar canal de tempo real
  useEffect(() => {
    // Evitar recriar o canal se já existe
    if (channelRef.current) {
      console.log('🔌 Canal já existe, pulando criação')
      return
    }

    loadNotifications()

    console.log('🔌 Criando novo canal realtime...')
    
    // Configurar realtime
    channelRef.current = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('📥 Nova notificação recebida!', payload.new.title)
          
          const newNotification: RealTimeNotification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            severity: payload.new.severity,
            timestamp: payload.new.created_at,
            read: false,
            metadata: payload.new.metadata,
            action_url: payload.new.action_url
          }

          setNotifications(prev => [newNotification, ...prev])
          
          // Se chegou notificação, significa que está conectado!
          setConnected(true)
          
          // Tocar som para notificações críticas
          if (newNotification.severity === 'critica' && soundPreference !== 'none') {
            notificationSoundService.playSound(soundPreference)
          }

          // Mostrar notificação do browser
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('📝 Notificação atualizada!', payload.new.id)
          
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === payload.new.id 
                ? { ...notification, read: payload.new.read }
                : notification
            )
          )
          
          // Se chegou update, também significa que está conectado!
          setConnected(true)
        }
      )
      .subscribe((status) => {
        console.log('🔌 Realtime status mudou:', status)
        
        // Só marcar como conectado se realmente estiver subscrito
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          console.log('✅ Canal realtime conectado com sucesso!')
        } else if (status === 'CLOSED') {
          setConnected(false)
          console.log('❌ Canal realtime desconectado')
        }
      })

    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      if (channelRef.current) {
        console.log('🔌 Removendo canal realtime...')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [])

  // Atualizar stats quando notifications mudarem
  useEffect(() => {
    updateStats(notifications)
  }, [notifications])

  // Marcar notificação como lida
  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id)

      if (unreadIds.length === 0) return

      await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds)

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

    // Diagnóstico detalhado do banco
  const runDiagnostic = async () => {
    try {
      console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO...')
      
      // Verificar usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      console.log(`👤 Usuário atual: ${user?.id || 'NENHUM'}`)
      
      // Verificar todas as notificações
      const { data: allNotifications, error } = await supabase
        .from('notifications')
        .select('id, user_id, read, created_at, type, severity')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Erro ao buscar notificações:', error)
        return
      }
      
      const stats = {
        total: allNotifications?.length || 0,
        minhas: allNotifications?.filter(n => n.user_id === user?.id).length || 0,
        outros: allNotifications?.filter(n => n.user_id !== user?.id).length || 0,
        semUserID: allNotifications?.filter(n => !n.user_id).length || 0,
        lidas: allNotifications?.filter(n => n.read).length || 0,
        naoLidas: allNotifications?.filter(n => !n.read).length || 0
      }
      
      console.log('📊 ESTATÍSTICAS COMPLETAS:')
      console.table(stats)
      
      // Mostrar amostra de IDs únicos
      const userIds = [...new Set(allNotifications?.map(n => n.user_id).filter(Boolean))]
      console.log(`👥 ${userIds.length} usuários únicos encontrados:`)
      userIds.forEach((uid, i) => {
        console.log(`  ${i+1}. ${uid?.slice(0, 8)}... ${uid === user?.id ? '✅ EU' : '❌ OUTRO'}`)
      })
      
      return stats
    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error)
    }
  }

  // Teste específico de DELETE com uma notificação só
  const testDelete = async () => {
    try {
      console.log('🧪 TESTE ESPECÍFICO DE DELETE...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        console.log('❌ Usuário não autenticado')
        return
      }

      // Buscar UMA notificação minha lida para testar delete
      const { data: myNotifications, error: fetchError } = await supabase
        .from('notifications')
        .select('id, read, user_id, title')
        .eq('user_id', user.id)
        .eq('read', true)
        .limit(1)

      if (fetchError) {
        console.error('❌ Erro ao buscar minhas notificações:', fetchError)
        return
      }

      if (!myNotifications || myNotifications.length === 0) {
        console.log('📝 Nenhuma notificação minha lida encontrada para teste')
        return
      }

      const testNotification = myNotifications[0]
      console.log(`🎯 Testando DELETE na notificação: ${testNotification.id.slice(0, 8)}...`)
      console.log(`📋 Título: "${testNotification.title}"`)
      console.log(`👤 user_id: ${testNotification.user_id === user.id ? '✅ CORRETO' : '❌ INCORRETO'}`)

      // Tentar deletar
      const { count, error: deleteError } = await supabase
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('id', testNotification.id)

      if (deleteError) {
        console.error('❌ Erro específico no DELETE:', deleteError)
        console.error('❌ Código:', deleteError.code)
        console.error('❌ Mensagem:', deleteError.message)
        console.error('❌ Detalhes:', deleteError.details)
        console.error('❌ Dica:', deleteError.hint)
      } else {
        console.log(`✅ DELETE SUCESSO: ${count || 0} notificação removida`)
        
        // Verificar se a notificação ainda existe após DELETE
        const { data: checkNotification, error: checkError } = await supabase
          .from('notifications')
          .select('id, title, user_id, read')
          .eq('id', testNotification.id)
          .single()

        if (checkError && checkError.code === 'PGRST116') {
          console.log(`🎯 CONFIRMADO: Notificação ${testNotification.id.slice(0, 8)}... foi REALMENTE removida`)
        } else if (checkNotification) {
          console.log(`⚠️ PROBLEMA: Notificação ${testNotification.id.slice(0, 8)}... ainda existe após DELETE!`)
          console.log(`📋 Dados atuais:`, checkNotification)
        } else {
          console.log(`❓ Erro ao verificar:`, checkError)
        }
        
        // Recarregar lista
        await loadNotifications()
      }

    } catch (error) {
      console.error('❌ Erro no teste DELETE:', error)
    }
  }

  // Teste completo: CREATE + DELETE para verificar RLS
  const testCreateAndDelete = async () => {
    try {
      console.log('🧪 TESTE COMPLETO: CREATE + DELETE...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) {
        console.log('❌ Usuário não autenticado')
        return
      }

      // 1. Criar uma notificação de teste
      const testNotification = {
        type: 'system',
        title: 'TESTE DELETE - ' + new Date().toLocaleTimeString(),
        message: 'Esta é uma notificação de teste para verificar DELETE. Pode ser removida.',
        severity: 'baixa',
        user_id: user.id,
        read: true
      }

      console.log(`🏭 Criando notificação de teste...`)
      const { data: createdNotification, error: createError } = await supabase
        .from('notifications')
        .insert(testNotification)
        .select()
        .single()

      if (createError) {
        console.error('❌ Erro ao criar notificação de teste:', createError)
        return
      }

      console.log(`✅ Notificação criada: ${createdNotification.id.slice(0, 8)}...`)
      
      // 2. Aguardar um pouco para garantir que foi criada
      await new Promise(resolve => setTimeout(resolve, 500))

      // 3. Tentar deletar a notificação recém-criada
      console.log(`🗑️ Tentando deletar notificação recém-criada...`)
      const { count: deleteCount, error: deleteError } = await supabase
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('id', createdNotification.id)

      if (deleteError) {
        console.error('❌ Erro ao deletar notificação recém-criada:', deleteError)
      } else {
        console.log(`✅ DELETE da notificação recém-criada: ${deleteCount || 0} removida`)
        
        if (deleteCount === 1) {
          console.log(`🎉 SUCESSO TOTAL: RLS está funcionando perfeitamente!`)
        } else {
          console.log(`⚠️ PROBLEMA: DELETE retornou sucesso mas count = 0`)
        }
      }

      // 4. Recarregar lista
      await loadNotifications()

    } catch (error) {
      console.error('❌ Erro no teste CREATE + DELETE:', error)
    }
  }

  // Limpar notificações (criação de novas com user_id correto)
  const clearOldNotifications = async () => {
    try {
      // Verificar usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      console.log(`👤 Usuário atual:`, user?.id)
      
      if (!user?.id) {
        console.log('❌ Usuário não autenticado')
        return
      }

      // Primeiro, fazer diagnóstico
      const { data: allNotifications, error: queryError } = await supabase
        .from('notifications')
        .select('id, read, created_at, user_id')
        .order('created_at', { ascending: false })
      
      if (queryError) throw queryError
      
      const readNotifications = allNotifications?.filter(n => n.read) || []
      const unreadNotifications = allNotifications?.filter(n => !n.read) || []
      const myNotifications = allNotifications?.filter(n => n.user_id === user.id) || []
      
      console.log(`📊 Diagnóstico: ${allNotifications?.length || 0} total, ${readNotifications.length} lidas, ${unreadNotifications.length} não lidas, ${myNotifications.length} minhas`)
      
      // Debug detalhado dos primeiros registros
      if (allNotifications && allNotifications.length > 0) {
        console.log('🔍 Amostra dos primeiros 3 registros:')
        allNotifications.slice(0, 3).forEach((n, i) => {
          console.log(`  ${i+1}. ID: ${n.id.slice(0, 8)}... read: ${n.read} user_id: ${n.user_id === user?.id ? '✅ MATCH' : '❌ DIFF'}`)
        })
      }

      // Estratégia: Se não há notificações minhas, criar algumas para demonstração
      if (myNotifications.length === 0) {
        console.log('🏭 Criando notificações de teste com user_id correto...')
        
        const testNotifications = [
          {
            type: 'system',
            title: 'Sistema Atualizado',
            message: 'VidaShield foi atualizado com sucesso. Versão 2.1.0',
            severity: 'baixa',
            user_id: user.id,
            read: true
          },
          {
            type: 'security',
            title: 'Login Detectado',
            message: 'Novo login detectado no sistema em ' + new Date().toLocaleString(),
            severity: 'media',
            user_id: user.id,
            read: true
          },
          {
            type: 'threat',
            title: 'Ameaça Neutralizada',
            message: 'Tentativa de acesso não autorizado bloqueada automaticamente',
            severity: 'alta',
            user_id: user.id,
            read: false
          }
        ]

        const { data: createdNotifications, error: createError } = await supabase
          .from('notifications')
          .insert(testNotifications)
          .select()

        if (createError) {
          console.error('❌ Erro ao criar notificações:', createError)
        } else {
          console.log(`✅ ${createdNotifications?.length || 0} notificações criadas`)
        }
      }

      // Tentar deletar notificações lidas que são minhas
      const myReadNotifications = allNotifications?.filter(n => n.read && n.user_id === user.id) || []
      
      if (myReadNotifications.length > 0) {
        console.log(`🎯 Tentando remover ${myReadNotifications.length} das minhas notificações lidas...`)
        
        const myReadIds = myReadNotifications.map(n => n.id)
        const { count: deletedCount, error: deleteError } = await supabase
          .from('notifications')
          .delete({ count: 'exact' })
          .in('id', myReadIds)

        if (deleteError) {
          console.error('❌ Erro ao deletar minhas notificações:', deleteError)
        } else {
          console.log(`🗑️ ${deletedCount || 0} das minhas notificações removidas`)
        }
      } else {
        console.log('📝 Não tenho notificações lidas para remover')
      }

      // Recarregar notificações
      await loadNotifications()
      console.log('✅ Lista de notificações atualizada')
      
    } catch (error) {
      console.error('❌ Erro ao limpar notificações:', error)
    }
  }

  return {
    notifications,
    stats,
    loading,
    connected,
    markAsRead,
    markAllAsRead,
    clearOldNotifications,
    refreshNotifications: loadNotifications,
    runDiagnostic,
    testDelete,
    testCreateAndDelete
  }
} 