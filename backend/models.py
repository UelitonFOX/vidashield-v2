# -*- coding: utf-8 -*-
"""
Módulo de definição dos modelos da aplicação.

Este módulo contém todas as classes de modelo que representam as tabelas 
do banco de dados usando SQLAlchemy ORM.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import uuid
import json
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Text, TypeDecorator, text

db = SQLAlchemy()

# Tipo personalizado para lidar com JSON em SQLite e PostgreSQL
class JSONType(TypeDecorator):
    impl = Text
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return '{}'
        if isinstance(value, str):
            return value
        return json.dumps(value)
    
    def process_result_value(self, value, dialect):
        if value is None:
            return {}
        if isinstance(value, dict):
            return value
        try:
            return json.loads(value)
        except (ValueError, TypeError):
            return {}


# Tipo personalizado para suporte a UUID em SQLite e PostgreSQL
class UUIDType(TypeDecorator):
    impl = Text
    cache_ok = True
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(Text())
            
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == 'postgresql':
            return value  # PostgreSQL aceita UUID diretamente
        else:
            return str(value)  # SQLite armazena como string
    
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if dialect.name == 'postgresql':
            if isinstance(value, uuid.UUID):
                return value
            return uuid.UUID(value)
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            try:
                return uuid.UUID(value)
            except (ValueError, AttributeError):
                return value  # Retorna a string se não for um UUID válido


class User(db.Model):
    """
    Modelo para usuários do sistema.
    
    Armazena dados de autenticação e informações básicas dos usuários.
    Suporta autenticação tradicional (email/senha) e OAuth.
    """
    # Usando UUIDType para compatibilidade PostgreSQL/SQLite
    id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
    
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))
    name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='usuario')  # 'admin', 'manager', ou 'user'
    status = db.Column(db.String(20), default='pendente') # 'ativo', 'pendente', 'bloqueado'
    oauth_provider = db.Column(db.String(20))  # 'google' ou 'github'
    oauth_id = db.Column(db.String(100))
    avatar_url = db.Column(db.String(255))  # URL da foto de perfil
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)  # Usado por OAuth
    reset_token = db.Column(db.String(100), unique=True)
    reset_token_expires = db.Column(db.DateTime)

    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        """Converte o usuário para um dicionário (sem dados sensíveis)."""
        return {
            'id': str(self.id) if isinstance(self.id, uuid.UUID) else self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'status': getattr(self, 'status', 'ativo'),
            'oauth_provider': self.oauth_provider,
            'oauth_id': self.oauth_id,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'email_verified': self.email_verified
        }
    
    def generate_reset_token(self):
        """Gera um token único para reset de senha com prazo de 24 horas."""
        self.reset_token = str(uuid.uuid4())
        self.reset_token_expires = datetime.utcnow() + timedelta(hours=24)
        return self.reset_token


class Alert(db.Model):
    """
    Modelo para alertas do sistema relacionados aos usuários.
    
    Armazena eventos de segurança e atividades suspeitas detectadas no sistema.
    """
    __tablename__ = 'alert'

    id = db.Column(UUIDType, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = db.Column(db.String(50), nullable=False)  # Tipo de alerta (segurança, sistema, etc)
    severity = db.Column(db.String(20), nullable=False)  # Severidade (baixa, média, alta, crítica)
    details = db.Column(db.JSON, nullable=True)  # Detalhes adicionais em formato JSON
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    resolved = db.Column(db.Boolean, default=False, nullable=False)
    resolved_time = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(UUIDType, db.ForeignKey('user.id'), nullable=False)
    resolved_by = db.Column(UUIDType, db.ForeignKey('user.id'), nullable=True)
    
    # Relacionamentos
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('alerts', lazy=True))
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref=db.backref('resolved_alerts', lazy=True))
    
    def __repr__(self):
        return f'<Alert {self.id}: {self.type}>'
    
    @property
    def formatted_date(self):
        return self.timestamp.strftime("%d/%m/%Y, %H:%M") if self.timestamp else None
    
    def to_dict(self):
        """Converte o objeto para um dicionário."""
        d = {
            'id': str(self.id) if self.id else None,
            'type': self.type,
            'severity': self.severity,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'resolved': self.resolved,
            'resolved_time': self.resolved_time.isoformat() if self.resolved_time else None,
            'user_id': str(self.user_id) if self.user_id else None,
            'resolved_by': str(self.resolved_by) if self.resolved_by else None,
            'formatted_date': self.formatted_date
        }
        return d
        
    def resolve(self, user_id):
        """Marca o alerta como resolvido pelo usuário especificado."""
        self.resolved = True
        self.resolved_time = datetime.utcnow()
        self.resolved_by = user_id


class AuthLog(db.Model):
    """
    Modelo para registro de eventos de autenticação.
    
    Armazena logs de atividades relacionadas à autenticação, incluindo
    tentativas de login, login via OAuth, logout, reset de senha, etc.
    """
    __tablename__ = 'auth_log'
    
    # Usando UUIDType para compatibilidade PostgreSQL/SQLite
    id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
    
    # Referência ao usuário usando UUIDType
    user_id = db.Column(UUIDType, db.ForeignKey('user.id'), nullable=True)
    
    action = db.Column(db.String(100), nullable=False)  # login, logout, reset_password, oauth_login, etc.
    details = db.Column(db.Text, nullable=True)  # Detalhes adicionais sobre a ação
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    success = db.Column(db.Boolean, default=True)
    
    # Relacionamento com o usuário
    user = db.relationship('User', backref=db.backref('auth_logs', lazy=True))
    
    def __repr__(self):
        return f'<AuthLog {self.id}: {self.action}>'
    
    def to_dict(self):
        """Converte o log de autenticação para um dicionário."""
        return {
            'id': str(self.id) if isinstance(self.id, uuid.UUID) else self.id,
            'user_id': str(self.user_id) if isinstance(self.user_id, uuid.UUID) else self.user_id,
            'action': self.action,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'success': self.success
        } 