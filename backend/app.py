from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp, setup_oauth, ensure_test_user_exists, ensure_default_admin_exists
from routes.dashboard import dashboard_bp
from routes.users import users_bp
from routes.logs import logs_bp
from routes.alerts import alerts_bp
from routes.settings import settings_bp

app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS
CORS(app)

# Configurar banco de dados
db.init_app(app)

# Configurar JWT
jwt = JWTManager(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(logs_bp, url_prefix='/api/logs')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(settings_bp, url_prefix='/api/settings')

# Criar tabelas e usuários padrão
with app.app_context():
    db.create_all()
    
    # Configurar OAuth
    setup_oauth(app)
    
    # Garantir que os usuários padrão existam
    ensure_test_user_exists()
    ensure_default_admin_exists()
    
    print("Banco de dados inicializado com sucesso!")

# Rota de verificação de status
@app.route('/ping')
def ping():
    return jsonify({"status": "ok", "message": "API VidaShield está online!"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') 