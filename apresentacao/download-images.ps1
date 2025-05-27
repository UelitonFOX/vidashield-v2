# Script para Download de Imagens VidaShield v2.0
# Execute este script no PowerShell para baixar imagens de exemplo

Write-Host "VidaShield v2.0 - Download de Imagens" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Criar diretório images se não existir
if (!(Test-Path "images")) {
    New-Item -ItemType Directory -Name "images"
    Write-Host "Pasta 'images' criada" -ForegroundColor Yellow
}

# URLs de imagens de exemplo (placeholder/free)
$images = @{
    "logo-vidashield.png" = "https://via.placeholder.com/512x512/00d4aa/1e293b?text=VidaShield"
    "team-photo.jpg" = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
    "clinica-vidamais.jpg" = "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop"
    "dr-rodrigo.jpg" = "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face"
    "dashboard-preview.png" = "https://via.placeholder.com/1200x800/1e293b/00d4aa?text=VidaShield+Dashboard"
    "login-screen.png" = "https://via.placeholder.com/800x600/1e293b/00d4aa?text=Login+Seguro"
    "dashboard-full.png" = "https://via.placeholder.com/1200x800/1e293b/00d4aa?text=Dashboard+Completo"
    "alerts-panel.png" = "https://via.placeholder.com/800x600/1e293b/ef4444?text=Painel+de+Alertas"
    "metrics-chart.png" = "https://via.placeholder.com/1000x600/1e293b/00d4aa?text=Gráfico+de+Métricas"
    "ai-integration.png" = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop"
    "mobile-app.png" = "https://via.placeholder.com/400x800/1e293b/00d4aa?text=App+Mobile"
    "success-illustration.png" = "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop"
    "react-logo.png" = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png"
    "typescript-logo.png" = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/512px-Typescript_logo_2020.svg.png"
    "supabase-logo.png" = "https://avatars.githubusercontent.com/u/54469796?s=200&v=4"
    "postgresql-logo.png" = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/512px-Postgresql_elephant.svg.png"
    "nodejs-logo.png" = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/512px-Node.js_logo.svg.png"
    "vite-logo.png" = "https://vitejs.dev/logo.svg"
    "tailwind-logo.png" = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/512px-Tailwind_CSS_Logo.svg.png"
    "api-logo.png" = "https://via.placeholder.com/512x512/00d4aa/1e293b?text=API"
}

# Download das imagens
$total = $images.Count
$current = 0

foreach ($img in $images.GetEnumerator()) {
    $current++
    $filename = $img.Key
    $url = $img.Value
    $filepath = "images/$filename"
    
    try {
        Write-Host "[$current/$total] Baixando $filename..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $filepath -UseBasicParsing
        Write-Host "$filename baixado com sucesso" -ForegroundColor Green
    }
    catch {
        Write-Host "Erro ao baixar $filename`: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Download concluido!" -ForegroundColor Green
Write-Host "Imagens salvas na pasta 'images/'" -ForegroundColor Yellow
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Substitua as imagens de placeholder pelas reais" -ForegroundColor White
Write-Host "2. Tire screenshots do sistema VidaShield" -ForegroundColor White  
Write-Host "3. Faça fotos profissionais da equipe" -ForegroundColor White
Write-Host "4. Use o guia SUGESTOES_IMAGENS.md" -ForegroundColor White
Write-Host ""
Write-Host "Sua apresentacao ficara INCRIVEL!" -ForegroundColor Green 