#!/bin/bash

echo "🛡️ VidaShield - Iniciando ambiente de desenvolvimento"
echo "=================================================="

# Verificar se os arquivos .env existem
if [ ! -f backend/.env ]; then
    echo "⚠️  Arquivo backend/.env não encontrado!"
    echo "📝 Copie backend/.env.example para backend/.env e configure as variáveis"
    exit 1
fi

if [ ! -f frontend-adm/.env ]; then
    echo "⚠️  Arquivo frontend-adm/.env não encontrado!"
    echo "📝 Copie frontend-adm/.env.example para frontend-adm/.env e configure as variáveis"
    exit 1
fi

# Iniciar backend
echo "🚀 Iniciando backend na porta 5000..."
cd backend
if [ ! -d venv ]; then
    echo "📦 Criando ambiente virtual Python..."
    python -m venv venv
fi

# Ativar ambiente virtual e instalar dependências
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt

# Iniciar servidor Flask em background
python app.py &
BACKEND_PID=$!
cd ..

# Iniciar frontend
echo "🚀 Iniciando frontend na porta 3001..."
cd frontend-adm
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Ambiente de desenvolvimento iniciado!"
echo "📍 Backend: http://localhost:5000"
echo "📍 Frontend: http://localhost:3001"
echo ""
echo "Para parar os servidores, use Ctrl+C"

# Aguardar Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 