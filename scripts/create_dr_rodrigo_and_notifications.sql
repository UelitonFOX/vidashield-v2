-- Script para criar Dr. Rodrigo admin e sistema de notificações para aprovação de usuários
-- Data: 2025-05-26

-- 1. Criar perfil do Dr. Rodrigo (admin da Clínica VidaMais)
INSERT INTO user_profiles (
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
  job_title,
  created_at,
  updated_at
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
  '{
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": true,
      "security": true,
      "updates": true
    },
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "notificationSound": "chime"
  }'::jsonb,
  'Proprietário e diretor médico da Clínica VidaMais em Palmital/PR. Especialista em administração hospitalar com foco em segurança cibernética para dados médicos.',
  '{"name": "Dra. Maria Silva", "phone": "(43) 99999-0002", "relationship": "Esposa"}',
  'Proprietário da Clínica',
  NOW(),
  NOW()
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

-- 2. Função para notificar administradores sobre novos usuários pendentes
CREATE OR REPLACE FUNCTION notify_admin_new_pending_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar apenas quando usuário é criado mas não confirmado
  IF NEW.email_confirmed_at IS NULL AND NEW.confirmation_sent_at IS NOT NULL THEN
    -- Criar notificação para todos os admins
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
        'user_id', NEW.id,
        'user_email', NEW.email,
        'user_name', NEW.raw_user_meta_data->>'full_name',
        'requested_at', NEW.created_at,
        'role', NEW.raw_user_meta_data->>'role'
      ),
      '/aprovacao-usuarios',
      up.id
    FROM user_profiles up
    WHERE up.role = 'admin' AND up.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para notificar admins sobre novos usuários
DROP TRIGGER IF EXISTS notify_admin_new_pending_user_trigger ON auth.users;
CREATE TRIGGER notify_admin_new_pending_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_pending_user();

-- 4. Função para criar notificações de aprovação/rejeição
CREATE OR REPLACE FUNCTION create_user_approval_notification(
  p_user_id uuid,
  p_user_email text,
  p_user_name text,
  p_action text, -- 'approved' ou 'rejected'
  p_admin_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id uuid;
  notification_title text;
  notification_message text;
  notification_severity text;
BEGIN
  -- Definir título e mensagem baseado na ação
  IF p_action = 'approved' THEN
    notification_title := 'Conta Aprovada com Sucesso!';
    notification_message := 'Sua solicitação de acesso foi aprovada por ' || p_admin_name || '. Você já pode fazer login no sistema.';
    notification_severity := 'baixa';
  ELSIF p_action = 'rejected' THEN
    notification_title := 'Solicitação de Acesso Negada';
    notification_message := 'Sua solicitação de acesso foi negada por ' || p_admin_name || '. Entre em contato com a administração para mais informações.';
    notification_severity := 'alta';
  ELSE
    RAISE EXCEPTION 'Ação inválida: %. Use "approved" ou "rejected".', p_action;
  END IF;

  -- Criar notificação
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
    notification_title,
    notification_message,
    notification_severity,
    p_user_id,
    jsonb_build_object(
      'action', p_action,
      'admin_name', p_admin_name,
      'user_email', p_user_email,
      'approval_time', NOW()
    ),
    CASE WHEN p_action = 'approved' THEN '/dashboard' ELSE '/contato' END
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- 5. Notificação inicial sobre o Dr. Rodrigo
INSERT INTO notifications (
  type,
  title,
  message,
  severity,
  metadata,
  action_url
) VALUES (
  'system',
  'Admin da Clínica VidaMais Criado',
  'Dr. Rodrigo Silva foi configurado como administrador principal da Clínica VidaMais em Palmital/PR. Sistema de segurança cibernética ativo.',
  'baixa',
  jsonb_build_object(
    'admin_name', 'Dr. Rodrigo Silva',
    'clinic', 'Clínica VidaMais',
    'location', 'Palmital/PR',
    'role', 'Proprietário da Clínica',
    'setup_time', NOW()
  ),
  '/gerenciamento-usuarios'
);

-- 6. Criar notificação sobre novos usuários pendentes (baseado nos existentes)
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
  'Usuários Aguardando Aprovação',
  'Existem ' || COUNT(*) || ' usuários aguardando aprovação para acessar o sistema.',
  'media',
  jsonb_build_object(
    'pending_count', COUNT(*),
    'check_time', NOW()
  ),
  '/aprovacao-usuarios',
  '94eb660b-01c7-42a7-a00e-2b93df671fdb'
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email_confirmed_at IS NULL 
  AND (up.id IS NULL OR up.status != 'active')
HAVING COUNT(*) > 0;

-- 7. Verificar dados criados
SELECT 'Dr. Rodrigo Profile' as item, 
       CASE WHEN EXISTS(SELECT 1 FROM user_profiles WHERE id = '94eb660b-01c7-42a7-a00e-2b93df671fdb') 
            THEN '✅ Criado' 
            ELSE '❌ Erro' 
       END as status
UNION ALL
SELECT 'Notification Functions' as item, '✅ Configuradas' as status
UNION ALL
SELECT 'Admin Notifications' as item, 
       COUNT(*)::text || ' criadas' as status
FROM notifications 
WHERE user_id = '94eb660b-01c7-42a7-a00e-2b93df671fdb' 
  AND created_at > NOW() - INTERVAL '1 minute'; 