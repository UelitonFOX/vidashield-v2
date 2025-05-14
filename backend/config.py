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

    # Configurações do OAuth
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')

    # URLs de callback - IMPORTANTE: estas URLs precisam corresponder exatamente às configuradas no console do Google
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5000/api/auth/google/callback')
    GITHUB_REDIRECT_URI = 'http://localhost:5000/api/auth/github/callback'
    
    # URLs alternativas para OAuth (backup)
    OAUTH_REDIRECT_URLS = [
        'http://localhost:3000/auth/callback',
        'http://localhost:3001/auth/callback',
        'http://localhost:5000/api/auth/google/callback'
    ]

    # Configurações do hCaptcha
    HCAPTCHA_SITE_KEY = os.getenv('HCAPTCHA_SITE_KEY', '866663ec-b850-4a54-8884-8376d11051c4')  # Chave pública - apenas para frontend
    HCAPTCHA_SECRET_KEY = os.getenv('HCAPTCHA_SECRET_KEY', '0x0000000000000000000000000000000000000000')  # Chave secreta para validação no backend

    # Configurações do banco de dados
    # Prioriza a variável de ambiente DATABASE_URL (PostgreSQL/Supabase)
    # Em ambiente de desenvolvimento local, pode-se usar um banco SQLite
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(current_dir, "app.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configurações de segurança
    # Estas chaves devem ser definidas em .env em ambiente de produção
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-dev-key-change-in-production')

    # Configurações de email
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    def __init__(self):
        # Log warning if any production keys are missing
        if not self.SECRET_KEY or self.SECRET_KEY == 'dev-key-change-in-production':
            logging.warning("SECRET_KEY não definida ou usando valor padrão inseguro!")
        
        if not self.JWT_SECRET_KEY or self.JWT_SECRET_KEY == 'jwt-dev-key-change-in-production':
            logging.warning("JWT_SECRET_KEY não definida ou usando valor padrão inseguro!") 