from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime, timedelta
import random
import logging
import os
import json
from utils import is_valid_uuid  # Importar função de validação de UUID

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/data', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    # Obter o usuário atual para personalizar os dados
    current_user_id = get_jwt_identity()
    
    # Logging para debug
    current_app.logger.info(f"Dashboard API acessada por usuário ID: {current_user_id}")
    
    # Buscar usuário com lógica mais robusta
    user = None
    try:
        # Tentar buscar o usuário de diferentes formas
        if isinstance(current_user_id, str) and is_valid_uuid(current_user_id):
            user = User.query.filter_by(id=current_user_id).first()
        else:
            user = User.query.get(current_user_id)
        
        # Se não encontrou o usuário, tentar buscar pelo ID como string
        if not user and isinstance(current_user_id, str):
            # Verificar se é um número que foi convertido para string
            try:
                if current_user_id.isdigit():
                    user = User.query.get(int(current_user_id))
            except Exception as e:
                current_app.logger.error(f"Erro ao tentar converter ID: {str(e)}")
    except Exception as e:
        current_app.logger.error(f"Erro ao buscar usuário: {str(e)}")
        return jsonify({"error": f"Erro ao buscar usuário: {str(e)}"}), 500
    
    if not user:
        current_app.logger.warning(f"Usuário com ID {current_user_id} não encontrado")
        return jsonify({"error": "Usuário não encontrado"}), 404
    
    # Gerar alguns dados de exemplo para o dashboard
    # Em um sistema real, isso viria do banco de dados
    total_usuarios = random.randint(50, 200)
    logins_hoje = random.randint(10, 50)
    alertas_criticos = random.randint(0, 5)
    
    # Gerar dados de acessos para a última semana
    acessos_semana = [random.randint(5, 30) for _ in range(7)]
    tentativas_bloqueadas = [random.randint(0, 5) for _ in range(7)]
    
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
    
    current_app.logger.info(f"Dados do dashboard gerados com sucesso para usuário: {user.email}")
    
    return jsonify({
        "total_usuarios": total_usuarios,
        "logins_hoje": logins_hoje,
        "alertas_criticos": alertas_criticos,
        "acessos_semana": acessos_semana,
        "tentativas_bloqueadas": tentativas_bloqueadas,
        "alertas_recentes": alertas_recentes,
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role
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
    """
    Retorna insights de segurança para o dashboard
    """
    # Lista de possíveis insights (em produção, seriam gerados a partir de dados reais)
    insights_list = [
        {"type": "security", "text": "🚨 192.168.1.105 teve 4 tentativas bloqueadas nas últimas 2h."},
        {"type": "security", "text": "🔁 Usuário pedro@clinica.com.br trocou a senha 2 vezes em 5 dias."},
        {"type": "trend", "text": "📈 Aumento de 25% em acessos na última semana."},
        {"type": "location", "text": "🧭 Mais acessos vindos de Londrina nas últimas 24h."},
        {"type": "security", "text": "⚠️ 3 logins foram realizados fora do horário comercial."},
        {"type": "trend", "text": "📊 Terça-feira é o dia com maior número de acessos (média de 42)."},
        {"type": "security", "text": "🔑 Usuário admin@clinica.com.br fez login em 3 dispositivos diferentes."},
        {"type": "location", "text": "🌎 Detectado acesso de IP internacional (bloqueado automaticamente)."}
    ]
    
    # Pegar alertas da última hora e criar insights dinâmicos
    try:
        alerts_file = os.path.join('instance', 'intrusion_alerts.json')
        if os.path.exists(alerts_file):
            with open(alerts_file, 'r') as f:
                alerts = json.load(f)
            
            # Criar insights dinâmicos baseados nos alertas recentes
            now = datetime.now()
            one_hour_ago = now - timedelta(hours=1)
            
            for alert in alerts:
                if alert.get('timestamp'):
                    try:
                        alert_time = datetime.fromisoformat(alert.get('timestamp'))
                        if alert_time > one_hour_ago:
                            # Adicionar insight baseado no alerta recente
                            if alert.get('type') == "Tentativa de intrusão":
                                email = alert.get('details', {}).get('email', 'desconhecido')
                                local = alert.get('details', {}).get('location', 'localização desconhecida')
                                insights_list.append({
                                    "type": "realtime", 
                                    "text": f"⚠️ AGORA: Tentativa de intrusão detectada para {email} vinda de {local}."
                                })
                    except:
                        pass  # Ignorar erros de parsing de data
    except:
        pass  # Ignorar erros de leitura do arquivo
    
    # Escolher aleatoriamente alguns insights para retornar
    count = min(int(request.args.get('count', 4)), len(insights_list))
    selected_insights = random.sample(insights_list, count)
    
    return jsonify(selected_insights)

@dashboard_bp.route('/dashboard/recent-alerts', methods=['GET'])
def get_recent_alerts():
    """
    Retorna os alertas mais recentes para o dashboard
    """
    try:
        # Buscar alertas do arquivo
        alerts_file = os.path.join('instance', 'intrusion_alerts.json')
        
        if not os.path.exists(alerts_file):
            # Se não existir, criar dados de exemplo
            from routes.alerts import create_sample_alerts
            create_sample_alerts()
            
        with open(alerts_file, 'r') as f:
            alerts = json.load(f)
        
        # Ordenar por data (mais recentes primeiro)
        alerts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # Pegar os 5 mais recentes
        recent_alerts = alerts[:5]
        
        return jsonify({
            "success": True,
            "alerts": recent_alerts
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@dashboard_bp.route('/dashboard/access-chart', methods=['GET'])
def get_access_chart():
    """
    Retorna dados para o gráfico de acessos dos últimos 7 dias
    """
    # Em produção, isso viria do banco de dados
    # Simulando dados para o gráfico
    
    # Gerar dias da semana (últimos 7 dias)
    days = []
    for i in range(6, -1, -1):
        day = datetime.now() - timedelta(days=i)
        days.append(day.strftime('%d/%m'))
    
    # Gerar dados de acesso
    valid_access = [random.randint(15, 40) for _ in range(7)]
    blocked_attempts = [random.randint(1, 8) for _ in range(7)]
    
    return jsonify({
        "days": days,
        "valid_access": valid_access,
        "blocked_attempts": blocked_attempts
    })

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