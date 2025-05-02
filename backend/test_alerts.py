"""
Script para testar a rota de alertas e identificar o erro.
"""

import os
import sys
from flask import Flask, jsonify
from models import db, User, Alert
from routes.alerts import alerts_bp
import logging
from flask.logging import default_handler
from flask_jwt_extended import JWTManager, create_access_token

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('TestAlerts')

def create_test_app():
    """Criar uma aplicação Flask de teste"""
    app = Flask(__name__)
    
    # Configurar SQLite em memória para testes
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    app.config['DEBUG'] = True
    
    # Configurações de JWT necessárias
    app.config['JWT_SECRET_KEY'] = 'teste-secret-key'
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600
    
    # Inicializar JWT
    jwt = JWTManager(app)
    
    # Registrar blueprints
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    
    # Inicializar banco de dados
    db.init_app(app)
    
    return app

def check_alert_model():
    """Verificar o modelo Alert"""
    print(f"Alert model: {Alert.__dict__}")
    print(f"Alert columns: {Alert.__table__.columns}")

def test_alert_route():
    """Testar rota de alertas"""
    app = create_test_app()
    client = app.test_client()
    
    with app.app_context():
        # Criar tabelas
        db.create_all()
        
        # Criar usuário de teste
        user = User(
            email="test@example.com",
            name="Test User",
            role="admin"
        )
        db.session.add(user)
        db.session.commit()
        
        print(f"Usuário criado com ID: {user.id}")
        
        # Criar token JWT para o usuário
        access_token = create_access_token(identity=user.id)
        print(f"Token JWT criado: {access_token[:20]}...")
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        # Testar rota com autenticação
        response = client.get('/api/alerts', headers=headers)
        print(f"Status code com auth: {response.status_code}")
        
        # Se a resposta for 500, imprimir o erro
        if response.status_code == 500:
            try:
                error_data = response.json
                print(f"Erro 500: {error_data}")
            except Exception:
                print(f"Resposta de erro: {response.data.decode()}")
        
        # Configurar rota especial para diagnóstico
        @app.route('/api/debug/alerts', methods=['GET'])
        def debug_alerts():
            try:
                from routes.alerts import seed_alerts_if_empty
                with app.app_context():
                    # Criar alerta de teste diretamente
                    alert = Alert(
                        type="Teste Direto",
                        severity="info",
                        details={"test": "data"},
                        user_id=user.id
                    )
                    db.session.add(alert)
                    db.session.commit()
                    print(f"Alerta criado com ID: {alert.id}")
                    
                    # Tentar carregar todos os alertas
                    alerts = Alert.query.all()
                    print(f"Total de alertas: {len(alerts)}")
                    
                    alert_list = []
                    for a in alerts:
                        try:
                            alert_list.append({
                                'id': a.id,
                                'type': a.type,
                                'severity': a.severity,
                                'details': a.details,
                                'timestamp': a.timestamp.isoformat() if a.timestamp else None,
                                'user_id': a.user_id,
                                'formatted_date': a.formatted_date
                            })
                        except Exception as e:
                            print(f"Erro ao processar alerta {a.id}: {str(e)}")
                    
                    return jsonify({"alerts": alert_list})
            except Exception as e:
                import traceback
                tb = traceback.format_exc()
                return jsonify({"error": str(e), "traceback": tb}), 500
        
        # Testar rota de debug
        debug_response = client.get('/api/debug/alerts')
        print(f"Debug status code: {debug_response.status_code}")
        print(f"Debug response: {debug_response.data.decode()}")

if __name__ == "__main__":
    test_alert_route() 