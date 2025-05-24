import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# CORS para desenvolvimento
CORS(app, resources={
    r"/api/*": {"origins": [
        "http://localhost:3000",
        "http://localhost:3001"
    ]}
}, supports_credentials=True)

# Dados mockados para dashboard
MOCK_DASHBOARD_DATA = {
    "total_usuarios": 75,
    "logins_hoje": 23,
    "alertas_criticos": 3,
    "acessos_semana": [15, 28, 18, 42, 30, 22, 37],
    "tentativas_bloqueadas": [1, 0, 3, 5, 0, 4, 2],
    "alertas_recentes": [
        {"id": 1, "tipo": "critical", "mensagem": "Múltiplas falhas de login", "tempo": "10h25 - 08/05"},
        {"id": 2, "tipo": "warning", "mensagem": "Novo dispositivo detectado", "tempo": "09h15 - 08/05"},
        {"id": 3, "tipo": "critical", "mensagem": "Acesso de IP não autorizado", "tempo": "18h42 - 07/05"}
    ],
    "labels_dias": ['01/05', '02/05', '03/05', '04/05', '05/05', '06/05', '07/05']
}

MOCK_INSIGHTS = {
    "insights": [
        {"type": "security", "text": "192.168.1.105 teve 4 tentativas bloqueadas nas últimas 2h."},
        {"type": "security", "text": "Usuário pedro@clinica.com.br trocou a senha 2 vezes em 5 dias."},
        {"type": "trend", "text": "Aumento de 25% em acessos na última semana."},
        {"type": "location", "text": "Mais acessos vindos de Londrina nas últimas 24h."}
    ]
}

@app.route('/api/ping')
def ping():
    return jsonify({
        "status": "success",
        "message": "API simples funcionando",
        "timestamp": "2025-05-24"
    })

@app.route('/api/dashboard/data')
def dashboard_data():
    return jsonify(MOCK_DASHBOARD_DATA)

@app.route('/api/dashboard/insights/multiple')
def dashboard_insights():
    return jsonify(MOCK_INSIGHTS)

@app.route('/api/auth/verify-captcha', methods=['POST'])
def verify_captcha():
    return jsonify({
        "success": False,
        "message": "Captcha inválido (modo teste)",
        "errors": ["invalid-input-response"]
    })

@app.route('/api/users')
def users():
    return jsonify([
        {"id": 1, "nome": "Admin", "email": "admin@test.com", "role": "admin"},
        {"id": 2, "nome": "User", "email": "user@test.com", "role": "user"}
    ])

if __name__ == '__main__':
    print("🚀 Iniciando servidor backend simples com dados mockados...")
    print("📊 Rotas disponíveis:")
    print("  - /api/ping")
    print("  - /api/dashboard/data")
    print("  - /api/dashboard/insights/multiple")
    print("  - /api/users")
    app.run(host='0.0.0.0', port=5000, debug=True) 