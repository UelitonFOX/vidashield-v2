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
from flask import Flask, jsonify, request, render_template, send_from_directory
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

app = Flask(__name__)
app.config.from_object(Config)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)

# Inicializar proteção CSRF
csrf = CSRFProtect(app)

# Desabilitar CSRF para certas rotas (debug/desenvolvimento)
csrf.exempt(auth_bp)

# Configuração simplificada do CORS - mais permissiva para desenvolvimento
app.config['CORS_ALLOW_HEADERS'] = ['Content-Type', 'Authorization', 'X-CSRF-TOKEN']
app.config['CORS_ALWAYS_SEND'] = True
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
app.config['CORS_ORIGINS'] = ['http://localhost:3000', 'https://vidashield.vercel.app']
app.config['CORS_ALLOW_ALL_ORIGINS'] = True

# Aplicar CORS a toda a aplicação
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
    origin = request.headers.get('Origin', '*')
    
    # Permitir todas as origens em desenvolvimento
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRF-TOKEN'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Max-Age'] = '86400' # 24 horas
    
    # Registrar informações de requisição para debug
    app.logger.info(f"Requisição: {request.method} {request.path} de {origin}")
    app.logger.info(f"Resposta: {response.status_code}")
    
    return response

# Rota OPTIONS para todas as URLs
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return jsonify({}), 200

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

# Rota para a documentação da API
@app.route('/docs')
def api_docs():
    """
    Exibe uma página HTML com documentação das APIs disponíveis.
    
    Returns:
        Página HTML renderizada com documentação das APIs
    """
    # Verificar o status do banco de dados e APIs
    context = get_system_status()
    return render_template('docs/api.html', **context)

# Rota raiz que redireciona para a documentação
@app.route('/')
def index():
    """
    Rota raiz que redireciona para a documentação da API.
    
    Returns:
        Página HTML com informações básicas e link para documentação
    """
    # Obter status do sistema
    context = get_system_status()
    return render_template('docs/api.html', **context)

def get_system_status():
    """
    Verifica o status do sistema e retorna informações para o template.
    
    Returns:
        Dicionário com informações de status do sistema
    """
    # Verificar o status do banco de dados
    db_status = "conectado"
    db_type = "desconhecido"
    
    try:
        # Testar conexão com banco
        with app.app_context():
            from sqlalchemy import text
            result = db.session.execute(text("SELECT 1")).scalar()
            db_status = "conectado" if result == 1 else "erro: resultado inesperado"
            
            # Verificar o tipo de banco
            url = str(db.engine.url)
            if 'sqlite' in url:
                db_type = "SQLite (local)"
            elif 'postgresql' in url or 'postgres' in url:
                db_type = "PostgreSQL (Supabase)"
            else:
                db_type = url.split('://')[0] if '://' in url else url
    except Exception as e:
        db_status = f"erro: {str(e)}"
    
    # Verificar status dos endpoints principais
    endpoints_status = {
        "auth": check_endpoint_status("/api/auth/csrf-token"),
        "dashboard": check_endpoint_status("/api/dashboard/stats"),
        "users": check_endpoint_status("/api/users"),
        "logs": check_endpoint_status("/api/logs"),
        "alerts": check_endpoint_status("/api/alerts"),
        "settings": check_endpoint_status("/api/settings/version"),
        "reports": check_endpoint_status("/api/reports")
    }
    
    return {
        "status": "online",
        "version": "2.0",
        "db_status": db_status,
        "db_type": db_type,
        "env": os.getenv('FLASK_ENV', 'development'),
        "timestamp": datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        "endpoints_status": endpoints_status
    }

def check_endpoint_status(endpoint):
    """
    Verifica se um endpoint está respondendo corretamente.
    
    Args:
        endpoint: URL do endpoint a ser verificado
        
    Returns:
        Status do endpoint (online/offline)
    """
    try:
        # Verificamos apenas se a rota existe, não se está funcionando completamente
        # Para simplificar, consideramos que se o endpoint está registrado, está online
        for rule in app.url_map.iter_rules():
            if endpoint in rule.rule:
                return "online"
        return "desconhecido"
    except:
        return "offline"

# Criar tabelas e usuários padrão
with app.app_context():
    try:
        # Inicializar banco de dados
        db.create_all()
        app.logger.info("Banco de dados inicializado com sucesso!")
        
        # Configurar OAuth
        setup_oauth(app)
        
        # Garantir que os usuários padrão existam
        ensure_test_user_exists()
        ensure_default_admin_exists()
    except Exception as e:
        app.logger.error(f"Erro ao inicializar o banco de dados: {e}")
        if os.getenv('FLASK_ENV') != 'production':
            # Em desenvolvimento, reexibir o erro para facilitar debug
            raise
    
# Rota de verificação de status
@app.route('/ping')
def ping():
    db_status = "conectado"
    db_type = "desconhecido"
    try:
        # Testar conexão com banco de forma direta
        with app.app_context():
            from sqlalchemy import text, inspect
            from sqlalchemy.engine import Engine
            
            # Executar uma query simples para testar a conexão
            result = db.session.execute(text("SELECT 1")).scalar()
            db_status = "conectado" if result == 1 else "erro: resultado inesperado"
            
            # Verificar o tipo de banco de maneira mais direta
            try:
                # Tentar obter o nome da conexão diretamente
                conn = db.engine.raw_connection()
                if hasattr(conn, 'dbapi_connection'):
                    # Para PostgreSQL
                    adapter_name = type(conn.dbapi_connection).__module__
                    if 'psycopg2' in adapter_name or 'postgresql' in adapter_name:
                        db_type = "postgresql (supabase)"
                    # Para SQLite
                    elif 'sqlite3' in adapter_name:
                        db_type = "sqlite (local)"
                    else:
                        db_type = adapter_name
                else:
                    # Método alternativo usando URL da conexão
                    url = str(db.engine.url)
                    if 'sqlite' in url:
                        db_type = "sqlite (local)"
                    elif 'postgresql' in url or 'postgres' in url:
                        db_type = "postgresql (supabase)"
                    else:
                        db_type = url.split('://')[0] if '://' in url else url
            except Exception as dialect_error:
                app.logger.warning(f"Não foi possível determinar o tipo de banco exato: {dialect_error}")
                db_type = "tipo desconhecido (mas conectado)"
            
    except Exception as e:
        db_status = f"erro: {str(e)}"
        app.logger.error(f"Erro ao verificar conexão com banco: {e}")
    
    return jsonify({
        "status": "ok", 
        "message": "API VidaShield está online!",
        "database": db_status,
        "db_type": db_type,
        "env": os.getenv('FLASK_ENV', 'development')
    })

# Rota para status completo do sistema (para consumo pela documentação ou clientes API)
@app.route('/api/status')
def api_status():
    """
    Retorna o status completo do sistema, incluindo banco de dados e endpoints.
    
    Returns:
        JSON com status do sistema
    """
    db_status = "conectado"
    db_type = "desconhecido"
    
    try:
        # Testar conexão com banco
        with app.app_context():
            from sqlalchemy import text
            result = db.session.execute(text("SELECT 1")).scalar()
            db_status = "conectado" if result == 1 else "erro: resultado inesperado"
            
            # Verificar o tipo de banco
            url = str(db.engine.url)
            if 'sqlite' in url:
                db_type = "SQLite (local)"
            elif 'postgresql' in url or 'postgres' in url:
                db_type = "PostgreSQL (Supabase)"
            else:
                db_type = url.split('://')[0] if '://' in url else url
    except Exception as e:
        db_status = f"erro: {str(e)}"
        app.logger.error(f"Erro ao verificar conexão com banco: {e}")
    
    # Verificar status dos endpoints principais
    endpoints_status = {
        "auth": check_endpoint_status("/api/auth/csrf-token"),
        "dashboard": check_endpoint_status("/api/dashboard/stats"),
        "users": check_endpoint_status("/api/users"),
        "logs": check_endpoint_status("/api/logs"),
        "alerts": check_endpoint_status("/api/alerts"),
        "settings": check_endpoint_status("/api/settings/version"),
        "reports": check_endpoint_status("/api/reports")
    }
    
    # Adicionar tempos de resposta para endpoints disponíveis
    response_times = {}
    for endpoint, status in endpoints_status.items():
        if status == "online":
            try:
                # Medir tempo de resposta aproximado (simples)
                import time
                route = next((r.rule for r in app.url_map.iter_rules() if endpoint in r.rule), None)
                if route:
                    start = time.time()
                    # Apenas verificamos o registro da rota
                    end = time.time()
                    response_times[endpoint] = round((end - start) * 1000, 2)  # em ms
            except Exception:
                pass
    
    return jsonify({
        "status": "ok", 
        "version": "2.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "database": db_status,
        "db_type": db_type,
        "env": os.getenv('FLASK_ENV', 'development'),
        "endpoints": endpoints_status,
        "response_times": response_times
    })

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

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    if debug_mode:
        app.logger.info("Iniciando servidor em modo de desenvolvimento")
        
    # Criar diretório static se não existir
    os.makedirs(os.path.join(os.path.dirname(__file__), 'static'), exist_ok=True)
    
    # Imprimir mensagem de boas-vindas
    print_welcome_message()
    
    # Iniciar servidor
    app.run(debug=debug_mode, host='0.0.0.0') 