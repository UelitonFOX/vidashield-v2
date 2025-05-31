# 🚀 VidaShield - Guia Completo de Deploy

## 📋 Índice
- [Visão Geral](#-visão-geral)
- [Deploy Gratuito (Cloud)](#-deploy-gratuito-cloud)
- [Deploy em VPS](#-deploy-em-vps)
- [Deploy com Docker Hub](#-deploy-com-docker-hub)
- [Deploy em Kubernetes](#-deploy-em-kubernetes)
- [Monitoramento](#-monitoramento)

---

## 🎯 Visão Geral

### **🏆 Recomendações por Caso:**

| **Uso** | **Plataforma** | **Custo** | **Dificuldade** | **URL Final** |
|---------|---------------|-----------|----------------|---------------|
| 🎓 **Apresentação** | Railway/Render | Gratuito | ⭐ Fácil | `vidashield.up.railway.app` |
| 💼 **Produção Pequena** | Fly.io/DigitalOcean | $5-10/mês | ⭐⭐ Médio | `vidashield.com` |
| 🏢 **Produção Grande** | AWS/Azure/GCP | $20+/mês | ⭐⭐⭐ Difícil | `vidashield.com` |

---

## ☁️ Deploy Gratuito (Cloud)

### 🚄 **Railway** (Mais Fácil)

1. **Fazer upload do código:**
   ```bash
   git add .
   git commit -m "🐳 Docker ready for deploy"
   git push origin main
   ```

2. **Deploy no Railway:**
   - Acesse: [railway.app](https://railway.app)
   - **Deploy from GitHub** → Conecte seu repositório
   - O Railway detecta o `Dockerfile` automaticamente
   - **Environment Variables** → Adicione:
     ```
     VITE_SUPABASE_URL=https://rqucoiabfiocasxuuvea.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
     VITE_HCAPTCHA_SITE_KEY=866663ec-b850-4a54-8884-8376d11051c4
     ```

3. **Resultado:**
   - ✅ URL: `https://vidashield-production.up.railway.app`
   - ✅ Deploy automático a cada push
   - ✅ SSL grátis

### 🎨 **Render** (Alternativa)

1. **Deploy no Render:**
   - Acesse: [render.com](https://render.com)
   - **New Web Service** → GitHub repo
   - **Runtime**: Docker
   - Use o arquivo `render.yaml` já criado

2. **Configurar variáveis:**
   - **Environment** → Add Environment Variables
   - Copie as mesmas variáveis do Railway

3. **Resultado:**
   - ✅ URL: `https://vidashield.onrender.com`
   - ✅ Plano gratuito: 750h/mês

### 🪰 **Fly.io** (Brasil)

1. **Instalar CLI:**
   ```bash
   # Windows
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Linux/Mac
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy:**
   ```bash
   fly auth login
   fly launch  # Usa o fly.toml já criado
   
   # Configurar segredos
   fly secrets set VITE_SUPABASE_URL="https://rqucoiabfiocasxuuvea.supabase.co"
   fly secrets set VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiI..."
   fly secrets set VITE_HCAPTCHA_SITE_KEY="866663ec-b850-4a54-8884-8376d11051c4"
   
   fly deploy
   ```

3. **Resultado:**
   - ✅ URL: `https://vidashield.fly.dev`
   - ✅ Servidor no Brasil (São Paulo)
   - ✅ $0-5/mês

---

## 🖥️ Deploy em VPS

### 💧 **DigitalOcean Droplet** ($5/mês)

1. **Criar Droplet:**
   - **OS**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($4-6/mês)
   - **Datacenter**: São Paulo (fra1)

2. **Configurar servidor:**
   ```bash
   # Conectar via SSH
   ssh root@seu-ip
   
   # Instalar Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Clonar projeto
   git clone https://github.com/seu-usuario/vidashield.git
   cd vidashield
   ```

3. **Deploy:**
   ```bash
   # Criar .env.docker
   echo "VITE_SUPABASE_URL=https://rqucoiabfiocasxuuvea.supabase.co" > .env.docker
   echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI..." >> .env.docker
   echo "VITE_HCAPTCHA_SITE_KEY=866663ec-b850-4a54-8884-8376d11051c4" >> .env.docker
   
   # Subir aplicação
   docker compose --env-file .env.docker up -d
   ```

4. **Configurar domínio (opcional):**
   ```bash
   # Instalar Nginx Proxy Manager
   docker run -d \
     --name nginx-proxy-manager \
     -p 80:80 -p 81:81 -p 443:443 \
     jc21/nginx-proxy-manager:latest
   
   # Acesse: http://seu-ip:81
   # Configure proxy para localhost:3004
   ```

### 🌊 **AWS EC2** (Produção)

1. **Criar instância EC2:**
   - **AMI**: Amazon Linux 2
   - **Instance Type**: t3.micro (Free Tier)
   - **Security Group**: HTTP (80), HTTPS (443), SSH (22)

2. **Deploy igual ao DigitalOcean**

---

## 🐳 Deploy com Docker Hub

### 📦 **Publicar Imagem**

1. **Build e push:**
   ```bash
   # Build local
   docker build --build-arg VITE_SUPABASE_URL="https://rqucoiabfiocasxuuvea.supabase.co" \
                --build-arg VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiI..." \
                --build-arg VITE_HCAPTCHA_SITE_KEY="866663ec-b850-4a54-8884-8376d11051c4" \
                -t seuusuario/vidashield:latest .
   
   # Login Docker Hub
   docker login
   
   # Push
   docker push seuusuario/vidashield:latest
   ```

2. **Usar em qualquer servidor:**
   ```bash
   # Em qualquer lugar do mundo
   docker run -d -p 80:80 seuusuario/vidashield:latest
   ```

---

## ⚓ Deploy em Kubernetes

### 🎛️ **Configuração K8s**

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vidashield
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vidashield
  template:
    metadata:
      labels:
        app: vidashield
    spec:
      containers:
      - name: vidashield
        image: seuusuario/vidashield:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: vidashield-service
spec:
  selector:
    app: vidashield
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### 🚀 **Deploy:**
```bash
kubectl apply -f k8s-deployment.yaml
kubectl get services  # Ver URL externa
```

---

## 📊 Monitoramento

### 🩺 **Health Checks**

Todas as plataformas vão verificar automaticamente:
- **Endpoint**: `http://seu-dominio/`
- **Status esperado**: 200 OK
- **Frequência**: 30s

### 📈 **Logs:**

```bash
# Railway/Render: Via dashboard web
# VPS: 
docker compose logs -f
# K8s:
kubectl logs -f deployment/vidashield
```

---

## 🎯 **Resumo de URLs**

Após deploy, seu VidaShield estará disponível em:

- **Railway**: `https://vidashield-production.up.railway.app`
- **Render**: `https://vidashield.onrender.com`  
- **Fly.io**: `https://vidashield.fly.dev`
- **VPS**: `http://seu-ip:3004` ou `https://seudominio.com`

---

## 🏆 **Recomendação Final**

### 🎓 **Para Apresentação:**
1. **Railway** (mais fácil, deploy em 5 minutos)
2. URL linda: `vidashield-production.up.railway.app`
3. Grátis, SSL automático

### 💼 **Para Produção:**
1. **Fly.io** ($5/mês, servidor no Brasil)
2. Domínio personalizado: `vidashield.com`
3. Performance alta, monitoramento

### 🏢 **Para Empresa:**
1. **AWS/DigitalOcean** + Kubernetes
2. Alta disponibilidade, escalabilidade
3. Backup, monitoramento avançado

---

**🚀 VidaShield está pronto para o mundo!** 🌍 