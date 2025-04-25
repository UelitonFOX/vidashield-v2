from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import random

settings_bp = Blueprint('settings', __name__)

# Configurações mockadas do sistema
system_settings = {
    "password_policy": {
        "min_length": 8,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_numbers": True,
        "require_special_chars": True,
        "expiration_days": 90
    },
    "security": {
        "max_login_attempts": 5,
        "lockout_duration_minutes": 30,
        "session_timeout_minutes": 60,
        "remember_me_days": 7
    },
    "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "use_tls": True,
        "username": "notificacoes@vidashield.com",
        "sender_name": "VidaShield Segurança"
    },
    "audit": {
        "log_user_actions": True,
        "log_retention_days": 90,
        "notify_critical_events": True
    }
}

@settings_bp.route('', methods=['GET'])
@jwt_required()
def get_settings():
    # Em uma implementação real, verificaríamos se o usuário tem permissão de admin
    return jsonify(system_settings)

@settings_bp.route('', methods=['PUT'])
@jwt_required()
def update_settings():
    # Em uma implementação real, verificaríamos se o usuário tem permissão de admin
    data = request.get_json()
    
    # Atualizar apenas as configurações fornecidas
    for section, settings in data.items():
        if section in system_settings:
            for key, value in settings.items():
                if key in system_settings[section]:
                    system_settings[section][key] = value
    
    return jsonify({
        "message": "Configurações atualizadas com sucesso",
        "settings": system_settings
    }) 