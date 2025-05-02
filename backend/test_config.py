import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# Verifica se as credenciais do Google OAuth estão carregadas
print("GOOGLE_CLIENT_ID:", os.getenv('GOOGLE_CLIENT_ID'))
print("GOOGLE_CLIENT_SECRET:", os.getenv('GOOGLE_CLIENT_SECRET')[:5] + "*****" if os.getenv('GOOGLE_CLIENT_SECRET') else None)
print("GOOGLE_REDIRECT_URI:", os.getenv('GOOGLE_REDIRECT_URI'))

# Verifica outras variáveis importantes
print("\nOutras configurações:")
print("SECRET_KEY definida:", "Sim" if os.getenv('SECRET_KEY') else "Não")
print("JWT_SECRET_KEY definida:", "Sim" if os.getenv('JWT_SECRET_KEY') else "Não")
print("HCAPTCHA_SITE_KEY:", os.getenv('HCAPTCHA_SITE_KEY'))
print("HCAPTCHA_SECRET_KEY:", os.getenv('HCAPTCHA_SECRET_KEY')[:5] + "*****" if os.getenv('HCAPTCHA_SECRET_KEY') else None)