# -*- coding: utf-8 -*-
"""
Módulo principal da aplicação VidaShield.
"""

import os
import logging
import platform
import datetime
import traceback
from flask import Flask, jsonify, request, redirect, send_from_directory
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, CSRFError
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from werkzeug.exceptions import HTTPException

from config import Config
from models import db
from routes.auth import auth_bp, setup_oauth
from routes.dashboard import dashboard_bp
from routes.users import users_bp
from routes.logs import logs_bp
from routes.alerts import alerts_bp
from routes.settings import settings_bp
from routes.reports import reports_bp

# Setup básico
os.makedirs('instance', exist_ok=True)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

app = Flask(__name__)
app.logger = logging.getLogger(__name__)
app.config.from_object(Config())

# Segurança
app.secret_key = app.config['SECRET_KEY']
app.config['JWT_SECRET_KEY'] = app.config['JWT_SECRET_KEY']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)

# CORS
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# CSRF Protection (exempt para auth routes)
csrf = CSRFProtect(app)
csrf.exempt(auth_bp)

# DB + JWT + Migrate
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(logs_bp, url_prefix='/api/logs')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(reports_bp, url_prefix='/api/reports')

# Handlers
@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    app.logger.error(f"Erro CSRF: {e}")
    return jsonify({"msg": "INVALID_CSRF"}), 400

@app.after_request
def log_response(response):
    app.logger.info(f"{request.method} {request.path} -> {response.status_code}")
    return response

@app.errorhandler(HTTPException)
def handle_http_exception(e):
    app.logger.error(f"HTTP {e.code}: {e.description}")
    return jsonify({"error": e.description}), e.code

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Erro não tratado: {str(e)}")
    traceback.print_exc()
    return jsonify({"error": "Erro interno do servidor"}), 500

# Rota de Ping (status)
@app.route('/api/ping')
def ping():
    return jsonify({
        "status": "success",
        "message": "API está funcionando",
        "timestamp": datetime.datetime.now().isoformat()
    })

# Rota raiz da API
@app.route('/api')
def api_info():
    return jsonify({
        "name": "VidaShield API",
        "version": "2.0",
        "status": "online",
        "timestamp": datetime.datetime.now().isoformat()
    })

# Rota raiz redireciona pro /api/ping
@app.route('/')
def index():
    return redirect('/api/ping')

# Favicon, Apple icons e static genéricos
@app.route('/favicon.ico')
@app.route('/apple-touch-icon.png')
@app.route('/apple-touch-icon-precomposed.png')
def empty_icon():
    return "", 204

@app.route('/robots.txt')
def robots():
    return "User-agent: *\nDisallow: /", 200

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Inicialização
with app.app_context():
    try:
        db.create_all()
        app.logger.info("Banco de dados OK")
        setup_oauth(app)
        app.logger.info("OAuth OK")
    except Exception as e:
        app.logger.error(f"Erro ao iniciar: {e}")
        traceback.print_exc()

# Boas-vindas
def print_welcome():
    width = os.get_terminal_size().columns if os.isatty(0) else 80
    msg = f"""
{'='*width}
🛡️  VidaShield API - v2.0 - Projeto Integrador TTPR 15
🚀 Rodando em: http://localhost:{os.getenv('PORT', '5000')}
📊 Dashboard: http://localhost:3000
{'='*width}
"""
    print(msg)

if __name__ == '__main__':
    print_welcome()
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
