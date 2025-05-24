#!/usr/bin/env python3
"""
Script para inicializar o banco de dados com dados de teste.
Use este script para criar um usuário inicial e dados de exemplo.
"""

from werkzeug.security import generate_password_hash
from models import User, Alert, AuthLog
from app import app, db
import os
import sys
from datetime import datetime, timedelta
import random

# Adicionar o diretório do backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def create_test_data():
    """Cria dados de teste para desenvolvimento local"""

    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        print("✅ Tabelas criadas com sucesso!")

        # Verificar se já existe um usuário admin
        admin = User.query.filter_by(email='admin@vidashield.com').first()
        if not admin:
            # Criar usuário administrador
            admin = User(
                name='Administrador',
                email='admin@vidashield.com',
                password_hash=generate_password_hash('admin123'),
                role='admin',
                is_active=True,
                created_at=datetime.now()
            )
            db.session.add(admin)
            print("✅ Usuário admin criado: admin@vidashield.com / senha: admin123")

        # Criar alguns usuários de teste
        test_users = [
            {'name': 'Maria Silva', 'email': 'maria@vidashield.com', 'role': 'gerente'},
            {'name': 'João Santos', 'email': 'joao@vidashield.com', 'role': 'usuario'},
            {'name': 'Ana Costa', 'email': 'ana@vidashield.com', 'role': 'usuario'},
        ]

        for user_data in test_users:
            if not User.query.filter_by(email=user_data['email']).first():
                user = User(
                    name=user_data['name'],
                    email=user_data['email'],
                    password_hash=generate_password_hash('senha123'),
                    role=user_data['role'],
                    is_active=True,
                    created_at=datetime.now() -
                    timedelta(
                        days=random.randint(
                            1,
                            30)))
                db.session.add(user)
                print(
                    f"✅ Usuário criado: {
                        user_data['email']} / senha: senha123")

        db.session.commit()

        # Criar alguns alertas de teste
        alert_types = [
            'security_breach',
            'failed_login',
            'system_error',
            'unusual_activity']
        severities = ['critical', 'warning', 'info']

        for i in range(20):
            alert = Alert(
                type=random.choice(alert_types),
                severity=random.choice(severities),
                timestamp=datetime.now() - timedelta(hours=random.randint(1, 168)),
                resolved=random.choice([True, False]),
                resolved_by='admin' if random.choice([True, False]) else None,
                user_id=admin.id
            )
            db.session.add(alert)

        # Criar logs de autenticação
        users = User.query.all()
        for _ in range(50):
            user = random.choice(users)
            log = AuthLog(
                user_id=user.id,
                action='login',
                success=random.choice(
                    [True, True, True, False]),  # 75% sucesso
                ip_address=f"192.168.1.{random.randint(1, 255)}",
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                timestamp=datetime.now() - timedelta(hours=random.randint(1, 72))
            )
            db.session.add(log)

        db.session.commit()
        print("✅ Dados de teste criados com sucesso!")

        # Mostrar resumo
        print(f"\n📊 Resumo do banco de dados:")
        print(f"   - Usuários: {User.query.count()}")
        print(f"   - Alertas: {Alert.query.count()}")
        print(f"   - Logs de autenticação: {AuthLog.query.count()}")

        print("\n🔐 Credenciais de acesso:")
        print("   Admin: admin@vidashield.com / admin123")
        print("   Outros: maria@vidashield.com, joao@vidashield.com, ana@vidashield.com / senha123")


if __name__ == '__main__':
    print("🛡️ VidaShield - Inicialização do Banco de Dados")
    print("=" * 50)

    response = input("\n⚠️  Isso irá criar dados de teste. Continuar? (s/n): ")
    if response.lower() == 's':
        create_test_data()
    else:
        print("❌ Operação cancelada.")
