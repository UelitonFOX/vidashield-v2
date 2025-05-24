# -*- coding: utf-8 -*-
"""
Serviço de Dashboard otimizado para Supabase.

Este módulo fornece todas as funcionalidades do dashboard usando
a nova estrutura otimizada do banco de dados.
"""

from flask import current_app
from sqlalchemy import text, func, and_, or_
from datetime import datetime, timedelta
from models import db, User, Alert, AuthLog, UserSession, BlockedIP, SystemSetting
import json


class SupabaseDashboardService:
    """Serviço do Dashboard otimizado para Supabase"""

    @staticmethod
    def get_dashboard_stats():
        """
        Obter estatísticas principais do dashboard usando view otimizada.
        """
        try:
            # Usar a view criada no Supabase para performance
            query = text("SELECT * FROM dashboard_stats")
            result = db.session.execute(query).fetchone()
            
            if result:
                return {
                    'total_usuarios': result.total_usuarios,
                    'logins_hoje': result.logins_hoje,
                    'alertas_criticos': result.alertas_criticos,
                    'ips_bloqueados': result.ips_bloqueados,
                    'sessoes_ativas': result.sessoes_ativas
                }
            
            # Fallback caso a view não esteja disponível
            return {
                'total_usuarios': User.query.filter_by(is_active=True).count(),
                'logins_hoje': AuthLog.query.filter(
                    and_(
                        AuthLog.action == 'login',
                        AuthLog.created_at >= datetime.now().date()
                    )
                ).count(),
                'alertas_criticos': Alert.query.filter(
                    and_(
                        Alert.severity.in_(['high', 'critical']),
                        Alert.resolved == False
                    )
                ).count(),
                'ips_bloqueados': BlockedIP.query.filter(
                    or_(
                        BlockedIP.is_permanent == True,
                        BlockedIP.expires_at > datetime.utcnow()
                    )
                ).count(),
                'sessoes_ativas': UserSession.query.filter_by(is_active=True).count()
            }
            
        except Exception as e:
            current_app.logger.error(f"Erro ao obter estatísticas do dashboard: {str(e)}")
            return {
                'total_usuarios': 0,
                'logins_hoje': 0,
                'alertas_criticos': 0,
                'ips_bloqueados': 0,
                'sessoes_ativas': 0
            }

    @staticmethod
    def get_weekly_access_data():
        """
        Obter dados de acesso da última semana.
        """
        try:
            # Obter dados dos últimos 7 dias
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=6)
            
            # Query para acessos por dia
            access_query = text("""
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM auth_logs 
                WHERE action = 'login' 
                  AND success = true
                  AND created_at >= :start_date 
                  AND created_at <= :end_date
                GROUP BY DATE(created_at)
                ORDER BY date
            """)
            
            access_results = db.session.execute(
                access_query, 
                {'start_date': start_date, 'end_date': end_date}
            ).fetchall()
            
            # Query para tentativas bloqueadas por dia
            blocked_query = text("""
                SELECT DATE(last_attempt) as date, SUM(attempts_count) as count
                FROM blocked_ips 
                WHERE last_attempt >= :start_date 
                  AND last_attempt <= :end_date
                GROUP BY DATE(last_attempt)
                ORDER BY date
            """)
            
            blocked_results = db.session.execute(
                blocked_query,
                {'start_date': start_date, 'end_date': end_date}
            ).fetchall()
            
            # Criar arrays com 7 dias
            acessos_semana = [0] * 7
            tentativas_bloqueadas = [0] * 7
            labels_dias = []
            
            # Preencher labels dos dias
            for i in range(7):
                date = start_date + timedelta(days=i)
                labels_dias.append(date.strftime('%d/%m'))
            
            # Preencher dados de acesso
            for result in access_results:
                day_index = (result.date - start_date).days
                if 0 <= day_index < 7:
                    acessos_semana[day_index] = result.count
            
            # Preencher dados de tentativas bloqueadas
            for result in blocked_results:
                day_index = (result.date - start_date).days
                if 0 <= day_index < 7:
                    tentativas_bloqueadas[day_index] = result.count
            
            return {
                'acessos_semana': acessos_semana,
                'tentativas_bloqueadas': tentativas_bloqueadas,
                'labels_dias': labels_dias
            }
            
        except Exception as e:
            current_app.logger.error(f"Erro ao obter dados semanais: {str(e)}")
            return {
                'acessos_semana': [0] * 7,
                'tentativas_bloqueadas': [0] * 7,
                'labels_dias': [(datetime.now().date() + timedelta(days=i)).strftime('%d/%m') for i in range(-6, 1)]
            }

    @staticmethod
    def get_security_insights():
        """
        Obter insights de segurança baseados em dados reais.
        """
        try:
            insights = []
            
            # Insight 1: IPs com mais tentativas bloqueadas
            top_blocked_ip = db.session.query(BlockedIP)\
                .order_by(BlockedIP.attempts_count.desc())\
                .first()
            
            if top_blocked_ip and top_blocked_ip.attempts_count > 3:
                insights.append({
                    'type': 'security',
                    'text': f"IP {top_blocked_ip.ip_address} teve {top_blocked_ip.attempts_count} tentativas bloqueadas nas últimas horas."
                })
            
            # Insight 2: Usuários com múltiplas falhas de login
            failed_logins = db.session.query(
                AuthLog.user_id, func.count().label('count')
            ).filter(
                and_(
                    AuthLog.action == 'failed_login',
                    AuthLog.created_at >= datetime.utcnow() - timedelta(days=1)
                )
            ).group_by(AuthLog.user_id)\
             .having(func.count() > 2)\
             .first()
            
            if failed_logins:
                user = User.query.get(failed_logins.user_id)
                if user:
                    insights.append({
                        'type': 'security',
                        'text': f"Usuário {user.email} teve {failed_logins.count} falhas de login nas últimas 24h."
                    })
            
            # Insight 3: Crescimento de acessos
            today_logins = AuthLog.query.filter(
                and_(
                    AuthLog.action == 'login',
                    AuthLog.success == True,
                    AuthLog.created_at >= datetime.now().date()
                )
            ).count()
            
            yesterday_logins = AuthLog.query.filter(
                and_(
                    AuthLog.action == 'login',
                    AuthLog.success == True,
                    AuthLog.created_at >= datetime.now().date() - timedelta(days=1),
                    AuthLog.created_at < datetime.now().date()
                )
            ).count()
            
            if yesterday_logins > 0:
                growth = ((today_logins - yesterday_logins) / yesterday_logins) * 100
                if abs(growth) > 10:
                    trend_type = "aumento" if growth > 0 else "diminuição"
                    insights.append({
                        'type': 'trend',
                        'text': f"{trend_type.capitalize()} de {abs(growth):.0f}% em acessos comparado a ontem."
                    })
            
            # Insight 4: Novos dispositivos/localizations
            recent_sessions = UserSession.query.filter(
                UserSession.created_at >= datetime.utcnow() - timedelta(hours=24)
            ).count()
            
            if recent_sessions > 0:
                insights.append({
                    'type': 'location',
                    'text': f"{recent_sessions} novas sessões iniciadas nas últimas 24 horas."
                })
            
            # Se não há insights reais, retornar alguns padrão
            if not insights:
                insights = [
                    {'type': 'info', 'text': 'Sistema funcionando normalmente.'},
                    {'type': 'info', 'text': 'Nenhuma atividade suspeita detectada.'}
                ]
            
            return insights[:4]  # Máximo 4 insights
            
        except Exception as e:
            current_app.logger.error(f"Erro ao obter insights: {str(e)}")
            return [
                {'type': 'info', 'text': 'Sistema funcionando normalmente.'},
                {'type': 'info', 'text': 'Monitoramento de segurança ativo.'}
            ]

    @staticmethod
    def get_recent_alerts(limit=10):
        """
        Obter alertas recentes com informações do usuário.
        """
        try:
            # Usar a view otimizada
            query = text("""
                SELECT 
                    id, type, category, severity, title, description,
                    created_at, resolved, user_name, user_email,
                    risk_score, ip_address
                FROM alerts_with_user 
                ORDER BY created_at DESC 
                LIMIT :limit
            """)
            
            results = db.session.execute(query, {'limit': limit}).fetchall()
            
            alerts = []
            for result in results:
                # Mapear severity para tipo de interface
                severity_map = {
                    'info': 'info',
                    'low': 'info', 
                    'medium': 'warning',
                    'high': 'warning',
                    'critical': 'critical'
                }
                
                alerts.append({
                    'id': str(result.id),
                    'tipo': severity_map.get(result.severity, 'info'),
                    'mensagem': result.title or result.type,
                    'data': result.created_at.strftime('%H:%M - %d/%m') if result.created_at else '',
                    'status': 'resolvido' if result.resolved else 'pendente',
                    'severity': result.severity,
                    'category': result.category,
                    'user_name': result.user_name,
                    'risk_score': result.risk_score or 0,
                    'ip_address': str(result.ip_address) if result.ip_address else None
                })
            
            return alerts
            
        except Exception as e:
            current_app.logger.error(f"Erro ao obter alertas recentes: {str(e)}")
            return []

    @staticmethod
    def get_blocked_users(limit=10):
        """
        Obter lista de IPs/usuários bloqueados.
        """
        try:
            blocked_ips = BlockedIP.query.filter(
                or_(
                    BlockedIP.is_permanent == True,
                    BlockedIP.expires_at > datetime.utcnow()
                )
            ).order_by(BlockedIP.last_attempt.desc()).limit(limit).all()
            
            blocked_list = []
            for blocked in blocked_ips:
                blocked_list.append({
                    'ip': str(blocked.ip_address),
                    'motivo': blocked.reason,
                    'timestamp': blocked.last_attempt.strftime('%d/%m, %H:%M') if blocked.last_attempt else '',
                    'tentativas': blocked.attempts_count,
                    'is_permanent': blocked.is_permanent,
                    'expires_at': blocked.expires_at.strftime('%d/%m %H:%M') if blocked.expires_at else 'Permanente'
                })
            
            return blocked_list
            
        except Exception as e:
            current_app.logger.error(f"Erro ao obter usuários bloqueados: {str(e)}")
            return []

    @staticmethod
    def get_system_settings():
        """
        Obter configurações do sistema.
        """
        try:
            settings = SystemSetting.query.all()
            settings_dict = {}
            
            for setting in settings:
                settings_dict[setting.key] = setting.value
            
            return settings_dict
            
        except Exception as e:
            current_app.logger.error(f"Erro ao obter configurações: {str(e)}")
            return {}

    @staticmethod
    def get_complete_dashboard_data():
        """
        Obter todos os dados necessários para o dashboard de uma vez.
        """
        try:
            # Obter todos os dados em paralelo
            stats = SupabaseDashboardService.get_dashboard_stats()
            weekly_data = SupabaseDashboardService.get_weekly_access_data()
            insights = SupabaseDashboardService.get_security_insights()
            alerts = SupabaseDashboardService.get_recent_alerts()
            blocked_users = SupabaseDashboardService.get_blocked_users()
            
            # Combinar tudo
            complete_data = {
                **stats,
                **weekly_data,
                'insights': insights,
                'alertas_recentes': alerts,
                'usuarios_bloqueados': blocked_users,
                'last_update': datetime.utcnow().isoformat()
            }
            
            return complete_data
            
        except Exception as e:
            current_app.logger.error(f"Erro ao obter dados completos do dashboard: {str(e)}")
            return {
                'total_usuarios': 0,
                'logins_hoje': 0,
                'alertas_criticos': 0,
                'ips_bloqueados': 0,
                'sessoes_ativas': 0,
                'acessos_semana': [0] * 7,
                'tentativas_bloqueadas': [0] * 7,
                'labels_dias': [],
                'insights': [],
                'alertas_recentes': [],
                'usuarios_bloqueados': [],
                'error': 'Erro ao carregar dados do dashboard'
            } 