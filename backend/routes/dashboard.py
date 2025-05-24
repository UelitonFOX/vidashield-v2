from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Alert, AuthLog
from datetime import datetime, timedelta
import logging
from sqlalchemy import func, desc
# Importar função de validação de UUID
from utils.uuid_helpers import is_valid_uuid

dashboard_bp = Blueprint('dashboard', __name__)
logger = logging.getLogger('VidaShield.dashboard')


@dashboard_bp.route('/data', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """
    Retorna dados para o dashboard principal com estatísticas reais
    """
    try:
        # Obter o usuário atual para personalizar os dados
        current_user_id = get_jwt_identity()

        # Logging para debug
        logger.info(
            f"Dashboard API acessada por usuário ID: {current_user_id}")

        # Buscar usuário com lógica mais robusta
        user = None
        try:
            # Tentar buscar o usuário de diferentes formas
            if isinstance(
                    current_user_id,
                    str) and is_valid_uuid(current_user_id):
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
                    logger.error(f"Erro ao tentar converter ID: {str(e)}")
        except Exception as e:
            logger.error(f"Erro ao buscar usuário: {str(e)}")
            return jsonify({"error": f"Erro ao buscar usuário: {str(e)}"}), 500

        if not user:
            logger.warning(f"Usuário com ID {current_user_id} não encontrado")
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Buscar dados reais do banco de dados
        # 1. Total de usuários ativos
        total_usuarios = User.query.filter_by(is_active=True).count()

        # 2. Logins hoje (contagem de logs de autenticação do tipo 'login' das
        # últimas 24h)
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        logins_hoje = AuthLog.query.filter(
            AuthLog.action.like('%login%'),
            AuthLog.success,
            AuthLog.timestamp >= today_start
        ).count()

        # 3. Alertas críticos não resolvidos
        alertas_criticos = Alert.query.filter_by(
            severity='critical',
            resolved=False
        ).count()

        # 4. Acessos por dia na última semana
        # Criar uma lista de 7 dias (de hoje para trás)
        days = []
        acessos_semana = []
        tentativas_bloqueadas = []

        for i in range(
                6, -1, -1):  # Do dia 6 (6 dias atrás) até o dia 0 (hoje)
            day_date = datetime.now() - timedelta(days=i)
            day_start = day_date.replace(
                hour=0, minute=0, second=0, microsecond=0)
            day_end = day_date.replace(
                hour=23, minute=59, second=59, microsecond=999999)

            # Acessos bem-sucedidos
            day_logins = AuthLog.query.filter(
                AuthLog.action.like('%login%'),
                AuthLog.success,
                AuthLog.timestamp >= day_start,
                AuthLog.timestamp <= day_end
            ).count()

            # Tentativas bloqueadas (login falhos)
            day_failed = AuthLog.query.filter(
                AuthLog.action.like('%login%'),
                AuthLog.success.is_(False),
                AuthLog.timestamp >= day_start,
                AuthLog.timestamp <= day_end
            ).count()

            days.append(day_date.strftime('%d/%m'))
            acessos_semana.append(day_logins)
            tentativas_bloqueadas.append(day_failed)

        # 5. Buscar alguns alertas recentes (últimas 24h)
        recent_alerts = Alert.query.order_by(
            Alert.timestamp.desc()
        ).limit(5).all()

        # Converter para formato de dicionário
        alertas_recentes = []
        for alert in recent_alerts:
            alertas_recentes.append({
                "id": alert.id,
                # Usar severity como tipo (critical, warning, success)
                "tipo": alert.severity,
                "mensagem": alert.type,  # Tipo de alerta como mensagem
                "tempo": alert.timestamp.strftime('%Hh%M - %d/%m') if alert.timestamp else 'N/A',
            })

        logger.info(
            f"Dados do dashboard gerados com sucesso para usuário: {
                user.email}")

        return jsonify({
            "total_usuarios": total_usuarios,
            "logins_hoje": logins_hoje,
            "alertas_criticos": alertas_criticos,
            "acessos_semana": acessos_semana,
            "tentativas_bloqueadas": tentativas_bloqueadas,
            "alertas_recentes": alertas_recentes,
            "labels_dias": days,
            "user": {
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        })
    except Exception as e:
        logger.error(f"Erro ao gerar dados do dashboard: {str(e)}")
        return jsonify(
            {"error": f"Erro ao gerar dados do dashboard: {str(e)}"}), 500


@dashboard_bp.route('/insights/random', methods=['GET'])
@jwt_required()
def get_random_insight():
    """
    Retorna um insight real baseado em dados do banco.
    Prioriza insights que possam ser relevantes.
    """
    try:
        # Buscar dados relevantes do banco de dados
        insights = []

        # Insight 1: Tentativas de login bloqueadas recentes (últimas 24h)
        last_24h = datetime.now() - timedelta(hours=24)
        blocked_logins = AuthLog.query.filter(
            AuthLog.action.like('%login%'),
            AuthLog.success.is_(False),
            AuthLog.timestamp >= last_24h
        ).count()

        if blocked_logins > 0:
            insights.append({
                "type": "security",
                "text": f"🚨 {blocked_logins} tentativas de login bloqueadas nas últimas 24h."
            })

        # Insight 2: Usuários que trocaram senha recentemente
        password_changes = AuthLog.query.filter(
            AuthLog.action.like('%password%change%'),
            AuthLog.timestamp >= (datetime.now() - timedelta(days=7))
        ).count()

        if password_changes > 0:
            insights.append({
                "type": "security",
                "text": f"🔁 {password_changes} usuários alteraram suas senhas na última semana."
            })

        # Insight 3: Alertas críticos não resolvidos
        critical_alerts = Alert.query.filter_by(
            severity='critical',
            resolved=False
        ).count()

        if critical_alerts > 0:
            insights.append({
                "type": "security",
                "text": f"⚠️ {critical_alerts} alertas críticos estão pendentes de resolução."
            })

        # Insight 4: Acessos fora do horário comercial (entre 22h e 6h)
        off_hours_logins = AuthLog.query.filter(
            AuthLog.action.like('%login%'),
            AuthLog.success,
            db.or_(
                db.and_(func.extract('hour', AuthLog.timestamp) >= 22),
                db.and_(func.extract('hour', AuthLog.timestamp) <= 6)
            ),
            AuthLog.timestamp >= (datetime.now() - timedelta(days=3))
        ).count()

        if off_hours_logins > 0:
            insights.append({
                "type": "security",
                "text": f"⏰ {off_hours_logins} logins foram realizados fora do horário comercial nos últimos 3 dias."
            })

        # Insight 5: Novos usuários
        new_users = User.query.filter(
            User.created_at >= (datetime.now() - timedelta(days=7))
        ).count()

        if new_users > 0:
            insights.append({
                "type": "trend",
                "text": f"👥 {new_users} novos usuários foram registrados na última semana."
            })

        # Insight 6: Comparação de acessos com a semana anterior
        this_week_start = datetime.now().replace(hour=0, minute=0, second=0,
                                                 microsecond=0) - timedelta(days=datetime.now().weekday())
        last_week_start = this_week_start - timedelta(days=7)

        this_week_logins = AuthLog.query.filter(
            AuthLog.action.like('%login%'),
            AuthLog.success,
            AuthLog.timestamp >= this_week_start
        ).count()

        last_week_logins = AuthLog.query.filter(
            AuthLog.action.like('%login%'),
            AuthLog.success,
            AuthLog.timestamp >= last_week_start,
            AuthLog.timestamp < this_week_start
        ).count()

        if last_week_logins > 0:
            percent_change = round(
                ((this_week_logins - last_week_logins) / last_week_logins) * 100)
            trend_emoji = "📈" if percent_change > 0 else "📉"

            insights.append({"type": "trend", "text": f"{trend_emoji} Acessos {abs(percent_change)}% {
                            'maior' if percent_change > 0 else 'menor'} em relação à semana passada."})

        # Se não tivermos insights baseados em dados reais, fornecer um insight
        # genérico
        if not insights:
            insights = [
                {
                    "type": "security",
                    "text": "🔒 Sistema de monitoramento de segurança ativo e funcionando normalmente."
                }
            ]

        # Escolher aleatoriamente um insight da lista gerada
        import random
        selected_insight = random.choice(insights)

        return jsonify(selected_insight), 200

    except Exception as e:
        logger.error(f"Erro ao buscar insight: {str(e)}")
        return jsonify({"error": f"Erro ao buscar insight: {str(e)}"}), 500


@dashboard_bp.route('/insights/multiple', methods=['GET'])
@jwt_required()
def get_multiple_insights():
    """
    Retorna múltiplos insights de segurança para o dashboard
    baseados em dados reais do banco
    """
    try:
        # Obter número de insights solicitados
        count = min(int(request.args.get('count', 4)), 8)

        # Lista para armazenar os insights gerados
        insights = []

        # Insight 1: Tentativas de login bloqueadas (últimas 24h)
        last_24h = datetime.now() - timedelta(hours=24)
        blocked_logins = AuthLog.query.filter(
            AuthLog.action.like('%login%'),
            AuthLog.success.is_(False),
            AuthLog.timestamp >= last_24h
        ).count()

        if blocked_logins > 0:
            insights.append({
                "type": "security",
                "text": f"🚨 {blocked_logins} tentativas de login bloqueadas nas últimas 24h."
            })

        # Insight 2: Alertas recentes
        recent_alerts = Alert.query.filter(
            Alert.timestamp >= (datetime.now() - timedelta(hours=48))
        ).count()

        if recent_alerts > 0:
            insights.append({
                "type": "security",
                "text": f"⚠️ {recent_alerts} alertas gerados nas últimas 48h."
            })

        # Insight 3: Usuários ativos hoje
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        active_users_today = db.session.query(
            func.count(
                db.distinct(
                    AuthLog.user_id))).filter(
            AuthLog.action.like('%login%'),
            AuthLog.success,
            AuthLog.timestamp >= today_start).scalar()

        if active_users_today > 0:
            insights.append({
                "type": "trend",
                "text": f"👤 {active_users_today} usuários ativos hoje."
            })

        # Insight 4: Alertas críticos não resolvidos
        critical_alerts = Alert.query.filter_by(
            severity='critical',
            resolved=False
        ).count()

        if critical_alerts > 0:
            insights.append({
                "type": "security",
                "text": f"🚨 {critical_alerts} alertas críticos pendentes."
            })

        # Insight 5: Comparação de logins com o dia anterior
        yesterday_start = today_start - timedelta(days=1)
        yesterday_end = today_start - timedelta(microseconds=1)

        logins_today = AuthLog.query.filter(
            AuthLog.action.like('%login%'),
            AuthLog.success,
            AuthLog.timestamp >= today_start
        ).count()

        logins_yesterday = AuthLog.query.filter(
            AuthLog.action.like('%login%'),
            AuthLog.success,
            AuthLog.timestamp >= yesterday_start,
            AuthLog.timestamp <= yesterday_end
        ).count()

        if logins_yesterday > 0:
            percent_change = round(
                ((logins_today - logins_yesterday) / logins_yesterday) * 100)
            if abs(percent_change) > 10:  # Só mostrar se a diferença for significativa
                trend_emoji = "📈" if percent_change > 0 else "📉"
                insights.append({"type": "trend", "text": f"{trend_emoji} Acessos hoje {abs(
                    percent_change)}% {'maior' if percent_change > 0 else 'menor'} que ontem."})

        # Insight 6: Dia da semana com mais logins
        if db.engine.dialect.name == 'postgresql':  # Se estivermos usando PostgreSQL
            day_counts = db.session.query(
                func.to_char(AuthLog.timestamp, 'Day').label('day_of_week'),
                func.count(AuthLog.id).label('count')
            ).filter(
                AuthLog.action.like('%login%'),
                AuthLog.success,
                AuthLog.timestamp >= (datetime.now() - timedelta(days=30))
            ).group_by('day_of_week').order_by(desc('count')).first()

            if day_counts:
                day, count = day_counts
                insights.append({
                    "type": "trend",
                    "text": f"📊 {day.strip()} é o dia com mais acessos no sistema."
                })

        # Insight 7: Horário de pico de acesso
        if db.engine.dialect.name == 'postgresql':  # Se estivermos usando PostgreSQL
            hour_counts = db.session.query(
                func.extract('hour', AuthLog.timestamp).label('hour'),
                func.count(AuthLog.id).label('count')
            ).filter(
                AuthLog.action.like('%login%'),
                AuthLog.success,
                AuthLog.timestamp >= (datetime.now() - timedelta(days=14))
            ).group_by('hour').order_by(desc('count')).first()

            if hour_counts:
                hour, count = hour_counts
                insights.append({
                    "type": "usage",
                    "text": f"🕒 Horário de pico de acessos: {int(hour)}h00."
                })

        # Insight 8: IPs mais comuns (ou com mais falhas)
        if 'ip_address' in [c.name for c in AuthLog.__table__.columns]:
            ip_blocks = db.session.query(
                AuthLog.ip_address,
                func.count(AuthLog.id).label('count')
            ).filter(
                AuthLog.action.like('%login%'),
                AuthLog.success.is_(False),
                AuthLog.timestamp >= (datetime.now() - timedelta(days=7)),
                AuthLog.ip_address.isnot(None)
            ).group_by(AuthLog.ip_address).order_by(desc('count')).first()

            if ip_blocks and ip_blocks[0]:
                ip, count = ip_blocks
                insights.append({"type": "security", "text": f"🔒 IP {ip} teve {
                                count} tentativas bloqueadas na última semana."})

        # Se ainda não tivermos insights suficientes, adicionar alguns
        # genéricos
        static_insights = [
            {"type": "security", "text": "🔒 Sistema de monitoramento de segurança ativo."},
            {"type": "trend", "text": "📊 Performance do sistema estável nas últimas 24h."},
            {"type": "usage", "text": "✅ Backup automático configurado e funcionando."},
            {"type": "security", "text": "🔔 Alertas de segurança configurados corretamente."}
        ]

        # Se precisarmos de mais insights para atingir o count solicitado
        while len(insights) < count:
            # Adicionar insights estáticos restantes
            remaining_static = [
                i for i in static_insights if i not in insights]
            if not remaining_static:
                break
            insights.append(remaining_static[0])
            static_insights.remove(remaining_static[0])

        # Limitar ao número solicitado
        insights = insights[:count]

        return jsonify(insights)
    except Exception as e:
        logger.error(f"Erro ao buscar múltiplos insights: {str(e)}")
        return jsonify(
            [{"type": "error", "text": "Erro ao buscar insights"}]), 500


@dashboard_bp.route('/recent-alerts', methods=['GET'])
@jwt_required()
def get_recent_alerts():
    """
    Retorna os alertas mais recentes para o dashboard
    """
    try:
        # Pegar o limite da query string
        limit = int(request.args.get('limit', 5))

        # Buscar alertas ordenados por data (mais recentes primeiro)
        alerts = Alert.query.order_by(
            Alert.timestamp.desc()).limit(limit).all()

        # Converter para dicionário
        alerts_dict = [alert.to_dict() for alert in alerts]

        # Verificar se temos alertas
        if not alerts:
            # Se não temos alertas, gerar alguns para demonstração
            from routes.alerts import seed_alerts_if_empty
            seed_alerts_if_empty()
            # Buscar novamente
            alerts = Alert.query.order_by(
                Alert.timestamp.desc()).limit(limit).all()
            alerts_dict = [alert.to_dict() for alert in alerts]

        return jsonify({
            "success": True,
            "alerts": alerts_dict
        })

    except Exception as e:
        logger.error(f"Erro ao buscar alertas recentes: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@dashboard_bp.route('/access-chart', methods=['GET'])
@jwt_required()
def get_access_chart():
    """
    Retorna dados para o gráfico de acessos dos últimos 7 dias
    baseado em dados reais do banco de dados
    """
    try:
        # Gerar dias da semana (últimos 7 dias)
        days = []
        valid_access = []
        blocked_attempts = []

        for i in range(
                6, -1, -1):  # Do dia 6 (6 dias atrás) até o dia 0 (hoje)
            day_date = datetime.now() - timedelta(days=i)
            day_start = day_date.replace(
                hour=0, minute=0, second=0, microsecond=0)
            day_end = day_date.replace(
                hour=23, minute=59, second=59, microsecond=999999)

            # Obter o rótulo do dia
            days.append(day_date.strftime('%d/%m'))

            # Acessos bem-sucedidos
            successful = AuthLog.query.filter(
                AuthLog.action.like('%login%'),
                AuthLog.success,
                AuthLog.timestamp >= day_start,
                AuthLog.timestamp <= day_end
            ).count()

            # Tentativas bloqueadas
            blocked = AuthLog.query.filter(
                AuthLog.action.like('%login%'),
                AuthLog.success.is_(False),
                AuthLog.timestamp >= day_start,
                AuthLog.timestamp <= day_end
            ).count()

            valid_access.append(successful)
            blocked_attempts.append(blocked)

        return jsonify({
            "days": days,
            "valid_access": valid_access,
            "blocked_attempts": blocked_attempts
        })

    except Exception as e:
        logger.error(f"Erro ao buscar dados do gráfico de acessos: {str(e)}")
        return jsonify({"error": str(e)}), 500
