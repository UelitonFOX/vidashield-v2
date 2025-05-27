-- Script para configurar sistema de controle de acesso
-- Execute este script no SQL Editor do Supabase

-- 1. Criação das tabelas se não existirem
CREATE TABLE IF NOT EXISTS access_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('page', 'api', 'feature', 'action')),
    resource_path VARCHAR(500) NOT NULL UNIQUE,
    required_role VARCHAR(50) NOT NULL CHECK (required_role IN ('user', 'moderator', 'admin')),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('role_based', 'ip_based', 'time_based', 'custom')),
    conditions JSONB NOT NULL DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '{}',
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    resource_id UUID REFERENCES access_resources(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('access', 'denied', 'blocked')),
    result VARCHAR(50) NOT NULL CHECK (result IN ('allowed', 'denied', 'error')),
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    method VARCHAR(10),
    response_code INTEGER,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE access_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
-- Recursos: Admin pode gerenciar, moderator pode visualizar, user apenas consultar ativos
CREATE POLICY "admin_full_access_resources" ON access_resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "moderator_read_resources" ON access_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Políticas: Admin pode gerenciar, moderator pode visualizar
CREATE POLICY "admin_full_access_policies" ON access_policies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "moderator_read_policies" ON access_policies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Logs: Admin e moderator podem visualizar todos, user apenas seus próprios
CREATE POLICY "admin_moderator_read_all_logs" ON access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "user_read_own_logs" ON access_logs
    FOR SELECT USING (user_id = auth.uid());

-- Admin pode inserir logs para auditoria
CREATE POLICY "admin_insert_logs" ON access_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_access_resources_updated_at ON access_resources;
CREATE TRIGGER update_access_resources_updated_at
    BEFORE UPDATE ON access_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_access_policies_updated_at ON access_policies;
CREATE TRIGGER update_access_policies_updated_at
    BEFORE UPDATE ON access_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Inserir recursos do sistema (limpar antes de inserir)
DELETE FROM access_resources;

INSERT INTO access_resources (name, description, resource_type, resource_path, required_role, is_active) VALUES
('Dashboard Premium', 'Página principal do sistema com analytics avançados', 'page', '/dashboard', 'user', true),
('Dashboard Clássico', 'Versão clássica do dashboard', 'page', '/dashboard-classic', 'user', true),
('Alertas de Segurança', 'Gerenciamento de alertas e notificações', 'page', '/alertas', 'user', true),
('Monitoramento', 'Sistema de monitoramento em tempo real', 'page', '/monitoramento', 'user', true),
('Segurança Avançada', 'Painel de segurança e controle de ameaças', 'page', '/security', 'moderator', true),
('Logs de Autenticação', 'Visualização de logs de login e autenticação', 'page', '/logs', 'moderator', true),
('Ameaças Detectadas', 'Monitoramento de ameaças e incidentes', 'page', '/threats', 'user', true),
('IPs Bloqueados', 'Gerenciamento de IPs bloqueados', 'page', '/blocked-ips', 'user', true),
('Gerenciamento de Usuários', 'CRUD completo de usuários do sistema', 'page', '/usuarios', 'admin', true),
('Aprovação de Usuários', 'Sistema de aprovação de novos usuários', 'page', '/aprovacao-usuarios', 'admin', true),
('Sistema de Backup', 'Configuração e monitoramento de backups', 'page', '/backups', 'admin', true),
('Controle de Acesso', 'Gerenciamento de recursos e políticas de acesso', 'page', '/access-control', 'admin', true),
('Relatórios e Exportação', 'Sistema de relatórios e exportação de dados', 'page', '/relatorios', 'user', true),
('Configurações do Sistema', 'Configurações globais e administrativas', 'page', '/configuracoes', 'admin', true),
('Estatísticas Avançadas', 'Analytics e métricas detalhadas', 'page', '/estatisticas', 'user', true),
('Perfil do Usuário', 'Configurações pessoais do usuário', 'page', '/perfil', 'user', true),
('Central de Ajuda', 'Documentação e suporte', 'page', '/ajuda', 'user', true),
('API de Alertas', 'Endpoint para criação de alertas via API', 'api', '/api/alerts', 'moderator', true),
('API de Usuários', 'Endpoints para gerenciamento de usuários', 'api', '/api/users', 'admin', true),
('Exportação de Dados', 'Funcionalidade de exportar relatórios', 'feature', 'export_data', 'user', true);

-- 6. Inserir políticas de exemplo (limpar antes de inserir)
DELETE FROM access_policies;

INSERT INTO access_policies (name, description, policy_type, conditions, actions, priority, is_active) VALUES
('Acesso Admin Total', 'Administradores têm acesso completo a todos os recursos', 'role_based', 
 '{"roles": ["admin"], "resources": ["*"]}', 
 '{"allow": ["read", "write", "delete", "manage"]}', 
 100, true),

('Acesso Moderador Limitado', 'Moderadores podem acessar funcionalidades de segurança', 'role_based',
 '{"roles": ["moderator"], "resources": ["security", "logs", "alerts"]}',
 '{"allow": ["read", "write"], "deny": ["delete"]}',
 80, true),

('Restrição por IP Corporativo', 'Apenas IPs da rede corporativa podem acessar funcionalidades administrativas', 'ip_based',
 '{"allowed_ips": ["192.168.1.0/24", "10.0.0.0/8"], "blocked_ips": [], "resources": ["admin", "config"]}',
 '{"allow": ["read", "write"], "require_ip_whitelist": true}',
 90, true),

('Horário Comercial', 'Acesso a funções críticas apenas em horário comercial', 'time_based',
 '{"allowed_hours": {"start": "08:00", "end": "18:00"}, "allowed_days": [1,2,3,4,5], "timezone": "America/Sao_Paulo"}',
 '{"allow": ["read"], "time_restricted": ["write", "delete"]}',
 60, true),

('Política Customizada - Backup', 'Regras específicas para sistema de backup', 'custom',
 '{"min_role": "admin", "require_2fa": true, "max_concurrent_sessions": 1}',
 '{"allow": ["backup_create", "backup_restore"], "audit": true}',
 70, true);

-- 7. Inserir logs de exemplo (limpar antes de inserir)
DELETE FROM access_logs;

-- Buscar alguns IDs de usuários existentes para os logs
DO $$
DECLARE
    admin_user_id UUID;
    user_user_id UUID;
    dashboard_resource_id UUID;
    security_resource_id UUID;
BEGIN
    -- Buscar ID de um usuário admin
    SELECT user_id INTO admin_user_id 
    FROM user_profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    -- Buscar ID de um usuário comum
    SELECT user_id INTO user_user_id 
    FROM user_profiles 
    WHERE role = 'user' 
    LIMIT 1;
    
    -- Buscar IDs de recursos
    SELECT id INTO dashboard_resource_id 
    FROM access_resources 
    WHERE resource_path = '/dashboard' 
    LIMIT 1;
    
    SELECT id INTO security_resource_id 
    FROM access_resources 
    WHERE resource_path = '/security' 
    LIMIT 1;
    
    -- Inserir logs apenas se temos usuários
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO access_logs (user_id, resource_id, action, result, ip_address, user_agent, request_path, method, response_code, reason) VALUES
        (admin_user_id, dashboard_resource_id, 'access', 'allowed', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '/dashboard', 'GET', 200, 'Admin access granted'),
        (admin_user_id, security_resource_id, 'access', 'allowed', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '/security', 'GET', 200, 'Security page accessed'),
        (admin_user_id, dashboard_resource_id, 'access', 'allowed', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '/access-control', 'GET', 200, 'Access control page loaded');
    END IF;
    
    IF user_user_id IS NOT NULL THEN
        INSERT INTO access_logs (user_id, resource_id, action, result, ip_address, user_agent, request_path, method, response_code, reason) VALUES
        (user_user_id, dashboard_resource_id, 'access', 'allowed', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '/dashboard', 'GET', 200, 'User dashboard access'),
        (user_user_id, security_resource_id, 'denied', 'denied', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '/security', 'GET', 403, 'Insufficient privileges');
    END IF;
    
    -- Logs genéricos para demonstração
    INSERT INTO access_logs (user_id, action, result, ip_address, user_agent, request_path, method, response_code, reason, created_at) VALUES
    (NULL, 'access', 'denied', '203.0.113.45', 'curl/7.68.0', '/api/admin', 'POST', 401, 'Invalid authentication token', NOW() - INTERVAL '1 hour'),
    (NULL, 'blocked', 'denied', '198.51.100.22', 'python-requests/2.25.1', '/api/users', 'GET', 429, 'Rate limit exceeded', NOW() - INTERVAL '30 minutes'),
    (NULL, 'access', 'error', '192.0.2.15', 'Mozilla/5.0', '/dashboard', 'GET', 500, 'Internal server error', NOW() - INTERVAL '15 minutes');
    
END $$;

-- 8. Criar uma notificação sobre a configuração
INSERT INTO notifications (type, title, message, severity, metadata, action_url)
VALUES (
    'system',
    'Sistema de Controle de Acesso Configurado',
    'As tabelas e dados iniciais do sistema de controle de acesso foram criados com sucesso. 20 recursos, 5 políticas e logs demonstrativos foram adicionados.',
    'baixa',
    '{"tables_created": ["access_resources", "access_policies", "access_logs"], "resources_count": 20, "policies_count": 5}',
    '/access-control'
);

-- 9. Verificar se tudo foi criado corretamente
SELECT 'access_resources' as tabela, COUNT(*) as registros FROM access_resources
UNION ALL
SELECT 'access_policies' as tabela, COUNT(*) as registros FROM access_policies  
UNION ALL
SELECT 'access_logs' as tabela, COUNT(*) as registros FROM access_logs; 