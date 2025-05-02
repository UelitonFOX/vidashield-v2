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
from sqlalchemy import Text, TypeDecorator

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


class User(db.Model):
    """
    Modelo para usuários do sistema.
    
    Armazena dados de autenticação e informações básicas dos usuários.
    Suporta autenticação tradicional (email/senha) e OAuth.
    """
    # Campo ID compatível com PostgreSQL e SQLite
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # Para PostgreSQL puro, usar: UUID(as_uuid=True), server_default=text('gen_random_uuid()')
    # Essa implementação mantém compatibilidade entre ambientes
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))
    name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')  # 'admin', 'manager', ou 'user'
    oauth_provider = db.Column(db.String(20))  # 'google' ou 'github'
    oauth_id = db.Column(db.String(100))
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
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'oauth_provider': self.oauth_provider,
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
    Modelo para alertas de segurança.
    
    Armazena eventos de segurança e atividades suspeitas detectadas no sistema.
    """
    # Compatível com PostgreSQL e SQLite
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # 'critical', 'warning', 'info'
    details = db.Column(JSONType)  # Usa o tipo personalizado que funciona em SQLite e PostgreSQL
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)
    resolved_time = db.Column(db.DateTime, nullable=True)
    resolved_by = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=True)
    
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'))
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('alerts', lazy=True))
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref=db.backref('resolved_alerts', lazy=True))
    
    def __repr__(self):
        return f'<Alert {self.id}: {self.type}>'
    
    @property
    def formatted_date(self):
        return self.timestamp.strftime("%d/%m/%Y, %H:%M") if self.timestamp else None
    
    def to_dict(self):
        """Converte o alerta para um dicionário."""
        return {
            'id': self.id,
            'type': self.type,
            'severity': self.severity,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'resolved': self.resolved,
            'resolved_time': self.resolved_time.isoformat() if self.resolved_time else None,
            'user_id': self.user_id,
            'resolved_by': self.resolved_by,
            'formatted_date': self.formatted_date
        }
    
    def resolve(self, user_id):
        """Marca o alerta como resolvido pelo usuário especificado."""
        self.resolved = True
        self.resolved_time = datetime.utcnow()
        self.resolved_by = user_id 