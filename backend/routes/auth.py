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

auth_bp = Blueprint('auth', __name__)
oauth = OAuth()

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
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    captcha_token = data.get('captchaToken')
    
    # Verifica o token do hCaptcha
    if not verify_hcaptcha(captcha_token):
        return jsonify({"msg": "Verificação de captcha falhou. Por favor, tente novamente."}), 400
    
    # Garante que o usuário de teste e admin existam
    ensure_test_user_exists()
    ensure_default_admin_exists()
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Credenciais inválidas"}), 401
        
    # Certifica-se de que o ID do usuário é convertido para string
    # para garantir compatibilidade entre UUID e outros formatos
    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=1)
    )
    
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    })

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
        user_info = token.get('userinfo')
        
        if not user_info:
            log_oauth_failure('google', 'Informações do usuário não disponíveis', 
                             ip_address=request.remote_addr)
            return jsonify({"msg": "Erro ao obter informações do usuário"}), 400
        
        # Log para depuração
        print(f"Google OAuth - Usuário autenticado: {user_info.get('email')}")
        
        # Procurar usuário por oauth_id
        user = User.query.filter_by(oauth_id=user_info['sub'], oauth_provider='google').first()
        
        # Se não encontrou por oauth_id, tenta por email
        if not user:
            user = User.query.filter_by(email=user_info['email']).first()
            if user:
                # Atualiza os dados OAuth para o usuário existente
                user.oauth_provider = 'google'
                user.oauth_id = user_info['sub']
                user.email_verified = True
                print(f"Atualizando usuário existente com dados OAuth: {user.email}")
                db.session.commit()
                log_oauth_success('google', user.email, user.id, ip_address=request.remote_addr)
            else:
                # Cria um novo usuário
                print(f"Criando novo usuário via OAuth: {user_info['email']}")
                user = User(
                    email=user_info['email'],
                    name=user_info['name'],
                    oauth_provider='google',
                    oauth_id=user_info['sub'],
                    email_verified=True
                )
                db.session.add(user)
                db.session.commit()
                log_oauth_success('google', user.email, user.id, ip_address=request.remote_addr)
        else:
            # Usuário encontrado por oauth_id
            log_oauth_success('google', user.email, user.id, ip_address=request.remote_addr)
    except Exception as e:
        error_msg = str(e)
        print(f"Erro no callback do Google: {error_msg}")
        log_oauth_failure('google', error_msg, ip_address=request.remote_addr)
        return jsonify({"msg": "Erro na autenticação com Google"}), 500
    
    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=1)
    )
    
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    return redirect(f'{frontend_url}/oauth-callback?token={access_token}')

@auth_bp.route('/github')
def github_login():
    # Usar sempre o fluxo de autenticação real do GitHub
    redirect_uri = url_for('auth.github_callback', _external=True)
    return oauth.github.authorize_redirect(redirect_uri)

@auth_bp.route('/github/callback')
def github_callback():
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
        else:
            # Cria um novo usuário
            user = User(
                email=primary_email,
                name=user_info['name'] or user_info['login'],
                oauth_provider='github',
                oauth_id=str(user_info['id'])
            )
            db.session.add(user)
            db.session.commit()
    
    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=1)
    )
    
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    return redirect(f'{frontend_url}/oauth-callback?token={access_token}')

@auth_bp.route('/me')
@jwt_required()
def get_user():
    current_user_id = get_jwt_identity()
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
        
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    })

@auth_bp.route('/check-role')
@jwt_required()
def check_role():
    current_user_id = get_jwt_identity()
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
        
    return jsonify({
        "isAdmin": user.role == 'admin',
        "isManager": user.role == 'manager',
        "role": user.role
    })

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