import os
from dotenv import load_dotenv

def get_secret_key():
    """
    Exemplo de função que busca a SECRET_KEY do .env
    """
    load_dotenv("config/.env")
    return os.getenv("SECRET_KEY", "default_secret")

# Podemos ler também ADMIN_USER, ADMIN_PASS, etc
def get_admin_credentials():
    load_dotenv("config/.env")
    user = os.getenv("ADMIN_USER", "admin")
    pwd = os.getenv("ADMIN_PASS", "seguro")
    return user, pwd
