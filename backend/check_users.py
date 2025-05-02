from app import app
from models import db, User
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

def check_db():
    with app.app_context():
        # Verificar estrutura da tabela de usuários
        try:
            print("Colunas na tabela de usuários:")
            for column in User.__table__.columns:
                print(f"  - {column.name}: {column.type}")
        except Exception as e:
            print(f"Erro ao verificar colunas: {e}")
        
        # Listar usuários
        try:
            users = User.query.all()
            print(f"\nUsuários encontrados: {len(users)}")
            for user in users[:10]:  # Limitar a 10 usuários
                print(f"ID: {user.id}, Email: {user.email}, Nome: {user.name}, Papel: {user.role}")
        except Exception as e:
            print(f"Erro ao listar usuários: {e}")
        
        # Verificar se o usuário específico existe
        try:
            # Aqui assumimos que o ID é string UUID, mas vamos verificar
            target_id = '954d93fb-8903-4fcb-a3d0-34317176293c'
            
            # Primeiro tentamos pela coluna id
            user = User.query.filter_by(id=target_id).first()
            print(f"\nBusca por ID exato:")
            if user:
                print(f"Usuário encontrado - ID: {user.id}, Email: {user.email}, Nome: {user.name}, Papel: {user.role}")
            else:
                print(f"Usuário com ID {target_id} não encontrado")
                
                # Verificamos se há uma coluna chamada uuid
                if hasattr(User, 'uuid'):
                    user_by_uuid = User.query.filter_by(uuid=target_id).first()
                    if user_by_uuid:
                        print(f"Usuário encontrado por UUID - ID: {user_by_uuid.id}, Email: {user_by_uuid.email}, Nome: {user_by_uuid.name}, Papel: {user_by_uuid.role}")
                    else:
                        print(f"Usuário com UUID {target_id} não encontrado")
                        
            # Tentativa SQL direta para debug
            try:
                print("\nTentando SQL direto:")
                sql_users = db.session.execute(text(f"SELECT * FROM \"user\" LIMIT 1")).all()
                print(f"Primeiro usuário: {sql_users[0]}")
                
                # Ver se tem o ID específico com SQL 
                sql_target = db.session.execute(text(f"SELECT * FROM \"user\" WHERE id = '{target_id}' OR uuid = '{target_id}'")).all()
                if sql_target:
                    print(f"Usuário alvo encontrado via SQL: {sql_target[0]}")
                else:
                    print(f"Usuário alvo NÃO encontrado via SQL")
                    
            except Exception as sql_e:
                print(f"Erro na consulta SQL: {sql_e}")
                
        except Exception as e:
            print(f"Erro ao buscar usuário específico: {e}")

if __name__ == "__main__":
    print("Verificando banco de dados...")
    check_db()
    print("Verificação concluída.")