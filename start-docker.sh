#!/bin/bash

# 🐳 VidaShield - Script de Inicialização Docker (Linux/Mac)
# Verifica pré-requisitos e inicia o container automaticamente

echo "🚀 VidaShield - Docker Startup Script"
echo "======================================"

# 🔍 Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado!"
    echo "📥 Instale Docker Desktop: https://docs.docker.com/get-docker/"
    exit 1
fi

# 🔍 Verificar se Docker Compose está disponível
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado!"
    echo "📥 Instale Docker Desktop com Compose incluído"
    exit 1
fi

echo "✅ Docker encontrado: $(docker --version)"

# 🔍 Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando!"
    echo "🔄 Inicie o Docker Desktop e tente novamente"
    exit 1
fi

echo "✅ Docker está rodando"

# 🔐 Verificar arquivo de ambiente
if [ ! -f ".env.docker" ]; then
    echo "⚠️  Arquivo .env.docker não encontrado!"
    echo "📝 Criando arquivo .env.docker..."
    
    cat > .env.docker << EOF
# 🔐 VidaShield - Variáveis de Ambiente para Docker
# ⚠️  NUNCA commitar este arquivo no Git!

# 🗄️ Supabase Configuration
VITE_SUPABASE_URL=https://rqucoiabfiocasxuuvea.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWNvaWFiZmlvY2FzeHV1dmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzY2MjMsImV4cCI6MjA2MzYxMjYyM30.YUIlLBPeNu4H4gHXIywUnuEHG1uSDu05XwAaAjRzbec

# 🛡️ hCaptcha Configuration
VITE_HCAPTCHA_SITE_KEY=866663ec-b850-4a54-8884-8376d11051c4

# 🏗️ Build Configuration
NODE_ENV=production
VITE_APP_TITLE=VidaShield
VITE_APP_VERSION=2.0.0
EOF
    echo "✅ Arquivo .env.docker criado com configurações completas"
else
    echo "✅ Arquivo .env.docker encontrado"
fi

# 🚀 Iniciar Docker Compose
echo ""
echo "🏗️  Iniciando build e execução do container..."
echo "⏱️  Primeira vez pode demorar 2-3 minutos"
echo ""

docker compose --env-file .env.docker up --build -d

# ✅ Verificar se subiu corretamente
sleep 3
if docker compose ps | grep -q "vidashield-app.*Up"; then
    echo ""
    echo "✅ VidaShield iniciado com sucesso!"
    echo "🌐 Acesse: http://localhost:3004"
    echo "📊 Status: docker compose ps"
    echo "📋 Logs: docker compose logs -f"
    echo "🛑 Parar: docker compose down"
    echo ""
    
    # 🌐 Tentar abrir no browser automaticamente
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3004
    elif command -v open &> /dev/null; then
        open http://localhost:3004
    fi
else
    echo ""
    echo "❌ Erro ao iniciar o container"
    echo "📋 Veja os logs: docker compose logs"
    echo "🔧 Para troubleshooting, consulte: DOCKER-README.md"
fi 