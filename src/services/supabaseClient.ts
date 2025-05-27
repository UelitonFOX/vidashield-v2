import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Dados de demonstração
export const DEMO_DATA = {
  user: {
    id: 'demo-user-123',
    email: 'demo@vidashield.com',
    user_metadata: {
      full_name: 'Usuário Demo',
      avatar_url: null
    }
  },
  notifications: [
    {
      id: '1',
      type: 'system' as const,
      title: 'Sistema Inicializado',
      message: 'VidaShield Security foi iniciado com sucesso',
      severity: 'baixa' as const,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: { module: 'core' }
    },
    {
      id: '2',
      type: 'security' as const,
      title: 'Modo Demonstração Ativo',
      message: 'Configure o Supabase para funcionalidade completa',
      severity: 'media' as const,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false,
      metadata: { feature: 'demo_mode' }
    },
    {
      id: '3',
      type: 'threat' as const,
      title: 'Configuração Necessária',
      message: 'Configure as regras de segurança para começar o monitoramento',
      severity: 'alta' as const,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      read: true,
      metadata: { action: 'configure_security_rules' }
    }
  ],
  blockedIPs: [
    {
      id: '1',
      ip_address: '192.168.1.100',
      reason: 'Múltiplas tentativas de login falhadas',
      is_permanent: false,
      attempts_count: 5,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      ip_address: '10.0.0.50',
      reason: 'Atividade suspeita detectada',
      is_permanent: true,
      attempts_count: 12,
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]
}

export default supabase

// Tipos para as tabelas
export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface AuthLog {
  id: string
  user_id?: string
  action: string
  provider?: string
  ip_address?: string
  user_agent?: string
  location?: any
  device_info?: any
  session_id?: string
  success: boolean
  failure_reason?: string
  created_at: string
  metadata?: any
}

export interface Threat {
  id: string
  tipo: string
  status: 'ativo' | 'resolvido' | 'investigando'
  data_detectada: string
  resolvido: boolean
  descricao?: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  ip_origem?: string
  created_at: string
  updated_at: string
} 