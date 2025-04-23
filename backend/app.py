from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes import auth_bp
from routes import dashboard_bp
from models import db, User
import config
import os

app = Flask(__name__)

# Configurações
app.config.from_object(config)

# Configuração básica do CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Inicialização das extensões
jwt = JWTManager(app)
db.init_app(app)

# Registro dos blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

# Adiciona uma rota para teste de conectividade
@app.route('/ping')
def ping():
    return jsonify({"status": "ok", "message": "Server is running"})

# Rota raiz
@app.route('/')
def home():
    return jsonify({
        "message": "VidaShield API",
        "status": "online",
        "endpoints": [
            "/ping - Teste de conectividade",
            "/api/auth/login - Login de usuários",
            "/api/auth/register - Registro de usuários",
            "/api/auth/google - Login com Google",
            "/api/auth/github - Login com GitHub",
            "/api/dashboard/data - Dados do dashboard"
        ]
    })

# Criar tabelas do banco de dados
with app.app_context():
    db.create_all()
    # Configuração do OAuth
    from routes.auth import setup_oauth, ensure_test_user_exists
    setup_oauth(app)
    # Criar usuário de teste
    ensure_test_user_exists()
    print("Banco de dados inicializado e usuário de teste criado")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Servidor rodando em http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0', port=port) 