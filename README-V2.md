# VidaShield V2 - Refatorado com Supabase

## 🎯 Objetivo
Versão completamente refatorada do VidaShield, mantendo apenas o **design visual** e **componentes**, mas com uma arquitetura moderna centrada no **Supabase**.

## 🧱 Stack Nova
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Autenticação**: Supabase Auth (sem Auth0)
- **Database**: PostgreSQL via Supabase
- **Deploy**: Vercel (frontend), Supabase (backend)

## 🚀 Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie o arquivo `.env.local.example` para `.env.local`
3. Configure as variáveis:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Executar o schema do banco
Execute o SQL do arquivo `supabase/schema.sql` no seu projeto Supabase.

### 4. Rodar o projeto
```bash
npm run dev
```

## 📊 Estrutura do Banco (Supabase)

### Tabelas Principais:
- **users**: usuários do sistema (email, role)
- **auth_logs**: histórico de tentativas de login
- **threats**: ameaças detectadas
- **blocked_ips**: IPs bloqueados

### Edge Functions:
- **detect-threats**: simula detecção de ameaças
- **block-ip**: adiciona IPs na lista de bloqueio

## 🎨 Design Mantido
Todos os estilos, cores e componentes visuais do projeto original foram mantidos:
- ✅ Tema dark com efeitos neon verdes
- ✅ Cards de estatísticas
- ✅ Sidebar responsiva
- ✅ Header com notificações
- ✅ Badges e indicadores coloridos

## 📱 Páginas
- `/login` - Tela de login com Supabase Auth
- `/dashboard` - Dashboard principal com métricas
- `/threats` - Painel de ameaças
- `/logs` - Histórico de acessos
- `/alerts` - Alertas de segurança

## 🔐 Funcionalidades Removidas
- ❌ Backend Flask
- ❌ Auth0
- ❌ hCaptcha
- ❌ Rotas de autenticação customizadas

## 🆕 Funcionalidades Novas
- ✅ Autenticação via Supabase
- ✅ RLS (Row Level Security) no banco
- ✅ Edge Functions para automações
- ✅ Real-time subscriptions (futuro)
- ✅ Storage integrado (futuro)

## 🛠️ Scripts Disponíveis
- `npm run dev` - Executar em desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview da build

## 📦 MCP Tools Integration
O projeto está preparado para usar ferramentas MCP no Cursor:
- Criação automática de tabelas via MCP
- Desenvolvimento de Edge Functions via MCP
- Configuração de políticas RLS via MCP

---
**VidaShield V2** - Cybersecurity Dashboard moderno e limpo com Supabase 🚀 