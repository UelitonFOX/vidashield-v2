-- Setup completo para VidaShield - Clínica VidaMais
-- Dr. Rodrigo, Palmital/PR
-- Sistema de segurança cibernética para dados médicos

-- 1. Criar tabela user_profiles se não existir
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'operator')),
  department text,
  phone text,
  bio text,
  job_title text,
  emergency_contact jsonb,
  two_factor_enabled boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  preferences jsonb DEFAULT '{
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": true,
      "security": true,
      "updates": false
    },
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "notificationSound": "beep"
  }'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles (email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles (role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles (status);

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Inserir Dr. Rodrigo
INSERT INTO public.user_profiles (
  id,
  email,
  name,
  role,
  department,
  phone,
  avatar_url,
  two_factor_enabled,
  email_verified,
  status,
  preferences,
  bio,
  emergency_contact,
  job_title
) VALUES (
  '94eb660b-01c7-42a7-a00e-2b93df671fdb',
  'dr.rodrigo@vidamais.com.br',
  'Dr. Rodrigo Silva',
  'admin',
  'Administração',
  '(43) 99999-0001',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  false,
  true,
  'active',
  jsonb_build_object(
    'theme', 'dark',
    'notifications', jsonb_build_object(
      'email', true,
      'push', true,
      'security', true,
      'updates', true
    ),
    'language', 'pt-BR',
    'timezone', 'America/Sao_Paulo',
    'notificationSound', 'chime'
  ),
  'Proprietário e diretor médico da Clínica VidaMais em Palmital/PR. Especialista em administração hospitalar com foco em segurança cibernética para dados médicos. Após recente tentativa de invasão, implementou sistema automatizado de detecção e resposta a ameaças para proteger 12 mil prontuários digitais da população local.',
  jsonb_build_object(
    'name', 'Dra. Maria Silva',
    'phone', '(43) 99999-0002',
    'relationship', 'Esposa',
    'email', 'dra.maria@vidamais.com.br'
  ),
  'Proprietário da Clínica VidaMais'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  phone = EXCLUDED.phone,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  emergency_contact = EXCLUDED.emergency_contact,
  job_title = EXCLUDED.job_title,
  updated_at = NOW();

-- 3. Funções para notificações de aprovação
CREATE OR REPLACE FUNCTION notify_admin_new_pending_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar admins quando usuário se registra mas não confirma email
  IF NEW.email_confirmed_at IS NULL AND NEW.confirmation_sent_at IS NOT NULL THEN
    INSERT INTO notifications (
      type,
      title,
      message,
      severity,
      metadata,
      action_url,
      user_id
    )
    SELECT 
      'auth',
      'Novo Usuário Aguardando Aprovação',
      'Um novo usuário (' || COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || ') está aguardando aprovação para acessar o sistema.',
      'media',
      jsonb_build_object(
        'pending_user_id', NEW.id,
        'pending_user_email', NEW.email,
        'pending_user_name', NEW.raw_user_meta_data->>'full_name',
        'requested_at', NEW.created_at,
        'requested_role', NEW.raw_user_meta_data->>'role'
      ),
      '/aprovacao-usuarios',
      up.id
    FROM user_profiles up
    WHERE up.role = 'admin' AND up.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para notificar usuário sobre aprovação/rejeição
CREATE OR REPLACE FUNCTION create_user_approval_notification(
  p_user_id uuid,
  p_user_email text,
  p_user_name text,
  p_action text, -- 'approved' ou 'rejected'
  p_admin_name text DEFAULT 'Administrador'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    type,
    title,
    message,
    severity,
    user_id,
    metadata,
    action_url
  ) VALUES (
    'auth',
    CASE 
      WHEN p_action = 'approved' THEN 'Acesso Aprovado - Clínica VidaMais'
      ELSE 'Solicitação de Acesso Negada'
    END,
    CASE 
      WHEN p_action = 'approved' THEN 'Parabéns! Sua conta foi aprovada por ' || p_admin_name || '. Você já pode acessar o sistema de segurança da Clínica VidaMais.'
      ELSE 'Sua solicitação foi negada por ' || p_admin_name || '. Entre em contato com a administração para mais informações.'
    END,
    CASE WHEN p_action = 'approved' THEN 'baixa' ELSE 'alta' END,
    p_user_id,
    jsonb_build_object(
      'action', p_action,
      'admin_name', p_admin_name,
      'user_email', p_user_email,
      'approval_time', NOW(),
      'clinic', 'Clínica VidaMais',
      'location', 'Palmital/PR'
    ),
    CASE WHEN p_action = 'approved' THEN '/dashboard' ELSE '/contato' END
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- 5. Trigger automático para novos usuários
DROP TRIGGER IF EXISTS notify_admin_new_pending_user_trigger ON auth.users;
CREATE TRIGGER notify_admin_new_pending_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_pending_user();

-- 6. Notificações iniciais
INSERT INTO notifications (type, title, message, severity, metadata, action_url) VALUES
(
  'system',
  'VidaShield Ativo - Clínica VidaMais',
  'Sistema de segurança cibernética iniciado pelo Dr. Rodrigo Silva. Proteção ativa para 12 mil prontuários digitais em Palmital/PR.',
  'baixa',
  jsonb_build_object(
    'admin', 'Dr. Rodrigo Silva',
    'clinic', 'Clínica VidaMais',
    'location', 'Palmital/PR',
    'population', 12000,
    'setup_date', NOW()
  ),
  '/dashboard'
),
(
  'security',
  'Monitoramento de Ameaças Ativo',
  'Detecção automatizada de invasões configurada. Sistema monitora logs de acesso e reporta tentativas de invasão em tempo real.',
  'media',
  jsonb_build_object(
    'feature', 'threat_detection',
    'status', 'active',
    'protection_level', 'maximum'
  ),
  '/security-dashboard'
);

-- 7. Notificar sobre usuários pendentes existentes
INSERT INTO notifications (
  type,
  title,
  message,
  severity,
  metadata,
  action_url,
  user_id
)
SELECT 
  'auth',
  CASE 
    WHEN COUNT(*) = 1 THEN 'Usuário Aguardando Aprovação'
    ELSE COUNT(*)::text || ' Usuários Aguardando Aprovação'
  END,
  CASE 
    WHEN COUNT(*) = 1 THEN 'Existe 1 usuário aguardando aprovação para acessar o sistema.'
    ELSE 'Existem ' || COUNT(*) || ' usuários aguardando aprovação para acessar o sistema.'
  END,
  'media',
  jsonb_build_object(
    'pending_count', COUNT(*),
    'check_time', NOW(),
    'clinic', 'Clínica VidaMais'
  ),
  '/aprovacao-usuarios',
  '94eb660b-01c7-42a7-a00e-2b93df671fdb'
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email_confirmed_at IS NULL 
  AND (up.id IS NULL OR up.status != 'active')
HAVING COUNT(*) > 0;

-- 8. Verificação final
SELECT 
  'Setup Status' as categoria,
  CASE 
    WHEN EXISTS(SELECT 1 FROM user_profiles WHERE id = '94eb660b-01c7-42a7-a00e-2b93df671fdb') 
    THEN '✅ Dr. Rodrigo configurado como admin'
    ELSE '❌ Erro na configuração'
  END as status
UNION ALL
SELECT 
  'Notificações',
  '✅ ' || COUNT(*)::text || ' notificações criadas'
FROM notifications 
WHERE created_at > NOW() - INTERVAL '1 minute'
UNION ALL
SELECT 
  'Usuários Pendentes',
  COALESCE(COUNT(*)::text, '0') || ' usuários aguardando aprovação'
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email_confirmed_at IS NULL 
  AND (up.id IS NULL OR up.status != 'active'); 