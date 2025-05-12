from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from models import db, Alert, User
import random
import logging
import traceback
import os
import json
import uuid

# Configurar logger
logger = logging.getLogger('VidaShield.alerts')

alerts_bp = Blueprint('alerts', __name__)

# Tipos de alertas e suas severidades
alert_types = [
    {"id": 1, "name": "Múltiplas falhas de login", "severity": "critical"},
    {"id": 2, "name": "Acesso de IP não autorizado", "severity": "critical"},
    {"id": 3, "name": "Tentativa de acesso a área restrita", "severity": "critical"},
    {"id": 4, "name": "Senha expirada", "severity": "warning"},
    {"id": 5, "name": "Credenciais alteradas", "severity": "warning"},
    {"id": 6, "name": "Novo dispositivo detectado", "severity": "warning"},
    {"id": 7, "name": "Usuário criado", "severity": "info"},
    {"id": 8, "name": "Relatório exportado", "severity": "info"},
    {"id": 9, "name": "Sessão expirada", "severity": "info"},
]

# Função para gerar alertas de exemplo no banco de dados
def seed_alerts_if_empty():
    # Verificar se já existem alertas
    if Alert.query.count() > 0:
        return
    
    # Data atual para trabalhar com timestamps
    now = datetime.now()
    
    # Buscar usuários para associar aos alertas
    users = User.query.all()
    if not users:
        return
    
    alerts_to_add = []
    
    for i in range(50):
        # Gerar data aleatória nos últimos 30 dias
        random_days = random.randint(0, 7)  # Alertas são mais recentes
        random_hours = random.randint(0, 23)
        random_minutes = random.randint(0, 59)
        
        alert_time = now - timedelta(
            days=random_days, 
            hours=random_hours,
            minutes=random_minutes
        )
        
        # Escolher tipo de alerta aleatório
        alert_type = random.choice(alert_types)
        
        # Escolher usuário aleatório
        user = random.choice(users)
        
        # Gerar dados baseados no tipo de alerta
        if alert_type["name"] == "Múltiplas falhas de login":
            details = {
                "attempts": random.randint(3, 10),
                "ip_address": f"45.67.{random.randint(1, 255)}.{random.randint(1, 255)}"
            }
        elif alert_type["name"] == "Acesso de IP não autorizado":
            details = {
                "ip_address": f"45.67.{random.randint(1, 255)}.{random.randint(1, 255)}",
                "usual_ip": "192.168.1.100"
            }
        else:
            details = {}
        
        resolved = random.choices([True, False], weights=[0.3, 0.7], k=1)[0]
        
        # Criar objeto de alerta
        alert = Alert(
            type=alert_type["name"],
            severity=alert_type["severity"],
            details=details,
            timestamp=alert_time,
            resolved=resolved,
            user_id=user.id
        )
        
        if resolved:
            resolved_time = alert_time + timedelta(hours=random.randint(1, 5))
            alert.resolved_time = resolved_time
            # Escolher um administrador aleatório
            admins = [u for u in users if u.role == 'admin']
            if admins:
                alert.resolved_by = random.choice(admins).id
        
        alerts_to_add.append(alert)
    
    # Adicionar alertas ao banco de dados
    db.session.add_all(alerts_to_add)
    db.session.commit()
    print(f"Adicionados {len(alerts_to_add)} alertas de exemplo ao banco de dados")

@alerts_bp.route('/diagnostico', methods=['GET'])
def diagnose_alerts():
    """Rota de diagnóstico para identificar problemas com alertas"""
    try:
        # Verificar conexão com o banco
        alert_count = Alert.query.count()
        
        # Verificar se há usuários
        user_count = User.query.all()
        
        # Listar alguns alertas para diagnóstico
        sample_alerts = []
        for alert in Alert.query.limit(5).all():
            try:
                sample_alerts.append({
                    "id": alert.id,
                    "type": alert.type,
                    "severity": alert.severity,
                    "user_id": alert.user_id,
                    "details_type": type(alert.details).__name__
                })
            except Exception as e:
                sample_alerts.append({
                    "id": alert.id,
                    "error": str(e)
                })
        
        return jsonify({
            "status": "ok",
            "alert_count": alert_count,
            "user_count": len(user_count),
            "sample_alerts": sample_alerts
        })
    except Exception as e:
        logger.error(f"Erro no diagnóstico de alertas: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }), 500

@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """
    Retorna alertas filtrados por tipo, severidade, status de resolução e limite
    """
    # Parâmetros de consulta
    alert_type = request.args.get('type')
    severity = request.args.get('severity')
    resolved = request.args.get('resolved')
    limit = request.args.get('limit', default=10, type=int)
    
    try:
        # Buscar dados do arquivo de alertas (simular banco de dados)
        alerts_file = os.path.join('instance', 'intrusion_alerts.json')
        
        if not os.path.exists(alerts_file):
            # Se o arquivo não existe, criar alguns alertas simulados
            create_sample_alerts()
        
        # Ler alertas do arquivo
        with open(alerts_file, 'r') as f:
            alerts = json.load(f)
        
        # Aplicar filtros
        if alert_type:
            alerts = [alert for alert in alerts if alert.get('type') == alert_type]
        
        if severity:
            alerts = [alert for alert in alerts if alert.get('severity') == severity]
        
        if resolved is not None:
            # Converter string para booleano
            is_resolved = resolved.lower() in ('true', 'yes', '1')
            alerts = [alert for alert in alerts if alert.get('resolved') == is_resolved]
        
        # Ordenar alertas por timestamp (mais recentes primeiro)
        alerts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # Aplicar limite
        alerts = alerts[:limit]
        
        return jsonify({
            "success": True,
            "alerts": alerts,
            "count": len(alerts),
            "total": len(alerts)  # Em um banco real, este seria o total sem limite
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@alerts_bp.route('/alerts/<alert_id>', methods=['GET'])
def get_alert(alert_id):
    """
    Retorna os detalhes de um alerta específico
    """
    try:
        # Buscar dados do arquivo de alertas
        alerts_file = os.path.join('instance', 'intrusion_alerts.json')
        
        if not os.path.exists(alerts_file):
            return jsonify({
                "success": False,
                "error": "Nenhum alerta encontrado"
            }), 404
        
        # Ler alertas do arquivo
        with open(alerts_file, 'r') as f:
            alerts = json.load(f)
        
        # Buscar alerta pelo ID
        alert = next((a for a in alerts if a.get('id') == alert_id), None)
        
        if not alert:
            return jsonify({
                "success": False,
                "error": "Alerta não encontrado"
            }), 404
        
        return jsonify({
            "success": True,
            "alert": alert
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@alerts_bp.route('/alerts/<alert_id>/resolve', methods=['PUT'])
def resolve_alert(alert_id):
    """
    Marca um alerta como resolvido
    """
    try:
        # Buscar dados do arquivo de alertas
        alerts_file = os.path.join('instance', 'intrusion_alerts.json')
        
        if not os.path.exists(alerts_file):
            return jsonify({
                "success": False,
                "error": "Nenhum alerta encontrado"
            }), 404
        
        # Ler alertas do arquivo
        with open(alerts_file, 'r') as f:
            alerts = json.load(f)
        
        # Buscar e atualizar alerta pelo ID
        alert = next((a for a in alerts if a.get('id') == alert_id), None)
        
        if not alert:
            return jsonify({
                "success": False,
                "error": "Alerta não encontrado"
            }), 404
        
        # Marcar como resolvido
        alert['resolved'] = True
        alert['resolved_at'] = datetime.now().isoformat()
        
        # Salvar alertas atualizados
        with open(alerts_file, 'w') as f:
            json.dump(alerts, f, indent=2)
        
        return jsonify({
            "success": True,
            "message": "Alerta marcado como resolvido",
            "alert": alert
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def create_sample_alerts():
    """
    Criar alertas de amostra para testes
    """
    sample_alerts = [
        {
            "id": str(uuid.uuid4()),
            "type": "Tentativa de intrusão",
            "severity": "critical",
            "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
            "resolved": False,
            "details": {
                "email": "admin@clinica.com.br",
                "ip_address": "45.67.89.123",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "location": "Kiev, Ucrânia",
                "attempts": 5,
                "message": "Detectadas 5 tentativas falhas de login para o email admin@clinica.com.br"
            }
        },
        {
            "id": str(uuid.uuid4()),
            "type": "Tentativa de intrusão",
            "severity": "critical",
            "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(),
            "resolved": False,
            "details": {
                "email": "atendimento@clinica.com.br",
                "ip_address": "178.154.200.58",
                "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
                "location": "Moscou, Rússia",
                "attempts": 8,
                "message": "Detectadas 8 tentativas falhas de login para o email atendimento@clinica.com.br"
            }
        },
        {
            "id": str(uuid.uuid4()),
            "type": "Acesso suspeito",
            "severity": "warning",
            "timestamp": (datetime.now() - timedelta(days=1)).isoformat(),
            "resolved": True,
            "details": {
                "email": "maria@clinica.com.br",
                "ip_address": "89.187.175.130",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "location": "Berlim, Alemanha",
                "message": "Acesso de localização incomum detectado"
            }
        }
    ]
    
    # Criar diretório se não existir
    os.makedirs('instance', exist_ok=True)
    
    # Salvar alertas
    with open(os.path.join('instance', 'intrusion_alerts.json'), 'w') as f:
        json.dump(sample_alerts, f, indent=2)

# Criar dados de teste na primeira execução
if not os.path.exists(os.path.join('instance', 'intrusion_alerts.json')):
    create_sample_alerts() 