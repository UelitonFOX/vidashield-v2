from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta, timezone
import random

logs_bp = Blueprint('logs', __name__)

# Dados de exemplo para logs
log_types = [
    "Login bem-sucedido",
    "Tentativa de login falha",
    "Logout",
    "Alteração de senha",
    "Criação de usuário",
    "Edição de usuário",
    "Exportação de relatório",
    "Acesso a área restrita",
    "Bloqueio de IP",
    "Reset de senha",
    "Tentativa de login bloqueado"
]

user_ips = [
    "192.168.1.100",
    "192.168.1.101",
    "192.168.1.102",
    "10.0.0.5",
    "10.0.0.10",
    "172.16.0.1",
    "172.16.0.2",
    "172.16.0.3",
    "8.8.8.8",
    "1.1.1.1"
]

user_ids = list(range(1, 10))
user_names = [
    "Admin do Sistema",
    "Maria Silva",
    "João Santos",
    "Ana Oliveira",
    "Carlos Ferreira",
    "Pedro Lima",
    "Juliana Costa",
    "Roberto Alves",
    "Camila Santos"
]


def generate_mock_logs(count=100):
    logs = []

    # Data atual para trabalhar com timestamps
    now = datetime.now()

    for i in range(count):
        # Gerar data aleatória nos últimos 30 dias
        random_days = random.randint(0, 30)
        random_hours = random.randint(0, 23)
        random_minutes = random.randint(0, 59)
        random_seconds = random.randint(0, 59)

        log_time = now - timedelta(
            days=random_days,
            hours=random_hours,
            minutes=random_minutes,
            seconds=random_seconds
        )

        user_id = random.choice(user_ids)
        user_name = user_names[user_id % len(user_names)]

        # Decidir se é login falho ou bloqueado para IPs diferentes
        log_type = random.choice(log_types)
        if log_type == "Tentativa de login falha" or log_type == "Tentativa de login bloqueado":
            ip = f"45.67.{random.randint(1, 255)}.{random.randint(1, 255)}"
        else:
            ip = random.choice(user_ips)

        logs.append({
            "id": i + 1,
            "action": log_type,
            "user_id": user_id,
            "user_name": user_name,
            "ip_address": ip,
            "timestamp": log_time.isoformat(),
            "formatted_date": log_time.strftime("%d/%m/%Y, %H:%M:%S")
        })

    # Adicionar algumas tentativas de login bloqueadas específicas
    for i in range(5):
        log_time = now - timedelta(
            days=random.randint(0, 10),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59)
        )

        user_id = random.choice(user_ids)
        user_name = user_names[user_id % len(user_names)]

        logs.append({
            "id": count + i + 1,
            "action": "Tentativa de login bloqueado",
            "user_id": user_id,
            "user_name": user_name,
            "ip_address": f"45.67.{random.randint(1, 255)}.{random.randint(1, 255)}",
            "timestamp": log_time.isoformat(),
            "formatted_date": log_time.strftime("%d/%m/%Y, %H:%M:%S")
        })

    # Ordenar logs por timestamp (mais recentes primeiro)
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs


# Gerar logs mockados
mock_logs = generate_mock_logs(100)


@logs_bp.route('', methods=['GET'])
@jwt_required()
def get_logs():
    # Parâmetros de paginação e filtro
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    search = request.args.get('search', '', type=str).lower()
    log_type = request.args.get('type', '', type=str)
    from_date = request.args.get('from', '', type=str)
    to_date = request.args.get('to', '', type=str)
    user_id = request.args.get('user_id', '', type=str)
    blocked = request.args.get('blocked', '', type=str)

    filtered_logs = mock_logs.copy()

    # Filtrar por tipo de log
    if log_type:
        filtered_logs = [
            log for log in filtered_logs if log['action'] == log_type]

    # Filtrar por usuário
    if user_id:
        filtered_logs = [
            log for log in filtered_logs if str(
                log['user_id']) == user_id]

    # Filtrar por tentativas bloqueadas
    if blocked:
        is_blocked = blocked.lower() == 'true'
        if is_blocked:
            filtered_logs = [log for log in filtered_logs if 'bloqueado' in log['action'].lower(
            ) or 'bloqueio' in log['action'].lower()]
        else:
            filtered_logs = [log for log in filtered_logs if 'bloqueado' not in log['action'].lower(
            ) and 'bloqueio' not in log['action'].lower()]

    # Filtrar por termos de busca (nome de usuário ou ação)
    if search:
        filtered_logs = [log for log in filtered_logs if
                         search in log['user_name'].lower() or
                         search in log['action'].lower() or
                         search in log['ip_address'].lower()]

    # Filtrar por intervalo de datas
    if from_date:
        try:
            # Corrigir problema de comparação de datas, garantindo timezone
            # consistente
            from_datetime = datetime.fromisoformat(
                from_date.replace('Z', '+00:00'))
            if from_datetime.tzinfo is None:
                from_datetime = from_datetime.replace(tzinfo=timezone.utc)

            filtered_logs = [
                log for log in filtered_logs if datetime.fromisoformat(
                    log['timestamp']).replace(
                    tzinfo=timezone.utc) >= from_datetime]
        except ValueError as e:
            print(f"Erro ao converter data inicial: {e}")

    if to_date:
        try:
            # Corrigir problema de comparação de datas, garantindo timezone
            # consistente
            to_datetime = datetime.fromisoformat(
                to_date.replace('Z', '+00:00'))
            if to_datetime.tzinfo is None:
                to_datetime = to_datetime.replace(tzinfo=timezone.utc)

            filtered_logs = [
                log for log in filtered_logs if datetime.fromisoformat(
                    log['timestamp']).replace(
                    tzinfo=timezone.utc) <= to_datetime]
        except ValueError as e:
            print(f"Erro ao converter data final: {e}")

    # Calcular paginação
    total = len(filtered_logs)
    start_idx = (page - 1) * limit
    end_idx = min(start_idx + limit, total)
    paginated_logs = filtered_logs[start_idx:end_idx]

    # Listar tipos de log únicos para filtros
    unique_log_types = sorted(list(set(log['action'] for log in mock_logs)))

    return jsonify({
        "logs": paginated_logs,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "log_types": unique_log_types
    })


@logs_bp.route('/export', methods=['GET'])
@jwt_required()
def export_logs():
    # Simulação de exportação - na versão real, geraria um CSV
    return jsonify({
        "success": True,
        "message": "Logs exportados com sucesso. O download começará em breve.",
        "filename": f"logs_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    })
