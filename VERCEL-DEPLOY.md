# 🚀 VidaShield - Deploy no Vercel

## 📋 **Resumo Rápido**
1. **Conecte** repositório GitHub no Vercel
2. **Configure** variáveis de ambiente
3. **Deploy** automático

---

## 🔧 **Passo a Passo Detalhado**

### **1. 🌐 Acesse o Vercel**
- Acesse: https://vercel.com/
- **Login** com sua conta

### **2. 📦 Importar Projeto**
- **New Project** → **Import Git Repository**
- Selecione: `UelitonFOX/vidashield-v2`
- **Import**

### **3. ⚙️ Configurar Projeto**
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **4. 🔐 Variáveis de Ambiente**
**Configure estas variáveis no Vercel Dashboard:**

```env
VITE_SUPABASE_URL=https://rqucoiabfiocasxuuvea.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWNvaWFiZmlvY2FzeHV1dmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzY2MjMsImV4cCI6MjA2MzYxMjYyM30.YUIlLBPeNu4H4gHXIywUnuEHG1uSDu05XwAaAjRzbec
```

### **5. 🚀 Deploy**
- **Deploy** (automático após configuração)
- Aguarde 2-3 minutos

### **6. 🌐 Domínio Personalizado (Opcional)**
- **Settings** → **Domains**
- Adicionar: `vidashield.vercel.app` ou seu domínio

---

## 🔄 **Para Substituir Projeto Existente**

### **Opção 1: Novo Deploy**
1. **Delete** projeto `vidashield` antigo no Vercel
2. **Import** novo repositório com mesmo nome

### **Opção 2: Conectar Novo Repo**
1. **Settings** → **Git Repository**
2. **Connect** novo repositório
3. **Deploy** automaticamente

---

## ✅ **Checklist Final**
- [ ] ✅ Vercel conectado ao GitHub  
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Build rodando com sucesso
- [ ] ✅ Site acessível na URL do Vercel
- [ ] ✅ Login funcionando
- [ ] ✅ Dashboard carregando

---

## 🔗 **URLs Importantes**
- **Painel Vercel**: https://vercel.com/dashboard
- **Docs Vercel**: https://vercel.com/docs
- **Suporte**: https://vercel.com/help

---

## 🐛 **Troubleshooting**

### **Erro de Build**
```bash
# Se der erro de build:
npm install
npm run build
# Se funcionar localmente, problema é config do Vercel
```

### **Erro 404 nas Rotas**
- ✅ Arquivo `vercel.json` já configurado com rewrites

### **Erro de Variáveis**
- ✅ Verifique se todas as VITE_ estão no Vercel
- ✅ Não commite .env no Git

---

**🎯 Agora é só fazer deploy!** 