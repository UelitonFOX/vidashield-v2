from flask import Blueprint, request, jsonify, url_for, redirect, current_app, render_template_string
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

auth_bp = Blueprint('auth', __name__)
oauth = OAuth()

# Armazenamento temporário para registrar tentativas (em produção, usar Redis ou DB)
login_attempts = defaultdict(list)

# Função para criar usuário de teste se não existir
def ensure_test_user_exists():
    test_email = "test@example.com"
    test_user = User.query.filter_by(email=test_email).first()
    if not test_user:
        test_user = User(
            email=test_email,
            password_hash=generate_password_hash("password"),
            name="Usuário de Teste"
        )
        db.session.add(test_user)
        db.session.commit()
        print(f"Usuário de teste criado: {test_email} / password")
    return test_user

# Garantir que exista um admin padrão
def ensure_default_admin_exists():
    admin_email = "admin@vidashield.com"
    admin_user = User.query.filter_by(email=admin_email).first()
    if not admin_user:
        admin_user = User(
            email=admin_email,
            password_hash=generate_password_hash("vidashield@admin"),
            name="Administrador do Sistema",
            role="admin"
        )
        db.session.add(admin_user)
        db.session.commit()
        print(f"Administrador padrão criado: {admin_email} / vidashield@admin")
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
    
    github_client_id = app.config.get('GITHUB_CLIENT_ID') or 'test_github_client_id'
    github_client_secret = app.config.get('GITHUB_CLIENT_SECRET') or 'test_github_client_secret'
    
    oauth.register(
        name='google',
        client_id=google_client_id,
        client_secret=google_client_secret,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )

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
def google_login():
    # Usar sempre o fluxo de autenticação real do Google
    redirect_uri = current_app.config.get('GOOGLE_REDIRECT_URI') or url_for('auth.google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@auth_bp.route('/google/callback')
def google_callback():
    try:
        token = oauth.google.authorize_access_token()
        print(f"Token OAuth recebido: {token.keys()}")
        
        try:
            user_info = oauth.google.parse_id_token(token)
            print(f"Informações do usuário obtidas: {user_info.get('email')}")
        except Exception as parse_error:
            print(f"Erro ao analisar token: {parse_error}")
            # Tentar método alternativo
            userinfo_response = oauth.google.get('https://www.googleapis.com/oauth2/v3/userinfo', token=token)
            user_info = userinfo_response.json()
            print(f"Informações obtidas via método alternativo: {user_info.get('email')}")
        
        email = user_info.get('email')
        if not email:
            print("ERRO: Email não encontrado nas informações do usuário!")
            print(f"Conteúdo do user_info: {user_info}")
            return jsonify({"msg": "Email não encontrado nas informações do usuário"}), 400
        
        # Pega o sub/id do usuário que pode estar em locais diferentes dependendo da API
        google_id = user_info.get('sub') or user_info.get('id')
        if not google_id:
            print("ERRO: ID do Google não encontrado!")
            return jsonify({"msg": "ID do Google não encontrado"}), 400
        
        # Primeiro procura por oauth_id
        user = User.query.filter_by(oauth_id=google_id, oauth_provider='google').first()
        
        if not user:
            # Se não encontrou por oauth_id, procura por email
            user = User.query.filter_by(email=email).first()
            if user:
                # Atualiza os dados do OAuth para o usuário existente
                user.oauth_provider = 'google'
                user.oauth_id = google_id
                db.session.commit()
                print(f"Usuário existente atualizado: {user.email}")
            else:
                # Cria um novo usuário
                user = User(
                    email=email,
                    name=user_info.get('name', email.split('@')[0]),
                    role='usuario',  # por padrão
                    status='ativo',  # alterar para ativo para facilitar testes
                    oauth_provider='google',
                    oauth_id=google_id,
                    email_verified=True
                )
                db.session.add(user)
                db.session.commit()
                print(f"Novo usuário criado: {user.email}")
                log_oauth_success('google', user.email, user.id, ip_address=request.remote_addr)
        else:
            # Usuário encontrado por oauth_id
            print(f"Usuário existente encontrado por oauth_id: {user.email}")
            log_oauth_success('google', user.email, user.id, ip_address=request.remote_addr)
        
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=1)
        )
        print(f"Token JWT gerado: {access_token[:15]}...")
        
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f'{frontend_url}/oauth-callback?token={access_token}'
        print(f"Redirecionando para: {redirect_url}")
        
        return redirect(redirect_url)
    except Exception as e:
        error_msg = str(e)
        print(f"Erro no callback do Google: {error_msg}")
        if 'email' in locals():
            log_oauth_failure('google', error_msg, email=email, ip_address=request.remote_addr)
        else:
            log_oauth_failure('google', error_msg, ip_address=request.remote_addr)
        return jsonify({"msg": "Erro na autenticação com Google", "error": error_msg}), 500

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
        
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f'{frontend_url}/oauth-callback?token={access_token}')
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
    reset_link = f"http://localhost:3000/reset-password/{reset_token}"
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