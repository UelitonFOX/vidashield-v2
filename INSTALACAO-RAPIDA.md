# 🚀 VidaShield - Instalação Rápida em Qualquer PC

## 📦 O que você precisa

1. **Git** instalado
2. **Docker Desktop** instalado
3. **5 minutos** ⏱️

---

## 🎯 Instalação em 3 Passos

### 1️⃣ **Baixar o Projeto**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vidashield.git
cd vidashield
```

### 2️⃣ **Instalar Docker Desktop**
Se não tiver Docker instalado:

**Windows:**
- Baixe: https://docs.docker.com/desktop/install/windows-install/
- Execute o instalador
- Reinicie o PC se necessário

**Mac:**
- Baixe: https://docs.docker.com/desktop/install/mac-install/
- Arraste para Applications

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 3️⃣ **Rodar o Script Automático**

**Windows:**
```cmd
start-docker.bat
```

**Linux/Mac:**
```bash
chmod +x start-docker.sh
./start-docker.sh
```

🎉 **Pronto!** Aplicação rodando em http://localhost:3004

---

## 🔧 Scripts Fazem Tudo Automaticamente

Os scripts `start-docker.bat` (Windows) e `start-docker.sh` (Linux/Mac) fazem:

✅ Verificam se Docker está instalado  
✅ Verificam se Docker está rodando  
✅ Criam arquivo `.env.docker` com todas as configurações  
✅ Fazem build da aplicação  
✅ Sobem o container  
✅ Abrem o browser automaticamente  

---

## 📱 Compartilhamento Rápido

### **Opção 1: Pendrive/Pasta Compartilhada**
```bash
# 1. Compacte apenas estes arquivos essenciais:
├── docker-compose.yml
├── Dockerfile
├── start-docker.bat (Windows)
├── start-docker.sh (Linux/Mac)
├── .dockerignore
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/ (pasta completa)
├── public/ (pasta completa)
└── supabase/ (pasta completa)

# 2. No outro PC:
# - Extrair arquivos
# - Rodar start-docker.bat (Windows) ou start-docker.sh (Linux/Mac)
```

### **Opção 2: GitHub (Mais Fácil)**
```bash
# 1. No PC atual:
git add .
git commit -m "🚀 Ready for deployment"
git push origin main

# 2. No outro PC:
git clone https://github.com/seu-usuario/vidashield.git
cd vidashield
start-docker.bat  # Windows
# ou
./start-docker.sh  # Linux/Mac
```

### **Opção 3: Docker Hub (Mais Profissional)**
```bash
# 1. No PC atual - publicar imagem:
docker build -t seuusuario/vidashield .
docker push seuusuario/vidashield

# 2. No outro PC - rodar direto:
docker run -d -p 3004:80 seuusuario/vidashield
```

---

## 🌐 Deploy na Nuvem (Grátis)

Para disponibilizar online, use uma dessas opções **gratuitas**:

### **Railway** (Mais Fácil) 🚄
1. Acesse: https://railway.app
2. "Deploy from GitHub" → Conecte seu repositório
3. ✅ Detect Dockerfile automaticamente
4. ✅ URL grátis: `vidashield-production.up.railway.app`

### **Render** 🎨
1. Acesse: https://render.com
2. "New Web Service" → GitHub repo
3. Runtime: Docker
4. ✅ URL grátis: `vidashield.onrender.com`

### **Fly.io** (Servidor no Brasil) 🪰
```bash
# Instalar CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly auth login
fly launch
fly deploy
```
✅ URL: `vidashield.fly.dev`  
✅ Servidor em São Paulo  

---

## 🆘 Problemas Comuns

### **❌ "Docker não encontrado"**
```bash
# Instalar Docker Desktop e reiniciar PC
# Verificar se está rodando: docker --version
```

### **❌ "Porta 3004 ocupada"**
```bash
# Windows
netstat -ano | findstr :3004
taskkill /F /PID [número_do_processo]

# Linux/Mac
lsof -ti:3004 | xargs kill -9
```

### **❌ "Container não sobe"**
```bash
# Ver logs de erro
docker compose logs

# Limpar e tentar novamente
docker compose down
docker system prune -f
start-docker.bat  # Windows
./start-docker.sh  # Linux/Mac
```

---

## 🎯 Resumo Ultra-Rápido

Para instalar em **qualquer PC**:

1. **Instale Docker Desktop**
2. **Clone o projeto**: `git clone URL`
3. **Execute**: `start-docker.bat` (Windows) ou `./start-docker.sh` (Linux/Mac)
4. **Acesse**: http://localhost:3004

**Tempo total**: ~5 minutos ⚡

---

## 📞 Suporte

- 📖 Documentação completa: `DOCKER-README.md`
- 🚀 Deploy em produção: `DEPLOY-GUIDE.md`
- 🐛 Problemas? Veja os logs: `docker compose logs -f` 