# 📧 Configurar Notificações por Email - VidaShield

## 🎯 **Objetivo**
Receber emails automáticos quando alguém solicitar acesso ao sistema VidaShield.

## 🆓 **EmailJS - 100% Gratuito**
- ✅ **200 emails/mês gratuitos**
- ✅ **Sem necessidade de backend**
- ✅ **Configuração simples**

---

## 📋 **Configuração Passo a Passo**

### **1. Criar Conta Gratuita**
1. Acesse: https://emailjs.com
2. Clique em **"Sign Up"**
3. Use seu Gmail: `ueliton.talento.tech@gmail.com`

### **2. Configurar Serviço de Email**
1. No painel, clique em **"Add New Service"**
2. Escolha: **"Gmail"**
3. Conecte sua conta Gmail
4. **Nome do serviço**: `service_vidashield`

### **3. Criar Template**
1. Clique em **"Create New Template"**
2. **Template ID**: `template_vidashield`
3. **Template HTML**:
```html
<h2>🔔 {{subject}}</h2>
<p>Olá {{to_name}},</p>
<p>{{message}}</p>
<hr>
<p><strong>Sistema:</strong> {{from_name}}</p>
<p><strong>Website:</strong> <a href="{{website_url}}">{{website_url}}</a></p>
<p><em>Este é um email automático do VidaShield Security.</em></p>
```

### **4. Obter Chaves**
1. Vá em **"Account"** → **"General"**
2. Copie a **"Public Key"**

### **5. Configurar no Código**
Edite o arquivo: `src/services/notificationService.ts`

```typescript
private static emailConfig: EmailNotificationConfig = {
  enabled: true,
  recipients: ['ueliton.talento.tech@gmail.com'], // ✅ Seu email
  serviceId: 'service_vidashield', // ✅ Da etapa 2
  templateId: 'template_vidashield', // ✅ Da etapa 3  
  publicKey: 'SUA_PUBLIC_KEY_AQUI' // ✅ Da etapa 4
}
```

---

## ✅ **Teste do Sistema**

### **Como Testar:**
1. Acesse: https://vidashield.vercel.app
2. Faça logout
3. Clique em **"Solicitar Acesso"**
4. Preencha o formulário
5. **Você deve receber um email automático!** 📧

### **Email de Exemplo:**
```
🔔 Nova Solicitação de Acesso - VidaShield

🔔 Nova solicitação de acesso recebida!

📊 Detalhes:
• 1 usuário aguardando aprovação
• Acesse: https://vidashield.vercel.app/aprovacao-usuarios
• Sistema: VidaShield Security

⏰ 02/06/2025 16:30:00

Ação necessária: Revisar e aprovar/rejeitar solicitação(ões) pendente(s).
```

---

## 🔧 **Troubleshooting**

### **Não recebeu email?**
1. ✅ Verifique **spam/lixo eletrônico**
2. ✅ Confirme as chaves no código
3. ✅ Teste direto no EmailJS
4. ✅ Verifique logs no console do navegador

### **Limite de 200 emails/mês**
- ✅ Suficiente para uso normal
- ✅ Se precisar mais: upgrade para plano pago ($5/mês)

---

## 🚀 **Próximos Passos**

Após configurar:
1. ✅ **Testar** o sistema
2. ✅ **Adicionar mais emails** se necessário
3. ✅ **WhatsApp Business API** (se quiser expandir - pago)

---

**📞 Suporte:** Se precisar de ajuda, chame no chat! 