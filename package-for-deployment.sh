#!/bin/bash

# 📦 VidaShield - Script de Empacotamento para Deploy
# Cria um pacote com apenas os arquivos essenciais

echo ""
echo "📦 VidaShield - Empacotamento para Deploy"
echo "========================================="
echo ""

# 🗂️ Criar pasta temporária
DEPLOY_DIR="vidashield-deploy"
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf "$DEPLOY_DIR"
fi
mkdir "$DEPLOY_DIR"

echo "📋 Copiando arquivos essenciais..."

# 🐳 Arquivos Docker essenciais
cp docker-compose.yml "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️ docker-compose.yml não encontrado"
cp Dockerfile "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️ Dockerfile não encontrado"
cp .dockerignore "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️ .dockerignore não encontrado"

# 🚀 Scripts de inicialização
cp start-docker.bat "$DEPLOY_DIR/" 2>/dev/null
cp start-docker.sh "$DEPLOY_DIR/" 2>/dev/null
chmod +x "$DEPLOY_DIR/start-docker.sh" 2>/dev/null

# ⚙️ Arquivos de configuração
cp package.json "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️ package.json não encontrado"
cp vite.config.ts "$DEPLOY_DIR/" 2>/dev/null
cp tsconfig.json "$DEPLOY_DIR/" 2>/dev/null
cp tailwind.config.js "$DEPLOY_DIR/" 2>/dev/null
cp postcss.config.js "$DEPLOY_DIR/" 2>/dev/null
cp index.html "$DEPLOY_DIR/" 2>/dev/null

# 📁 Pastas completas necessárias
echo "📁 Copiando pasta src/..."
if [ -d "src" ]; then
    cp -r src "$DEPLOY_DIR/"
else
    echo "⚠️ Pasta src/ não encontrada"
fi

echo "📁 Copiando pasta public/..."
if [ -d "public" ]; then
    cp -r public "$DEPLOY_DIR/"
else
    echo "⚠️ Pasta public/ não encontrada"
fi

echo "📁 Copiando pasta supabase/..."
if [ -d "supabase" ]; then
    cp -r supabase "$DEPLOY_DIR/"
else
    echo "⚠️ Pasta supabase/ não encontrada"
fi

# 📖 Documentação importante
cp INSTALACAO-RAPIDA.md "$DEPLOY_DIR/" 2>/dev/null
cp DOCKER-README.md "$DEPLOY_DIR/" 2>/dev/null
cp README.md "$DEPLOY_DIR/" 2>/dev/null

echo "📄 Criando arquivo LEIA-ME.txt..."
cat > "$DEPLOY_DIR/LEIA-ME.txt" << 'EOF'
🚀 VidaShield - Instalação Rápida
=================================

1. Instale Docker Desktop
2. Execute: start-docker.bat (Windows) ou ./start-docker.sh (Linux/Mac)
3. Acesse: http://localhost:3004

📖 Documentação completa: INSTALACAO-RAPIDA.md
EOF

echo ""
echo "✅ Pacote criado com sucesso!"
echo "📁 Pasta: $DEPLOY_DIR"
echo "📊 Conteúdo:"
ls -la "$DEPLOY_DIR"

echo ""
echo "🎯 Próximos passos:"
echo "1. Compacte a pasta '$DEPLOY_DIR' em ZIP/TAR"
echo "2. Compartilhe o arquivo via pendrive/email/cloud"
echo "3. No outro PC: extrair + rodar start-docker.bat ou ./start-docker.sh"
echo ""

# 🗜️ Tentar criar TAR.GZ automaticamente
if command -v tar >/dev/null 2>&1; then
    echo "🗜️ Criando arquivo compactado..."
    tar -czf vidashield-deploy.tar.gz "$DEPLOY_DIR"
    
    if [ $? -eq 0 ]; then
        echo "✅ TAR.GZ criado: vidashield-deploy.tar.gz"
        echo "📏 Tamanho do arquivo:"
        ls -lh vidashield-deploy.tar.gz | awk '{print "   " $5}'
        echo ""
        echo "🎉 Pronto para compartilhar o arquivo vidashield-deploy.tar.gz!"
    else
        echo "❌ Erro ao criar TAR.GZ"
    fi
else
    echo "⚠️ 'tar' não encontrado. Compacte manualmente a pasta '$DEPLOY_DIR'"
fi

# 🗜️ Tentar criar ZIP se disponível
if command -v zip >/dev/null 2>&1; then
    echo "🗜️ Criando ZIP..."
    zip -r vidashield-deploy.zip "$DEPLOY_DIR" >/dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ ZIP criado: vidashield-deploy.zip"
        echo "📏 Tamanho do arquivo:"
        ls -lh vidashield-deploy.zip | awk '{print "   " $5}'
        echo ""
    fi
fi

echo ""
echo "🎯 Pressione Enter para continuar..."
read -r 