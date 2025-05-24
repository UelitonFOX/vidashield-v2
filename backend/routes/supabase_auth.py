# -*- coding: utf-8 -*-
"""
Rotas de autenticação com Supabase.
"""

import os
from flask import Blueprint, request, jsonify, current_app
from utils.supabase_auth import require_auth, require_role, validate_token, supabase_auth

# Blueprint para autenticação Supabase
supabase_auth_bp = Blueprint('supabase_auth', __name__)

@supabase_auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verificar se o token JWT do Supabase é válido.
    
    Esperado:
    {
        "token": "jwt_token_here"
    }
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({
                'valid': False,
                'error': 'Token não fornecido'
            }), 400
        
        # Validar token
        user_data = validate_token(token)
        
        if user_data:
            return jsonify({
                'valid': True,
                'user': {
                    'id': user_data['user_id'],
                    'email': user_data['email'],
                    'role': user_data.get('role', 'user'),
                    'is_active': user_data.get('is_active', True)
                }
            })
        else:
            return jsonify({
                'valid': False,
                'error': 'Token inválido ou expirado'
            }), 401
            
    except Exception as e:
        current_app.logger.error(f"Erro ao verificar token: {str(e)}")
        return jsonify({
            'valid': False,
            'error': 'Erro interno do servidor'
        }), 500

@supabase_auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """
    Obter perfil do usuário autenticado.
    
    Headers:
        Authorization: Bearer <jwt_token>
    """
    try:
        user = request.user
        
        # Buscar dados adicionais do Supabase se necessário
        user_details = supabase_auth.get_user_from_supabase(user['user_id'])
        
        return jsonify({
            'success': True,
            'user': {
                'id': user['user_id'],
                'email': user['email'],
                'role': user.get('role', 'user'),
                'is_active': user.get('is_active', True),
                'metadata': user.get('metadata', {}),
                'supabase_data': user_details
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Erro ao obter perfil: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@supabase_auth_bp.route('/admin/users', methods=['GET'])
@require_role('admin')
def list_users():
    """
    Listar usuários (apenas para admins).
    
    Headers:
        Authorization: Bearer <jwt_token>
    """
    try:
        # Esta rota seria implementada com chamadas diretas ao Supabase
        # usando a Service Role Key para gerenciamento de usuários
        
        return jsonify({
            'success': True,
            'message': 'Endpoint de administração de usuários (implementar conforme necessário)',
            'admin_user': request.user['email']
        })
        
    except Exception as e:
        current_app.logger.error(f"Erro ao listar usuários: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@supabase_auth_bp.route('/test', methods=['GET'])
@require_auth
def test_auth():
    """
    Endpoint de teste para verificar autenticação.
    
    Headers:
        Authorization: Bearer <jwt_token>
    """
    try:
        user = request.user
        
        return jsonify({
            'success': True,
            'message': f'Autenticado como {user["email"]}',
            'user_id': user['user_id'],
            'role': user.get('role', 'user'),
            'timestamp': '2025-05-23'
        })
        
    except Exception as e:
        current_app.logger.error(f"Erro no teste de auth: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500

@supabase_auth_bp.route('/health', methods=['GET'])
def health_check():
    """
    Verificar saúde do sistema de autenticação.
    """
    try:
        # Verificar configurações
        config_status = {
            'supabase_url': bool(os.getenv('SUPABASE_URL')),
            'service_key': bool(os.getenv('SUPABASE_SERVICE_ROLE_KEY')),
            'jwt_secret': bool(os.getenv('SUPABASE_JWT_SECRET'))
        }
        
        all_configured = all(config_status.values())
        
        return jsonify({
            'status': 'healthy' if all_configured else 'warning',
            'message': 'Sistema de autenticação Supabase',
            'config': config_status,
            'timestamp': '2025-05-23'
        }), 200 if all_configured else 500
        
    except Exception as e:
        current_app.logger.error(f"Erro no health check: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'Erro interno do servidor'
        }), 500 