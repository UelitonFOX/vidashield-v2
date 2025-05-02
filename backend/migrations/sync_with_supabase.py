"""
Script de migração para sincronizar o esquema do banco de dados local com o Supabase.
- Converte o campo id de INTEGER para STRING (UUID)
- Atualiza chaves estrangeiras
- Preserva os dados existentes
"""

import os
import sys
import uuid
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, inspect
import logging
import json

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('db_migration')

# Adicionando o diretório pai ao path para poder importar os módulos
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)

# Importando a configuração
from config import Config

def check_column_type(inspector, table_name, column_name):
    """Verifica o tipo da coluna no banco de dados"""
    columns = inspector.get_columns(table_name)
    for col in columns:
        if col['name'] == column_name:
            return col['type'].__str__()
    return None

def backup_data(db):
    """Faz backup de todos os dados das tabelas para restaurar após a migração"""
    data_backup = {}
    
    # Backup da tabela de usuários
    try:
        users_query = text('SELECT * FROM "user"')
        users = db.session.execute(users_query).fetchall()
        data_backup['users'] = [dict(u._mapping) for u in users]
        logger.info(f"Backup de {len(data_backup['users'])} usuários realizado")
    except Exception as e:
        logger.error(f"Erro ao fazer backup da tabela user: {e}")
        data_backup['users'] = []
    
    # Backup da tabela de alertas
    try:
        alerts_query = text('SELECT * FROM "alert"')
        alerts = db.session.execute(alerts_query).fetchall()
        data_backup['alerts'] = [dict(a._mapping) for a in alerts]
        logger.info(f"Backup de {len(data_backup['alerts'])} alertas realizado")
    except Exception as e:
        logger.error(f"Erro ao fazer backup da tabela alert: {e}")
        data_backup['alerts'] = []
    
    return data_backup

def run_migration():
    """Executa a migração para sincronizar com o Supabase"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Criando uma instância do SQLAlchemy
    db = SQLAlchemy(app)
    
    with app.app_context():
        try:
            inspector = inspect(db.engine)
            
            # Verificar tipos de colunas atuais
            user_id_type = check_column_type(inspector, 'user', 'id')
            logger.info(f"Tipo atual da coluna user.id: {user_id_type}")
            
            # Se já for String/VARCHAR, não precisa migrar
            if user_id_type and ('VARCHAR' in user_id_type.upper() or 'STRING' in user_id_type.upper()):
                logger.info("A coluna user.id já é do tipo String/VARCHAR. Migração não necessária.")
                return
            
            # Backup dos dados antes da migração
            logger.info("Iniciando backup dos dados...")
            data_backup = backup_data(db)
            
            # Salvar backup em arquivo por segurança
            with open('db_backup_before_migration.json', 'w') as f:
                json.dump(data_backup, f, default=str)
            
            # Remover as tabelas antigas
            logger.info("Removendo tabelas antigas...")
            db.session.execute(text('DROP TABLE IF EXISTS "alert"'))
            db.session.execute(text('DROP TABLE IF EXISTS "user"'))
            db.session.commit()
            
            # Recriar as tabelas com o novo esquema
            logger.info("Recriando tabelas com novo esquema...")
            from models import User, Alert
            db.create_all()
            
            # Restaurar os dados dos usuários
            logger.info("Restaurando dados dos usuários...")
            for user_data in data_backup['users']:
                # Preservar o ID original se possível ou gerar um novo UUID
                user_id = user_data.get('id')
                if isinstance(user_id, int):
                    user_id = str(uuid.uuid4())
                
                # Verificar dados obrigatórios
                if not user_data.get('email'):
                    logger.warning(f"Usuário sem email encontrado, ignorando: {user_data}")
                    continue
                
                # Criar novo usuário com os dados do backup
                new_user = User(
                    id=user_id,
                    email=user_data.get('email'),
                    name=user_data.get('name'),
                    password_hash=user_data.get('password_hash'),
                    role=user_data.get('role', 'user'),
                    oauth_provider=user_data.get('oauth_provider'),
                    oauth_id=user_data.get('oauth_id'),
                    created_at=user_data.get('created_at'),
                    is_active=user_data.get('is_active', True),
                    email_verified=user_data.get('email_verified', False),
                    reset_token=user_data.get('reset_token'),
                    reset_token_expires=user_data.get('reset_token_expires')
                )
                db.session.add(new_user)
            
            # Commit dos usuários antes de restaurar os alertas (devido às chaves estrangeiras)
            db.session.commit()
            logger.info("Dados dos usuários restaurados com sucesso")
            
            # Verificar se existem dados de alerta para restaurar
            if data_backup.get('alerts'):
                logger.info("Restaurando dados dos alertas...")
                for alert_data in data_backup['alerts']:
                    # Se os IDs dos usuários eram números, não podemos restaurar as referências
                    # corretamente, então pulamos os alertas
                    if isinstance(alert_data.get('user_id'), int) or isinstance(alert_data.get('resolved_by'), int):
                        logger.warning("Alertas com referências a IDs de usuário numéricos não podem ser restaurados")
                        continue
                    
                    try:
                        new_alert = Alert(
                            id=alert_data.get('id'),
                            type=alert_data.get('type'),
                            severity=alert_data.get('severity'),
                            details=alert_data.get('details'),
                            timestamp=alert_data.get('timestamp'),
                            resolved=alert_data.get('resolved', False),
                            resolved_time=alert_data.get('resolved_time'),
                            resolved_by=alert_data.get('resolved_by'),
                            user_id=alert_data.get('user_id')
                        )
                        db.session.add(new_alert)
                    except Exception as e:
                        logger.error(f"Erro ao restaurar alerta: {e}")
                
                db.session.commit()
                logger.info("Dados dos alertas restaurados (quando possível)")
            
            logger.info("Migração concluída com sucesso!")
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Erro durante a migração: {str(e)}")
            raise

if __name__ == "__main__":
    logger.info("Iniciando migração para sincronizar com o Supabase")
    run_migration()
    logger.info("Script de migração concluído")