-- =================================================
-- CRIAÇÃO DAS TABELAS PARA COMPLIANCE LGPD
-- Sistema VidaShield - Segurança Digital para Clínicas
-- =================================================

-- 1. TABELA DE CONSENTIMENTOS LGPD
-- =================================================
CREATE TABLE IF NOT EXISTS public.lgpd_consent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'registration', 'data_processing', 'marketing', 'cookies'
  consent_version TEXT NOT NULL, -- versão dos termos
  consent_text TEXT NOT NULL, -- texto exato do consentimento
  consent_given BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lgpd_consent_user_id ON public.lgpd_consent_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_consent_type ON public.lgpd_consent_logs (consent_type);
CREATE INDEX IF NOT EXISTS idx_lgpd_consent_created ON public.lgpd_consent_logs (created_at);

-- RLS
ALTER TABLE public.lgpd_consent_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view own consent logs" ON public.lgpd_consent_logs;
CREATE POLICY "Users can view own consent logs" ON public.lgpd_consent_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consent logs" ON public.lgpd_consent_logs;
CREATE POLICY "Users can insert own consent logs" ON public.lgpd_consent_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all consent logs" ON public.lgpd_consent_logs;
CREATE POLICY "Admins can view all consent logs" ON public.lgpd_consent_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 2. TABELA DE SOLICITAÇÕES DE DADOS (LGPD Art. 18)
-- =================================================
CREATE TABLE IF NOT EXISTS public.lgpd_data_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL, -- 'access', 'portability', 'correction', 'deletion', 'anonymization'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  description TEXT,
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processing_notes TEXT,
  ip_address INET,
  user_agent TEXT,
  deadline_date TIMESTAMP WITH TIME ZONE, -- prazo para resposta (15 dias)
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lgpd_requests_user_id ON public.lgpd_data_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_requests_type ON public.lgpd_data_requests (request_type);
CREATE INDEX IF NOT EXISTS idx_lgpd_requests_status ON public.lgpd_data_requests (status);
CREATE INDEX IF NOT EXISTS idx_lgpd_requests_deadline ON public.lgpd_data_requests (deadline_date);

-- RLS
ALTER TABLE public.lgpd_data_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view own data requests" ON public.lgpd_data_requests;
CREATE POLICY "Users can view own data requests" ON public.lgpd_data_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own data requests" ON public.lgpd_data_requests;
CREATE POLICY "Users can create own data requests" ON public.lgpd_data_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all data requests" ON public.lgpd_data_requests;
CREATE POLICY "Admins can manage all data requests" ON public.lgpd_data_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 3. TABELA DE AUDITORIA LGPD
-- =================================================
CREATE TABLE IF NOT EXISTS public.lgpd_audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'data_access', 'data_export', 'data_deletion', 'consent_update', 'policy_update'
  resource_type TEXT NOT NULL, -- 'user_profile', 'analytics_data', 'auth_logs', etc.
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  justification TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lgpd_audit_user_id ON public.lgpd_audit_trail (user_id);
CREATE INDEX IF NOT EXISTS idx_lgpd_audit_action ON public.lgpd_audit_trail (action_type);
CREATE INDEX IF NOT EXISTS idx_lgpd_audit_resource ON public.lgpd_audit_trail (resource_type);
CREATE INDEX IF NOT EXISTS idx_lgpd_audit_created ON public.lgpd_audit_trail (created_at);

-- RLS
ALTER TABLE public.lgpd_audit_trail ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Admins can view audit trail" ON public.lgpd_audit_trail;
CREATE POLICY "Admins can view audit trail" ON public.lgpd_audit_trail
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON public.lgpd_audit_trail;
CREATE POLICY "System can insert audit logs" ON public.lgpd_audit_trail
  FOR INSERT WITH CHECK (true);

-- 4. TABELA DE VERSÕES DOS TERMOS
-- =================================================
CREATE TABLE IF NOT EXISTS public.lgpd_terms_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'privacy_policy', 'terms_of_use', 'consent_form'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lgpd_terms_version ON public.lgpd_terms_versions (version);
CREATE INDEX IF NOT EXISTS idx_lgpd_terms_type ON public.lgpd_terms_versions (type);
CREATE INDEX IF NOT EXISTS idx_lgpd_terms_active ON public.lgpd_terms_versions (is_active);

-- RLS
ALTER TABLE public.lgpd_terms_versions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Anyone can read active terms" ON public.lgpd_terms_versions;
CREATE POLICY "Anyone can read active terms" ON public.lgpd_terms_versions
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage terms" ON public.lgpd_terms_versions;
CREATE POLICY "Admins can manage terms" ON public.lgpd_terms_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 5. ATUALIZAR TABELA USER_PROFILES PARA LGPD
-- =================================================
DO $$ 
BEGIN
  -- Adicionar campos LGPD se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'lgpd_consent_date') THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN lgpd_consent_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN lgpd_consent_version TEXT,
    ADD COLUMN data_retention_period INTERVAL DEFAULT INTERVAL '5 years',
    ADD COLUMN marketing_consent BOOLEAN DEFAULT false,
    ADD COLUMN analytics_consent BOOLEAN DEFAULT false,
    ADD COLUMN data_processing_purpose JSONB DEFAULT '["security", "service_provision"]',
    ADD COLUMN last_data_export TIMESTAMP WITH TIME ZONE,
    ADD COLUMN deletion_requested BOOLEAN DEFAULT false,
    ADD COLUMN deletion_scheduled_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 6. INSERIR VERSÕES INICIAIS DOS TERMOS
-- =================================================
INSERT INTO public.lgpd_terms_versions (version, type, title, content, effective_date, created_by) 
VALUES 
(
  'v1.0.0',
  'privacy_policy',
  'Política de Privacidade VidaShield',
  'Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais no VidaShield.

**1. DADOS COLETADOS**
- Informações de identificação (nome, email, telefone)
- Dados de autenticação e segurança
- Logs de atividade e acesso
- Dados de uso da plataforma

**2. FINALIDADES DO TRATAMENTO**
- Provisão do serviço de segurança digital
- Autenticação e controle de acesso
- Detecção e prevenção de ameaças
- Comunicação sobre o serviço
- Cumprimento de obrigações legais

**3. BASE LEGAL (LGPD Art. 7)**
- Execução de contrato (Art. 7, V)
- Legítimo interesse (Art. 7, IX) para segurança
- Consentimento para comunicações não essenciais

**4. COMPARTILHAMENTO**
Não compartilhamos dados pessoais com terceiros, exceto:
- Quando exigido por lei
- Para cumprimento de ordem judicial
- Com seu consentimento expresso

**5. SEUS DIREITOS (LGPD Art. 18)**
- Confirmação da existência de tratamento
- Acesso aos dados
- Correção de dados incompletos/incorretos
- Anonimização ou eliminação
- Portabilidade dos dados
- Revogação do consentimento

**6. RETENÇÃO DE DADOS**
- Dados mantidos pelo tempo necessário para as finalidades
- Período padrão: 5 anos após término da relação
- Dados podem ser anonimizados para estatísticas

**7. SEGURANÇA**
- Criptografia de dados sensíveis
- Controles de acesso rigorosos
- Monitoramento 24/7
- Backups seguros

**8. CONTATO**
Para exercer seus direitos ou esclarecer dúvidas:
- Email: privacidade@vidashield.com.br
- Prazo de resposta: até 15 dias

**Data de vigência:** ' || NOW() || '
**Versão:** v1.0.0',
  NOW(),
  NULL
),
(
  'v1.0.0',
  'consent_form',
  'Termo de Consentimento LGPD',
  'Ao utilizar o VidaShield, você está consentindo com:

**✓ COLETA E PROCESSAMENTO** dos seus dados pessoais para:
- Provisão do serviço de segurança digital
- Autenticação e controle de acesso
- Detecção de ameaças e vulnerabilidades
- Comunicação sobre atualizações do serviço

**✓ ARMAZENAMENTO SEGURO** dos seus dados por até 5 anos

**✓ GERAÇÃO DE LOGS** de atividade para auditoria e segurança

**CONSENTIMENTOS OPCIONAIS:**
□ Aceito receber comunicações de marketing
□ Autorizo uso de dados para analytics e melhorias
□ Aceito cookies não essenciais

**SEUS DIREITOS:**
Você pode a qualquer momento solicitar acesso, correção, exclusão ou portabilidade dos seus dados através do menu "Meus Dados" ou contactando privacidade@vidashield.com.br

**Ao clicar "Aceito", você confirma ter lido e concordado com esta política.**

Versão: v1.0.0 | Data: ' || NOW(),
  NOW(),
  NULL
) ON CONFLICT (version, type) DO NOTHING;

-- 7. FUNÇÕES PARA AUTOMAÇÃO LGPD
-- =================================================

-- Função para registrar consentimento
CREATE OR REPLACE FUNCTION register_lgpd_consent(
  p_user_id UUID,
  p_consent_type TEXT,
  p_consent_given BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  current_version TEXT;
  consent_id UUID;
BEGIN
  -- Obter versão atual dos termos
  SELECT version INTO current_version 
  FROM lgpd_terms_versions 
  WHERE type = 'consent_form' AND is_active = true
  ORDER BY effective_date DESC 
  LIMIT 1;

  -- Registrar consentimento
  INSERT INTO lgpd_consent_logs (
    user_id, 
    consent_type, 
    consent_version, 
    consent_text, 
    consent_given,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_consent_type,
    current_version,
    (SELECT content FROM lgpd_terms_versions WHERE version = current_version AND type = 'consent_form'),
    p_consent_given,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO consent_id;

  -- Atualizar perfil do usuário
  UPDATE user_profiles 
  SET 
    lgpd_consent_date = NOW(),
    lgpd_consent_version = current_version
  WHERE id = p_user_id;

  RETURN consent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para audit trail automático
CREATE OR REPLACE FUNCTION log_lgpd_audit(
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_performed_by UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO lgpd_audit_trail (
    user_id,
    action_type,
    resource_type,
    resource_id,
    performed_by,
    metadata
  ) VALUES (
    p_user_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    COALESCE(p_performed_by, auth.uid()),
    p_metadata
  ) RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGERS PARA AUDIT TRAIL AUTOMÁTICO
-- =================================================

-- Trigger para user_profiles
CREATE OR REPLACE FUNCTION trigger_user_profile_audit() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    PERFORM log_lgpd_audit(
      NEW.id,
      'data_update',
      'user_profile',
      NEW.id::TEXT,
      auth.uid(),
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_lgpd_audit(
      OLD.id,
      'data_deletion',
      'user_profile',
      OLD.id::TEXT,
      auth.uid(),
      jsonb_build_object('deleted_data', to_jsonb(OLD))
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS user_profile_audit_trigger ON public.user_profiles;
CREATE TRIGGER user_profile_audit_trigger
  AFTER UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_user_profile_audit();

-- =================================================
-- DADOS DE EXEMPLO PARA DEMONSTRAÇÃO
-- =================================================

-- Inserir alguns consentimentos de exemplo (apenas se não existirem usuários)
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- Selecionar um usuário existente para exemplo
  SELECT id INTO sample_user_id 
  FROM auth.users 
  LIMIT 1;

  IF sample_user_id IS NOT NULL THEN
    -- Registrar consentimento de exemplo
    PERFORM register_lgpd_consent(
      sample_user_id,
      'registration',
      true,
      '192.168.1.100'::INET,
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    -- Inserir solicitação de dados de exemplo
    INSERT INTO lgpd_data_requests (
      user_id,
      request_type,
      status,
      description,
      deadline_date
    ) VALUES (
      sample_user_id,
      'access',
      'completed',
      'Solicitação de acesso aos dados pessoais conforme LGPD Art. 18',
      NOW() + INTERVAL '15 days'
    );
  END IF;
END $$;

-- =================================================
-- VERIFICAÇÃO FINAL
-- =================================================

-- Verificar tabelas criadas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'lgpd_%'
ORDER BY tablename;

-- Mostrar estatísticas das tabelas LGPD
SELECT 
  'lgpd_consent_logs' as tabela,
  COUNT(*) as registros
FROM lgpd_consent_logs
UNION ALL
SELECT 
  'lgpd_data_requests',
  COUNT(*)
FROM lgpd_data_requests
UNION ALL
SELECT 
  'lgpd_audit_trail',
  COUNT(*)
FROM lgpd_audit_trail
UNION ALL
SELECT 
  'lgpd_terms_versions',
  COUNT(*)
FROM lgpd_terms_versions; 