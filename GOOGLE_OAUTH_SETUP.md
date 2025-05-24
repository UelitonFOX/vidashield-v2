# 🔐 Configuração Google OAuth - VidaShield

Guia completo para configurar o login social com Google no Supabase.

## 🚀 Passos para Configuração

### 1. Configurar Google Cloud Console

1. **Acesse o Google Cloud Console**
   - Vá para: https://console.cloud.google.com/

2. **Criar/Selecionar Projeto**
   - Crie um novo projeto ou selecione um existente
   - Nome sugerido: `VidaShield-Auth`

3. **Habilitar Google+ API**
   - Vá para "APIs & Services" > "Library"
   - Procure por "Google+ API" e habilite
   - Procure por "People API" e habilite também

4. **Configurar OAuth Consent Screen**
   - Vá para "APIs & Services" > "OAuth consent screen"
   - Escolha "External" (para testes) ou "Internal" (se for workspace)
   - Preencha:
     - **App name**: VidaShield
     - **User support email**: seu email
     - **Developer contact email**: seu email
     - **App domain**: seu domínio (opcional para testes)

5. **Criar Credenciais OAuth**
   - Vá para "APIs & Services" > "Credentials"
   - Clique "Create Credentials" > "OAuth 2.0 Client IDs"
   - **Application type**: Web application
   - **Name**: VidaShield Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3004
     https://seu-dominio.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://seu-projeto.supabase.co/auth/v1/callback
     ```

6. **Copiar Credenciais**
   - Anote o **Client ID** e **Client Secret**

### 2. Configurar Supabase

1. **Acesse seu projeto Supabase**
   - Vá para: https://app.supabase.com/

2. **Configurar Google Provider**
   - Vá para "Authentication" > "Providers"
   - Encontre "Google" e clique para configurar
   - **Enable Google**: ✅ Ativado
   - **Client ID**: Cole o Client ID do Google
   - **Client Secret**: Cole o Client Secret do Google

3. **Configurar Redirect URLs** (se necessário)
   - Vá para "Authentication" > "URL Configuration"
   - **Site URL**: `http://localhost:3004` (para desenvolvimento)
   - **Redirect URLs**: Adicione URLs permitidas

### 3. Atualizar Variáveis de Ambiente

Atualize seu `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Development
VITE_APP_ENVIRONMENT=development
```

### 4. Testar a Configuração

1. **Reiniciar o servidor**:
   ```bash
   npm run dev
   ```

2. **Testar login**:
   - Acesse: http://localhost:3004
   - Clique em "Continuar com Google"
   - Deve abrir popup do Google para autenticação

## 🔍 Troubleshooting

### Erro: "redirect_uri_mismatch"
- **Solução**: Verifique se a URL de redirect no Google Console está correta
- **URL correta**: `https://seu-projeto.supabase.co/auth/v1/callback`

### Erro: "unauthorized_client"
- **Solução**: Verifique se o Client ID está correto no Supabase
- **Verificar**: Se o OAuth consent screen está configurado

### Erro: "access_denied"
- **Solução**: Usuário cancelou ou não tem permissão
- **Verificar**: Se o app está em modo de produção (precisa de aprovação do Google)

### Login funciona mas não redireciona
- **Solução**: Verificar se `redirectTo` está configurado corretamente
- **Código atual**:
  ```typescript
  signInWithGoogle({
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  ```

## 🎯 Resultado Esperado

Após a configuração:

1. ✅ Botão "Continuar com Google" aparece na tela de login
2. ✅ Clique abre popup/redirect do Google
3. ✅ Usuário faz login no Google
4. ✅ Retorna para o VidaShield logado
5. ✅ Dashboard é exibido com dados do usuário

## 📋 Checklist Final

- [ ] Google Cloud Console configurado
- [ ] OAuth Consent Screen preenchido
- [ ] Credenciais OAuth criadas
- [ ] Supabase Provider Google ativado
- [ ] Client ID/Secret configurados no Supabase
- [ ] Variáveis de ambiente atualizadas
- [ ] Servidor reiniciado
- [ ] Login testado

---

🎉 **Login social com Google implementado com sucesso!** 