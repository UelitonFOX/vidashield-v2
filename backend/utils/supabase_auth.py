# -*- coding: utf-8 -*-
"""
Utilitário de autenticação Supabase para o backend Flask.
"""

import os
import jwt
import requests
from functools import wraps
from flask import request, jsonify, current_app
from typing import Dict, Optional, Any
import json

class SupabaseAuth:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        self.jwt_secret = os.getenv('SUPABASE_JWT_SECRET')  # JWT Secret do Supabase
        
        if not self.supabase_url:
            current_app.logger.warning("⚠️  SUPABASE_URL não configurado")
        if not self.jwt_secret:
            current_app.logger.warning("⚠️  SUPABASE_JWT_SECRET não configurado")

    def get_jwt_secret(self) -> Optional[str]:
        """Obter secret JWT do Supabase (pode ser extraído do dashboard)"""
        if self.jwt_secret:
            return self.jwt_secret
        
        # Fallback: tentar extrair das configurações do projeto
        # (Em produção, sempre defina SUPABASE_JWT_SECRET explicitamente)
        return None

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verificar e decodificar token JWT do Supabase.
        
        Args:
            token: Token JWT do Supabase
            
        Returns:
            Dados do usuário se válido, None se inválido
        """
        try:
            # Remover prefixo 'Bearer ' se presente
            if token.startswith('Bearer '):
                token = token[7:]

            jwt_secret = self.get_jwt_secret()
            if not jwt_secret:
                current_app.logger.error("JWT Secret não configurado")
                return None

            # Decodificar token
            payload = jwt.decode(
                token, 
                jwt_secret, 
                algorithms=["HS256"],
                options={"verify_exp": True}
            )
            
            # Validar campos obrigatórios
            if 'sub' not in payload or 'email' not in payload:
                current_app.logger.warning("Token inválido: campos obrigatórios ausentes")
                return None
                
            return {
                'user_id': payload['sub'],
                'email': payload['email'],
                'role': payload.get('role', 'user'),
                'is_active': payload.get('is_active', True),
                'metadata': payload.get('user_metadata', {}),
                'exp': payload.get('exp'),
                'aud': payload.get('aud'),
                'iss': payload.get('iss')
            }

        except jwt.ExpiredSignatureError:
            current_app.logger.warning("Token expirado")
            return None
        except jwt.InvalidTokenError as e:
            current_app.logger.warning(f"Token inválido: {str(e)}")
            return None
        except Exception as e:
            current_app.logger.error(f"Erro ao verificar token: {str(e)}")
            return None

    def get_user_from_supabase(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Buscar dados do usuário diretamente do Supabase usando Service Role.
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Dados do usuário ou None se não encontrado
        """
        if not self.supabase_url or not self.supabase_service_key:
            return None

        try:
            headers = {
                'Authorization': f'Bearer {self.supabase_service_key}',
                'apikey': self.supabase_service_key,
                'Content-Type': 'application/json'
            }
            
            # Buscar usuário na tabela auth.users
            url = f"{self.supabase_url}/auth/v1/admin/users/{user_id}"
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                current_app.logger.warning(f"Erro ao buscar usuário: {response.status_code}")
                return None
                
        except Exception as e:
            current_app.logger.error(f"Erro ao conectar com Supabase: {str(e)}")
            return None

# Instância global
supabase_auth = SupabaseAuth()

def require_auth(f):
    """
    Decorator para proteger rotas que requerem autenticação.
    
    Usage:
        @app.route('/protected')
        @require_auth
        def protected_route():
            user = request.user  # Dados do usuário autenticado
            return jsonify({'message': f'Olá, {user["email"]}!'})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Token de autorização necessário'}), 401
        
        # Verificar token
        user_data = supabase_auth.verify_token(auth_header)
        if not user_data:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
        
        # Verificar se usuário está ativo
        if not user_data.get('is_active', True):
            return jsonify({'error': 'Conta desativada'}), 403
        
        # Adicionar dados do usuário ao request
        request.user = user_data
        
        return f(*args, **kwargs)
    
    return decorated

def require_role(required_role: str):
    """
    Decorator para proteger rotas que requerem um papel específico.
    
    Args:
        required_role: Papel necessário ('admin', 'user', etc.)
        
    Usage:
        @app.route('/admin-only')
        @require_role('admin')
        def admin_route():
            return jsonify({'message': 'Área administrativa'})
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'error': 'Token de autorização necessário'}), 401
            
            # Verificar token
            user_data = supabase_auth.verify_token(auth_header)
            if not user_data:
                return jsonify({'error': 'Token inválido ou expirado'}), 401
            
            # Verificar se usuário está ativo
            if not user_data.get('is_active', True):
                return jsonify({'error': 'Conta desativada'}), 403
            
            # Verificar papel
            user_role = user_data.get('role', 'user')
            if user_role != required_role and user_role != 'admin':
                return jsonify({'error': 'Permissão insuficiente'}), 403
            
            # Adicionar dados do usuário ao request
            request.user = user_data
            
            return f(*args, **kwargs)
        
        return decorated
    return decorator

# Função para validar token simples (sem decorator)
def validate_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Validar token JWT diretamente.
    
    Args:
        token: Token JWT
        
    Returns:
        Dados do usuário se válido, None se inválido
    """
    return supabase_auth.verify_token(token) 