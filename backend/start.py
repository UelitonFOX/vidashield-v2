"""
Script para iniciar o servidor backend com a configuração correta.
Permite selecionar entre ambiente SQLite local e PostgreSQL/Supabase.
"""

import os
import sys
import argparse
import subprocess
import shutil
from dotenv import load_dotenv, set_key, find_dotenv

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Iniciar o servidor backend VidaShield')
    
    # Opções de ambiente
    parser.add_argument(
        '--env', 
        choices=['dev', 'prod'], 
        default='dev',
        help='Ambiente de execução (dev: SQLite local, prod: PostgreSQL/Supabase)'
    )
    
    # Opções de porta
    parser.add_argument(
        '--port',
        type=int,
        default=5000,
        help='Porta para o servidor (padrão: 5000)'
    )
    
    # Ativação de debug
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Ativar modo de debug'
    )
    
    # Forçar sincronização de UUIDs
    parser.add_argument(
        '--sync-admin',
        action='store_true',
        help='Sincronizar usuário admin com Supabase'
    )
    
    return parser.parse_args()

def update_env_file(env_type):
    """Atualiza o arquivo .env com a configuração correta"""
    dotenv_path = find_dotenv()
    
    if not dotenv_path:
        print("❌ Arquivo .env não encontrado")
        return False
    
    # Carrega variáveis do .env atual
    load_dotenv(dotenv_path)
    
    # Configura o ambiente
    if env_type == 'dev':
        # Ambiente de desenvolvimento com SQLite
        os.environ['FLASK_ENV'] = 'development'
        os.environ['DATABASE_URL'] = 'sqlite:///app.db'
        
        # Atualiza o arquivo .env
        set_key(dotenv_path, 'FLASK_ENV', 'development')
        set_key(dotenv_path, 'DATABASE_URL', 'sqlite:///app.db')
        
        print("✅ Configurado ambiente de desenvolvimento com SQLite")
    else:
        # Ambiente de produção com PostgreSQL/Supabase
        os.environ['FLASK_ENV'] = 'production'
        
        # Verifica se a URL do PostgreSQL está definida
        pg_url = os.getenv('POSTGRES_URL')
        if not pg_url or '[SEU_PASSWORD_SUPABASE]' in pg_url:
            print("⚠️ URL do PostgreSQL não configurada no .env")
            print("Configure a variável POSTGRES_URL no arquivo .env")
            return False
        
        # Atualiza o arquivo .env
        os.environ['DATABASE_URL'] = pg_url
        set_key(dotenv_path, 'FLASK_ENV', 'production')
        set_key(dotenv_path, 'DATABASE_URL', pg_url)
        
        print("✅ Configurado ambiente de produção com PostgreSQL/Supabase")
    
    return True

def sync_admin_user():
    """Sincroniza o usuário admin com o Supabase"""
    print("Sincronizando usuário admin com Supabase...")
    try:
        subprocess.run([sys.executable, 'sync_users_from_supabase.py'], check=True)
        print("✅ Usuário admin sincronizado com sucesso")
    except subprocess.CalledProcessError:
        print("❌ Erro ao sincronizar usuário admin")
        return False
    return True

def start_server(port, debug):
    """Inicia o servidor Flask"""
    print(f"Iniciando servidor na porta {port}...")
    
    # Configura variáveis de ambiente para o servidor
    env = os.environ.copy()
    
    # Prepara o comando para iniciar o servidor
    command = [sys.executable, 'app.py']
    
    if debug:
        env['FLASK_DEBUG'] = '1'
        print("🐞 Modo de debug ativado")
    
    try:
        # Execução do servidor
        process = subprocess.Popen(command, env=env)
        print(f"✅ Servidor iniciado (PID: {process.pid})")
        print(f"🌐 API disponível em: http://localhost:{port}")
        print("Pressione Ctrl+C para encerrar")
        
        # Aguarda o término do processo
        process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Encerrando servidor...")
        process.terminate()
        process.wait()
        print("Servidor encerrado")
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        return False
    
    return True

if __name__ == "__main__":
    args = parse_args()
    
    # Atualiza .env
    if not update_env_file(args.env):
        sys.exit(1)
    
    # Sincroniza usuário admin se solicitado
    if args.sync_admin:
        if not sync_admin_user():
            sys.exit(1)
    
    # Inicia o servidor
    if not start_server(args.port, args.debug):
        sys.exit(1)
    
    sys.exit(0)