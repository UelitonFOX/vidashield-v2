# -*- coding: utf-8 -*-
"""
Módulo principal da aplicação VidaShield.

Este módulo é responsável pela inicialização do servidor Flask,
configuração do banco de dados, rotas e middlewares.
"""

import os
import logging
import platform
import datetime
from flask import Flask, jsonify, request, render_template, send_from_directory, redirect
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, CSRFError
from config import Config
from models import db
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp, setup_oauth, ensure_test_user_exists, ensure_default_admin_exists
from routes.dashboard import dashboard_bp
from routes.users import users_bp
from routes.logs import logs_bp
from routes.alerts import alerts_bp
from routes.settings import settings_bp
from routes.reports import reports_bp
from logging.handlers import RotatingFileHandler
from flask_migrate import Migrate
from werkzeug.exceptions import HTTPException
import traceback

# Criar pasta para logs se não existir
os.makedirs('logs', exist_ok=True)
os.makedirs('instance', exist_ok=True)

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

file_handler = RotatingFileHandler(
    'logs/vidashield.log', maxBytes=10240, backupCount=10
)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

# Inicializar app Flask
app = Flask(__name__)
app.config.from_object(Config())
app.secret_key = app.config.get('SECRET_KEY')  # Necessário para o Flask Session
app.config['JWT_SECRET_KEY'] = app.config.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)

# Inicializar proteção CSRF
csrf = CSRFProtect(app)

# Desabilitar CSRF para certas rotas (debug/desenvolvimento)
csrf.exempt(auth_bp)

# Configuração simplificada do CORS - mais permissiva para desenvolvimento
app.config['CORS_ALLOW_HEADERS'] = ['Content-Type', 'Authorization', 'X-CSRF-TOKEN']
app.config['CORS_ALWAYS_SEND'] = True
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
app.config['CORS_ORIGINS'] = ['http://localhost:3001']
app.config['CORS_ALLOW_ALL_ORIGINS'] = False

# Aplicar CORS a toda a aplicação
CORS(app, origins=["http://localhost:3001"], supports_credentials=True)

# Configurar banco de dados
db.init_app(app)

# Configurar migrações do banco de dados
migrate = Migrate(app, db)

# Configurar JWT
jwt = JWTManager(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(logs_bp, url_prefix='/api/logs')
app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(reports_bp, url_prefix='/api/reports')

# Adicionar logging
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)

# Verificar o modo de operação
if app.debug:
    app.logger.info('Aplicação inicializada em modo DEBUG')
else:
    app.logger.info('Aplicação inicializada em modo PRODUÇÃO')

# Handler para erros de CSRF
@app.errorhandler(CSRFError)
def handle_csrf_error(e):
    app.logger.error(f"Erro CSRF: {e}")
    app.logger.error(f"URL: {request.url}, Método: {request.method}, IP: {request.remote_addr}")
    return jsonify({"msg": "INVALID_CSRF: Token CSRF inválido ou ausente. Por favor, atualize a página e tente novamente."}), 400

# Adicionar headers CORS em cada resposta
@app.after_request
def add_cors_headers(response):
    app.logger.info(f"Requisição: {request.method} {request.path} de {request.headers.get('Origin', '*')}")
    
    origin = request.headers.get('Origin', '*')
    
    # Permitir apenas o frontend local
    allowed_origins = ["http://localhost:3001"]
        
    # Se a origem da requisição é permitida
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 
                           'Content-Type, Authorization, X-CSRF-TOKEN')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        
    app.logger.info(f"Resposta: {response.status_code}")
    return response

# Registrar erros HTTP não tratados
@app.errorhandler(HTTPException)
def handle_http_exception(e):
    app.logger.error(f"Erro HTTP {e.code}: {e.description}")
    return jsonify({"error": e.description}), e.code

# Registrar erros não tratados
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Erro não tratado: {str(e)}")
    traceback.print_exc()
    return jsonify({"error": "Erro interno do servidor", "details": str(e)}), 500

# Rota OPTIONS para todas as URLs
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return jsonify({}), 200

# Rota para tratar recursos estáticos na raiz que podem causar erros 405
@app.route('/favicon.ico')
def serve_favicon():
    return "", 204

@app.route('/apple-touch-icon.png')
@app.route('/apple-touch-icon-precomposed.png')
def serve_apple_icon():
    return "", 204

@app.route('/robots.txt')
def serve_robots():
    return "User-agent: *\nDisallow: /", 200

# Rota para debug de cabeçalhos
@app.route('/api/debug/headers')
def debug_headers():
    headers = dict(request.headers)
    auth_header = headers.get('Authorization', 'Não encontrado')
    return jsonify({
        "headers": headers,
        "auth_header": auth_header,
        "ip": request.remote_addr,
        "method": request.method,
        "url": request.url,
        "timestamp": datetime.datetime.now().isoformat()
    })

# Rota para servir arquivos estáticos
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Rota raiz que redireciona para a documentação
@app.route('/')
def index():
    """
    Rota raiz que redireciona para o endpoint de ping
    """
    return redirect('/api/ping')

# Rota de validação de funcionamento da API
@app.route('/api/ping')
def ping():
    return jsonify({
        "status": "success",
        "message": "API está funcionando",
        "timestamp": datetime.datetime.now().isoformat(),
        "environment": app.config.get('ENV', 'production')
    })

# API Documentação
@app.route('/docs')
def docs():
    return jsonify({
        "status": "success",
        "message": "Documentação da API (implementação futura)",
        "version": "1.0.0"
    })

# Criar tabelas e usuários padrão
with app.app_context():
    try:
        # Inicializar banco de dados
        db.create_all()
        app.logger.info("Banco de dados inicializado com sucesso!")
        
        # Configurar OAuth 
        setup_oauth(app)
        
        try:
            # Garantir que os usuários padrão existam
            ensure_test_user_exists()
            ensure_default_admin_exists()
            app.logger.info("Usuários padrão verificados com sucesso")
        except Exception as user_error:
            app.logger.warning(f"Erro ao configurar usuários padrão: {user_error}")
    except Exception as e:
        app.logger.error(f"Erro ao inicializar o banco de dados: {e}")
        if os.getenv('FLASK_ENV') != 'production':
            # Em desenvolvimento, reexibir o erro para facilitar debug
            app.logger.error(traceback.format_exc())

def print_welcome_message():
    """Imprime uma mensagem de boas-vindas formatada no terminal"""
    # Obter largura do terminal ou usar valor padrão
    try:
        terminal_width = os.get_terminal_size().columns
    except:
        terminal_width = 80
    
    # Informações do sistema
    system_info = f"Sistema: {platform.system()} {platform.release()}"
    python_info = f"Python: {platform.python_version()}"
    flask_version = "2.0.1"  # Hardcoded para exemplo, idealmente obter dinamicamente
    
    # Informações do banco
    database_url = os.getenv('DATABASE_URL', '')
    db_type = "SQLite (local)" if 'sqlite:' in database_url else "PostgreSQL (Supabase)"
    
    border = "=" * terminal_width
    
    # Formatar mensagem
    message = [
        border,
        f"{'🛡️  VidaShield - Sistema de Segurança Digital para Clínicas  🛡️':^{terminal_width}}",
        f"{'Versão 2.0 - Projeto Integrador Talento Tech PR 15':^{terminal_width}}",
        border,
        "",
        f"{'🚀 Servidor iniciado com sucesso!':^{terminal_width}}",
        f"{'📊 Dashboard: http://localhost:3000':^{terminal_width}}",
        f"{'📚 API Docs: http://localhost:5000/docs':^{terminal_width}}",
        f"{'🔍 API Status: http://localhost:5000/ping':^{terminal_width}}",
        "",
        f" ℹ️  Informações do Sistema:",
        f"    • {system_info}",
        f"    • {python_info}",
        f"    • Flask: {flask_version}",
        f"    • Banco de Dados: {db_type}",
        f"    • Modo: {os.getenv('FLASK_ENV', 'development')}",
        "",
        f" 🔐 Segurança:",
        f"    • JWT Authentication: Ativo",
        f"    • CSRF Protection: Ativo",
        f"    • CORS: Configurado para origens específicas",
        f"    • PostgreSQL: {'Conectado' if 'postgresql:' in database_url else 'Não configurado (usando SQLite)'}",
        "",
        f" 🔧 APIs Disponíveis:",
        f"    • /api/auth       - Autenticação e gerenciamento de sessões",
        f"    • /api/dashboard  - Estatísticas e dados para o dashboard",
        f"    • /api/users      - Gerenciamento de usuários",
        f"    • /api/logs       - Logs de acesso e atividades",
        f"    • /api/alerts     - Sistema de alertas e notificações",
        f"    • /api/settings   - Configurações do sistema",
        "",
        border,
        f"{'⚠️  Para encerrar o servidor, pressione CTRL+C  ⚠️':^{terminal_width}}",
        border
    ]
    
    print("\n".join(message))

# Mensagem de início
if __name__ == '__main__':
    print_welcome_message()
    app.run(host='0.0.0.0', debug=True, port=5000) 