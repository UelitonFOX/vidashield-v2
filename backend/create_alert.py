"""
Script para criar alertas de teste no banco de dados
"""

from flask import Flask
from models import db, Alert, User
import random
from datetime import datetime
import uuid
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def create_test_alerts():
    """Criar alertas de teste no banco de dados"""
    with app.app_context():
        # Verificar se existem usuários
        users = User.query.all()
        if not users:
            print("Nenhum usuário encontrado, criando usuário de teste")
            user = User(
                id=str(uuid.uuid4()),
                email="teste@example.com",
                name="Usuário Teste",
                role="admin"
            )
            db.session.add(user)
            db.session.commit()
            users = [user]
        
        print(f"Encontrados {len(users)} usuários")
        
        # Criar alertas de exemplo
        severidades = ["critical", "warning", "info"]
        tipos = [
            "Múltiplas falhas de login",
            "Acesso de IP não autorizado",
            "Tentativa de acesso a área restrita",
            "Senha expirada",
            "Novo dispositivo detectado"
        ]
        
        alertas_criados = []
        for i in range(5):
            tipo = random.choice(tipos)
            severidade = random.choice(severidades)
            usuario = random.choice(users)
            
            # Criar detalhes como uma string JSON para SQLite
            detalhes_dict = {}
            if tipo == "Múltiplas falhas de login":
                detalhes_dict = {
                    "attempts": random.randint(3, 10),
                    "ip_address": f"192.168.1.{random.randint(1, 255)}"
                }
            
            # Converter para string JSON
            detalhes_json = json.dumps(detalhes_dict)
            
            # Criar alerta com a string JSON
            alerta = Alert(
                id=str(uuid.uuid4()),
                type=tipo,
                severity=severidade,
                timestamp=datetime.now(),
                resolved=False,
                details=detalhes_json,  # SQLite não suporta JSON nativo
                user_id=usuario.id
            )
            
            db.session.add(alerta)
            alertas_criados.append(alerta.id)
            
            # Commit depois de cada alerta para evitar problemas em lote
            db.session.commit()
        
        print(f"Criados {len(alertas_criados)} alertas")
        print(f"IDs dos alertas: {alertas_criados}")
        
        # Verificar alertas
        alertas = Alert.query.all()
        print(f"Total de alertas no banco: {len(alertas)}")
        for alerta in alertas:
            print(f"ID: {alerta.id}, Tipo: {alerta.type}, Severidade: {alerta.severity}, Detalhes: {type(alerta.details)}")

if __name__ == "__main__":
    create_test_alerts() 