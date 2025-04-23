from flask import Blueprint, request, jsonify, url_for, redirect, current_app, render_template_string
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta, datetime
from authlib.integrations.flask_client import OAuth
from models import db, User
import json
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import uuid

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

# Configuração do OAuth
def setup_oauth(app):
    oauth.init_app(app)
    
    # Use configurações de teste se as variáveis de ambiente não estiverem definidas
    google_client_id = app.config.get('GOOGLE_CLIENT_ID') or 'test_google_client_id'
    google_client_secret = app.config.get('GOOGLE_CLIENT_SECRET') or 'test_google_client_secret'
    
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

@auth_bp.route('/login', methods=['POST'])
def login():
    # Garante que o usuário de teste existe
    ensure_test_user_exists()
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    print(f"Tentativa de login para: {email}")
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(hours=1)
        )
        print(f"Login bem-sucedido para: {email}")
        return jsonify(access_token=access_token), 200
        
    print(f"Login falhou para: {email}")
    return jsonify({"msg": "Credenciais inválidas"}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
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
        identity=user.id,
        expires_delta=timedelta(hours=1)
    )
    
    return jsonify({
        "msg": "Usuário registrado com sucesso",
        "access_token": access_token
    }), 201

@auth_bp.route('/google')
def google_login():
    # Verifica se estamos em modo de teste/desenvolvimento
    if current_app.config.get('TESTING') or not current_app.config.get('GOOGLE_CLIENT_ID'):
        print("Usando fluxo de login simulado para Google")
        # Gera um token diretamente para simular o fluxo de login
        token = _generate_test_token("google")
        # Use o FRONTEND_URL configurado ou o padrão
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/oauth-callback?token={token}"
        print(f"Redirecionando para: {redirect_url}")
        return redirect(redirect_url)
        
    redirect_uri = url_for('auth.google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@auth_bp.route('/google/callback')
def google_callback():
    token = oauth.google.authorize_access_token()
    user_info = token.get('userinfo')
    
    if not user_info:
        return jsonify({"msg": "Erro ao obter informações do usuário"}), 400
        
    user = User.query.filter_by(oauth_id=user_info['sub'], oauth_provider='google').first()
    
    if not user:
        user = User(
            email=user_info['email'],
            name=user_info['name'],
            oauth_provider='google',
            oauth_id=user_info['sub']
        )
        db.session.add(user)
        db.session.commit()
    
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(hours=1)
    )
    
    return redirect(f'http://localhost:3000/oauth-callback?token={access_token}')

@auth_bp.route('/github')
def github_login():
    # Verifica se estamos em modo de teste/desenvolvimento
    if current_app.config.get('TESTING') or not current_app.config.get('GITHUB_CLIENT_ID'):
        print("Usando fluxo de login simulado para GitHub")
        # Gera um token diretamente para simular o fluxo de login
        token = _generate_test_token("github")
        # Use o FRONTEND_URL configurado ou o padrão
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        redirect_url = f"{frontend_url}/oauth-callback?token={token}"
        print(f"Redirecionando para: {redirect_url}")
        return redirect(redirect_url)
        
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
        identity=user.id,
        expires_delta=timedelta(hours=1)
    )
    
    return redirect(f'http://localhost:3000/oauth-callback?token={access_token}')

@auth_bp.route('/me')
@jwt_required()
def get_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404
        
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name
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
        identity=user.id,
        expires_delta=timedelta(hours=1)
    )
    
    print(f"Token gerado para {provider}: {token[:15]}...")
    return token 