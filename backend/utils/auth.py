import json
from functools import wraps
from urllib.request import urlopen

import jwt
from flask import request, jsonify, current_app, _request_ctx_stack
from werkzeug.local import LocalProxy

# Proxy para acessar o usuário atual do contexto Flask
current_user = LocalProxy(
    lambda: getattr(
        _request_ctx_stack.top,
        'current_user',
        None))


def get_token_auth_header():
    """
    Extrai o token do cabeçalho Authorization.
    """
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise Exception("Authorization header ausente")

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise Exception("Authorization header deve começar com Bearer")
    elif len(parts) == 1:
        raise Exception("Token não encontrado")
    elif len(parts) > 2:
        raise Exception("Authorization header deve ser Bearer token")

    return parts[1]


def requires_auth(f):
    """
    Decorador que valida o JWT do Auth0.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = get_token_auth_header()
            domain = current_app.config['AUTH0_DOMAIN']
            audience = current_app.config['AUTH0_AUDIENCE']

            # Buscar chaves públicas do Auth0
            jwks_url = f"https://{domain}/.well-known/jwks.json"
            with urlopen(jwks_url) as response:
                jwks = json.load(response)

            unverified_header = jwt.get_unverified_header(token)

            rsa_key = {}
            for key in jwks["keys"]:
                if key["kid"] == unverified_header["kid"]:
                    rsa_key = {
                        "kty": key["kty"],
                        "kid": key["kid"],
                        "use": key["use"],
                        "n": key["n"],
                        "e": key["e"]
                    }
                    break

            if not rsa_key:
                return jsonify(
                    {"message": "Token inválido (chave não encontrada)"}), 401

            # Decodifica e valida o token
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=audience,
                issuer=f"https://{domain}/"
            )

            # Salvar payload no contexto da request
            _request_ctx_stack.top.current_user = payload

            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expirado"}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({"message": f"Token inválido: {str(e)}"}), 401
        except Exception as e:
            return jsonify({"message": f"Erro na autenticação: {str(e)}"}), 401

    return decorated


def requires_role(role):
    """
    Decorador que valida se o usuário tem uma role específica.
    """
    def decorator(f):
        @wraps(f)
        @requires_auth
        def wrapper(*args, **kwargs):
            user_roles = current_user.get('permissions', [])
            if role not in user_roles:
                return jsonify(
                    {"message": f"Permissão '{role}' necessária"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


def get_auth0_user_info():
    """
    Retorna as informações do usuário autenticado.
    """
    if not current_user:
        return None

    return {
        "sub": current_user.get("sub"),
        "email": current_user.get("email"),
        "name": current_user.get("name"),
        "picture": current_user.get("picture"),
        "email_verified": current_user.get("email_verified", False),
        "permissions": current_user.get("permissions", [])
    }
