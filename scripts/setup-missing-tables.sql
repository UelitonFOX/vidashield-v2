-- =====================================================
-- SCRIPT COMPLETO - TABELAS FALTANDO NO SUPABASE
-- VidaShield - Sistema de Configurações e Segurança
-- =====================================================

-- 1. ADICIONAR CAMPOS 2FA NA TABELA user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[];

-- 2. TABELA DE LOGS DE ATIVIDADE
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para user_activity_logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own activity logs" ON user_activity_logs;
CREATE POLICY "Users can view own activity logs" ON user_activity_logs
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own activity logs" ON user_activity_logs;  
CREATE POLICY "Users can create own activity logs" ON user_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. TABELA DE CONFIGURAÇÃO DE BACKUP
CREATE TABLE IF NOT EXISTS backup_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_backup BOOLEAN DEFAULT TRUE,
  interval TEXT DEFAULT 'daily',
  retention_days INTEGER DEFAULT 30,
  include_user_data BOOLEAN DEFAULT TRUE,
  include_logs BOOLEAN DEFAULT TRUE,
  include_settings BOOLEAN DEFAULT TRUE,
  compress BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para backup_config
ALTER TABLE backup_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own backup config" ON backup_config;
CREATE POLICY "Users can manage own backup config" ON backup_config
  FOR ALL USING (auth.uid() = user_id);

-- 4. TABELA DE SESSÕES ATIVAS
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info TEXT,
  user_agent TEXT,
  ip_address INET,
  location TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- RLS para user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own sessions" ON user_sessions;
CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 5. TABELA DE LOGS DE AUTENTICAÇÃO
CREATE TABLE IF NOT EXISTS auth_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  email TEXT,
  provider TEXT,
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  device_info JSONB,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  session_id TEXT,
  success BOOLEAN DEFAULT TRUE,
  failure_reason TEXT,
  session_duration INTEGER,
  risk_score INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para auth_logs (admins podem ver todos, users só os próprios)
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all auth logs" ON auth_logs;
CREATE POLICY "Admins can view all auth logs" ON auth_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Users can view own auth logs" ON auth_logs;
CREATE POLICY "Users can view own auth logs" ON auth_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 6. TABELA DE DETECÇÃO DE AMEAÇAS
CREATE TABLE IF NOT EXISTS threat_detection (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  threat_type TEXT NOT NULL,
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  source_ip INET NOT NULL,
  target_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_email TEXT,
  description TEXT NOT NULL,
  attack_pattern TEXT,
  attempts_count INTEGER DEFAULT 1,
  time_window TEXT,
  geographical_anomaly BOOLEAN DEFAULT FALSE,
  device_anomaly BOOLEAN DEFAULT FALSE,
  behavior_score INTEGER DEFAULT 0,
  details JSONB,
  status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'confirmed', 'false_positive', 'mitigated')),
  auto_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- RLS para threat_detection (apenas admins)
ALTER TABLE threat_detection ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage threat detection" ON threat_detection;
CREATE POLICY "Admins can manage threat detection" ON threat_detection
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'moderator')
    )
  );

-- 7. TABELA DE FIREWALL DINÂMICO
CREATE TABLE IF NOT EXISTS dynamic_firewall (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('block', 'rate_limit', 'monitor', 'whitelist')),
  reason TEXT NOT NULL,
  threat_id UUID REFERENCES threat_detection(id) ON DELETE SET NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  auto_generated BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  attempts_blocked INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  whitelist_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para dynamic_firewall (apenas admins)
ALTER TABLE dynamic_firewall ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage firewall rules" ON dynamic_firewall;
CREATE POLICY "Admins can manage firewall rules" ON dynamic_firewall
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'moderator')
    )
  );

-- 8. TABELA DE CONFIGURAÇÕES DE SEGURANÇA
CREATE TABLE IF NOT EXISTS security_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para security_config (apenas admins)
ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage security config" ON security_config;
CREATE POLICY "Admins can manage security config" ON security_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 9. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_current, last_active DESC);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_detection_status ON threat_detection(status);
CREATE INDEX IF NOT EXISTS idx_threat_detection_severity ON threat_detection(severity_level DESC);
CREATE INDEX IF NOT EXISTS idx_dynamic_firewall_ip ON dynamic_firewall(ip_address);
CREATE INDEX IF NOT EXISTS idx_dynamic_firewall_active ON dynamic_firewall(is_active);

-- 10. CONFIGURAÇÕES PADRÃO DE SEGURANÇA
INSERT INTO security_config (config_key, config_value, description, category) VALUES
('max_login_attempts', '5', 'Máximo de tentativas de login falhadas antes de bloquear', 'authentication'),
('session_timeout', '3600', 'Timeout de sessão em segundos', 'session'),
('2fa_required_for_admin', 'true', 'Requer 2FA para usuários admin', 'authentication'),
('auto_block_suspicious_ips', 'true', 'Bloquear automaticamente IPs suspeitos', 'security'),
('log_retention_days', '90', 'Dias para manter logs de segurança', 'logging')
ON CONFLICT (config_key) DO NOTHING;

-- =====================================================
-- SCRIPT CONCLUÍDO ✅
-- 
-- Para aplicar:
-- 1. Copie este conteúdo
-- 2. Cole no SQL Editor do Supabase
-- 3. Execute o script
-- 
-- Ou via CLI:
-- npx supabase db reset
-- npx supabase db push
-- ===================================================== 