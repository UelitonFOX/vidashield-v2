import logging
import os
from datetime import datetime

# Configurar o logger
logger = logging.getLogger('oauth_audit')
logger.setLevel(logging.INFO)

# Garantir que o diretório de logs existe
log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(log_dir, exist_ok=True)

# Definir o arquivo de log
log_file = os.path.join(log_dir, 'oauth_logins.log')

# Adicionar handler para arquivo
file_handler = logging.FileHandler(log_file)
file_handler.setLevel(logging.INFO)

# Definir o formato do log
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

# Adicionar o handler ao logger
logger.addHandler(file_handler)

def log_oauth_success(provider, user_email, user_id, ip_address=None):
    """
    Registra um login bem-sucedido via OAuth.
    """
    logger.info(f"LOGIN_SUCCESS - Provider: {provider}, User: {user_email}, ID: {user_id}, IP: {ip_address or 'unknown'}")

def log_oauth_failure(provider, error, user_email=None, ip_address=None):
    """
    Registra uma falha de login via OAuth.
    """
    logger.error(f"LOGIN_FAILURE - Provider: {provider}, Error: {error}, User: {user_email or 'unknown'}, IP: {ip_address or 'unknown'}")