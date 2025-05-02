-- Migração para PostgreSQL/Supabase
-- Este script altera as tabelas para usar UUID como chave primária

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migração da tabela user
BEGIN;

-- 1. Criar tabela temporária com nova estrutura
CREATE TABLE IF NOT EXISTS user_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(200),
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    oauth_provider VARCHAR(20),
    oauth_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(100) UNIQUE,
    reset_token_expires TIMESTAMP
);

-- 2. Copiar dados da tabela antiga (convertendo IDs)
INSERT INTO user_new (
    id, 
    email, 
    password_hash, 
    name, 
    role, 
    oauth_provider, 
    oauth_id, 
    created_at, 
    is_active, 
    email_verified, 
    reset_token, 
    reset_token_expires
)
SELECT 
    CASE 
        WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN id::uuid
        ELSE uuid_generate_v4()
    END,
    email, 
    password_hash, 
    name, 
    role, 
    oauth_provider, 
    oauth_id, 
    created_at, 
    is_active, 
    email_verified, 
    reset_token, 
    reset_token_expires
FROM "user";

-- 3. Remover tabela antiga e renomear a nova
DROP TABLE IF EXISTS "user";
ALTER TABLE user_new RENAME TO "user";

-- 4. Recriar índices e constraints
CREATE INDEX IF NOT EXISTS idx_user_email ON "user" (email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "user" (role);
CREATE INDEX IF NOT EXISTS idx_user_oauth ON "user" (oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;

COMMIT;

-- Migração da tabela alert
BEGIN;

-- 1. Criar tabela temporária com nova estrutura
CREATE TABLE IF NOT EXISTS alert_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_time TIMESTAMP,
    resolved_by UUID REFERENCES "user"(id),
    user_id UUID REFERENCES "user"(id)
);

-- 2. Copiar dados da tabela antiga (convertendo IDs)
INSERT INTO alert_new (
    id,
    type,
    severity,
    details,
    timestamp,
    resolved,
    resolved_time,
    resolved_by,
    user_id
)
SELECT 
    CASE 
        WHEN a.id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN a.id::uuid
        ELSE uuid_generate_v4()
    END,
    a.type,
    a.severity,
    a.details,
    a.timestamp,
    a.resolved,
    a.resolved_time,
    u1.id,
    u2.id
FROM alert a
LEFT JOIN "user" u1 ON u1.id::text = a.resolved_by::text
LEFT JOIN "user" u2 ON u2.id::text = a.user_id::text;

-- 3. Remover tabela antiga e renomear a nova
DROP TABLE IF EXISTS alert;
ALTER TABLE alert_new RENAME TO alert;

-- 4. Recriar índices e constraints
CREATE INDEX IF NOT EXISTS idx_alert_user ON alert (user_id);
CREATE INDEX IF NOT EXISTS idx_alert_type ON alert (type);
CREATE INDEX IF NOT EXISTS idx_alert_severity ON alert (severity);
CREATE INDEX IF NOT EXISTS idx_alert_timestamp ON alert (timestamp);

COMMIT;

-- Adicionar políticas RLS para segurança
BEGIN;

-- Habilitar RLS
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY user_select ON "user"
    FOR SELECT
    USING (
        auth.uid() = id::text 
        OR (SELECT role FROM "user" WHERE id::text = auth.uid()) = 'admin'
    );

CREATE POLICY user_update ON "user"
    FOR UPDATE
    USING (
        auth.uid() = id::text 
        OR (SELECT role FROM "user" WHERE id::text = auth.uid()) = 'admin'
    );

-- Políticas para alertas
CREATE POLICY alert_select ON alert
    FOR SELECT
    USING (
        user_id::text = auth.uid() 
        OR (SELECT role FROM "user" WHERE id::text = auth.uid()) IN ('admin', 'manager')
    );

CREATE POLICY alert_insert ON alert
    FOR INSERT
    WITH CHECK (
        user_id::text = auth.uid() 
        OR (SELECT role FROM "user" WHERE id::text = auth.uid()) IN ('admin', 'manager')
    );

CREATE POLICY alert_update ON alert
    FOR UPDATE
    USING (
        user_id::text = auth.uid() 
        OR (SELECT role FROM "user" WHERE id::text = auth.uid()) IN ('admin', 'manager')
    );

COMMIT;