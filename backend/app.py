# -*- coding: utf-8 -*-
"""
Módulo principal da aplicação VidaShield.

Este módulo é responsável pela inicialização do servidor Flask,
configuração do banco de dados, rotas e middlewares.
"""

import os
import logging
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

# Configurar logging
logging.basicConfig(
    level=logging.INFO if os.getenv('FLASK_ENV') != 'production' else logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('VidaShield')

app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://vidashield.vercel.app"]}}, supports_credentials=True)

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
    try:
        # Inicializar banco de dados
        db.create_all()
        logger.info("Banco de dados inicializado com sucesso!")
        
        # Configurar OAuth
        setup_oauth(app)
        
        # Garantir que os usuários padrão existam
        ensure_test_user_exists()
        ensure_default_admin_exists()
    except Exception as e:
        logger.error(f"Erro ao inicializar o banco de dados: {e}")
        if os.getenv('FLASK_ENV') != 'production':
            # Em desenvolvimento, reexibir o erro para facilitar debug
            raise
    
# Rota de verificação de status
@app.route('/ping')
def ping():
    db_status = "conectado"
    db_type = "desconhecido"
    try:
        # Testar conexão com banco
        with app.app_context():
            from sqlalchemy import text
            db.session.execute(text("SELECT 1"))
            
            # Verificar o tipo de banco (SQLite ou PostgreSQL/Supabase)
            dialect = db.session.bind.dialect.name
            if 'sqlite' in dialect.lower():
                db_type = "sqlite (local)"
            elif 'postgre' in dialect.lower():
                db_type = "postgresql (supabase)"
            else:
                db_type = dialect
    except Exception as e:
        db_status = f"erro: {str(e)}"
        logger.error(f"Erro ao verificar conexão com banco: {e}")
    
    return jsonify({
        "status": "ok", 
        "message": "API VidaShield está online!",
        "database": db_status,
        "db_type": db_type,
        "env": os.getenv('FLASK_ENV', 'development')
    })

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    if debug_mode:
        logger.info("Iniciando servidor em modo de desenvolvimento")
    app.run(debug=debug_mode, host='0.0.0.0') 