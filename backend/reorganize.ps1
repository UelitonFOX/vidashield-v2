# Script para reorganizar o projeto - Versão Notebook
# Remove a pasta frontend e outros arquivos desnecessários
# Move o conteúdo da pasta backend para a raiz

# Certificar que estamos na raiz do projeto
Set-Location -Path C:\dev\vidashield_new

# Remover arquivos raiz que não são necessários
if (Test-Path -Path package.json) { Remove-Item package.json }
if (Test-Path -Path package-lock.json) { Remove-Item package-lock.json }
if (Test-Path -Path supabase_schema.sql) { Remove-Item supabase_schema.sql }
if (Test-Path -Path supabase_security.sql) { Remove-Item supabase_security.sql }
if (Test-Path -Path app.db) { Remove-Item app.db }

# Fazer backup do README original
if (Test-Path -Path README.md) { Move-Item README.md README.original.md -Force }

# Copiar arquivos importantes do backend para a raiz
Copy-Item -Path backend\*.py -Destination . -Force
Copy-Item -Path backend\requirements.txt -Destination . -Force
Copy-Item -Path backend\README.md -Destination . -Force
Copy-Item -Path backend\CHANGELOG.md -Destination . -Force
Copy-Item -Path backend\.env -Destination .\notebook.env -Force
Copy-Item -Path backend\.env.example -Destination . -Force

# Criar estrutura de diretórios
if (-not (Test-Path -Path .\migrations)) { New-Item -Path . -Name "migrations" -ItemType "directory" }
if (-not (Test-Path -Path .\routes)) { New-Item -Path . -Name "routes" -ItemType "directory" }
if (-not (Test-Path -Path .\static)) { New-Item -Path . -Name "static" -ItemType "directory" }
if (-not (Test-Path -Path .\templates)) { New-Item -Path . -Name "templates" -ItemType "directory" }
if (-not (Test-Path -Path .\logs)) { New-Item -Path . -Name "logs" -ItemType "directory" }

# Copiar conteúdo para os diretórios
Copy-Item -Path backend\migrations\* -Destination .\migrations -Recurse -Force
Copy-Item -Path backend\routes\* -Destination .\routes -Recurse -Force
Copy-Item -Path backend\static\* -Destination .\static -Recurse -Force
Copy-Item -Path backend\templates\* -Destination .\templates -Recurse -Force
Copy-Item -Path backend\logs\* -Destination .\logs -Recurse -Force

# Atualizar arquivos de configuração
# Usar um arquivo .env específico para o ambiente notebook
if (Test-Path -Path .\notebook.env) { 
    # Certificando que estamos usando SQLite para facilitar
    (Get-Content .\notebook.env) -replace "# DATABASE_URL='sqlite:///app.db'", "DATABASE_URL='sqlite:///app.db'" -replace "DATABASE_URL=postgresql://.*", "# DATABASE_URL=postgresql://..." | Out-File -FilePath .\notebook.env -Encoding utf8
}

# Limpeza do diretório backend
# Remove-Item -Path backend -Recurse -Force

Write-Host "Reorganização concluída. Revise as alterações antes de fazer commit." 