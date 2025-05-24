Write-Host "🛡️ VidaShield - Iniciando ambiente de desenvolvimento" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Verificar se os arquivos .env existem
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Arquivo backend\.env não encontrado!" -ForegroundColor Yellow
    Write-Host "📝 Copie backend\.env.example para backend\.env e configure as variáveis" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "frontend-adm\.env")) {
    Write-Host "⚠️  Arquivo frontend-adm\.env não encontrado!" -ForegroundColor Yellow
    Write-Host "📝 Copie frontend-adm\.env.example para frontend-adm\.env e configure as variáveis" -ForegroundColor Yellow
    exit 1
}

# Iniciar backend
Write-Host "`n🚀 Iniciando backend na porta 5000..." -ForegroundColor Cyan
$backend = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", @"
cd backend
if (-not (Test-Path 'venv')) {
    Write-Host '📦 Criando ambiente virtual Python...' -ForegroundColor Yellow
    python -m venv venv
}
.\venv\Scripts\Activate
pip install -r requirements.txt
python app.py
"@ -PassThru

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 5

# Iniciar frontend
Write-Host "🚀 Iniciando frontend na porta 3001..." -ForegroundColor Cyan
$frontend = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", @"
cd frontend-adm
npm install
npm run dev
"@ -PassThru

Write-Host ""
Write-Host "✅ Ambiente de desenvolvimento iniciado!" -ForegroundColor Green
Write-Host "📍 Backend: http://localhost:5000" -ForegroundColor White
Write-Host "📍 Frontend: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Para parar os servidores, feche as janelas do PowerShell abertas" -ForegroundColor Yellow

# Manter o script principal rodando
Read-Host "Pressione Enter para encerrar os servidores"

# Encerrar processos
Stop-Process -Id $backend.Id -Force
Stop-Process -Id $frontend.Id -Force 