-- Migração: Criar tabela para solicitações de acesso pendentes
-- Data: 2025-01-27
-- Autor: Sistema VidaShield

-- Criar tabela para solicitações de acesso pendentes
CREATE TABLE IF NOT EXISTS pending_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    google_id VARCHAR(255),
    department VARCHAR(255),
    phone VARCHAR(50),
    justification TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_requests_status ON pending_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_pending_requests_email ON pending_access_requests(email);
CREATE INDEX IF NOT EXISTS idx_pending_requests_user_id ON pending_access_requests(user_id);

-- Habilitar RLS
ALTER TABLE pending_access_requests ENABLE ROW LEVEL SECURITY;

-- Política para admins verem todas as solicitações
CREATE POLICY "Admins can view all requests" ON pending_access_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin' 
            AND user_profiles.status = 'active'
        )
    );

-- Política para usuários verem apenas suas próprias solicitações
CREATE POLICY "Users can view own requests" ON pending_access_requests
    FOR SELECT USING (user_id = auth.uid());

-- Política para inserir solicitações (qualquer usuário autenticado)
CREATE POLICY "Authenticated users can insert requests" ON pending_access_requests
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para admins atualizarem solicitações
CREATE POLICY "Admins can update requests" ON pending_access_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin' 
            AND user_profiles.status = 'active'
        )
    );

-- Comentários para documentação
COMMENT ON TABLE pending_access_requests IS 'Tabela para gerenciar solicitações de acesso pendentes ao sistema';
COMMENT ON COLUMN pending_access_requests.user_id IS 'ID do usuário no Supabase Auth';
COMMENT ON COLUMN pending_access_requests.email IS 'Email do usuário solicitante';
COMMENT ON COLUMN pending_access_requests.status IS 'Status da solicitação: pending, approved, rejected'; 