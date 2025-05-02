# TODO - Migração do Banco de Dados para Supabase

## Checklist de Migração

- [x] Analisar todos os arquivos de configuração e conexão do banco de dados
- [x] Listar todas as tabelas e modelos existentes
- [x] Gerar comandos SQL para criação das tabelas no Supabase
- [x] Atualizar variáveis de ambiente no `.env` (`SUPABASE_URL`, `SUPABASE_KEY`, `DATABASE_URL`)
- [x] Adaptar scripts e pontos de conexão para usar o PostgreSQL do Supabase
- [x] Criar/adaptar script de teste de conexão com o Supabase
- [x] Validar rotas e funcionalidades do backend com o novo banco
- [x] Atualizar o `README.md` com instruções de configuração e uso do Supabase
- [x] Atualizar/criar variáveis de ambiente no `.env` do frontend (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_API_KEY`, etc)
- [x] Marcar tarefas concluídas neste checklist

## Melhorias de Segurança Implementadas

- [x] Criação de arquivos `.env.example` com templates para backend e frontend
- [x] Remoção de credenciais e senhas hardcoded de todos os arquivos do projeto
- [x] Adição de logging adequado para monitoramento de erros e eventos
- [x] Melhoria da documentação com docstrings e comentários explicativos
- [x] Implementação de tratamento robusto de erros no código
- [x] Sanitização das URLs e senhas nos logs para não expor dados sensíveis
- [x] Verificação de conexão segura com o banco de dados

## Configurações de Segurança do Supabase

- [ ] Desabilitar permissões públicas ("anon") nas tabelas `user` e `alert` (operações SELECT, INSERT, UPDATE, DELETE)
- [ ] Manter apenas permissões para `authenticated` e `service_role` nas tabelas
- [ ] Verificar e corrigir alertas de segurança "RLS Disabled in Public"
- [ ] Considerar ativar Row Level Security (RLS) com políticas adequadas
- [ ] Documentar as políticas de segurança aplicadas para futuras referências

> **Instruções:**
> 1. Acessar o dashboard do Supabase: https://app.supabase.com/project/dtvylgjkibzuydekuiwu
> 2. Navegar para API > Tables & Views
> 3. Para cada tabela (`user` e `alert`), ajustar as permissões na aba "Auth"
> 4. Desmarcar todas as permissões para "anon"
> 5. Verificar se os alertas de RLS foram resolvidos

---

> **Observação:**
> Não inclua dados sensíveis neste arquivo. Atualize as variáveis de ambiente manualmente conforme instruções em `.env.example`.
