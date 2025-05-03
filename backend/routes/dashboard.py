from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime, timedelta
import random
import logging

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

@dashboard_bp.route('/insights/random', methods=['GET'])
@jwt_required()
def get_random_insight():
    """Retorna um insight aleatório sobre segurança ou uso do sistema."""
    try:
        current_user_id = get_jwt_identity()
        
        # Obter dados do banco de dados (simulação)
        # Aqui deveria integrar com queries reais 
        insights = [
            {
                "type": "security",
                "text": f"🚨 IP {_random_ip()} teve {random.randint(1, 5)} tentativas bloqueadas nas últimas {random.randint(1, 3)}h."
            },
            {
                "type": "security",
                "text": f"🔁 Usuário {_random_email()} trocou a senha {random.randint(1, 3)} vezes em {random.randint(3, 10)} dias."
            },
            {
                "type": "trend",
                "text": f"📉 Acesso caiu {random.randint(10, 30)}% em relação à semana passada."
            },
            {
                "type": "trend", 
                "text": f"📈 Aumento de {random.randint(5, 40)}% em exportações de relatórios este mês."
            },
            {
                "type": "location",
                "text": f"🧭 Mais acessos vindos de {_random_city()} nas últimas 24h."
            },
            {
                "type": "usage",
                "text": f"📊 Horário de pico de acessos: {random.randint(8, 11)}h às {random.randint(13, 18)}h."
            },
            {
                "type": "security",
                "text": f"🚨 {random.randint(2, 8)} tentativas de login do dispositivo não reconhecido."
            },
            {
                "type": "usage",
                "text": f"🔄 {random.randint(1, 10)} novos usuários cadastrados na última semana."
            }
        ]
        
        # Selecionar um insight aleatoriamente
        random_insight = random.choice(insights)
        
        return jsonify(random_insight), 200
    
    except Exception as e:
        logging.error(f"Erro ao buscar insight aleatório: {str(e)}")
        return jsonify({"error": "Erro ao buscar insight"}), 500

@dashboard_bp.route('/insights/multiple', methods=['GET'])
@jwt_required()
def get_multiple_insights():
    """Retorna múltiplos insights aleatórios sobre segurança ou uso do sistema."""
    try:
        current_user_id = get_jwt_identity()
        count = request.args.get('count', default=4, type=int)
        count = min(max(1, count), 10)  # Limita entre 1 e 10 insights
        
        # Lista de insights disponíveis (igual à função de insight único)
        insights = [
            {
                "type": "security",
                "text": f"🚨 IP {_random_ip()} teve {random.randint(1, 5)} tentativas bloqueadas nas últimas {random.randint(1, 3)}h."
            },
            {
                "type": "security",
                "text": f"🔁 Usuário {_random_email()} trocou a senha {random.randint(1, 3)} vezes em {random.randint(3, 10)} dias."
            },
            {
                "type": "trend",
                "text": f"📉 Acesso caiu {random.randint(10, 30)}% em relação à semana passada."
            },
            {
                "type": "trend", 
                "text": f"📈 Aumento de {random.randint(5, 40)}% em exportações de relatórios este mês."
            },
            {
                "type": "location",
                "text": f"🧭 Mais acessos vindos de {_random_city()} nas últimas 24h."
            },
            {
                "type": "usage",
                "text": f"📊 Horário de pico de acessos: {random.randint(8, 11)}h às {random.randint(13, 18)}h."
            },
            {
                "type": "security",
                "text": f"🚨 {random.randint(2, 8)} tentativas de login do dispositivo não reconhecido."
            },
            {
                "type": "usage",
                "text": f"🔄 {random.randint(1, 10)} novos usuários cadastrados na última semana."
            }
        ]
        
        # Gerar alguns insights adicionais com valores aleatórios
        additional_insights = [
            {
                "type": "trend",
                "text": f"📊 {random.randint(60, 95)}% dos usuários estão usando autenticação de dois fatores."
            },
            {
                "type": "security",
                "text": f"🔐 {random.randint(3, 12)} senhas consideradas fracas foram alteradas esta semana."
            },
            {
                "type": "location",
                "text": f"🌍 Acessos de {random.randint(2, 7)} países diferentes nas últimas 24h."
            },
            {
                "type": "usage",
                "text": f"⏱️ Tempo médio de sessão: {random.randint(8, 35)} minutos por usuário."
            }
        ]
        
        # Combinar as duas listas
        all_insights = insights + additional_insights
        
        # Embaralhar e selecionar o número solicitado
        random.shuffle(all_insights)
        selected_insights = all_insights[:count]
        
        return jsonify(selected_insights), 200
    
    except Exception as e:
        logging.error(f"Erro ao buscar múltiplos insights: {str(e)}")
        return jsonify({"error": "Erro ao buscar insights"}), 500

def _random_ip():
    """Gera um IP aleatório para simulação."""
    return f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"

def _random_email():
    """Gera um email aleatório para simulação."""
    names = ["joao", "maria", "pedro", "ana", "carlos", "lucia", "rafael", "beatriz"]
    domains = ["exemplo.com", "teste.com.br", "empresa.net", "org.br", "tech.com"]
    
    name = random.choice(names)
    domain = random.choice(domains)
    
    return f"{name}@{domain}"

def _random_city():
    """Retorna uma cidade aleatória para simulação."""
    cities = ["Maringá", "Curitiba", "Londrina", "Cascavel", "Ponta Grossa", 
              "Foz do Iguaçu", "São Paulo", "Rio de Janeiro", "Brasília"]
    
    return random.choice(cities) 