@echo off
setlocal enabledelayedexpansion

REM 📦 VidaShield - Script de Empacotamento para Deploy
REM Cria um pacote com apenas os arquivos essenciais

echo.
echo 📦 VidaShield - Empacotamento para Deploy
echo =========================================
echo.

REM 🗂️ Criar pasta temporária
set "DEPLOY_DIR=vidashield-deploy"
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

echo 📋 Copiando arquivos essenciais...

REM 🐳 Arquivos Docker essenciais
copy "docker-compose.yml" "%DEPLOY_DIR%\" >nul
copy "Dockerfile" "%DEPLOY_DIR%\" >nul
copy ".dockerignore" "%DEPLOY_DIR%\" >nul

REM 🚀 Scripts de inicialização
copy "start-docker.bat" "%DEPLOY_DIR%\" >nul
copy "start-docker.sh" "%DEPLOY_DIR%\" >nul

REM ⚙️ Arquivos de configuração
copy "package.json" "%DEPLOY_DIR%\" >nul
copy "vite.config.ts" "%DEPLOY_DIR%\" >nul
copy "tsconfig.json" "%DEPLOY_DIR%\" >nul
copy "tailwind.config.js" "%DEPLOY_DIR%\" >nul
copy "postcss.config.js" "%DEPLOY_DIR%\" >nul
copy "index.html" "%DEPLOY_DIR%\" >nul

REM 📁 Pastas completas necessárias
echo 📁 Copiando pasta src/...
xcopy "src" "%DEPLOY_DIR%\src" /E /I /Q >nul

echo 📁 Copiando pasta public/...
xcopy "public" "%DEPLOY_DIR%\public" /E /I /Q >nul

echo 📁 Copiando pasta supabase/...
xcopy "supabase" "%DEPLOY_DIR%\supabase" /E /I /Q >nul

REM 📖 Documentação importante
copy "INSTALACAO-RAPIDA.md" "%DEPLOY_DIR%\" >nul
copy "DOCKER-README.md" "%DEPLOY_DIR%\" >nul
copy "README.md" "%DEPLOY_DIR%\" >nul

echo 📄 Criando arquivo LEIA-ME.txt...
echo 🚀 VidaShield - Instalação Rápida > "%DEPLOY_DIR%\LEIA-ME.txt"
echo ================================= >> "%DEPLOY_DIR%\LEIA-ME.txt"
echo. >> "%DEPLOY_DIR%\LEIA-ME.txt"
echo 1. Instale Docker Desktop >> "%DEPLOY_DIR%\LEIA-ME.txt"
echo 2. Execute: start-docker.bat (Windows) ou ./start-docker.sh (Linux/Mac) >> "%DEPLOY_DIR%\LEIA-ME.txt"
echo 3. Acesse: http://localhost:3004 >> "%DEPLOY_DIR%\LEIA-ME.txt"
echo. >> "%DEPLOY_DIR%\LEIA-ME.txt"
echo 📖 Documentação completa: INSTALACAO-RAPIDA.md >> "%DEPLOY_DIR%\LEIA-ME.txt"

echo.
echo ✅ Pacote criado com sucesso!
echo 📁 Pasta: %DEPLOY_DIR%
echo 📊 Conteúdo:
dir "%DEPLOY_DIR%" /b

echo.
echo 🎯 Próximos passos:
echo 1. Compacte a pasta '%DEPLOY_DIR%' em ZIP
echo 2. Compartilhe o ZIP via pendrive/email/cloud
echo 3. No outro PC: extrair + rodar start-docker.bat
echo.

REM 🗜️ Tentar criar ZIP automaticamente (se tiver PowerShell)
powershell -command "Compress-Archive -Path '%DEPLOY_DIR%' -DestinationPath 'vidashield-deploy.zip' -Force" 2>nul
if %errorlevel% equ 0 (
    echo 🗜️ ZIP criado automaticamente: vidashield-deploy.zip
    echo 📏 Tamanho do arquivo:
    for %%A in (vidashield-deploy.zip) do echo    %%~zA bytes
    echo.
    echo 🎉 Pronto para compartilhar o arquivo vidashield-deploy.zip!
) else (
    echo ⚠️  Para criar ZIP: selecione a pasta '%DEPLOY_DIR%' e "Enviar para > Pasta compactada"
)

echo.
echo 🎯 Pressione qualquer tecla para continuar...
pause >nul 