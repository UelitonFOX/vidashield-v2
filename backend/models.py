# -*- coding: utf-8 -*-
"""
Módulo de definição dos modelos da aplicação.

Este módulo contém todas as classes de modelo que representam as tabelas
do banco de dados usando SQLAlchemy ORM otimizado para Supabase.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import uuid
import json
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET, ARRAY
from sqlalchemy import Text, TypeDecorator, String

db = SQLAlchemy()

class User(db.Model):
    """
    Modelo otimizado para usuários do sistema.
    
    Estrutura avançada com campos para segurança e monitoramento.
    """
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(String(255))
    name = db.Column(String(100))
    role = db.Column(String(20), default='usuario', nullable=False)
    status = db.Column(String(20), default='ativo', nullable=False)
    oauth_provider = db.Column(String(50))
    oauth_id = db.Column(String(100))
    avatar_url = db.Column(Text)
    phone = db.Column(String(20))
    department = db.Column(String(100))
    last_login = db.Column(db.DateTime(timezone=True))
    login_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    reset_token = db.Column(String(100), unique=True)
    reset_token_expires = db.Column(db.DateTime(timezone=True))
    preferences = db.Column(JSONB, default=dict)
    metadata = db.Column(JSONB, default=dict)

    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        """Converte o usuário para um dicionário (sem dados sensíveis)."""
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'status': self.status,
            'oauth_provider': self.oauth_provider,
            'oauth_id': self.oauth_id,
            'avatar_url': self.avatar_url,
            'phone': self.phone,
            'department': self.department,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'login_attempts': self.login_attempts,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'preferences': self.preferences or {},
            'metadata': self.metadata or {}
        }

    def generate_reset_token(self):
        """Gera um token único para reset de senha com prazo de 24 horas."""
        self.reset_token = str(uuid.uuid4())
        self.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
        return self.reset_token

    def is_locked(self):
        """Verifica se a conta está bloqueada."""
        return self.locked_until and self.locked_until > datetime.utcnow()

    def can_attempt_login(self):
        """Verifica se pode tentar fazer login."""
        return not self.is_locked() and self.is_active and self.status == 'ativo'


class Alert(db.Model):
    """
    Modelo avançado para alertas do sistema.
    
    Estrutura completa com categorização, risk score e localização.
    """
    __tablename__ = 'alerts'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = db.Column(String(100), nullable=False)
    category = db.Column(String(50), default='security', nullable=False)
    severity = db.Column(String(20), nullable=False)
    title = db.Column(String(255), nullable=False)
    description = db.Column(Text)
    details = db.Column(JSONB, default=dict)
    source = db.Column(String(100))
    ip_address = db.Column(INET)
    user_agent = db.Column(Text)
    location = db.Column(JSONB)
    risk_score = db.Column(db.Integer, default=0)
    auto_resolved = db.Column(db.Boolean, default=False)
    resolved = db.Column(db.Boolean, default=False)
    resolved_time = db.Column(db.DateTime(timezone=True))
    resolved_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    resolution_notes = db.Column(Text)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = db.Column(db.DateTime(timezone=True))
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    related_alerts = db.Column(ARRAY(UUID()))
    tags = db.Column(ARRAY(String), default=list)
    metadata = db.Column(JSONB, default=dict)

    # Relacionamentos
    user = db.relationship('User', foreign_keys=[user_id], backref='user_alerts')
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref='resolved_alerts')

    def __repr__(self):
        return f'<Alert {self.id}: {self.type}>'

    @property
    def formatted_date(self):
        return self.created_at.strftime("%d/%m/%Y, %H:%M") if self.created_at else None

    def to_dict(self):
        """Converte o objeto para um dicionário."""
        return {
            'id': str(self.id),
            'type': self.type,
            'category': self.category,
            'severity': self.severity,
            'title': self.title,
            'description': self.description,
            'details': self.details or {},
            'source': self.source,
            'ip_address': str(self.ip_address) if self.ip_address else None,
            'user_agent': self.user_agent,
            'location': self.location or {},
            'risk_score': self.risk_score,
            'auto_resolved': self.auto_resolved,
            'resolved': self.resolved,
            'resolved_time': self.resolved_time.isoformat() if self.resolved_time else None,
            'resolved_by': str(self.resolved_by) if self.resolved_by else None,
            'resolution_notes': self.resolution_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'related_alerts': [str(alert_id) for alert_id in (self.related_alerts or [])],
            'tags': self.tags or [],
            'metadata': self.metadata or {},
            'formatted_date': self.formatted_date
        }

    def resolve(self, user_id, notes=None):
        """Marca o alerta como resolvido pelo usuário especificado."""
        self.resolved = True
        self.resolved_time = datetime.utcnow()
        self.resolved_by = user_id
        if notes:
            self.resolution_notes = notes


class AuthLog(db.Model):
    """
    Modelo para logs de autenticação avançados.
    
    Registra todas as atividades de autenticação com detalhes completos.
    """
    __tablename__ = 'auth_logs'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    action = db.Column(String(100), nullable=False)
    provider = db.Column(String(50))
    ip_address = db.Column(INET)
    user_agent = db.Column(Text)
    location = db.Column(JSONB)
    device_info = db.Column(JSONB)
    session_id = db.Column(UUID(as_uuid=True))
    success = db.Column(db.Boolean, default=True)
    failure_reason = db.Column(String(255))
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    metadata = db.Column(JSONB, default=dict)

    # Relacionamento
    user = db.relationship('User', backref='auth_logs')

    def __repr__(self):
        return f'<AuthLog {self.id}: {self.action}>'

    def to_dict(self):
        """Converte o objeto para um dicionário."""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'action': self.action,
            'provider': self.provider,
            'ip_address': str(self.ip_address) if self.ip_address else None,
            'user_agent': self.user_agent,
            'location': self.location or {},
            'device_info': self.device_info or {},
            'session_id': str(self.session_id) if self.session_id else None,
            'success': self.success,
            'failure_reason': self.failure_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'metadata': self.metadata or {}
        }


class UserSession(db.Model):
    """
    Modelo para gerenciamento de sessões ativas.
    """
    __tablename__ = 'user_sessions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    session_token = db.Column(String(255), unique=True, nullable=False)
    refresh_token = db.Column(String(255), unique=True)
    ip_address = db.Column(INET)
    user_agent = db.Column(Text)
    device_info = db.Column(JSONB)
    location = db.Column(JSONB)
    is_active = db.Column(db.Boolean, default=True)
    last_activity = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    expires_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.utcnow() + timedelta(days=7))

    # Relacionamento
    user = db.relationship('User', backref='sessions')

    def is_expired(self):
        """Verifica se a sessão expirou."""
        return self.expires_at < datetime.utcnow()

    def to_dict(self):
        """Converte o objeto para um dicionário."""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'ip_address': str(self.ip_address) if self.ip_address else None,
            'user_agent': self.user_agent,
            'device_info': self.device_info or {},
            'location': self.location or {},
            'is_active': self.is_active,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_expired': self.is_expired()
        }


class BlockedIP(db.Model):
    """
    Modelo para IPs bloqueados.
    """
    __tablename__ = 'blocked_ips'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ip_address = db.Column(INET, unique=True, nullable=False)
    reason = db.Column(String(255), nullable=False)
    blocked_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    attempts_count = db.Column(db.Integer, default=1)
    first_attempt = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    last_attempt = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    is_permanent = db.Column(db.Boolean, default=False)
    expires_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    metadata = db.Column(JSONB, default=dict)

    # Relacionamento
    blocker = db.relationship('User', backref='blocked_ips')

    def is_blocked(self):
        """Verifica se o IP ainda está bloqueado."""
        if self.is_permanent:
            return True
        return self.expires_at and self.expires_at > datetime.utcnow()

    def to_dict(self):
        """Converte o objeto para um dicionário."""
        return {
            'id': str(self.id),
            'ip_address': str(self.ip_address),
            'reason': self.reason,
            'blocked_by': str(self.blocked_by) if self.blocked_by else None,
            'attempts_count': self.attempts_count,
            'first_attempt': self.first_attempt.isoformat() if self.first_attempt else None,
            'last_attempt': self.last_attempt.isoformat() if self.last_attempt else None,
            'is_permanent': self.is_permanent,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'metadata': self.metadata or {},
            'is_blocked': self.is_blocked()
        }


class SystemSetting(db.Model):
    """
    Modelo para configurações do sistema.
    """
    __tablename__ = 'system_settings'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = db.Column(String(100), unique=True, nullable=False)
    value = db.Column(JSONB, nullable=False)
    category = db.Column(String(50), default='general')
    description = db.Column(Text)
    is_public = db.Column(db.Boolean, default=False)
    updated_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamento
    updater = db.relationship('User', backref='updated_settings')

    def to_dict(self):
        """Converte o objeto para um dicionário."""
        return {
            'id': str(self.id),
            'key': self.key,
            'value': self.value,
            'category': self.category,
            'description': self.description,
            'is_public': self.is_public,
            'updated_by': str(self.updated_by) if self.updated_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Report(db.Model):
    """
    Modelo para relatórios.
    """
    __tablename__ = 'reports'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(String(255), nullable=False)
    type = db.Column(String(50), nullable=False)
    format = db.Column(String(10), default='json')
    parameters = db.Column(JSONB, default=dict)
    data = db.Column(JSONB)
    file_url = db.Column(Text)
    file_size = db.Column(db.BigInteger)
    generated_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(String(20), default='pending')
    error_message = db.Column(Text)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    completed_at = db.Column(db.DateTime(timezone=True))
    expires_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.utcnow() + timedelta(days=30))

    # Relacionamento
    generator = db.relationship('User', backref='reports')

    def to_dict(self):
        """Converte o objeto para um dicionário."""
        return {
            'id': str(self.id),
            'name': self.name,
            'type': self.type,
            'format': self.format,
            'parameters': self.parameters or {},
            'data': self.data,
            'file_url': self.file_url,
            'file_size': self.file_size,
            'generated_by': str(self.generated_by),
            'status': self.status,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }
