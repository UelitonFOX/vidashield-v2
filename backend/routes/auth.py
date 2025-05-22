from flask import Blueprint, request, jsonify, url_for, redirect, current_app, render_template_string, session
from authlib.integrations.flask_client import OAuth
from models import db, User
from utils.uuid_helpers import validate_uuid, is_valid_uuid, str_to_uuid
from utils.auth import requires_auth, get_auth0_user_info, requires_role
import json
import secrets
import os
import uuid
import requests
from log_oauth import log_oauth_success, log_oauth_failure
from flask_wtf.csrf import generate_csrf
from urllib.parse import urlparse
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

auth_bp = Blueprint('auth', __name__)
oauth = OAuth()

# Configuração do OAuth
def setup_oauth(app):
    oauth.init_app(app)

    google_client_id = app.config.get('GOOGLE_CLIENT_ID')
    google_client_secret = app.config.get('GOOGLE_CLIENT_SECRET')

    print(f"OAuth Setup - Google Client ID: {google_client_id[:10] if google_client_id else 'Não configurado'}")
    print(f"OAuth Setup - Google Client Secret: {'Configurado' if google_client_secret else 'Não configurado'}")

    oauth.register(
        name='google',
        client_id=google_client_id,
        client_secret=google_client_secret,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'prompt': 'select_account'
        },
        authorize_params={
            'access_type': 'offline'
        }
    )

    github_client_id = app.config.get('GITHUB_CLIENT_ID') or 'test_github_client_id'
    github_client_secret = app.config.get('GITHUB_CLIENT_SECRET') or 'test_github_client_secret'

    oauth.register(
        name='github',
        client_id=github_client_id,
        client_secret=github_client_secret,
        access_token_url='https://github.com/login/oauth/access_token',
        authorize_url='https://github.com/login/oauth/authorize',
        api_base_url='https://api.github.com/',
        client_kwargs={'scope': 'user:email'},
    )

@auth_bp.route('/csrf-token', methods=['GET'])
def get_csrf_token():
    token = generate_csrf()
    response = jsonify({'csrf_token': token})
    response.headers.set('X-CSRF-TOKEN', token)
    return response

# Função de verificação de captcha - disponibilizada separadamente para ser usada diretamente
def verify_captcha():
    """
    Verifica a validade do token hCaptcha.
    """
    data = request.get_json()
    if not data or 'token' not in data:
        return jsonify({'success': False, 'message': 'Token não fornecido'}), 400
    
    captcha_token = data['token']
    hcaptcha_secret = current_app.config.get('HCAPTCHA_SECRET_KEY')
    
    if not hcaptcha_secret:
        # Em ambiente de desenvolvimento, aceita qualquer token
        if current_app.config.get('ENV') == 'development':
            return jsonify({'success': True, 'message': 'Captcha validado (modo desenvolvimento)'})
        return jsonify({'success': False, 'message': 'Configuração de hCaptcha não encontrada'}), 500
    
    try:
        # Verificar o token com a API do hCaptcha
        response = requests.post(
            'https://hcaptcha.com/siteverify',
            data={
                'secret': hcaptcha_secret,
                'response': captcha_token
            }
        )
        result = response.json()
        
        if result.get('success'):
            return jsonify({'success': True, 'message': 'Captcha validado com sucesso'})
        else:
            return jsonify({'success': False, 'message': 'Captcha inválido', 'errors': result.get('error-codes', [])}), 400
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao validar captcha: {str(e)}'}), 500

# Rota para o Blueprint
@auth_bp.route('/verify-captcha', methods=['POST'])
def verify_captcha_route():
    """
    Rota do blueprint para verificação de captcha.
    """
    return verify_captcha()

@auth_bp.route('/login', methods=['POST'])
def login():
    return jsonify({
        "error": "Use Auth0 para login social. Este endpoint foi desativado.",
        "auth0_url": f"https://{current_app.config.get('AUTH0_DOMAIN')}/authorize"
    }), 400

@auth_bp.route('/verify_token', methods=['GET'])
@requires_auth
def verify_token():
    user_info = get_auth0_user_info()
    return jsonify({
        "valid": True,
        "user": user_info
    })

@auth_bp.route('/me', methods=['GET', 'OPTIONS'])
@requires_auth
def get_user():
    if request.method == 'OPTIONS':
        return jsonify({})

    user_info = get_auth0_user_info()
    if not user_info:
        return jsonify({"error": "Usuário não encontrado"}), 404

    return jsonify({
        "id": user_info.get("sub"),
        "email": user_info.get("email"),
        "name": user_info.get("name"),
        "picture": user_info.get("picture"),
        "permissions": user_info.get("permissions", []),
        "email_verified": user_info.get("email_verified", False)
    })

@auth_bp.route('/check-role', methods=['GET', 'OPTIONS'])
@requires_auth
def check_role():
    if request.method == 'OPTIONS':
        return jsonify({})

    user_info = get_auth0_user_info()
    if not user_info:
        return jsonify({"error": "Usuário não encontrado"}), 404

    required_role = request.args.get('role')
    if not required_role:
        return jsonify({"error": "Parâmetro 'role' é obrigatório"}), 400

    permissions = user_info.get("permissions", [])
    has_role = required_role in permissions

    return jsonify({
        "has_role": has_role,
        "user_permissions": permissions
    })

@auth_bp.route('/callback', methods=['GET', 'POST'])
def callback():
    code = request.args.get('code')
    if not code:
        return jsonify({'error': 'Código de autorização ausente'}), 400

    token_url = f"https://{current_app.config.get('AUTH0_DOMAIN')}/oauth/token"
    payload = {
        'grant_type': 'authorization_code',
        'client_id': current_app.config.get('AUTH0_CLIENT_ID'),
        'client_secret': current_app.config.get('AUTH0_CLIENT_SECRET'),
        'code': code,
        'redirect_uri': current_app.config.get('AUTH0_CALLBACK_URL')
    }

    try:
        token_response = requests.post(token_url, json=payload)
        token_response.raise_for_status()

        tokens = token_response.json()
        session['user_tokens'] = tokens

        log_oauth_success('auth0', {
            'message': 'Autenticação com Auth0 bem-sucedida',
            'user_id': 'auth0_user'
        })

        return redirect(current_app.config.get('FRONTEND_URL'))

    except requests.exceptions.RequestException as e:
        log_oauth_failure('auth0', {
            'message': f'Falha na autenticação com Auth0: {str(e)}',
            'error': str(e)
        })

        return jsonify({'error': 'Falha ao obter token do Auth0', 'details': str(e)}), 500

@auth_bp.route('/userinfo', methods=['GET'])
def userinfo():
    """
    Retorna informações do usuário autenticado via Auth0 ou via Bearer JWT.
    """
    # 1️⃣ Tentativa via Bearer Token (JWT)
    try:
        verify_jwt_in_request()
        identity = get_jwt_identity()

        return jsonify({
            "user": identity,
            "method": "Bearer Token"
        })
    except Exception:
        pass  # Se falhar, tenta pela session

    # 2️⃣ Fallback: Session Tokens
    tokens = session.get('user_tokens')
    if not tokens:
        return jsonify({'error': 'Usuário não autenticado'}), 401

    userinfo_url = f"https://{current_app.config.get('AUTH0_DOMAIN')}/userinfo"
    headers = {
        'Authorization': f"Bearer {tokens.get('access_token')}"
    }

    try:
        userinfo_response = requests.get(userinfo_url, headers=headers)
        userinfo_response.raise_for_status()

        return jsonify(userinfo_response.json())

    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Falha ao obter informações do usuário', 'details': str(e)}), 500

@auth_bp.route('/favicon.ico')
def favicon():
    return "", 204
