# -*- coding: utf-8 -*-
"""
Cliente Supabase otimizado usando MCP.

Este módulo fornece um cliente que usa as APIs do Supabase
através do MCP em vez de conexão SQL direta.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)


class SupabaseMCPClient:
    """Cliente Supabase usando MCP para execução de queries."""
    
    def __init__(self):
        self.project_ref = "rqucoiabfiocasxuuvea"
    
    def execute_query(self, query: str) -> Dict[str, Any]:
        """
        Executa uma query SQL via MCP.
        """
        try:
            # Aqui vamos simular o resultado para agora, 
            # em produção isso seria executado via MCP
            # result = mcp_composio_composio_SUPABASE_BETA_RUN_SQL_QUERY(
            #     ref=self.project_ref, 
            #     query=query
            # )
            
            # Por enquanto, vamos retornar dados mockados baseados na query
            return self._mock_query_result(query)
            
        except Exception as e:
            logger.error(f"Erro ao executar query: {e}")
            return {"data": {"details": []}, "error": str(e), "successful": False}
    
    def _mock_query_result(self, query: str) -> Dict[str, Any]:
        """
        Gera resultados mockados baseados na query.
        Usado para demonstração até integrarmos completamente o MCP.
        """
        query_lower = query.lower()
        
        # Dashboard Stats
        if "dashboard_stats" in query_lower:
            return {
                "data": {
                    "details": [{
                        "total_usuarios": 75,
                        "logins_hoje": 23,
                        "alertas_criticos": 3,
                        "ips_bloqueados": 2,
                        "sessoes_ativas": 18
                    }]
                },
                "error": None,
                "successful": True
            }
        
        # Dados semanais de acesso
        elif "auth_logs" in query_lower and "group by date" in query_lower:
            return {
                "data": {
                    "details": [
                        {"date": "2025-05-17", "count": 15},
                        {"date": "2025-05-18", "count": 28},
                        {"date": "2025-05-19", "count": 18},
                        {"date": "2025-05-20", "count": 42},
                        {"date": "2025-05-21", "count": 30},
                        {"date": "2025-05-22", "count": 22},
                        {"date": "2025-05-23", "count": 37}
                    ]
                },
                "error": None,
                "successful": True
            }
        
        # IPs bloqueados por data
        elif "blocked_ips" in query_lower and "group by date" in query_lower:
            return {
                "data": {
                    "details": [
                        {"date": "2025-05-20", "count": 5},
                        {"date": "2025-05-22", "count": 3},
                        {"date": "2025-05-23", "count": 2}
                    ]
                },
                "error": None,
                "successful": True
            }
        
        # Alertas com usuário
        elif "alerts_with_user" in query_lower:
            return {
                "data": {
                    "details": [
                        {
                            "id": "alert-1",
                            "type": "failed_login",
                            "category": "security",
                            "severity": "high",
                            "title": "Múltiplas falhas de login",
                            "description": "Detectadas múltiplas tentativas de login falhadas",
                            "created_at": datetime.now() - timedelta(hours=2),
                            "resolved": False,
                            "user_name": "João Silva",
                            "user_email": "joao@clinica.com",
                            "risk_score": 75,
                            "ip_address": "192.168.1.105"
                        },
                        {
                            "id": "alert-2", 
                            "type": "new_device",
                            "category": "access",
                            "severity": "medium",
                            "title": "Novo dispositivo detectado",
                            "description": "Login de dispositivo não reconhecido",
                            "created_at": datetime.now() - timedelta(hours=5),
                            "resolved": True,
                            "user_name": "Maria Santos",
                            "user_email": "maria@clinica.com",
                            "risk_score": 30,
                            "ip_address": "10.0.0.150"
                        },
                        {
                            "id": "alert-3",
                            "type": "suspicious_ip",
                            "category": "security", 
                            "severity": "critical",
                            "title": "Acesso de IP suspeito",
                            "description": "Tentativa de acesso de IP conhecido por atividades maliciosas",
                            "created_at": datetime.now() - timedelta(hours=8),
                            "resolved": False,
                            "user_name": "Pedro Costa",
                            "user_email": "pedro@clinica.com",
                            "risk_score": 95,
                            "ip_address": "45.67.123.89"
                        }
                    ]
                },
                "error": None,
                "successful": True
            }
        
        # IPs bloqueados
        elif "blocked_ips" in query_lower and "order by" in query_lower:
            return {
                "data": {
                    "details": [
                        {
                            "id": "blocked-1",
                            "ip_address": "192.168.1.105",
                            "reason": "Múltiplas tentativas de login falhadas",
                            "attempts_count": 8,
                            "last_attempt": datetime.now() - timedelta(hours=1),
                            "is_permanent": False,
                            "expires_at": datetime.now() + timedelta(hours=23)
                        },
                        {
                            "id": "blocked-2",
                            "ip_address": "45.67.123.89", 
                            "reason": "IP identificado como malicioso",
                            "attempts_count": 15,
                            "last_attempt": datetime.now() - timedelta(hours=3),
                            "is_permanent": True,
                            "expires_at": None
                        }
                    ]
                },
                "error": None,
                "successful": True
            }
        
        # Contagem de usuários
        elif "count(*)" in query_lower and "users" in query_lower:
            return {
                "data": {
                    "details": [{"count": 75}]
                },
                "error": None,
                "successful": True
            }
        
        # Default - query genérica
        else:
            return {
                "data": {
                    "details": []
                },
                "error": None,
                "successful": True
            }

    def get_dashboard_stats(self) -> Dict[str, int]:
        """Obter estatísticas do dashboard."""
        result = self.execute_query("SELECT * FROM dashboard_stats")
        
        if result["successful"] and result["data"]["details"]:
            return result["data"]["details"][0]
        
        return {
            "total_usuarios": 0,
            "logins_hoje": 0,
            "alertas_criticos": 0,
            "ips_bloqueados": 0,
            "sessoes_ativas": 0
        }
    
    def get_weekly_access_data(self) -> Dict[str, List]:
        """Obter dados de acesso da semana."""
        # Query para acessos
        access_query = """
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM auth_logs 
            WHERE action = 'login' 
              AND success = true
              AND created_at >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(created_at)
            ORDER BY date
        """
        
        # Query para IPs bloqueados
        blocked_query = """
            SELECT DATE(last_attempt) as date, SUM(attempts_count) as count
            FROM blocked_ips 
            WHERE last_attempt >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(last_attempt)
            ORDER BY date
        """
        
        access_result = self.execute_query(access_query)
        blocked_result = self.execute_query(blocked_query)
        
        # Processar resultados
        acessos_semana = [0] * 7
        tentativas_bloqueadas = [0] * 7
        labels_dias = []
        
        # Gerar labels dos últimos 7 dias
        today = datetime.now().date()
        for i in range(7):
            date = today - timedelta(days=6-i)
            labels_dias.append(date.strftime('%d/%m'))
        
        # Preencher dados de acesso
        if access_result["successful"]:
            for item in access_result["data"]["details"]:
                date_str = item["date"]
                if isinstance(date_str, str):
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                else:
                    date_obj = date_str
                
                day_diff = (today - date_obj).days
                if 0 <= day_diff < 7:
                    acessos_semana[6-day_diff] = item["count"]
        
        # Preencher dados de IPs bloqueados
        if blocked_result["successful"]:
            for item in blocked_result["data"]["details"]:
                date_str = item["date"]
                if isinstance(date_str, str):
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                else:
                    date_obj = date_str
                
                day_diff = (today - date_obj).days
                if 0 <= day_diff < 7:
                    tentativas_bloqueadas[6-day_diff] = item["count"]
        
        return {
            "acessos_semana": acessos_semana,
            "tentativas_bloqueadas": tentativas_bloqueadas,
            "labels_dias": labels_dias
        }
    
    def get_recent_alerts(self, limit: int = 10) -> List[Dict]:
        """Obter alertas recentes."""
        query = f"""
            SELECT 
                id, type, category, severity, title, description,
                created_at, resolved, user_name, user_email,
                risk_score, ip_address
            FROM alerts_with_user 
            ORDER BY created_at DESC 
            LIMIT {limit}
        """
        
        result = self.execute_query(query)
        
        if not result["successful"]:
            return []
        
        alerts = []
        for alert in result["data"]["details"]:
            # Mapear severity para tipo de interface
            severity_map = {
                'info': 'info',
                'low': 'info',
                'medium': 'warning', 
                'high': 'warning',
                'critical': 'critical'
            }
            
            created_at = alert.get("created_at", datetime.now())
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            
            alerts.append({
                'id': str(alert.get("id", "")),
                'tipo': severity_map.get(alert.get("severity", "info"), 'info'),
                'mensagem': alert.get("title", alert.get("type", "Alerta")),
                'data': created_at.strftime('%H:%M - %d/%m'),
                'status': 'resolvido' if alert.get("resolved", False) else 'pendente',
                'severity': alert.get("severity", "info"),
                'category': alert.get("category", "general"),
                'user_name': alert.get("user_name", ""),
                'risk_score': alert.get("risk_score", 0),
                'ip_address': alert.get("ip_address")
            })
        
        return alerts
    
    def get_blocked_users(self, limit: int = 10) -> List[Dict]:
        """Obter lista de IPs bloqueados."""
        query = f"""
            SELECT 
                ip_address, reason, attempts_count, last_attempt,
                is_permanent, expires_at
            FROM blocked_ips 
            WHERE (is_permanent = true OR expires_at > NOW())
            ORDER BY last_attempt DESC 
            LIMIT {limit}
        """
        
        result = self.execute_query(query)
        
        if not result["successful"]:
            return []
        
        blocked_list = []
        for blocked in result["data"]["details"]:
            last_attempt = blocked.get("last_attempt", datetime.now())
            if isinstance(last_attempt, str):
                last_attempt = datetime.fromisoformat(last_attempt.replace('Z', '+00:00'))
            
            expires_at = blocked.get("expires_at")
            if expires_at and isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            
            blocked_list.append({
                'ip': str(blocked.get("ip_address", "")),
                'motivo': blocked.get("reason", "Não especificado"),
                'timestamp': last_attempt.strftime('%d/%m, %H:%M'),
                'tentativas': blocked.get("attempts_count", 0),
                'is_permanent': blocked.get("is_permanent", False),
                'expires_at': expires_at.strftime('%d/%m %H:%M') if expires_at else 'Permanente'
            })
        
        return blocked_list
    
    def get_security_insights(self) -> List[Dict]:
        """Gerar insights de segurança baseados nos dados."""
        insights = []
        
        try:
            # Insight baseado em IPs bloqueados
            blocked_users = self.get_blocked_users(5)
            if blocked_users:
                top_blocked = max(blocked_users, key=lambda x: x['tentativas'])
                if top_blocked['tentativas'] > 3:
                    insights.append({
                        'type': 'security',
                        'text': f"IP {top_blocked['ip']} teve {top_blocked['tentativas']} tentativas bloqueadas."
                    })
            
            # Insight baseado em alertas críticos
            alerts = self.get_recent_alerts(20)
            critical_alerts = [a for a in alerts if a['severity'] == 'critical']
            if critical_alerts:
                insights.append({
                    'type': 'security',
                    'text': f"{len(critical_alerts)} alertas críticos nas últimas horas."
                })
            
            # Insight baseado em dados da semana
            weekly_data = self.get_weekly_access_data()
            total_acessos = sum(weekly_data['acessos_semana'])
            total_bloqueados = sum(weekly_data['tentativas_bloqueadas'])
            
            if total_acessos > 0:
                insights.append({
                    'type': 'trend',
                    'text': f"{total_acessos} acessos realizados na última semana."
                })
            
            if total_bloqueados > 0:
                insights.append({
                    'type': 'security',
                    'text': f"{total_bloqueados} tentativas bloqueadas na última semana."
                })
            
            # Se não há insights específicos, adicionar padrão
            if not insights:
                insights = [
                    {'type': 'info', 'text': 'Sistema funcionando normalmente.'},
                    {'type': 'info', 'text': 'Monitoramento de segurança ativo.'}
                ]
            
        except Exception as e:
            logger.error(f"Erro ao gerar insights: {e}")
            insights = [
                {'type': 'info', 'text': 'Sistema funcionando normalmente.'},
                {'type': 'info', 'text': 'Dados sendo processados...'}
            ]
        
        return insights[:4]  # Máximo 4 insights
    
    def get_complete_dashboard_data(self) -> Dict[str, Any]:
        """Obter todos os dados do dashboard."""
        try:
            stats = self.get_dashboard_stats()
            weekly_data = self.get_weekly_access_data()
            insights = self.get_security_insights()
            alerts = self.get_recent_alerts()
            blocked_users = self.get_blocked_users()
            
            return {
                **stats,
                **weekly_data,
                'insights': insights,
                'alertas_recentes': alerts,
                'usuarios_bloqueados': blocked_users,
                'last_update': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter dados completos: {e}")
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
                'error': 'Erro ao carregar dados'
            }


# Instância global do cliente
supabase_client = SupabaseMCPClient() 