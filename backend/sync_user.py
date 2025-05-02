"""
Script para sincronizar/criar um usuário administrador localmente
que corresponda ao usuário do Supabase.
"""

from app import app
from models import db, User
from werkzeug.security import generate_password_hash
import uuid
import sys

def sync_user_role(email, new_role='admin', new_name='Fox'):
    """
    Atualiza ou cria um usuário com papel administrador.
    Parâmetros:
    - email: Email do usuário a ser promovido
    - new_role: Novo papel (admin, manager, user)
    - new_name: Novo nome do usuário
    """
    with app.app_context():
        # Buscar o usuário pelo email
        user = User.query.filter_by(email=email).first()
        
        if user:
            print(f"Usuário encontrado: ID={user.id}, Nome={user.name}, Papel={user.role}")
            
            # Atualizar papel e nome
            user.role = new_role
            user.name = new_name
            db.session.commit()
            
            print(f"Usuário atualizado: ID={user.id}, Nome={user.name}, Papel={user.role}")
            return user
        else:
            print(f"Usuário não encontrado. Criando novo usuário admin...")
            
            # Criar um novo usuário admin
            new_user = User(
                email=email,
                name=new_name,
                role=new_role,
                password_hash=generate_password_hash(str(uuid.uuid4()))  # Senha aleatória
            )
            
            db.session.add(new_user)
            db.session.commit()
            
            print(f"Novo usuário criado: ID={new_user.id}, Nome={new_user.name}, Papel={new_user.role}")
            return new_user

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
    else:
        # E-mail do usuário a ser promovido
        email = input("Digite o email do usuário a ser promovido para administrador: ")
    
    sync_user_role(email)
    print("Sincronização concluída. Faça logout e login novamente para aplicar as alterações.")