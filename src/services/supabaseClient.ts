import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  email: string
  ip_address: string
  status: 'success' | 'failed' | 'blocked'
  timestamp: string
  user_agent?: string
}

export interface Threat {
  id: string
  tipo: string
  status: 'ativo' | 'resolvido' | 'investigando'
  data_detectada: string
  resolvido: boolean
  descricao?: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
}

export interface BlockedIP {
  id: string
  ip: string
  motivo: string
  data_bloqueio: string
  ativo: boolean
} 