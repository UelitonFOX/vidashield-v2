"""
Script para testar conexão com banco de dados Supabase.
Garante que a conexão está funcionando e que a configuração está correta.
"""

import os
import sys
from sqlalchemy import create_engine, text
import psycopg2
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('db_connection')

# Carregar variáveis de ambiente
load_dotenv()

def test_connection():
    """
    Testa a conexão com o banco de dados configurado no .env
    """
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        logger.error("DATABASE_URL não encontrada no arquivo .env")
        return False
    
    logger.info(f"Testando conexão com: {database_url.split('@')[0].split(':')[0]}:***@{database_url.split('@')[1] if '@' in database_url else '(local)'}")
    
    try:
        # Conexão com SQLAlchemy
        engine = create_engine(database_url)
        
        with engine.connect() as connection:
            # Teste simples
            result = connection.execute(text("SELECT 1 as is_alive"))
            row = result.fetchone()
            
            if row and row[0] == 1:
                logger.info("✅ Conexão SQLAlchemy bem-sucedida!")
            else:
                logger.error("❌ Teste SQLAlchemy falhou!")
                return False
            
            # Verificar se estamos usando PostgreSQL (Supabase)
            is_postgres = 'postgresql' in database_url
            
            if is_postgres:
                logger.info("Banco de dados PostgreSQL detectado (provavelmente Supabase)")
                
                # Verificar se podemos acessar as tabelas
                try:
                    tables = connection.execute(text(
                        "SELECT table_name FROM information_schema.tables "
                        "WHERE table_schema = 'public'"
                    ))
                    
                    table_names = [table[0] for table in tables]
                    logger.info(f"Tabelas encontradas: {', '.join(table_names)}")
                    
                    # Verificar estrutura da tabela 'user'
                    if 'user' in table_names:
                        columns = connection.execute(text(
                            "SELECT column_name, data_type FROM information_schema.columns "
                            "WHERE table_name = 'user'"
                        ))
                        
                        column_info = [(col[0], col[1]) for col in columns]
                        logger.info(f"Estrutura da tabela 'user':")
                        for col_name, col_type in column_info:
                            logger.info(f"  - {col_name}: {col_type}")
                        
                        # Verificar tipo do ID
                        id_column = next((col for col in column_info if col[0] == 'id'), None)
                        if id_column:
                            if id_column[1].lower() == 'uuid':
                                logger.info("✅ Coluna 'id' é do tipo UUID (compatível com Supabase)")
                            else:
                                logger.warning(f"⚠️ Coluna 'id' é do tipo {id_column[1]}, não UUID!")
                        else:
                            logger.warning("⚠️ Coluna 'id' não encontrada na tabela 'user'!")
                    else:
                        logger.warning("⚠️ Tabela 'user' não encontrada!")
                    
                except Exception as e:
                    logger.error(f"❌ Erro ao verificar estrutura do banco: {e}")
            else:
                logger.info("Banco de dados SQLite detectado (ambiente local)")
            
            # Verificar contagem de usuários
            try:
                count = connection.execute(text("SELECT COUNT(*) FROM \"user\""))
                user_count = count.scalar()
                logger.info(f"Total de usuários: {user_count}")
                
                if user_count > 0:
                    # Mostrar primeiro usuário
                    first_user = connection.execute(text(
                        "SELECT id, email, role FROM \"user\" LIMIT 1"
                    )).fetchone()
                    
                    logger.info(f"Primeiro usuário: ID={first_user[0]}, Email={first_user[1]}, Role={first_user[2]}")
            except Exception as e:
                logger.error(f"❌ Erro ao consultar usuários: {e}")
        
        return True
    
    except Exception as e:
        logger.error(f"❌ Falha na conexão: {e}")
        return False

if __name__ == "__main__":
    logger.info("Iniciando teste de conexão com banco de dados...")
    success = test_connection()
    if success:
        logger.info("✅ Teste concluído com sucesso!")
        sys.exit(0)
    else:
        logger.error("❌ Teste de conexão falhou!")
        sys.exit(1)