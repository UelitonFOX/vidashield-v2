-- Corrigir políticas RLS para tabela notifications
-- Este arquivo resolve o problema de user_id incompatível

-- 1. Verificar se as políticas existem e removê-las
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON notifications;

-- 2. Habilitar RLS na tabela
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas mais permissivas para demonstração
-- POLÍTICA SELECT: Usuários podem ver suas próprias notificações
CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- POLÍTICA INSERT: Usuários podem criar notificações para si mesmos
CREATE POLICY "notifications_insert_policy" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- POLÍTICA UPDATE: Usuários podem atualizar suas próprias notificações
CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- POLÍTICA DELETE: Usuários podem deletar suas próprias notificações
CREATE POLICY "notifications_delete_policy" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- 4. [OPCIONAL] Política de ADMIN para ver todas as notificações
-- (Descomente se quiser que admins vejam tudo)
/*
CREATE POLICY "notifications_admin_policy" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
*/

-- 5. Atualizar notificações existentes sem user_id
-- Atribuir ao primeiro usuário encontrado na tabela profiles
UPDATE notifications 
SET user_id = (
    SELECT id FROM profiles LIMIT 1
)
WHERE user_id IS NULL;

-- 6. Verificar resultado
SELECT 
    'POLÍTICAS RLS' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

-- Exibir estatísticas das notificações
SELECT 
    'ESTATÍSTICAS' as info,
    COUNT(*) as total_notifications,
    COUNT(DISTINCT user_id) as usuarios_com_notifications,
    COUNT(CASE WHEN read = true THEN 1 END) as lidas,
    COUNT(CASE WHEN read = false THEN 1 END) as nao_lidas
FROM notifications; 