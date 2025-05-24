# 🔧 Configuração Auth0 para VidaShield

## 📝 **URLs que devem ser configuradas no Auth0 Dashboard**

### 1. **Allowed Callback URLs**
```
http://localhost:3001/callback
http://localhost:3000/callback
http://localhost:3001/auth-callback
```

### 2. **Allowed Logout URLs**
```
http://localhost:3001/login
http://localhost:3001/
http://localhost:3000/login
```

### 3. **Allowed Web Origins**
```
http://localhost:3001
http://localhost:3000
http://localhost:5000
```

### 4. **Allowed Origins (CORS)**
```
http://localhost:3001
http://localhost:3000
http://localhost:5000
```

## 🚀 **Como configurar:**

1. Acesse seu **Auth0 Dashboard**
2. Vá em **Applications** → **VidaShield Application**
3. Na aba **Settings**, configure as URLs acima nos campos correspondentes
4. **Salve as alterações**

## 🔑 **Credenciais necessárias:**

- **Domain**: `dev-uhfy4gh2szxayskh.us.auth0.com`
- **Client ID**: `FrJXkUPH1eWy2wwhesfn61PgEj0WmERH`
- **Audience**: `https://vidashield.onrender.com/api`

## ✅ **Após configurar:**

1. Acesse: `http://localhost:3001`
2. Clique em **Login**
3. Faça login com Auth0
4. Deve redirecionar automaticamente para `/dashboard`

---

**Nota**: Se ainda estiver redirecionando para Auth0, verifique se as URLs estão exatamente como mostrado acima no dashboard do Auth0. 