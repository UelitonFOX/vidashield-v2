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

# Nova rota para dashboard com dados mock (API simples)


@alerts_bp.route('', methods=['GET'])
def get_alerts_mock():
    """
    Retorna uma lista de alertas mock para o dashboard
    """
    logger.info("Acessando rota GET /api/alerts (mock data)")

            # Extrair parâmetros de consulta (opcionais) - não utilizados nesta versão mock

    # Lista fixa de alertas mock para demo
    mock_alerts = [
        {"id": 1, "title": "Tentativa suspeita detectada", "date": "2025-05-15", "resolved": False},
        {"id": 2, "title": "Login bloqueado por IP inválido", "date": "2025-05-15", "resolved": False},
        {"id": 3, "title": "Múltiplas tentativas de login", "date": "2025-05-14", "resolved": True},
        {"id": 4, "title": "Acesso a dados sensíveis", "date": "2025-05-14", "resolved": False},
        {"id": 5, "title": "Nova conta criada", "date": "2025-05-12", "resolved": True}
    ]

    return jsonify(mock_alerts), 200

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
                "attempts": random.randint(
                    3, 10), "ip_address": f"45.67.{
                    random.randint(
                        1, 255)}.{
                    random.randint(
                        1, 255)}"}
        elif alert_type["name"] == "Acesso de IP não autorizado":
            details = {
                "ip_address": f"45.67.{
                    random.randint(
                        1,
                        255)}.{
                    random.randint(
                        1,
                        255)}",
                "usual_ip": "192.168.1.100"}
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
    print(f"Adicionados {len(alerts_to_add)
                         } alertas de exemplo ao banco de dados")


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
    """
    Retorna uma lista de alertas do banco de dados com filtros
    """
    try:
        logger.info("Acessando rota GET /api/alerts")

        # Extrair parâmetros de consulta (opcionais)
        limit = request.args.get('limit', default=10, type=int)
        offset = request.args.get('offset', default=0, type=int)
        alert_type = request.args.get('type')
        severity = request.args.get('severity')
        resolved_param = request.args.get('resolved')

        # Construir query base
        query = Alert.query

        # Aplicar filtros se fornecidos
        if alert_type:
            query = query.filter(Alert.type == alert_type)

        if severity:
            query = query.filter(Alert.severity == severity)

        if resolved_param is not None:
            # Converter string para booleano
            is_resolved = resolved_param.lower() in ('true', 'yes', '1')
            query = query.filter(Alert.resolved == is_resolved)

        # Obter o total de alertas que correspondem aos filtros (antes de
        # aplicar limit/offset)
        total_count = query.count()

        # Aplicar ordenação, limit e offset
        alerts = query.order_by(Alert.timestamp.desc()).offset(
            offset).limit(limit).all()

        # Converter para dicionário
        alerts_dict = [alert.to_dict() for alert in alerts]

        # Verificar se temos alertas
        if not alerts:
            # Se não temos alertas, vamos gerar alguns de exemplo para
            # demonstração
            seed_alerts_if_empty()
            # Tentar buscar novamente
            alerts = query.order_by(
                Alert.timestamp.desc()).offset(offset).limit(limit).all()
            alerts_dict = [alert.to_dict() for alert in alerts]

        return jsonify({
            "success": True,
            "alerts": alerts_dict,
            "count": len(alerts_dict),
            "total": total_count
        }), 200

    except Exception as e:
        logger.error(f"Erro ao buscar alertas: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerts_bp.route('/<alert_id>', methods=['GET'])
@jwt_required()
def get_alert(alert_id):
    """
    Retorna os detalhes de um alerta específico
    """
    try:
        # Buscar alerta pelo ID
        alert = Alert.query.get(alert_id)

        if not alert:
            return jsonify({
                "success": False,
                "error": "Alerta não encontrado"
            }), 404

        return jsonify({
            "success": True,
            "alert": alert.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Erro ao buscar alerta {alert_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerts_bp.route('/<alert_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_alert(alert_id):
    """
    Marca um alerta como resolvido
    """
    try:
        # Buscar alerta pelo ID
        alert = Alert.query.get(alert_id)

        if not alert:
            return jsonify({
                "success": False,
                "error": "Alerta não encontrado"
            }), 404

        # Obter ID do usuário que está resolvendo o alerta
        current_user_id = get_jwt_identity()

        # Marcar como resolvido
        alert.resolve(current_user_id)

        # Salvar alterações
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Alerta marcado como resolvido",
            "alert": alert.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Erro ao resolver alerta {alert_id}: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerts_bp.route('', methods=['POST'])
@jwt_required()
def create_alert():
    """
    Cria um novo alerta
    """
    try:
        data = request.json

        if not data:
            return jsonify(
                {"success": False, "error": "Dados não fornecidos"}), 400

        required_fields = ['type', 'severity', 'user_id']
        for field in required_fields:
            if field not in data:
                return jsonify(
                    {"success": False, "error": f"Campo obrigatório ausente: {field}"}), 400

        # Criar novo alerta
        new_alert = Alert(
            type=data['type'],
            severity=data['severity'],
            details=data.get('details', {}),
            user_id=data['user_id'],
            resolved=data.get('resolved', False)
        )

        if data.get('resolved', False) and data.get('resolved_by'):
            new_alert.resolved_by = data['resolved_by']
            new_alert.resolved_time = datetime.utcnow()

        # Salvar no banco
        db.session.add(new_alert)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Alerta criado com sucesso",
            "alert": new_alert.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Erro ao criar alerta: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


def create_sample_alerts():
    """
    Criar alertas de amostra para testes
    """
    sample_alerts = [{"id": str(uuid.uuid4()),
                      "type": "Tentativa de intrusão",
                      "severity": "critical",
                      "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
                      "resolved": False,
                      "details": {"email": "admin@clinica.com.br",
                                  "ip_address": "45.67.89.123",
                                  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                                  "location": "Kiev, Ucrânia",
                                  "attempts": 5,
                                  "message": "Detectadas 5 tentativas falhas de login para o email admin@clinica.com.br"}},
                     {"id": str(uuid.uuid4()),
                      "type": "Tentativa de intrusão",
                      "severity": "critical",
                      "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(),
                      "resolved": False,
                      "details": {"email": "atendimento@clinica.com.br",
                                  "ip_address": "178.154.200.58",
                                  "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
                                  "location": "Moscou, Rússia",
                                  "attempts": 8,
                                  "message": "Detectadas 8 tentativas falhas de login para o email atendimento@clinica.com.br"}},
                     {"id": str(uuid.uuid4()),
                      "type": "Acesso suspeito",
                      "severity": "warning",
                      "timestamp": (datetime.now() - timedelta(days=1)).isoformat(),
                      "resolved": True,
                      "details": {"email": "maria@clinica.com.br",
                                  "ip_address": "89.187.175.130",
                                  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                                  "location": "Berlim, Alemanha",
                                  "message": "Acesso de localização incomum detectado"}}]

    # Criar diretório se não existir
    os.makedirs('instance', exist_ok=True)

    # Salvar alertas
    with open(os.path.join('instance', 'intrusion_alerts.json'), 'w') as f:
        json.dump(sample_alerts, f, indent=2)


# Criar dados de teste na primeira execução
if not os.path.exists(os.path.join('instance', 'intrusion_alerts.json')):
    create_sample_alerts()
