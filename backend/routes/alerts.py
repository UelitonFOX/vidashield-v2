from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random

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

# Dados de exemplo para alertas
def generate_mock_alerts(count=50):
    alerts = []
    
    # Data atual para trabalhar com timestamps
    now = datetime.now()
    
    for i in range(count):
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
        
        # Gerar dados baseados no tipo de alerta
        if alert_type["name"] == "Múltiplas falhas de login":
            details = {
                "user_id": random.randint(1, 10),
                "user_email": f"usuario{random.randint(1, 10)}@exemplo.com",
                "attempts": random.randint(3, 10),
                "ip_address": f"45.67.{random.randint(1, 255)}.{random.randint(1, 255)}"
            }
        elif alert_type["name"] == "Acesso de IP não autorizado":
            details = {
                "user_id": random.randint(1, 10),
                "user_email": f"usuario{random.randint(1, 10)}@exemplo.com",
                "ip_address": f"45.67.{random.randint(1, 255)}.{random.randint(1, 255)}",
                "usual_ip": "192.168.1.100"
            }
        else:
            details = {
                "user_id": random.randint(1, 10),
                "user_email": f"usuario{random.randint(1, 10)}@exemplo.com"
            }
        
        resolved = random.choices([True, False], weights=[0.3, 0.7], k=1)[0]
        if resolved:
            resolved_time = alert_time + timedelta(hours=random.randint(1, 5))
            resolved_by = random.randint(1, 3)  # ID do admin
        else:
            resolved_time = None
            resolved_by = None
        
        alerts.append({
            "id": i + 1,
            "type": alert_type["name"],
            "severity": alert_type["severity"],
            "details": details,
            "timestamp": alert_time.isoformat(),
            "formatted_date": alert_time.strftime("%d/%m/%Y, %H:%M"),
            "resolved": resolved,
            "resolved_time": resolved_time.isoformat() if resolved_time else None,
            "resolved_by": resolved_by
        })
    
    # Ordenar alertas por timestamp (mais recentes primeiro)
    alerts.sort(key=lambda x: x["timestamp"], reverse=True)
    return alerts

# Gerar alertas mockados
mock_alerts = generate_mock_alerts(50)

@alerts_bp.route('', methods=['GET'])
@jwt_required()
def get_alerts():
    # Parâmetros de paginação e filtro
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    severity = request.args.get('severity', '', type=str)
    resolved = request.args.get('resolved', '', type=str)
    
    filtered_alerts = mock_alerts.copy()
    
    # Filtrar por severidade
    if severity:
        filtered_alerts = [alert for alert in filtered_alerts if alert['severity'] == severity]
    
    # Filtrar por status de resolução
    if resolved == 'true':
        filtered_alerts = [alert for alert in filtered_alerts if alert['resolved']]
    elif resolved == 'false':
        filtered_alerts = [alert for alert in filtered_alerts if not alert['resolved']]
    
    # Calcular paginação
    total = len(filtered_alerts)
    start_idx = (page - 1) * limit
    end_idx = min(start_idx + limit, total)
    paginated_alerts = filtered_alerts[start_idx:end_idx]
    
    # Contagem por severidade para o dashboard
    severity_counts = {
        "critical": len([a for a in mock_alerts if a['severity'] == 'critical' and not a['resolved']]),
        "warning": len([a for a in mock_alerts if a['severity'] == 'warning' and not a['resolved']]),
        "info": len([a for a in mock_alerts if a['severity'] == 'info' and not a['resolved']])
    }
    
    return jsonify({
        "alerts": paginated_alerts,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "severity_counts": severity_counts,
        "alert_types": alert_types
    })

@alerts_bp.route('/<int:alert_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_alert(alert_id):
    # Encontrar o alerta pelo ID
    alert = next((a for a in mock_alerts if a['id'] == alert_id), None)
    
    if not alert:
        return jsonify({"error": "Alerta não encontrado"}), 404
    
    if alert['resolved']:
        return jsonify({"error": "Alerta já foi resolvido"}), 400
    
    # Atualizar status do alerta
    current_user_id = get_jwt_identity()
    alert['resolved'] = True
    alert['resolved_time'] = datetime.now().isoformat()
    alert['resolved_by'] = current_user_id
    
    return jsonify({
        "message": "Alerta marcado como resolvido",
        "alert": alert
    }) 