"""
Script para corrigir o problema de alertas no banco de dados.
Este script recria a tabela de alertas com a estrutura correta.
"""

from flask import Flask
from models import db, Alert, User, JSONType
import json
import uuid
from datetime import datetime, timedelta
import random
import os
import shutil

# Criar aplicação Flask
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def fix_alerts_table():
    """Recria a tabela de alertas e cria alertas de exemplo"""
    with app.app_context():
        print("Iniciando correção da tabela de alertas...")
        
        # Fazer backup do banco de dados
        if os.path.exists('instance/app.db'):
            backup_path = 'instance/app.db.backup'
            try:
                shutil.copy2('instance/app.db', backup_path)
                print(f"Backup do banco de dados criado em {backup_path}")
            except Exception as e:
                print(f"Não foi possível criar backup: {str(e)}")
        
        # Remover a tabela atual de alertas
        print("Removendo tabela de alertas...")
        try:
            Alert.__table__.drop(db.engine)
            print("Tabela de alertas removida com sucesso.")
        except Exception as e:
            print(f"Erro ao remover tabela de alertas: {str(e)}")
        
        # Criar a nova tabela de alertas
        print("Criando nova tabela de alertas...")
        Alert.__table__.create(db.engine)
        print("Nova tabela de alertas criada com sucesso.")
        
        # Buscar usuários para associar aos alertas
        users = User.query.all()
        if not users:
            print("Nenhum usuário encontrado.")
            return
        
        print(f"Encontrados {len(users)} usuários.")
        
        # Dados para alertas de exemplo
        severities = ["critical", "warning", "info"]
        alert_types = [
            "Múltiplas falhas de login",
            "Acesso de IP não autorizado",
            "Tentativa de acesso a área restrita",
            "Senha expirada",
            "Novo dispositivo detectado",
            "Usuário criado",
            "Relatório exportado",
            "Sessão expirada"
        ]
        
        # Criar alertas de exemplo
        now = datetime.now()
        print("Criando alertas de exemplo...")
        alerts_to_add = []
        
        for i in range(20):
            # Gerar data aleatória nos últimos 7 dias
            random_days = random.randint(0, 7)
            random_hours = random.randint(0, 23)
            random_minutes = random.randint(0, 59)
            
            alert_time = now - timedelta(
                days=random_days,
                hours=random_hours,
                minutes=random_minutes
            )
            
            # Escolher tipo e severidade aleatória
            alert_type = random.choice(alert_types)
            severity = random.choice(severities)
            
            # Escolher usuário aleatório
            user = random.choice(users)
            
            # Criar detalhes
            details = {}
            if alert_type == "Múltiplas falhas de login":
                details = {
                    "attempts": random.randint(3, 10),
                    "ip_address": f"192.168.1.{random.randint(1, 255)}"
                }
            elif alert_type == "Acesso de IP não autorizado":
                details = {
                    "ip_address": f"45.67.{random.randint(1, 255)}.{random.randint(1, 255)}",
                    "usual_ip": "192.168.1.100"
                }
            
            # Determinar se o alerta está resolvido
            resolved = random.choices([True, False], weights=[0.3, 0.7], k=1)[0]
            resolved_time = None
            resolved_by = None
            
            if resolved:
                resolved_time = alert_time + timedelta(hours=random.randint(1, 24))
                # Encontrar um administrador para resolver
                admins = [u for u in users if u.role == 'admin']
                if admins:
                    resolver = random.choice(admins)
                    resolved_by = resolver.id
            
            # Criar o alerta
            alert = Alert(
                id=str(uuid.uuid4()),
                type=alert_type,
                severity=severity,
                details=details,
                timestamp=alert_time,
                resolved=resolved,
                resolved_time=resolved_time,
                resolved_by=resolved_by,
                user_id=user.id
            )
            
            alerts_to_add.append(alert)
        
        # Adicionar todos os alertas ao banco de dados
        db.session.add_all(alerts_to_add)
        db.session.commit()
        
        print(f"Adicionados {len(alerts_to_add)} alertas de exemplo.")
        
        # Verificar se os alertas foram criados corretamente
        alerts = Alert.query.all()
        print(f"Total de alertas no banco de dados: {len(alerts)}")
        
        for alert in alerts[:3]:  # Mostrar apenas os 3 primeiros
            print(f"ID: {alert.id}, Tipo: {alert.type}, Severidade: {alert.severity}, " +
                  f"Detalhes: {type(alert.details)}")
            if isinstance(alert.details, dict):
                print(f"Conteúdo de detalhes: {alert.details}")

if __name__ == "__main__":
    fix_alerts_table() 