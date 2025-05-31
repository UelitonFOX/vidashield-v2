# 🐳 VidaShield - Guia Docker Profissional

## 📋 Índice
- [Pré-requisitos](#-pré-requisitos)
- [Configuração Segura](#-configuração-segura)
- [Comandos Principais](#-comandos-principais)
- [Monitoramento](#-monitoramento)
- [Arquitetura](#-arquitetura)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Pré-requisitos

### 🖥️ Softwares Necessários
- **Docker Desktop** (Windows/Mac) ou **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Node.js** 18+ (para desenvolvimento local)

### 📥 Verificar Instalação
```bash
docker --version          # Docker 20.10+
docker compose version    # Docker Compose 2.0+
```

---

## 🔐 Configuração Segura

### ⚠️ IMPORTANTE: Variáveis de Ambiente
O projeto usa um arquivo `.env.docker` **separado** para maior segurança:

1. **Copie as variáveis**:
   ```bash
   # O arquivo .env.docker já foi criado com as configurações completas
   # ✅ Este arquivo está no .gitignore (não vai para o Git)
   ```

2. **Estrutura do `.env.docker`**:
   ```env
   # 🗄️ Supabase Configuration
   VITE_SUPABASE_URL=https://rqucoiabfiocasxuuvea.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
   
   # 🛡️ hCaptcha Configuration
   VITE_HCAPTCHA_SITE_KEY=866663ec-b850-4a54-8884-8376d11051c4
   
   # 🏗️ Build Configuration
   NODE_ENV=production
   ```

3. **🚨 Segurança**: 
   - ✅ Arquivo `.env.docker` está no `.gitignore`
   - ✅ Credenciais não ficam hardcoded no `docker-compose.yml`
   - ✅ Variáveis são carregadas de forma isolada
   - ✅ Inclui todas as chaves necessárias (Supabase + hCaptcha)

---

## 🚀 Comandos Principais

### 🏗️ Build e Execução
```bash
# 1️⃣ Build + Subir container (foreground)
docker compose --env-file .env.docker up --build

# 2️⃣ Build + Subir container (background) 
docker compose --env-file .env.docker up --build -d

# 3️⃣ Só subir (se já buildou antes)
docker compose --env-file .env.docker up -d
```

### 📊 Monitoramento
```bash
# Ver status + healthcheck
docker compose ps

# Logs em tempo real
docker compose logs -f

# Logs específicos do app
docker compose logs -f vidashield-app

# Estatísticas de uso
docker stats vidashield-app
```

### 🛑 Parar e Limpar
```bash
# Parar containers
docker compose down

# Parar + remover volumes
docker compose down -v

# Limpeza completa (remover imagens)
docker compose down --rmi all -v
```

---

## 🌐 Acesso

- **🎯 Aplicação**: http://localhost:3004
- **📊 Healthcheck**: Automático a cada 30s
- **🔄 Auto-restart**: Habilitado

---

## 🏗️ Arquitetura

### 📦 Multi-Stage Build
```dockerfile
Stage 1: Build (Node.js 18-alpine)
├── npm ci --silent
├── npm run build
└── Otimização Vite

Stage 2: Production (nginx:alpine)
├── Copia build do Stage 1
├── Configuração Nginx
└── Container final ~50MB
```

### 🔐 Segurança Implementada
- ✅ Multi-stage build (apenas arquivos necessários)
- ✅ Nginx com headers de segurança
- ✅ Healthcheck automático
- ✅ Network isolation
- ✅ Variáveis de ambiente isoladas
- ✅ .dockerignore otimizado

### 📊 Performance
- **Build time**: ~30-40s
- **Container size**: ~50MB (vs 500MB+ sem multi-stage)
- **Memory usage**: ~20-50MB em produção
- **Boot time**: ~5-10s

---

## 🩺 Troubleshooting

### ❌ Problemas Comuns

**1. Container não sobe**
```bash
# Verificar logs
docker compose logs vidashield-app

# Verificar se porta 3004 está livre
netstat -an | findstr 3004  # Windows
lsof -i :3004               # Linux/Mac
```

**2. Erro de variáveis de ambiente**
```bash
# Verificar se .env.docker existe
ls -la .env.docker

# Verificar conteúdo
cat .env.docker

# Rebuild forçado
docker compose --env-file .env.docker up --build --force-recreate
```

**3. Docker não encontrado**
```bash
# Instalar Docker Desktop
# https://docs.docker.com/get-docker/

# Ou usar script helper
./start-docker.sh    # Linux/Mac
start-docker.bat     # Windows
```

**4. Build travado**
```bash
# Parar processo
Ctrl+C

# Limpar cache
docker builder prune

# Tentar novamente
docker compose --env-file .env.docker up --build
```

### 🔧 Scripts Helper

**Windows**: `start-docker.bat`
**Linux/Mac**: `start-docker.sh`

Estes scripts fazem:
- ✅ Verificação automática de pré-requisitos
- ✅ Criação do arquivo .env.docker se necessário
- ✅ Build e execução automática
- ✅ Abertura do browser

---

## 🎯 Comandos Úteis

```bash
# 🔍 Inspecionar container
docker inspect vidashield-app

# 🖥️ Entrar no container
docker exec -it vidashield-app sh

# 📈 Ver uso de recursos
docker stats --no-stream

# 🗂️ Ver imagens criadas  
docker images | grep vidashield

# 🧹 Limpeza geral
docker system prune -a
```

---

## 📚 Referências

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/#use-multi-stage-builds)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**✨ VidaShield v2.0 | Docker Professional Setup** 