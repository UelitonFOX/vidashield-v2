-- Script para configurar segurança no Supabase para as tabelas do VidaShield
-- Execute isso no Editor SQL do Supabase

-- 1. Revogar todas as permissões públicas para a tabela 'user'
REVOKE ALL ON TABLE "user" FROM anon;
REVOKE ALL ON TABLE "user" FROM public;

-- 2. Revogar todas as permissões públicas para a tabela 'alert'
REVOKE ALL ON TABLE "alert" FROM anon;
REVOKE ALL ON TABLE "alert" FROM public;

-- 3. Conceder permissões apenas para roles apropriados para 'user'
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "user" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "user" TO service_role;

-- 4. Conceder permissões apenas para roles apropriados para 'alert'
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "alert" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "alert" TO service_role;

-- 5. Habilitar Row Level Security (opcional - só habilite se for implementar políticas)
-- ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "alert" ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança (opcional - exemplos)
-- CREATE POLICY "Usuários podem ver apenas seus próprios dados" 
--   ON "user" FOR SELECT 
--   USING (auth.uid() = id);

-- CREATE POLICY "Usuários podem ver apenas seus próprios alertas" 
--   ON "alert" FOR SELECT 
--   USING (auth.uid() = user_id);