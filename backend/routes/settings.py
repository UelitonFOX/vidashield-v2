from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

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
        "remember_me_days": 7,
        "require_mfa": False,
        "prevent_concurrent_sessions": True
    },
    "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "use_tls": True,
        "username": "notificacoes@vidashield.com",
        "password": "",
        "sender_name": "VidaShield Segurança",
        "from_email": "notificacoes@vidashield.com",
        "from_name": "VidaShield Notificações"
    },
    "audit": {
        "log_user_actions": True,
        "log_retention_days": 90,
        "notify_critical_events": True,
        "log_logins": True,
        "log_data_access": True,
        "log_configuration": True
    },
    "user_preferences": {
        "default_dashboard": "main",
        "notifications_enabled": True,
        "email_notifications": False,
        "session_autosave": True,
        "theme": "light"
    },
    "management": {
        "auto_assign_users": False,
        "approval_required": True,
        "report_schedule": "weekly",
        "alert_threshold": 10
    }
}


@settings_bp.route('', methods=['GET'])
@jwt_required()
def get_settings():
    # Obter o ID do usuário atual
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Em uma implementação real, verificaríamos as permissões do usuário
    # e retornaríamos apenas as configurações que ele tem permissão para ver

    # Filtrar configurações com base no papel do usuário
    role = user.role if user else 'user'
    settings_to_return = {}

    # Usuários comuns podem ver apenas suas preferências
    settings_to_return["user_preferences"] = system_settings["user_preferences"]

    # Gerentes podem ver configurações adicionais
    if role in ['manager', 'admin']:
        settings_to_return["audit"] = system_settings["audit"]
        settings_to_return["management"] = system_settings["management"]

    # Admins podem ver todas as configurações
    if role == 'admin':
        settings_to_return = system_settings

    return jsonify(settings_to_return)


@settings_bp.route('', methods=['PUT'])
@jwt_required()
def update_settings():
    # Obter o ID do usuário atual
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Em uma implementação real, verificaríamos as permissões do usuário
    if not user or user.role not in ['manager', 'admin']:
        return jsonify(
            {"error": "Permissão negada. Apenas gerentes e administradores podem alterar configurações."}), 403

    data = request.get_json()

    # Verificar quais seções o usuário pode atualizar com base no papel
    # Todos os usuários podem atualizar suas preferências
    allowed_sections = ["user_preferences"]

    if user.role == 'manager':
        # Gerentes podem atualizar auditoria e gerenciamento
        allowed_sections.extend(["audit", "management"])

    if user.role == 'admin':
        # Admins podem atualizar tudo
        allowed_sections = list(system_settings.keys())

    # Atualizar apenas as configurações permitidas
    for section, settings in data.items():
        if section in allowed_sections and section in system_settings:
            for key, value in settings.items():
                if key in system_settings[section]:
                    system_settings[section][key] = value

    # Retornar apenas as seções que o usuário tem permissão para ver
    settings_to_return = {}

    # Usuários comuns podem ver apenas suas preferências
    settings_to_return["user_preferences"] = system_settings["user_preferences"]

    # Gerentes podem ver configurações adicionais
    if user.role in ['manager', 'admin']:
        settings_to_return["audit"] = system_settings["audit"]
        settings_to_return["management"] = system_settings["management"]

    # Admins podem ver todas as configurações
    if user.role == 'admin':
        settings_to_return = system_settings

    return jsonify({
        "message": "Configurações atualizadas com sucesso",
        "settings": settings_to_return
    })
