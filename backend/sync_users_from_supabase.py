"""
Script para sincronizar usuários do Supabase com o backend local.

Este script permite:
1. Sincronizar os UUIDs dos usuários com os UUIDs do Supabase
2. Atualizar papéis e informações de usuários específicos
3. Garantir que administradores específicos existam no sistema
"""

from app import app
from models import db, User
from werkzeug.security import generate_password_hash
import uuid
import sys
import logging
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('user_sync')

# ID específico do Supabase a ser sincronizado
SUPABASE_ADMIN_ID = '954d93fb-8903-4fcb-a3d0-34317176293c'
SUPABASE_ADMIN_EMAIL = 'ueliton.talento.tech@gmail.com'
SUPABASE_ADMIN_NAME = 'Fox'

def create_or_update_admin(specific_id=None, email=None, name=None):
    """
    Cria ou atualiza um usuário administrador com um ID específico.
    """
    if not specific_id and not email:
        logger.error("É necessário fornecer um ID específico ou um email para criar/atualizar o administrador.")
        return None
    
    with app.app_context():
        # Se temos ID específico, buscamos pelo ID
        if specific_id:
            admin = User.query.filter_by(id=specific_id).first()
            if admin:
                logger.info(f"Administrador encontrado pelo ID: {admin.id}, {admin.email}")
            else:
                logger.info(f"Administrador com ID {specific_id} não encontrado.")
        else:
            admin = None
        
        # Se não encontramos pelo ID, buscamos pelo email
        if not admin and email:
            admin = User.query.filter_by(email=email).first()
            if admin:
                logger.info(f"Administrador encontrado pelo email: {admin.id}, {admin.email}")
                
                # Se temos um ID específico, atualizamos o ID do usuário
                if specific_id and admin.id != specific_id:
                    logger.info(f"Atualizando ID do usuário de {admin.id} para {specific_id}")
                    
                    # Isso é complicado porque envolve atualizar chaves primárias
                    # Vamos inserir um novo registro e excluir o antigo
                    old_id = admin.id
                    admin_data = {
                        'id': specific_id,
                        'email': admin.email,
                        'name': name or admin.name,
                        'password_hash': admin.password_hash,
                        'role': 'admin',
                        'oauth_provider': admin.oauth_provider,
                        'oauth_id': admin.oauth_id,
                        'created_at': admin.created_at,
                        'is_active': admin.is_active,
                        'email_verified': admin.email_verified,
                        'reset_token': admin.reset_token,
                        'reset_token_expires': admin.reset_token_expires
                    }
                    
                    # Excluir o usuário antigo
                    db.session.delete(admin)
                    db.session.commit()
                    
                    # Criar novo usuário com ID específico
                    admin = User(**admin_data)
                    db.session.add(admin)
                    db.session.commit()
                    logger.info(f"Usuário recriado com ID do Supabase: {admin.id}")
                    
                    return admin
            else:
                logger.info(f"Administrador com email {email} não encontrado.")
        
        # Se ainda não encontramos o administrador, criamos um novo
        if not admin:
            logger.info(f"Criando novo administrador com ID {specific_id} e email {email}")
            admin = User(
                id=specific_id or str(uuid.uuid4()),
                email=email or f"admin_{uuid.uuid4().hex[:8]}@vidashield.com",
                name=name or "Administrador do Sistema",
                password_hash=generate_password_hash(str(uuid.uuid4())),  # Senha aleatória
                role='admin',
                email_verified=True,
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
            logger.info(f"Novo administrador criado: ID={admin.id}, Email={admin.email}")
            return admin
        
        # Atualizamos as informações do administrador se necessário
        if name and admin.name != name:
            admin.name = name
            logger.info(f"Nome do administrador atualizado para {name}")
        
        if admin.role != 'admin':
            admin.role = 'admin'
            logger.info(f"Papel do usuário {admin.email} atualizado para 'admin'")
            
        admin.email_verified = True
        db.session.commit()
        logger.info(f"Administrador atualizado: ID={admin.id}, Nome={admin.name}, Papel={admin.role}")
        return admin

def list_all_users():
    """Lista todos os usuários no banco de dados"""
    with app.app_context():
        users = User.query.all()
        logger.info(f"Total de usuários: {len(users)}")
        for user in users:
            logger.info(f"ID: {user.id}, Email: {user.email}, Nome: {user.name}, Papel: {user.role}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == 'list':
        list_all_users()
    else:
        # Sincronizar o administrador específico do Supabase
        admin = create_or_update_admin(
            specific_id=SUPABASE_ADMIN_ID,
            email=SUPABASE_ADMIN_EMAIL,
            name=SUPABASE_ADMIN_NAME
        )
        
        if admin:
            logger.info("Sincronização do administrador concluída com sucesso.")
            logger.info(f"ID: {admin.id}, Email: {admin.email}, Nome: {admin.name}, Papel: {admin.role}")
        else:
            logger.error("Falha ao sincronizar o administrador.")
            
        logger.info("Faça logout e login novamente para aplicar as alterações.")