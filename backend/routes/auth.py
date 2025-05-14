from flask import Blueprint, request, jsonify, url_for, redirect, current_app, render_template_string, session
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime
from authlib.integrations.flask_client import OAuth
from models import db, User
from utils import validate_uuid, is_valid_uuid, str_to_uuid
import json
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import uuid
import requests
from log_oauth import log_oauth_success, log_oauth_failure
from flask_wtf.csrf import generate_csrf
from collections import defaultdict
from urllib.parse import urlparse

auth_bp = Blueprint('auth', __name__)
oauth = OAuth()

# Armazenamento temporário para registrar tentativas (em produção, usar Redis ou DB)
login_attempts = defaultdict(list)

# Função para criar usuário de teste se não existir
def ensure_test_user_exists():
    test_email = "test@example.com"
    user = None
    
    try:
        user = User.query.filter_by(email=test_email).first()
    except Exception as e:
        print(f"Erro ao buscar usuário de teste: {e}")
        return None
        
    if not user:
        try:
            user = User(
                email=test_email,
                password_hash=generate_password_hash("password"),
                name="Usuário de Teste"
            )
            db.session.add(user)
            db.session.commit()
            print(f"Usuário de teste criado: {test_email} / password")
        except Exception as e:
            print(f"Erro ao criar usuário de teste: {e}")
            return None
    return user

# Garantir que exista um admin padrão
def ensure_default_admin_exists():
    admin_email = "admin@vidashield.com"
    admin_user = None
    
    try:
        admin_user = User.query.filter_by(email=admin_email).first()
    except Exception as e:
        print(f"Erro ao buscar admin padrão: {e}")
        return None
        
    if not admin_user:
        try:
            admin_user = User(
                email=admin_email,
                password_hash=generate_password_hash("vidashield@admin"),
                name="Administrador do Sistema",
                role="admin"
            )
            db.session.add(admin_user)
            db.session.commit()
            print(f"Administrador padrão criado: {admin_email} / vidashield@admin")
        except Exception as e:
            print(f"Erro ao criar admin padrão: {e}")
            return None
    return admin_user

# Configuração do OAuth
def setup_oauth(app):
    oauth.init_app(app)
    
    # Use configurações de teste se as variáveis de ambiente não estiverem definidas
    google_client_id = app.config.get('GOOGLE_CLIENT_ID')
    google_client_secret = app.config.get('GOOGLE_CLIENT_SECRET')
    
    # Log para depuração
    print(f"OAuth Setup - Google Client ID: {google_client_id[:10]}{'...' if google_client_id else ''}")  
    print(f"OAuth Setup - Google Client Secret: {'Configurado' if google_client_secret else 'Não configurado'}")
    
    # Registro mais detalhado do provedor Google
    oauth.register(
        name='google',
        client_id=google_client_id,
        client_secret=google_client_secret,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'prompt': 'select_account'  # Força o Google a mostrar a tela de seleção de conta
        },
        authorize_params={
            'access_type': 'offline'  # Necessário para obter refresh_token
        }
    )
    
    # Configuração do GitHub OAuth
    github_client_id = app.config.get('GITHUB_CLIENT_ID') or 'test_github_client_id'
    github_client_secret = app.config.get('GITHUB_CLIENT_SECRET') or 'test_github_client_secret'
    
    oauth.register(
        name='github',
        client_id=github_client_id,
        client_secret=github_client_secret,
        access_token_url='https://github.com/login/oauth/access_token',
        access_token_params=None,
        authorize_url='https://github.com/login/oauth/authorize',
        authorize_params=None,
        api_base_url='https://api.github.com/',
        client_kwargs={'scope': 'user:email'},
    )
    
    # Garante que o usuário de teste existe
    ensure_test_user_exists()

# Endpoint para obter token CSRF
@auth_bp.route('/csrf-token', methods=['GET'])
def get_csrf_token():
    """
    Retorna um token CSRF para ser usado em requisições protegidas.
    Este token deve ser enviado no header X-CSRF-TOKEN nas requisições POST, PUT, DELETE.
    """
    token = generate_csrf()
    response = jsonify({'csrf_token': token})
    response.headers.set('X-CSRF-TOKEN', token)
    return response

# Função para verificar token do hCaptcha
def verify_hcaptcha(token):
    if current_app.config.get('TESTING', False):
        # Em ambiente de teste, aceita qualquer token
        return True
    
    # Chave secreta do hCaptcha
    hcaptcha_secret_key = current_app.config.get('HCAPTCHA_SECRET_KEY', '0x0000000000000000000000000000000000000000')
    
    # URL de verificação do hCaptcha
    verify_url = 'https://hcaptcha.com/siteverify'
    
    # Dados para verificação
    data = {
        'secret': hcaptcha_secret_key,
        'response': token
    }
    
    # Envia a requisição para verificar o token
    response = requests.post(verify_url, data=data)
    result = response.json()
    
    # Retorna True se o token for válido, False caso contrário
    return result.get('success', False)

@auth_bp.route('/login', methods=['POST'])
def login():
    # Obter dados do request
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400
    
    # Coletar informações extras
    ip_address = request.remote_addr
    user_agent = request.headers.get('User-Agent', 'Unknown')
    
    # Simular verificação (em produção, consultar banco de dados)
    valid_credentials = (email == "admin@clinica.com.br" and password == "admin123")
    
    # Registrar a tentativa
    current_time = datetime.now()
    
    # Chave composta: pode ser por email ou IP (ou ambos)
    attempt_key = f"{email}:{ip_address}"
    
    login_attempts[attempt_key].append({
        "timestamp": current_time,
        "success": valid_credentials,
        "email": email,
        "ip_address": ip_address,
        "user_agent": user_agent
    })
    
    # Verificar tentativas recentes falhas (últimos 10 minutos)
    recent_attempts = [
        attempt for attempt in login_attempts[attempt_key] 
        if attempt["timestamp"] > current_time - timedelta(minutes=10)
    ]
    
    # Manter apenas tentativas recentes na memória
    login_attempts[attempt_key] = recent_attempts
    
    # Contar falhas consecutivas
    failed_attempts = [attempt for attempt in recent_attempts if not attempt["success"]]
    consecutive_failures = len(failed_attempts)
    
    # Validar se estamos diante de uma possível tentativa de intrusão (3+ falhas em 10 min)
    if consecutive_failures >= 3:
        # Gerar alerta de segurança
        create_intrusion_alert(email, ip_address, user_agent, consecutive_failures)
    
    # Se as credenciais são válidas, retornar token JWT
    if valid_credentials:
        access_token = create_access_token(identity=email)
        return jsonify({
            "access_token": access_token,
            "user_email": email
        }), 200
    else:
        return jsonify({"error": "Credenciais inválidas"}), 401

def create_intrusion_alert(email, ip_address, user_agent, attempts_count):
    """
    Criar um alerta para possível tentativa de intrusão.
    Em produção, isso seria armazenado no banco de dados.
    """
    # Simular localização baseada no IP (em produção, usar serviço real de geolocalização)
    fake_locations = {
        "127.0.0.1": "Local (Palmital/PR)",
        "192.168.1.1": "Rede Local (Palmital/PR)",
    }
    
    default_locations = [
        "São Paulo, Brasil", 
        "Rio de Janeiro, Brasil", 
        "Kiev, Ucrânia", 
        "Moscou, Rússia",
        "Pequim, China",
        "Nova York, EUA"
    ]
    
    import random
    location = fake_locations.get(ip_address, random.choice(default_locations))
    
    # Criar objeto de alerta
    alert = {
        "id": str(uuid.uuid4()),
        "type": "Tentativa de intrusão",
        "severity": "critical",
        "timestamp": datetime.now().isoformat(),
        "resolved": False,
        "details": {
            "email": email,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "location": location,
            "attempts": attempts_count,
            "message": f"Detectadas {attempts_count} tentativas falhas de login para o email {email}"
        }
    }
    
    try:
        # Em produção, salvar no banco de dados
        # db.alerts.insert_one(alert)
        
        # Enquanto isso, salvar em um arquivo de log para simulação
        with open("instance/intrusion_alerts.json", "a+") as f:
            try:
                # Tentar ler o arquivo atual primeiro
                f.seek(0)
                content = f.read()
                alerts = json.loads(content) if content else []
            except:
                alerts = []
            
            # Adicionar o novo alerta
            alerts.append(alert)
            
            # Reescrever o arquivo
            f.seek(0)
            f.truncate()
            json.dump(alerts, f, indent=2)
            
        print(f"Alerta de segurança gerado: Possível intrusão detectada para {email}")
        return True
    except Exception as e:
        print(f"Erro ao salvar alerta: {str(e)}")
        return False

@auth_bp.route('/verify_token', methods=['GET'])
@jwt_required()
def verify_token():
    current_user = get_jwt_identity()
    return jsonify({"valid": True, "user": current_user}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    captcha_token = data.get('captchaToken')
    
    # Verifica o token do hCaptcha
    if not verify_hcaptcha(captcha_token):
        return jsonify({"msg": "Verificação de captcha falhou. Por favor, tente novamente."}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email já cadastrado"}), 400
        
    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        name=name
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=1)
    )
    
    return jsonify({
        "msg": "Usuário registrado com sucesso",
        "access_token": access_token
    }), 201

@auth_bp.route('/google')
def login_google():
    """
    Redireciona o usuário para a página de autenticação do Google
    """
    try:
        # Extrair a origem da solicitação
        frontend_origin = request.headers.get('Origin', '')
        print(f"Origem da solicitação de login Google: {frontend_origin}")

        # Extrair também a URL atual (para casos de desenvolvimento)
        current_url = request.url
        print(f"URL da solicitação: {current_url}")
        
        # Obter o redirect_uri da query string
        redirect_uri_param = request.args.get('redirect_uri')
        print(f"Redirect URI da query string: {redirect_uri_param}")
        
        # Obter as URLs permitidas da configuração
        frontend_urls = current_app.config.get('FRONTEND_URLS', [])
        print(f"URLs de frontend permitidas: {frontend_urls}")
        
        # Gerar um state para verificação
        state_data = {
            'redirect_uri': redirect_uri_param
        }
        state = secrets.token_urlsafe(16)
        
        # Armazenar o state e os dados associados
        current_app.config.setdefault('OAUTH_STATES', {})
        current_app.config['OAUTH_STATES'][state] = state_data
        print(f"State gerado: {state}, dados: {state_data}")
            
        # Criar a URL de redirecionamento OAuth para o Google
        callback_uri = url_for('auth.google_callback', _external=True)
        print(f"URL de callback para Google: {callback_uri}")
        
        # Iniciar fluxo OAuth do Google
        return oauth.google.authorize_redirect(callback_uri, state=state)
    except Exception as e:
        error_message = str(e)
        print(f"Erro ao iniciar login com Google: {error_message}")
        return jsonify({"error": "Falha ao iniciar autenticação com Google", "details": error_message}), 500

@auth_bp.route('/google/callback')
def google_callback():
    """
    Endpoint que recebe o redirecionamento do Google OAuth
    após autenticação. Processa o código e troca por um token JWT.
    """
    try:
        print("==== GOOGLE CALLBACK RECEBIDO ====")
        print(f"Query string completa: {request.query_string.decode('utf-8')}")
        print(f"Headers: {dict(request.headers)}")
        
        # Obter o state e validar
        state = request.args.get('state')
        state_data = {}
        
        if state and state in current_app.config.get('OAUTH_STATES', {}):
            state_data = current_app.config['OAUTH_STATES'].pop(state)
            print(f"State válido encontrado: {state}, dados: {state_data}")
        else:
            print(f"State não encontrado ou inválido: {state}")
        
        # Obter token sem passar o code manualmente
        print("Obtendo token do Google...")
        token = oauth.google.authorize_access_token()
        print(f"Token obtido com sucesso: {', '.join(token.keys())}")
        
        # Obter informações do usuário
        print("Obtendo informações do usuário...")
        try:
            user_info = oauth.google.parse_id_token(token)
            print(f"Info do usuário obtida via parse_id_token: {user_info.get('email')}")
        except Exception as parse_error:
            print(f"Erro ao analisar token: {parse_error}")
            # Método alternativo - tentar obter diretamente via API userinfo
            resp = oauth.google.get('https://www.googleapis.com/oauth2/v3/userinfo', token=token)
            user_info = resp.json()
            print(f"Info do usuário obtida via userinfo endpoint: {user_info.get('email')}")
        
        # Extrair informações do usuário
        email = user_info.get('email')
        if not email:
            print(f"ERRO: Email não encontrado nas informações do usuário: {user_info}")
            return jsonify({"error": "Email não encontrado"}), 400
        
        # Obter o ID do Google
        google_id = user_info.get('sub') or user_info.get('id')
        if not google_id:
            print(f"ERRO: ID do Google não encontrado: {user_info}")
            return jsonify({"error": "ID do Google não encontrado"}), 400
        
        # Verificar se o usuário já existe
        user = User.query.filter_by(oauth_id=google_id, oauth_provider='google').first()
        
        if not user:
            # Procurar por email
            user = User.query.filter_by(email=email).first()
            if user:
                # Atualizar dados OAuth para usuário existente
                user.oauth_provider = 'google'
                user.oauth_id = google_id
                db.session.commit()
                print(f"Usuário atualizado: {email} (ID: {user.id})")
                log_oauth_success('google', email, user.id, ip_address=request.remote_addr)
            else:
                # Criar novo usuário
                user = User(
                    email=email,
                    name=user_info.get('name', email.split('@')[0]),
                    role='usuario',
                    status='ativo',
                    oauth_provider='google',
                    oauth_id=google_id,
                    email_verified=True
                )
                db.session.add(user)
                db.session.commit()
                print(f"Novo usuário criado: {email} (ID: {user.id})")
                log_oauth_success('google', email, user.id, ip_address=request.remote_addr)
        else:
            print(f"Usuário encontrado via oauth_id: {email} (ID: {user.id})")
            log_oauth_success('google', email, user.id, ip_address=request.remote_addr)
        
        # Gerar token JWT
        print("Gerando token JWT...")
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=1)
        )
        print(f"Token JWT gerado: {access_token[:15]}...")
        
        # Determinar a URL do frontend para redirecionamento
        frontend_url = None
        
        # Usar a URL que veio no state
        if state_data and state_data.get('redirect_uri'):
            frontend_url = state_data.get('redirect_uri')
            print(f"Usando redirect_uri do state: {frontend_url}")
        
        # Se não tiver no state, usar o padrão
        if not frontend_url:
            frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3001')
            print(f"Usando URL do frontend padrão: {frontend_url}")
        
        # Construir URL de redirecionamento
        # Remover /auth/callback caso exista no frontend_url
        if frontend_url.endswith('/auth/callback'):
            frontend_base = frontend_url[:-14]
        else:
            frontend_base = frontend_url
            
        redirect_url = f'{frontend_base}/auth/callback?token={access_token}'
        print(f"Redirecionando para: {redirect_url}")
        
        return redirect(redirect_url)
    except Exception as e:
        error_msg = str(e)
        print(f"Erro no callback do Google: {error_msg}")
        print(f"Detalhes completos: {repr(e)}")
        
        if 'email' in locals():
            log_oauth_failure('google', error_msg, email=email, ip_address=request.remote_addr)
        else:
            log_oauth_failure('google', error_msg, ip_address=request.remote_addr)
        
        # Retornar erro e redirecionar para frontend com mensagem de erro
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3001')
        return redirect(f"{frontend_url}/auth/callback?error=auth_error&error_description={error_msg}")

@auth_bp.route('/github')
def github_login():
    # Usar sempre o fluxo de autenticação real do GitHub
    redirect_uri = url_for('auth.github_callback', _external=True)
    return oauth.github.authorize_redirect(redirect_uri)

@auth_bp.route('/github/callback')
def github_callback():
    try:
        token = oauth.github.authorize_access_token()
        resp = oauth.github.get('user', token=token)
        user_info = resp.json()
        
        # Obter email do GitHub
        emails_resp = oauth.github.get('user/emails', token=token)
        emails = emails_resp.json()
        primary_email = next(email['email'] for email in emails if email['primary'])
        
        # Primeiro procura por oauth_id
        user = User.query.filter_by(oauth_id=str(user_info['id']), oauth_provider='github').first()
        
        if not user:
            # Se não encontrou por oauth_id, procura por email
            user = User.query.filter_by(email=primary_email).first()
            if user:
                # Atualiza os dados do OAuth para o usuário existente
                user.oauth_provider = 'github'
                user.oauth_id = str(user_info['id'])
                db.session.commit()
                log_oauth_success('github', primary_email, user.id, ip_address=request.remote_addr)
            else:
                # Cria um novo usuário
                user = User(
                    email=primary_email,
                    name=user_info['name'] or user_info['login'],
                    role='usuario',  # por padrão
                    status='pendente',  # por padrão
                    oauth_provider='github',
                    oauth_id=str(user_info['id']),
                    email_verified=True
                )
                db.session.add(user)
                db.session.commit()
                log_oauth_success('github', primary_email, user.id, ip_address=request.remote_addr)
        else:
            # Usuário encontrado por oauth_id
            log_oauth_success('github', primary_email, user.id, ip_address=request.remote_addr)
        
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=1)
        )
        
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3001')
        return redirect(f'{frontend_url}/auth/callback?token={access_token}')
    except Exception as e:
        error_msg = str(e)
        print(f"Erro no callback do GitHub: {error_msg}")
        log_oauth_failure('github', error_msg, email=primary_email if 'primary_email' in locals() else None, ip_address=request.remote_addr)
        return jsonify({"msg": "Erro na autenticação com GitHub"}), 500

@auth_bp.route('/me', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)  # Tornando o JWT opcional para propósitos de depuração
def get_user():
    # Se for uma requisição OPTIONS, retornar resposta vazia com cabeçalhos CORS
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-TOKEN')
        response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
        response.headers.add('Access-Control-Max-Age', '86400')  # 24 horas
        return response
        
    # Logging para debug
    print("=== ROTA /api/auth/me ===")
    print(f"Headers: {dict(request.headers)}")
    print(f"JWT Identity: {get_jwt_identity()}")
    
    current_user_id = get_jwt_identity()
    
    if not current_user_id:
        print("Nenhum JWT fornecido ou JWT inválido")
        return jsonify({"msg": "Não autorizado - Token JWT não fornecido ou inválido"}), 401
        
    # Validação de UUID para compatibilidade com Supabase
    try:
        # Tenta converter para UUID caso seja string
        if isinstance(current_user_id, str) and is_valid_uuid(current_user_id):
            user = User.query.filter_by(id=current_user_id).first()
        else:
            user = User.query.get(current_user_id)
    except Exception as e:
        print(f"Erro ao buscar usuário: {str(e)}")
        return jsonify({"msg": f"Erro ao buscar usuário: {str(e)}"}), 500
    
    # Verificar se o usuário existe, está ativo E tem status 'ativo'
    if not user or not user.is_active or user.status != 'ativo':
        # Log para depuração
        print(f"/me: Usuário {current_user_id} não encontrado, inativo ou com status diferente de 'ativo'. Status: {user.status if user else 'N/A'}, IsActive: {user.is_active if user else 'N/A'}")
        # Retorna 401 para indicar que o usuário não está autorizado
        return jsonify({"msg": "Usuário não autorizado ou inativo"}), 401
    
    response_data = {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_active": user.is_active,
            "status": user.status  # Incluindo o status na resposta
        }
    }
    print(f"Retornando dados do usuário: {user.email}")
    
    # Adicionar manualmente cabeçalhos CORS
    response = jsonify(response_data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-TOKEN')
    response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
    
    return response

@auth_bp.route('/check-role', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def check_role():
    # Se for uma requisição OPTIONS, retornar resposta vazia com cabeçalhos CORS
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-TOKEN')
        response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
        response.headers.add('Access-Control-Max-Age', '86400')  # 24 horas
        return response
        
    current_user_id = get_jwt_identity()
    
    if not current_user_id:
        return jsonify({"msg": "Não autorizado - Token JWT não fornecido ou inválido"}), 401
        
    # Validação de UUID para compatibilidade com Supabase
    try:
        # Tenta converter para UUID caso seja string
        if isinstance(current_user_id, str) and is_valid_uuid(current_user_id):
            user = User.query.filter_by(id=current_user_id).first()
        else:
            user = User.query.get(current_user_id)
    except Exception as e:
        return jsonify({"msg": f"Erro ao buscar usuário: {str(e)}"}), 500
    
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404
    
    response_data = {
        "isAdmin": user.role == 'admin',
        "isManager": user.role == 'manager',
        "role": user.role
    }
    
    # Adicionar manualmente cabeçalhos CORS
    response = jsonify(response_data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-TOKEN')
    response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
    
    return response

@auth_bp.route('/recover', methods=['POST'])
def recover_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"msg": "Email é obrigatório"}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Por segurança, não informamos se o email existe ou não
        return jsonify({
            "msg": "Se o email estiver cadastrado, você receberá as instruções para recuperação de senha"
        }), 200
    
    # Gerar token de recuperação
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()
    
    # Carregar o template do email
    template_path = os.path.join(current_app.root_path, 'templates', 'email', 'password_reset.html')
    with open(template_path, 'r', encoding='utf-8') as file:
        template = file.read()
    
    # Renderizar o template com as variáveis
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/reset-password/{reset_token}"
    html_content = render_template_string(
        template,
        link=reset_link,
        year=datetime.utcnow().year
    )
    
    # Enviar email
    try:
        msg = MIMEMultipart()
        msg['From'] = f'VidaShield <{current_app.config["MAIL_USERNAME"]}>'
        msg['To'] = email
        msg['Subject'] = "Recuperação de Senha - VidaShield"
        
        msg.attach(MIMEText(html_content, 'html'))
        
        server = smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT'])
        server.starttls()
        server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
        server.send_message(msg)
        server.quit()
        
        return jsonify({
            "msg": "Se o email estiver cadastrado, você receberá as instruções para recuperação de senha"
        }), 200
        
    except Exception as e:
        print(f"Erro ao enviar email: {str(e)}")
        return jsonify({"msg": "Erro ao processar a recuperação de senha"}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({"msg": "Token e nova senha são obrigatórios"}), 400
    
    user = User.query.filter_by(reset_token=token).first()
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        return jsonify({"msg": "Token inválido ou expirado"}), 400
    
    user.password_hash = generate_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()
    
    return jsonify({"msg": "Senha alterada com sucesso"}), 200

@auth_bp.route('/create-admin', methods=['POST'])
def create_admin():
    # Verificar se já existe um admin
    if User.query.filter_by(role="admin").first():
        return jsonify({"msg": "Já existe pelo menos um administrador no sistema"}), 400
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email já cadastrado"}), 400
        
    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        name=name,
        role="admin"
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        "msg": "Administrador criado com sucesso",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 201

@auth_bp.route('/test-captcha', methods=['POST'])
def test_captcha():
    """
    Endpoint de teste para verificar a funcionalidade do hCaptcha
    """
    data = request.get_json()
    captcha_token = data.get('captchaToken')
    
    if not captcha_token:
        return jsonify({"erro": "Token do captcha não fornecido"}), 400
        
    if verify_hcaptcha(captcha_token):
        return jsonify({"mensagem": "Token do captcha válido"})
    
    return jsonify({"erro": "Token do captcha inválido"}), 400

# Função auxiliar para gerar tokens de teste
def _generate_test_token(provider):
    # Busca um usuário de teste ou cria um novo
    test_email = f"test_{provider}@example.com"
    user = User.query.filter_by(email=test_email).first()
    
    if not user:
        user = User(
            email=test_email,
            name=f"Usuário Teste {provider.capitalize()}",
            oauth_provider=provider,
            oauth_id=str(uuid.uuid4())
        )
        db.session.add(user)
        db.session.commit()
        print(f"Usuário OAuth de teste criado: {test_email}")
    else:
        print(f"Usando usuário OAuth existente: {test_email}")
    
    # Gera um token JWT para o usuário
    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=1)
    )
    
    print(f"Token gerado para {provider}: {token[:15]}...")
    return token

@auth_bp.route('/token', methods=['POST'])
def exchange_token():
    """
    Endpoint que recebe um código de autorização OAuth do frontend
    e retorna um token JWT após a validação bem-sucedida
    """
    try:
        # Verificar CSRF token
        csrf_token = request.json.get('csrf_token')
        if not csrf_token or csrf_token != session.get('csrf_token'):
            print(f"Erro de CSRF token: Recebido={csrf_token}, Esperado={session.get('csrf_token')}")
            return jsonify({"error": "CSRF token inválido"}), 403
        
        # Obter dados da requisição
        code = request.json.get('code')
        redirect_uri = request.json.get('redirect_uri')
        
        if not code:
            return jsonify({"error": "Código de autorização não fornecido"}), 400
        
        if not redirect_uri:
            return jsonify({"error": "URI de redirecionamento não fornecido"}), 400
        
        print(f"==== TROCA DE CÓDIGO POR TOKEN ====")
        print(f"Código recebido: {code[:10]}...")
        print(f"Redirect URI: {redirect_uri}")
        
        # Verificar se o redirect_uri é válido
        parsed_uri = urlparse(redirect_uri)
        frontend_origin = f"{parsed_uri.scheme}://{parsed_uri.netloc}"
        
        frontend_urls = current_app.config.get('FRONTEND_URLS', [])
        valid_origin = any(frontend_origin.startswith(url) for url in frontend_urls)
        
        if not valid_origin:
            print(f"Origem inválida: {frontend_origin}")
            return jsonify({"error": "Origem não autorizada"}), 403
        
        # Configurar o cliente para usar o redirect_uri fornecido
        google_client = None
        if 'google' in oauth._clients:
            google_client = oauth._clients['google']
            if hasattr(google_client, 'config'):
                client_config = google_client.config.copy() if hasattr(google_client.config, 'copy') else dict(google_client.config)
                client_config['redirect_uri'] = redirect_uri
                google_client.config = client_config
                print(f"Cliente Google configurado com redirect_uri: {redirect_uri}")
        
        if not google_client:
            print("Cliente Google não encontrado")
            return jsonify({"error": "Cliente OAuth não configurado"}), 500
        
        # Trocar o código por um token
        try:
            token = oauth.google.authorize_access_token(code=code)
            print(f"Token obtido com sucesso: {', '.join(token.keys())}")
        except Exception as token_error:
            print(f"ERRO AO OBTER TOKEN: {str(token_error)}")
            print(f"Tipo de erro: {type(token_error).__name__}")
            print(f"Detalhes completos: {repr(token_error)}")
            
            # Verificar se é um problema de redirect_uri
            if "redirect_uri_mismatch" in str(token_error).lower():
                print("Erro de redirect_uri mismatch detectado!")
                return jsonify({
                    "error": "URI de redirecionamento incorreto", 
                    "message": "O URI de redirecionamento não corresponde ao configurado no Console Google"
                }), 400
            
            return jsonify({"error": f"Falha ao obter token: {str(token_error)}"}), 500
        
        # Obter informações do usuário
        user_info = None
        try:
            user_info = oauth.google.parse_id_token(token)
            print(f"Info do usuário obtida via parse_id_token")
        except Exception as parse_error:
            print(f"Erro ao analisar token: {parse_error}")
            try:
                # Método alternativo - tentar obter diretamente via API userinfo
                resp = oauth.google.get('https://www.googleapis.com/oauth2/v3/userinfo', token=token)
                user_info = resp.json()
                print(f"Info do usuário obtida via userinfo endpoint: {user_info.get('email')}")
            except Exception as userinfo_error:
                print(f"Erro ao obter userinfo: {userinfo_error}")
                return jsonify({"error": "Falha ao obter informações do usuário"}), 500
            
        if not user_info:
            print("ERRO: Não foi possível obter informações do usuário")
            return jsonify({"error": "Falha ao obter informações do usuário"}), 500
        
        # Extrair informações do usuário
        email = user_info.get('email')
        if not email:
            print(f"ERRO: Email não encontrado nas informações do usuário: {user_info}")
            return jsonify({"error": "Email não encontrado"}), 400
        
        # Obter o ID do Google
        google_id = user_info.get('sub') or user_info.get('id')
        if not google_id:
            print(f"ERRO: ID do Google não encontrado: {user_info}")
            return jsonify({"error": "ID do Google não encontrado"}), 400
        
        # Verificar se o usuário já existe
        user = User.query.filter_by(oauth_id=google_id, oauth_provider='google').first()
        
        if not user:
            # Procurar por email
            user = User.query.filter_by(email=email).first()
            if user:
                # Atualizar dados OAuth para usuário existente
                user.oauth_provider = 'google'
                user.oauth_id = google_id
                db.session.commit()
                print(f"Usuário atualizado: {email} (ID: {user.id})")
            else:
                # Criar novo usuário
                user = User(
                    email=email,
                    name=user_info.get('name', email.split('@')[0]),
                    role='usuario',
                    status='ativo',
                    oauth_provider='google',
                    oauth_id=google_id,
                    email_verified=True
                )
                db.session.add(user)
                db.session.commit()
                print(f"Novo usuário criado: {email} (ID: {user.id})")
                log_oauth_success('google', email, user.id, ip_address=request.remote_addr)
        else:
            print(f"Usuário encontrado via oauth_id: {email} (ID: {user.id})")
            log_oauth_success('google', email, user.id, ip_address=request.remote_addr)
        
        # Gerar token JWT
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=1)
        )
        print(f"Token JWT gerado: {access_token[:15]}...")
        
        # Retornar token e informações do usuário
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
        })
        
    except Exception as e:
        error_msg = str(e)
        print(f"Erro no endpoint de troca de token: {error_msg}")
        print(f"Detalhes completos: {repr(e)}")
        
        if 'email' in locals():
            log_oauth_failure('google', error_msg, email=email, ip_address=request.remote_addr)
        else:
            log_oauth_failure('google', error_msg, ip_address=request.remote_addr)
        
        return jsonify({
            "error": "Erro ao processar código de autorização", 
            "message": error_msg,
            "type": type(e).__name__
        }), 500

@auth_bp.route('/callback')
def handle_redirect_callback():
    """
    Endpoint de proxy para capturar o redirecionamento do provedor OAuth
    e encaminhar diretamente para o frontend com token.
    """
    try:
        print("==== CALLBACK RECEBIDO ====")
        print(f"Query string completa: {request.query_string.decode('utf-8')}")
        
        # Extrair código e state dos parâmetros
        code = request.args.get('code')
        state = request.args.get('state')
        scope = request.args.get('scope', '')
        error = request.args.get('error')
        
        # Determinar URL do frontend
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3001')
        
        # Se houver erro no callback, redirecionar imediatamente com erro
        if error or not code:
            error_desc = request.args.get('error_description', 'Erro desconhecido')
            print(f"Erro no callback: {error} - {error_desc}")
            return redirect(f"{frontend_url}/auth/callback?error={error or 'missing_code'}&error_description={error_desc}")
        
        # Apenas passar o código para o frontend e deixar o frontend trocar por token
        # Isso evita problemas de CORS e erros no backend
        print(f"Redirecionando para o frontend com código: {code[:10]}...")
        return redirect(f"{frontend_url}/auth/callback?code={code}&state={state}")
            
    except Exception as e:
        print(f"ERRO GRAVE no /callback: {str(e)}")
        print(f"Detalhes: {repr(e)}")
        # Redirecionar com erro para o frontend lidar com a exibição
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3001')
        return redirect(f"{frontend_url}/auth/callback?error=server_error&error_description={str(e)}")

# Tratamento para favicon.ico
@auth_bp.route('/favicon.ico')
def favicon():
    return "", 204 