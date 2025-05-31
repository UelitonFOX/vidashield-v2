@echo off
setlocal enabledelayedexpansion

REM 🐳 VidaShield - Script de Inicialização Docker (Windows)
REM Verifica pré-requisitos e inicia o container automaticamente

echo.
echo 🚀 VidaShield - Docker Startup Script
echo ======================================
echo.

REM 🔍 Verificar se Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado!
    echo 📥 Instale Docker Desktop: https://docs.docker.com/get-docker/
    echo.
    pause
    exit /b 1
)

REM 🔍 Verificar se Docker Compose está disponível
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose não encontrado!
    echo 📥 Instale Docker Desktop com Compose incluído
    echo.
    pause
    exit /b 1
)

echo ✅ Docker encontrado
echo.

REM 🔍 Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando!
    echo 🔄 Inicie o Docker Desktop e tente novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Docker está rodando
echo.

REM 🔐 Verificar arquivo de ambiente
if not exist ".env.docker" (
    echo ⚠️  Arquivo .env.docker não encontrado!
    echo 📝 Criando arquivo .env.docker...
    echo.
    
    echo # 🔐 VidaShield - Variáveis de Ambiente para Docker > .env.docker
    echo # ⚠️  NUNCA commitar este arquivo no Git! >> .env.docker
    echo. >> .env.docker
    echo # 🗄️ Supabase Configuration >> .env.docker
    echo VITE_SUPABASE_URL=https://rqucoiabfiocasxuuvea.supabase.co >> .env.docker
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdWNvaWFiZmlvY2FzeHV1dmVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzY2MjMsImV4cCI6MjA2MzYxMjYyM30.YUIlLBPeNu4H4gHXIywUnuEHG1uSDu05XwAaAjRzbec >> .env.docker
    echo. >> .env.docker
    echo # 🛡️ hCaptcha Configuration >> .env.docker
    echo VITE_HCAPTCHA_SITE_KEY=866663ec-b850-4a54-8884-8376d11051c4 >> .env.docker
    echo. >> .env.docker
    echo # 🏗️ Build Configuration >> .env.docker
    echo NODE_ENV=production >> .env.docker
    echo VITE_APP_TITLE=VidaShield >> .env.docker
    echo VITE_APP_VERSION=2.0.0 >> .env.docker
    
    echo ✅ Arquivo .env.docker criado com configurações completas
) else (
    echo ✅ Arquivo .env.docker encontrado
)

echo.

REM 🚀 Iniciar Docker Compose
echo 🏗️  Iniciando build e execução do container...
echo ⏱️  Primeira vez pode demorar 2-3 minutos
echo.

docker compose --env-file .env.docker up --build -d

REM ✅ Verificar se subiu corretamente
timeout /t 3 /nobreak >nul

docker compose ps | findstr "vidashield-app.*Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ✅ VidaShield iniciado com sucesso!
    echo 🌐 Acesse: http://localhost:3004
    echo 📊 Status: docker compose ps
    echo 📋 Logs: docker compose logs -f
    echo 🛑 Parar: docker compose down
    echo.
    
    REM 🌐 Abrir no browser automaticamente
    start http://localhost:3004
    
    echo 🎯 Pressione qualquer tecla para continuar...
    pause >nul
) else (
    echo.
    echo ❌ Erro ao iniciar o container
    echo 📋 Veja os logs: docker compose logs
    echo 🔧 Para troubleshooting, consulte: DOCKER-README.md
    echo.
    pause
) 