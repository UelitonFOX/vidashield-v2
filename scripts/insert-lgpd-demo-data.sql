-- =================================================
-- DADOS DE DEMONSTRAÇÃO LGPD - VIDASHIELD
-- Sistema completo de compliance para apresentação
-- =================================================

-- Inserir versões dos termos de exemplo
INSERT INTO public.lgpd_terms_versions (version, type, title, content, effective_date, is_active) VALUES 
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
  true
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
  true
) ON CONFLICT (version, type) DO NOTHING;

-- Função para gerar dados de demonstração
DO $$
DECLARE
  demo_user_id UUID;
  admin_user_id UUID;
  i INTEGER;
BEGIN
  -- Obter usuários existentes para demonstração
  SELECT id INTO demo_user_id FROM auth.users WHERE email LIKE '%demo%' OR email LIKE '%test%' LIMIT 1;
  SELECT id INTO admin_user_id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1;
  
  -- Se não encontrar usuários, usar o primeiro disponível
  IF demo_user_id IS NULL THEN
    SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
  END IF;
  
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users OFFSET 1 LIMIT 1;
  END IF;
  
  -- Inserir apenas se temos usuários
  IF demo_user_id IS NOT NULL THEN
    
    -- 1. LOGS DE CONSENTIMENTO (variados e realistas)
    INSERT INTO public.lgpd_consent_logs (user_id, consent_type, consent_version, consent_text, consent_given, ip_address, user_agent, created_at) VALUES
    (demo_user_id, 'registration', 'v1.0.0', 'Consentimento inicial para uso da plataforma VidaShield', true, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '30 days'),
    (demo_user_id, 'marketing', 'v1.0.0', 'Consentimento para recebimento de emails marketing', true, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '30 days'),
    (demo_user_id, 'analytics', 'v1.0.0', 'Consentimento para uso de dados em analytics', true, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '25 days'),
    (demo_user_id, 'cookies', 'v1.0.0', 'Consentimento para cookies não essenciais', false, '192.168.1.105', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', NOW() - INTERVAL '20 days'),
    (demo_user_id, 'marketing', 'v1.0.0', 'Revogação do consentimento de marketing', false, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '10 days');

    -- 2. SOLICITAÇÕES DE DADOS (demonstrando diferentes tipos e status)
    INSERT INTO public.lgpd_data_requests (user_id, request_type, status, description, request_data, deadline_date, created_at, completed_at) VALUES
    (demo_user_id, 'access', 'completed', 'Solicitação de acesso aos dados pessoais conforme LGPD Art. 18', 
     '{"reason": "verificacao_dados", "scope": "complete"}', 
     NOW() + INTERVAL '15 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),
    
    (demo_user_id, 'portability', 'completed', 'Exportação dos dados para transferência para outro sistema', 
     '{"format": "json", "include_logs": true}', 
     NOW() + INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days'),
    
    (demo_user_id, 'correction', 'processing', 'Correção do nome no perfil e atualização de telefone', 
     '{"field": "full_name", "old_value": "João Silva", "new_value": "João da Silva Santos"}', 
     NOW() + INTERVAL '10 days', NOW() - INTERVAL '5 days', NULL),
    
    (demo_user_id, 'anonymization', 'pending', 'Anonimização de dados de analytics mais antigos que 2 anos', 
     '{"scope": "analytics", "cutoff_date": "2022-01-01"}', 
     NOW() + INTERVAL '12 days', NOW() - INTERVAL '3 days', NULL);

    -- Adicionar solicitação de admin se disponível
    IF admin_user_id IS NOT NULL THEN
      INSERT INTO public.lgpd_data_requests (user_id, request_type, status, description, deadline_date, created_at) VALUES
      (admin_user_id, 'access', 'pending', 'Auditoria de dados para verificação de compliance', NOW() + INTERVAL '14 days', NOW() - INTERVAL '1 day');
    END IF;

    -- 3. TRILHA DE AUDITORIA (eventos importantes)
    INSERT INTO public.lgpd_audit_trail (user_id, action_type, resource_type, resource_id, performed_by, metadata, created_at) VALUES
    (demo_user_id, 'data_export', 'user_data', demo_user_id::text, demo_user_id, 
     '{"export_type": "complete", "file_size": "2.3MB", "format": "json"}', NOW() - INTERVAL '10 days'),
    
    (demo_user_id, 'consent_update', 'consent', demo_user_id::text, demo_user_id, 
     '{"consent_type": "marketing", "action": "revoked", "reason": "user_request"}', NOW() - INTERVAL '10 days'),
    
    (demo_user_id, 'data_access', 'user_profile', demo_user_id::text, demo_user_id, 
     '{"accessed_sections": ["profile", "consent_logs", "data_requests"], "access_reason": "lgpd_request"}', NOW() - INTERVAL '18 days'),
    
    (demo_user_id, 'data_request_created', 'lgpd_data_request', '', demo_user_id, 
     '{"request_type": "correction", "description": "profile_update"}', NOW() - INTERVAL '5 days'),
    
    (demo_user_id, 'policy_acceptance', 'terms_version', 'v1.0.0', demo_user_id, 
     '{"policy_type": "privacy_policy", "version": "v1.0.0", "ip": "192.168.1.100"}', NOW() - INTERVAL '30 days');

    -- 4. ATUALIZAR PERFIS COM DADOS LGPD
    UPDATE public.user_profiles 
    SET 
      lgpd_consent_date = NOW() - INTERVAL '30 days',
      lgpd_consent_version = 'v1.0.0',
      marketing_consent = false, -- Revogado posteriormente
      analytics_consent = true,
      last_data_export = NOW() - INTERVAL '10 days',
      data_retention_period = INTERVAL '5 years'
    WHERE id = demo_user_id;

    -- Atualizar admin se disponível
    IF admin_user_id IS NOT NULL THEN
      UPDATE public.user_profiles 
      SET 
        lgpd_consent_date = NOW() - INTERVAL '25 days',
        lgpd_consent_version = 'v1.0.0',
        marketing_consent = true,
        analytics_consent = true
      WHERE id = admin_user_id;
    END IF;

    -- 5. DADOS ADICIONAIS PARA ANALYTICS
    -- Inserir alguns logs de consentimento de outros usuários (para estatísticas)
    FOR i IN 1..8 LOOP
      INSERT INTO public.lgpd_consent_logs (user_id, consent_type, consent_version, consent_text, consent_given, ip_address, created_at) VALUES
      (demo_user_id, 'registration', 'v1.0.0', 'Consentimento automático simulado', true, '192.168.1.' || (100 + i), NOW() - INTERVAL (i || ' days'));
    END LOOP;

    RAISE NOTICE 'Dados de demonstração LGPD inseridos com sucesso!';
    RAISE NOTICE 'Usuário principal: %', demo_user_id;
    RAISE NOTICE 'Consentimentos: 5 registros';
    RAISE NOTICE 'Solicitações: 4-5 registros';
    RAISE NOTICE 'Auditoria: 5 registros';
    
  ELSE
    RAISE NOTICE 'Nenhum usuário encontrado para inserção de dados de demonstração';
  END IF;
  
END $$;

-- 6. VERIFICAR DADOS INSERIDOS
SELECT 
  'Logs de Consentimento' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN consent_given = true THEN 1 END) as concedidos,
  COUNT(CASE WHEN consent_given = false THEN 1 END) as negados
FROM lgpd_consent_logs

UNION ALL

SELECT 
  'Solicitações de Dados',
  COUNT(*),
  COUNT(CASE WHEN status = 'completed' THEN 1 END),
  COUNT(CASE WHEN status = 'pending' THEN 1 END)
FROM lgpd_data_requests

UNION ALL

SELECT 
  'Trilha de Auditoria',
  COUNT(*),
  COUNT(CASE WHEN action_type = 'data_export' THEN 1 END),
  COUNT(CASE WHEN action_type = 'consent_update' THEN 1 END)
FROM lgpd_audit_trail

UNION ALL

SELECT 
  'Termos Ativos',
  COUNT(*),
  COUNT(CASE WHEN type = 'privacy_policy' THEN 1 END),
  COUNT(CASE WHEN type = 'consent_form' THEN 1 END)
FROM lgpd_terms_versions
WHERE is_active = true;

-- 7. RESUMO PARA APRESENTAÇÃO
SELECT 
  '🎯 SISTEMA LGPD VIDASHIELD - DADOS DEMONSTRAÇÃO' as titulo,
  '✅ Compliance completo implementado' as status,
  '📊 Dados realistas para apresentação' as detalhes;

SELECT 
  'FUNCIONALIDADES IMPLEMENTADAS:' as categoria,
  '• Modal de Consentimento Interativo' as item
UNION ALL SELECT '', '• Portal "Meus Dados" Completo'
UNION ALL SELECT '', '• Exportação de Dados (JSON)'
UNION ALL SELECT '', '• Solicitações LGPD (Art. 18)'
UNION ALL SELECT '', '• Trilha de Auditoria Automática'
UNION ALL SELECT '', '• Widget Dashboard Premium'
UNION ALL SELECT '', '• Gestão de Versões de Termos'
UNION ALL SELECT '', '• Controle de Consentimentos'
UNION ALL SELECT '', '• Logs Detalhados de Atividade'
UNION ALL SELECT '', '• Interface Premium Responsiva';

-- 8. ESTATÍSTICAS PARA DASHBOARD
WITH stats AS (
  SELECT 
    COUNT(DISTINCT user_id) as users_with_consent,
    COUNT(*) as total_consents,
    COUNT(CASE WHEN consent_given = true THEN 1 END) as consents_given,
    COUNT(CASE WHEN consent_given = false THEN 1 END) as consents_denied
  FROM lgpd_consent_logs
),
requests AS (
  SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN deadline_date < NOW() AND status = 'pending' THEN 1 END) as overdue
  FROM lgpd_data_requests
)
SELECT 
  '📈 MÉTRICAS LGPD PARA APRESENTAÇÃO' as dashboard,
  s.users_with_consent || ' usuários com consentimento' as users,
  ROUND((s.consents_given::numeric / s.total_consents) * 100, 1) || '% taxa de consentimento' as consent_rate,
  r.total_requests || ' solicitações total' as requests,
  r.pending || ' pendentes, ' || r.overdue || ' em atraso' as status
FROM stats s, requests r; 