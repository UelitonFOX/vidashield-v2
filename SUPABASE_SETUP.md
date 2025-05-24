# 🛡️ Configuração do Supabase para VidaShield

## 📋 **Visão Geral**

Este documento detalha como configurar o Supabase Auth para substituir completamente o Auth0 no projeto VidaShield.

---

## 🚀 **1. Criando Projeto no Supabase**

### 1.1 Acesse o Supabase
- Vá para [supabase.com](https://supabase.com)
- Faça login ou crie uma conta
- Clique em "New Project"

### 1.2 Configurações do Projeto
```
Nome: vidashield-auth
Organização: Sua organização
Região: East US (us-east-1) - recomendado para menor latência
Senha do DB: [gere uma senha forte]
```

### 1.3 Aguarde a Criação
- O processo leva ~2 minutos
- Anote a URL do projeto: `https://[seu-id].supabase.co`

---

## 🔐 **2. Configurando Autenticação**

### 2.1 Ativando Provedores de Auth

#### Email/Senha:
1. Vá para **Authentication > Providers**
2. **Email** já vem ativado por padrão
3. Configure:
   ```
   ✅ Enable email confirmations: true
   ✅ Enable email change confirmations: true
   ✅ Secure email change: true
   ```

#### Google OAuth:
1. Vá para **Authentication > Providers > Google**
2. Ative o provedor Google
3. Configure as credenciais OAuth:

**No Google Cloud Console:**
```bash
# 1. Acesse: https://console.cloud.google.com/apis/credentials
# 2. Crie um novo projeto ou selecione existente
# 3. Vá para "Credentials" > "Create Credentials" > "OAuth Client ID"
# 4. Tipo: Web Application
# 5. Authorized redirect URIs:
https://[seu-id].supabase.co/auth/v1/callback
```

**No Supabase:**
```
Client ID: [do Google Cloud Console]
Client Secret: [do Google Cloud Console]
```

### 2.2 Configurações de URL

#### Site URL:
```
http://localhost:3001
```

#### Redirect URLs:
```
http://localhost:3001/dashboard
http://localhost:3001/
https://[seu-dominio-producao].vercel.app/dashboard
```

---

## 🔑 **3. Obtendo Chaves de API**

### 3.1 Chaves Necessárias
Vá para **Settings > API** e copie:

1. **Project URL**: `https://[seu-id].supabase.co`
2. **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3.2 JWT Secret
Vá para **Settings > API > JWT Settings**:
- **JWT Secret**: `[sua-chave-jwt-secreta]`

---

## ⚙️ **4. Configuração dos Arquivos .env**

### 4.1 Frontend (.env)
```bash
# Supabase
VITE_SUPABASE_URL=https://[seu-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
VITE_API_URL=http://localhost:5000
```

### 4.2 Backend (.env)
```bash
# Flask
SECRET_KEY=vidashield-development-secret-key-123456789
JWT_SECRET_KEY=vidashield-jwt-secret-key-987654321

# Database
DATABASE_URL=sqlite:///./instance/app.db

# Supabase
SUPABASE_URL=https://[seu-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=[sua-chave-jwt-secreta]

# Frontend
FRONTEND_URL=http://localhost:3001
```

---

## 🛠️ **5. Configuração de Segurança (RLS)**

### 5.1 Criando Tabela de Perfis
```sql
-- Criar tabela de perfis de usuário
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy para admins verem todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 5.2 Trigger para Criar Perfil Automaticamente
```sql
-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🧪 **6. Testando a Configuração**

### 6.1 Teste de Conexão
```bash
# Backend
curl http://localhost:5000/api/supabase/health

# Resposta esperada:
{
  "status": "healthy",
  "message": "Sistema de autenticação Supabase",
  "config": {
    "supabase_url": true,
    "service_key": true,
    "jwt_secret": true
  }
}
```

### 6.2 Teste de Login
1. Acesse `http://localhost:3001`
2. Tente fazer login com email/senha
3. Tente fazer login com Google
4. Verifique se o redirecionamento funciona

---

## 🚨 **7. Solução de Problemas**

### 7.1 Problemas Comuns

#### "Invalid login credentials"
- Verifique se o email está confirmado
- Confirme se a senha está correta
- Verifique se o usuário existe no painel Supabase

#### "Token inválido"
- Verifique se `SUPABASE_JWT_SECRET` está correto
- Confirme se as chaves não expiraram
- Verifique se o token está sendo enviado corretamente

#### "CORS Error"
- Adicione `http://localhost:3001` nas Redirect URLs
- Verifique se a Site URL está configurada
- Confirme se o CORS está habilitado no backend

### 7.2 Logs de Debug
```bash
# Frontend - Console do navegador
console.log("Supabase config:", {
  url: import.meta.env.VITE_SUPABASE_URL,
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});

# Backend - Logs do Flask
app.logger.info(f"Supabase URL: {os.getenv('SUPABASE_URL')}")
app.logger.info(f"JWT Secret configurado: {bool(os.getenv('SUPABASE_JWT_SECRET'))}")
```

---

## 📈 **8. Próximos Passos**

### 8.1 Produção
1. Configure domínio personalizado no Supabase
2. Atualize Redirect URLs para produção
3. Configure variáveis de ambiente no Vercel/Render
4. Ative 2FA para conta admin do Supabase

### 8.2 Funcionalidades Avançadas
1. Implementar reset de senha
2. Configurar webhooks para eventos de auth
3. Adicionar autenticação por SMS
4. Implementar sessões persistentes

---

## 🔗 **9. Links Úteis**

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Configuração Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**✅ Configuração concluída! O VidaShield agora usa Supabase Auth.** 