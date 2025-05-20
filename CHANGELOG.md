# CHANGELOG

## 2025-05-20

### ✨ Funcionalidades
- Implementado sistema modular de perfil de usuário com foto
- Adicionada página de gerenciamento avançado de usuários (UserManagement)
- Criados novos componentes de visualização para o Dashboard (gráficos e estatísticas)
- Implementados componentes modulares para gerenciamento de alertas
- Adicionada funcionalidade de configurações do sistema com múltiplas abas

### 🧱 Estrutura e Refatorações
- Reorganização dos componentes por domínios funcionais (alertas, dashboard, configurações)
- Migração de componentes .js para .tsx para tipagem estática
- Substituição do PrivateRoute por ProtectedRoute com melhorias de segurança
- Implementação de hook personalizado useAuthFetch para requisições autenticadas
- Reorganização da estrutura de layout com componentes modulares

### 🛡️ Segurança
- Adicionado utilitário de autenticação no backend (utils/auth.py)
- Melhorias no sistema de rotas protegidas no frontend
- Implementação de formulário de alteração de senha no perfil do usuário
- Adicionados helpers para manipulação segura de UUIDs

### 🐛 Correções
- Corrigido fluxo de autenticação e redirecionamento após login
- Resolvidos problemas de renderização condicional na sidebar
- Ajustado layout responsivo em várias páginas
- Corrigido comportamento dos alertas na interface

### ⚙️ Infra e Dependências
- Atualização das configurações do Vite
- Atualização de dependências no package.json
- Inclusão do banco de dados local para desenvolvimento (app.db)