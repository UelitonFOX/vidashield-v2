from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime, timedelta
import random

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/data', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    # Obter o usuário atual para personalizar os dados
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
    
    # Gerar alguns dados de exemplo para o dashboard
    # Em um sistema real, isso viria do banco de dados
    total_usuarios = random.randint(50, 200)
    logins_hoje = random.randint(10, 50)
    alertas_criticos = random.randint(0, 5)
    
    # Gerar dados de acessos para a última semana
    acessos_semana = [random.randint(5, 30) for _ in range(7)]
    
    # Gerar alguns alertas recentes
    tipos_alerta = ['critical', 'warning', 'success']
    mensagens_alerta = [
        'Tentativa de acesso não autorizado',
        'Senha fraca detectada',
        'Login realizado com sucesso',
        'Arquivo sensível acessado',
        'Backup concluído com sucesso',
        'Atualização de segurança disponível',
        'Dispositivo não reconhecido tentou autenticação'
    ]
    
    alertas_recentes = []
    for i in range(1, 6):  # 5 alertas recentes
        tipo = random.choice(tipos_alerta)
        tempo_atras = timedelta(
            minutes=random.randint(1, 60 * 24)
        )  # Entre 1 minuto e 24 horas atrás
        tempo = (datetime.now() - tempo_atras).strftime('%Hh%M - %d/%m')
        
        alertas_recentes.append({
            "id": i,
            "tipo": tipo,
            "mensagem": random.choice(mensagens_alerta),
            "tempo": tempo
        })
    
    # Ordenar alertas por tempo (mais recentes primeiro)
    alertas_recentes.sort(
        key=lambda x: datetime.strptime(x["tempo"].split(" - ")[0], "%Hh%M"), 
        reverse=True
    )
    
    return jsonify({
        "total_usuarios": total_usuarios,
        "logins_hoje": logins_hoje,
        "alertas_criticos": alertas_criticos,
        "acessos_semana": acessos_semana,
        "alertas_recentes": alertas_recentes,
        "user": {
            "name": user.name,
            "email": user.email
        }
    }) 