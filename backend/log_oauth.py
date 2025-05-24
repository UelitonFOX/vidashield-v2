"""
Módulo para logging de eventos de autenticação OAuth.
Registra sucessos e falhas para auditoria de segurança.
"""

import logging
from datetime import datetime
from models import db, AuthLog

logger = logging.getLogger('oauth')


def log_oauth_success(
        provider,
        email,
        user_id,
        provider_user_id=None,
        ip_address=None):
    """
    Registra um evento de sucesso na autenticação OAuth.

    Args:
        provider: O provedor OAuth (google, github, etc)
        email: Email do usuário
        user_id: ID do usuário no sistema
        provider_user_id: ID do usuário no provedor (opcional)
        ip_address: Endereço IP do cliente (opcional)
    """
    try:
        log = AuthLog(
            user_id=user_id,
            action=f"oauth_{provider}_success",
            details=f"Login via {provider.title()} bem-sucedido para {email}" +
            (f" (ID: {provider_user_id})" if provider_user_id else ""),
            timestamp=datetime.utcnow(),
            ip_address=ip_address or "N/A"
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        logger.error(f"Erro ao registrar sucesso OAuth: {str(e)}")


def log_oauth_failure(provider, reason, email=None, ip_address=None):
    """
    Registra um evento de falha na autenticação OAuth.

    Args:
        provider: O provedor OAuth (google, github, etc)
        reason: Razão da falha
        email: Email do usuário (ou 'desconhecido') (opcional)
        ip_address: Endereço IP do cliente (opcional)
    """
    try:
        email_info = f" para {email}" if email else ""
        log = AuthLog(
            user_id=None,
            action=f"oauth_{provider}_failure",
            details=f"Falha no login via {
                provider.title()}{email_info}: {reason}",
            timestamp=datetime.utcnow(),
            ip_address=ip_address or "N/A")
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        logger.error(f"Erro ao registrar falha OAuth: {str(e)}")
