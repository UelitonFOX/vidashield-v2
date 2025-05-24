"""
Script para adicionar a coluna email_verified à tabela user.
Execute este script após adicionar o campo no modelo.
"""

from config import Config
import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('db_migration')

# Adicionando o diretório pai ao path para poder importar os módulos
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

# Importando a configuração


def run_migration():
    """Executa a migração para adicionar a coluna email_verified"""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Criando uma instância do SQLAlchemy
    db = SQLAlchemy(app)

    with app.app_context():
        try:
            # Verificar se a coluna já existe (compatível com SQLite)
            exists_query = text("""
                SELECT COUNT(*) FROM pragma_table_info('user')
                WHERE name='email_verified'
            """)

            result = db.session.execute(exists_query).scalar()

            if result > 0:
                logger.info(
                    "A coluna email_verified já existe na tabela user.")
                return

            # Adicionar a coluna email_verified
            add_column_query = text(
                "ALTER TABLE user ADD COLUMN email_verified BOOLEAN DEFAULT FALSE")
            db.session.execute(add_column_query)

            # Definir email_verified como true para usuários OAuth
            update_query = text("""
                UPDATE user
                SET email_verified = TRUE
                WHERE oauth_provider IS NOT NULL
            """)
            db.session.execute(update_query)

            db.session.commit()
            logger.info(
                "Coluna email_verified adicionada com sucesso à tabela user.")

        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro durante a migração: {str(e)}")
            raise


if __name__ == "__main__":
    logger.info("Iniciando migração para adicionar email_verified")
    run_migration()
    logger.info("Migração concluída")
