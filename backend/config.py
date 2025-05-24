# -*- coding: utf-8 -*-
"""
Módulo principal de configuração do VidaShield.
"""

import os
from dotenv import load_dotenv
import logging

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# Obtém o diretório atual do script
current_dir = os.path.abspath(os.path.dirname(__file__))


class Config:
    # URL do frontend
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3001')

    # Configurações do Auth0
    AUTH0_DOMAIN = os.getenv('AUTH0_DOMAIN', 'dev-xxxxxxxx.us.auth0.com')
    AUTH0_AUDIENCE = os.getenv(
        'AUTH0_AUDIENCE',
        'https://vidashield.onrender.com/api')
    AUTH0_CLIENT_ID = os.getenv('AUTH0_CLIENT_ID', '')
    AUTH0_CLIENT_SECRET = os.getenv('AUTH0_CLIENT_SECRET', '')
    AUTH0_CALLBACK_URL = os.getenv(
        'AUTH0_CALLBACK_URL',
        'https://vidashield.vercel.app/auth/callback')

    # Configurações do OAuth
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')

    # URLs de callback (desenvolvimento e produção)
    GOOGLE_REDIRECT_URI = os.getenv(
        'GOOGLE_REDIRECT_URI',
        'http://localhost:5000/api/auth/google/callback')
    GITHUB_REDIRECT_URI = os.getenv(
        'GITHUB_REDIRECT_URI',
        'http://localhost:5000/api/auth/github/callback')

    # URLs alternativas (redundância)
    OAUTH_REDIRECT_URLS = [
        'http://localhost:3001/auth/callback',
        'https://vidashield.vercel.app/auth/callback',
        'https://vidashield.onrender.com/api/auth/google/callback',
        'https://vidashield.onrender.com/api/auth/github/callback'
    ]

    # hCaptcha
    HCAPTCHA_SITE_KEY = os.getenv(
        'HCAPTCHA_SITE_KEY',
        '866663ec-b850-4a54-8884-8376d11051c4')
    HCAPTCHA_SECRET_KEY = os.getenv(
        'HCAPTCHA_SECRET_KEY',
        '0x0000000000000000000000000000000000000000')

    # Banco de dados (preferência por variável de ambiente)
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', f'sqlite:///{os.path.join(current_dir, "app.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Segurança
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    JWT_SECRET_KEY = os.getenv(
        'JWT_SECRET_KEY',
        'jwt-dev-key-change-in-production')

    # Email
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    def __init__(self):
        if not self.SECRET_KEY or self.SECRET_KEY == 'dev-key-change-in-production':
            logging.warning(
                "SECRET_KEY não definida ou usando valor padrão inseguro!")

        if not self.JWT_SECRET_KEY or self.JWT_SECRET_KEY == 'jwt-dev-key-change-in-production':
            logging.warning(
                "JWT_SECRET_KEY não definida ou usando valor padrão inseguro!")

        if not os.getenv('AUTH0_DOMAIN') or not os.getenv('AUTH0_AUDIENCE'):
            logging.warning(
                "⚠️ Configurações do Auth0 não encontradas. Usando valores padrão para testes.")
