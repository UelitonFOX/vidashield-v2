# Script de Limpeza do Repositório VidaShield
# Autor: Administrador VidaShield
# Descrição: Este script realiza a limpeza completa do repositório para preparação de instalação em máquina zerada

Write-Host "🧹 Iniciando limpeza do repositório VidaShield..." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Lista de diretórios para remover
$diretorios_para_remover = @(
    "node_modules",
    "__pycache__",
    ".vscode",
    ".idea",
    "dist",
    "build",
    ".pytest_cache"
)

# Lista de arquivos para remover
$arquivos_para_remover = @(
    "*.log",
    ".DS_Store",
    "*.pyc",
    "*.pyo",
    ".coverage"
)

# Função para remover diretórios
function Remover-Diretorios {
    foreach ($dir in $diretorios_para_remover) {
        Write-Host "🔍 Procurando diretórios $dir para remover..." -ForegroundColor Yellow
        
        $diretorios = Get-ChildItem -Path . -Recurse -Directory -Filter $dir
        foreach ($diretorio in $diretorios) {
            Write-Host "   🗑️ Removendo: $($diretorio.FullName)" -ForegroundColor Red
            Remove-Item -Path $diretorio.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# Função para remover arquivos
function Remover-Arquivos {
    foreach ($arquivo in $arquivos_para_remover) {
        Write-Host "🔍 Procurando arquivos $arquivo para remover..." -ForegroundColor Yellow
        
        $arquivos = Get-ChildItem -Path . -Recurse -File -Filter $arquivo
        foreach ($arq in $arquivos) {
            Write-Host "   🗑️ Removendo: $($arq.FullName)" -ForegroundColor Red
            Remove-Item -Path $arq.FullName -Force -ErrorAction SilentlyContinue
        }
    }
}

# Função para lidar com os arquivos .env
function Lidar-Com-Env {
    Write-Host "🔍 Verificando arquivos .env..." -ForegroundColor Yellow
    
    # Backend .env
    if (Test-Path -Path "backend/.env") {
        Write-Host "   🔄 Verificando .env no backend" -ForegroundColor Cyan
        
        if (-not (Test-Path -Path "backend/.env.example")) {
            Write-Host "   ⚠️ Não existe arquivo .env.example no backend - criando a partir do .env atual (com valores genéricos)" -ForegroundColor Yellow
            
            # Lê o conteúdo do .env e substitui valores sensíveis
            $conteudo = Get-Content -Path "backend/.env" -Raw
            $conteudo = $conteudo -replace "(SUPABASE_KEY|JWT_SECRET_KEY|SECRET_KEY|GOOGLE_CLIENT_SECRET|DATABASE_URL)=.*", '$1=your-secret-value-here'
            $conteudo = $conteudo -replace "(SUPABASE_URL)=.*", '$1=https://your-project.supabase.co'
            $conteudo = $conteudo -replace "(GOOGLE_CLIENT_ID)=.*", '$1=your-google-client-id'
            
            # Salva o arquivo .env.example
            $conteudo | Out-File -FilePath "backend/.env.example" -Encoding utf8
        }
        
        Write-Host "   🗑️ Removendo arquivo .env original do backend" -ForegroundColor Red
        Remove-Item -Path "backend/.env" -Force -ErrorAction SilentlyContinue
    }
    
    # Frontend .env
    if (Test-Path -Path "frontend-adm/.env") {
        Write-Host "   🔄 Verificando .env no frontend" -ForegroundColor Cyan
        
        if (-not (Test-Path -Path "frontend-adm/.env.example")) {
            Write-Host "   ⚠️ Não existe arquivo .env.example no frontend - criando a partir do .env atual" -ForegroundColor Yellow
            
            # Cria um arquivo .env.example simples para o frontend
            "# Configuração do frontend-adm para VidaShield" | Out-File -FilePath "frontend-adm/.env.example" -Encoding utf8
            "# Copie este arquivo para .env e ajuste as configurações conforme necessário" | Out-File -FilePath "frontend-adm/.env.example" -Encoding utf8 -Append
            "VITE_API_URL=http://localhost:5000" | Out-File -FilePath "frontend-adm/.env.example" -Encoding utf8 -Append
        }
        
        Write-Host "   🗑️ Removendo arquivo .env original do frontend" -ForegroundColor Red
        Remove-Item -Path "frontend-adm/.env" -Force -ErrorAction SilentlyContinue
    }
}

# Função para verificar dependências
function Verificar-Dependencias {
    Write-Host "🔍 Verificando dependências..." -ForegroundColor Yellow
    
    # Verifica package.json do frontend
    if (Test-Path -Path "frontend-adm/package.json") {
        Write-Host "   ✅ Frontend package.json encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend package.json não encontrado" -ForegroundColor Red
    }
    
    # Verifica requirements.txt do backend
    if (Test-Path -Path "backend/requirements.txt") {
        Write-Host "   ✅ Backend requirements.txt encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend requirements.txt não encontrado" -ForegroundColor Red
    }
}

# Função para remover pasta de backup
function Remover-Backup {
    if (Test-Path -Path "backup-atual") {
        Write-Host "🗑️ Removendo pasta de backup-atual" -ForegroundColor Red
        Remove-Item -Path "backup-atual" -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Execução principal
Remover-Diretorios
Remover-Arquivos
Lidar-Com-Env
Verificar-Dependencias
Remover-Backup

Write-Host "====================================================" -ForegroundColor Green
Write-Host "✅ Limpeza do repositório VidaShield concluída!" -ForegroundColor Green
Write-Host "O projeto está pronto para ser instalado em uma máquina limpa." -ForegroundColor Green 