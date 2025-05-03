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

-- 5. Habilitar Row Level Security
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alert" ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança
-- Usuários podem ver apenas seus próprios dados, exceto administradores que podem ver todos
CREATE POLICY "Usuários veem apenas seus dados" 
  ON "user" FOR SELECT 
  USING (
    auth.uid()::text = id::text 
    OR 
    EXISTS (
      SELECT 1 FROM "user" WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Políticas para alertas - usuários normais veem apenas seus alertas, admins e gerentes veem todos
CREATE POLICY "Política de visualização de alertas" 
  ON "alert" FOR SELECT 
  USING (
    user_id::text = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id::text = auth.uid()::text 
      AND (role = 'admin' OR role = 'gerente')
    )
  );

-- Políticas para inserção de alertas - qualquer usuário autenticado pode criar alertas
CREATE POLICY "Política de criação de alertas"
  ON "alert" FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para atualização de alertas - apenas administradores e gerentes podem resolver alertas
CREATE POLICY "Política de atualização de alertas"
  ON "alert" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "user" 
      WHERE id::text = auth.uid()::text 
      AND (role = 'admin' OR role = 'gerente')
    )
  );