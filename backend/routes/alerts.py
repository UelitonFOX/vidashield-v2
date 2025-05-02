from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from models import db, Alert, User
import random
import logging
import traceback

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

@alerts_bp.route('', methods=['GET'])
@jwt_required()
def get_alerts():
    try:
        logger.info("Iniciando processamento da rota de alertas")
        
        # Garantir que existam alertas de exemplo no banco
        seed_alerts_if_empty()
        
        # Parâmetros de paginação e filtro
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        severity = request.args.get('severity', '', type=str)
        resolved = request.args.get('resolved', '', type=str)
        
        logger.info(f"Parâmetros: page={page}, limit={limit}, severity={severity}, resolved={resolved}")
        
        # Construir query
        query = Alert.query
        
        # Filtrar por severidade
        if severity:
            query = query.filter_by(severity=severity)
        
        # Filtrar por status de resolução
        if resolved == 'true':
            query = query.filter_by(resolved=True)
        elif resolved == 'false':
            query = query.filter_by(resolved=False)
        
        # Ordenar por data de criação (mais recentes primeiro)
        query = query.order_by(Alert.timestamp.desc())
        
        # Realizar paginação
        paginated_alerts = query.paginate(page=page, per_page=limit, error_out=False)
        
        logger.info(f"Total de alertas encontrados: {paginated_alerts.total}")
        
        # Formatar resultados
        results = []
        for alert in paginated_alerts.items:
            try:
                user = User.query.get(alert.user_id) if alert.user_id else None
                resolver = User.query.get(alert.resolved_by) if alert.resolved_by else None
                
                alert_data = {
                    "id": alert.id,
                    "type": alert.type,
                    "severity": alert.severity,
                    "details": alert.details or {},
                    "timestamp": alert.timestamp.isoformat() if alert.timestamp else None,
                    "formatted_date": alert.formatted_date,
                    "resolved": alert.resolved,
                    "resolved_time": alert.resolved_time.isoformat() if alert.resolved_time else None,
                    "resolved_by": alert.resolved_by
                }
                
                # Adicionar informações do usuário e resolver aos detalhes
                if user:
                    alert_data["details"]["user_id"] = user.id
                    alert_data["details"]["user_email"] = user.email
                
                if resolver:
                    alert_data["resolver_name"] = resolver.name
                
                results.append(alert_data)
            except Exception as e:
                logger.error(f"Erro ao processar alerta {alert.id}: {str(e)}")
                logger.error(traceback.format_exc())
        
        # Contagem por severidade para o dashboard
        severity_counts = {
            "critical": Alert.query.filter_by(severity='critical', resolved=False).count(),
            "warning": Alert.query.filter_by(severity='warning', resolved=False).count(),
            "info": Alert.query.filter_by(severity='info', resolved=False).count()
        }
        
        return jsonify({
            "alerts": results,
            "total": paginated_alerts.total,
            "page": page,
            "pages": paginated_alerts.pages,
            "severity_counts": severity_counts,
            "alert_types": alert_types
        })
    except Exception as e:
        logger.error(f"Erro global na rota de alertas: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

@alerts_bp.route('/<int:alert_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_alert(alert_id):
    # Recuperar o ID do usuário logado
    current_user_id = get_jwt_identity()
    
    # Buscar o alerta
    alert = Alert.query.get(alert_id)
    
    if not alert:
        return jsonify({"error": "Alerta não encontrado"}), 404
    
    if alert.resolved:
        return jsonify({"error": "Alerta já foi resolvido"}), 400
    
    # Atualizar status do alerta
    alert.resolved = True
    alert.resolved_time = datetime.now()
    alert.resolved_by = int(current_user_id)
    
    # Salvar no banco de dados
    db.session.commit()
    
    # Buscar informações do usuário que resolveu
    resolver = User.query.get(int(current_user_id))
    
    return jsonify({
        "message": "Alerta marcado como resolvido",
        "alert": {
            "id": alert.id,
            "type": alert.type,
            "severity": alert.severity,
            "details": alert.details,
            "timestamp": alert.timestamp.isoformat(),
            "formatted_date": alert.formatted_date,
            "resolved": alert.resolved,
            "resolved_time": alert.resolved_time.isoformat(),
            "resolved_by": alert.resolved_by,
            "resolver_name": resolver.name if resolver else None
        }
    }) 