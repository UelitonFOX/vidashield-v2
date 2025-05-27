-- Script CONSERVADOR: Apenas ADICIONAR notificações com user_id correto
-- NÃO remove nada existente, apenas adiciona o que falta

-- 1. Verificar usuários existentes (para referência)
SELECT 'USUÁRIOS EXISTENTES' as info, id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Verificar notificações existentes
SELECT 
    'ESTATÍSTICAS ATUAIS' as info,
    COUNT(*) as total_notifications,
    COUNT(DISTINCT user_id) as usuarios_com_notifications,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as sem_user_id,
    COUNT(CASE WHEN read = true THEN 1 END) as lidas,
    COUNT(CASE WHEN read = false THEN 1 END) as nao_lidas
FROM notifications;

-- 3. APENAS inserir notificações de teste para o usuário atual
-- (Será executado pelo frontend quando o usuário clicar em "Limpar Antigas")

-- 4. [OPCIONAL] Se quiser atualizar notificações órfãs para um usuário específico:
-- Descomente e substitua 'SEU_USER_ID_AQUI' pelo ID real
/*
UPDATE notifications 
SET user_id = 'SEU_USER_ID_AQUI'
WHERE user_id IS NULL 
OR user_id NOT IN (SELECT id FROM auth.users);
*/

-- 5. Verificar estatísticas finais
SELECT 
    'VERIFICAÇÃO FINAL' as info,
    COUNT(*) as total_notifications,
    COUNT(DISTINCT user_id) as usuarios_com_notifications,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as sem_user_id
FROM notifications; 