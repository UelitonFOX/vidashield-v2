# -*- coding: utf-8 -*-
"""
Módulo para rotas de relatórios da aplicação.

Este módulo gerencia as funcionalidades relacionadas a relatórios e exportação de dados.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Alert, AuthLog
from datetime import datetime, timedelta
import json
import csv
import io

reports_bp = Blueprint('reports', __name__)

# Rota para listar relatórios disponíveis


@reports_bp.route('', methods=['GET'])
@jwt_required()
def get_reports():
    # Verificar se o usuário tem permissão (admin ou gerente)
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    if not user or user.role not in ['admin', 'gerente']:
        return jsonify({'msg': 'Permissão negada'}), 403

    # Lista de relatórios disponíveis
    available_reports = [{'id': 'alerts_summary',
                          'name': 'Resumo de Alertas',
                          'description': 'Relatório resumido dos alertas por tipo e severidade.',
                          'type': 'summary'},
                         {'id': 'users_activity',
                          'name': 'Atividade de Usuários',
                          'description': 'Relatório de atividade recente dos usuários no sistema.',
                          'type': 'activity'},
                         {'id': 'security_events',
                          'name': 'Eventos de Segurança',
                          'description': 'Histórico detalhado de eventos de segurança.',
                          'type': 'security'},
                         {'id': 'dashboard_data',
                          'name': 'Dados do Dashboard',
                          'description': 'Exportação completa dos dados mostrados no dashboard.',
                          'type': 'dashboard'},
                         {'id': 'system_performance',
                          'name': 'Performance do Sistema',
                          'description': 'Métricas de performance do sistema ao longo do tempo.',
                          'type': 'performance'}]

    return jsonify({'reports': available_reports})

# Rota para listar relatórios exportáveis


@reports_bp.route('/export', methods=['GET'])
@jwt_required()
def get_exportable_reports():
    # Verificar se o usuário tem permissão (admin ou gerente)
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    if not user or user.role not in ['admin', 'gerente']:
        return jsonify({'msg': 'Permissão negada'}), 403

    # Lista de relatórios exportáveis
    exportable_reports = [
        {
            'id': 'alerts_summary',
            'name': 'Resumo de Alertas',
            'formats': ['csv', 'json', 'pdf']
        },
        {
            'id': 'users_activity',
            'name': 'Atividade de Usuários',
            'formats': ['csv', 'json', 'pdf']
        },
        {
            'id': 'security_events',
            'name': 'Eventos de Segurança',
            'formats': ['csv', 'json', 'pdf']
        },
        {
            'id': 'all_users',
            'name': 'Lista de Usuários',
            'formats': ['csv', 'json']
        },
        {
            'id': 'all_alerts',
            'name': 'Lista de Alertas',
            'formats': ['csv', 'json', 'pdf']
        },
        {
            'id': 'dashboard_data',
            'name': 'Dados do Dashboard',
            'formats': ['csv', 'json', 'pdf']
        },
        {
            'id': 'system_stats',
            'name': 'Estatísticas do Sistema',
            'formats': ['csv', 'json', 'pdf']
        }
    ]

    return jsonify({'available_reports': exportable_reports})

# Função auxiliar para gerar CSV


def generate_csv(data, headers):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)

    for row in data:
        writer.writerow(row)

    return output.getvalue()

# Função auxiliar para gerar JSON


def generate_json(data, keys):
    result = []
    for item in data:
        result_item = {}
        for i, key in enumerate(keys):
            result_item[key] = item[i]
        result.append(result_item)

    return json.dumps(result, indent=2)

# Rota para exportar um relatório específico


@reports_bp.route('/export', methods=['POST'])
@jwt_required()
def export_report():
    # Verificar se o usuário tem permissão (admin ou gerente)
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    if not user or user.role not in ['admin', 'gerente']:
        return jsonify({'msg': 'Permissão negada'}), 403

    data = request.get_json()
    report_id = data.get('report_id')
    format_type = data.get('format', 'csv').lower()  # Padrão é CSV

    if not report_id:
        return jsonify({'msg': 'ID do relatório não fornecido'}), 400

    # Verificar se o formato é suportado
    if format_type not in ['csv', 'json', 'pdf']:
        return jsonify(
            {'msg': 'Formato não suportado. Use csv, json ou pdf'}), 400

    try:
        # Relatório: Todos os alertas
        if report_id == 'all_alerts':
            alerts = Alert.query.all()

            headers = [
                'ID',
                'Tipo',
                'Severidade',
                'Timestamp',
                'Resolvido',
                'Resolvido Por',
                'Usuário ID']
            data_rows = []

            for alert in alerts:
                data_rows.append([
                    alert.id,
                    alert.type,
                    alert.severity,
                    alert.timestamp.strftime('%Y-%m-%d %H:%M:%S') if alert.timestamp else 'N/A',
                    'Sim' if alert.resolved else 'Não',
                    alert.resolved_by or 'N/A',
                    alert.user_id or 'N/A'
                ])

            if format_type == 'csv':
                csv_data = generate_csv(data_rows, headers)
                return jsonify(
                    {'msg': 'Relatório gerado com sucesso', 'data': csv_data, 'format': 'csv'})

            elif format_type == 'json':
                json_data = generate_json(
                    data_rows, [
                        'id', 'type', 'severity', 'timestamp', 'resolved', 'resolved_by', 'user_id'])
                return jsonify(
                    {'msg': 'Relatório gerado com sucesso', 'data': json_data, 'format': 'json'})

            elif format_type == 'pdf':
                # Em uma implementação real, geraria o PDF
                return jsonify(
                    {'msg': 'Exportação de PDF disponível apenas para download direto'})

        # Relatório: Lista de usuários
        elif report_id == 'all_users':
            users = User.query.all()

            headers = [
                'ID',
                'Nome',
                'Email',
                'Função',
                'Status',
                'Criado em',
                'Último login']
            data_rows = []

            for user in users:
                # Encontrar o último login (se houver)
                last_login = AuthLog.query.filter_by(
                    user_id=user.id,
                    action='login',
                    success=True
                ).order_by(AuthLog.timestamp.desc()).first()

                data_rows.append([
                    user.id,
                    user.name,
                    user.email,
                    user.role,
                    'Ativo' if user.is_active else 'Inativo',
                    user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else 'N/A',
                    last_login.timestamp.strftime('%Y-%m-%d %H:%M:%S') if last_login else 'Nunca'
                ])

            if format_type == 'csv':
                csv_data = generate_csv(data_rows, headers)
                return jsonify(
                    {'msg': 'Relatório gerado com sucesso', 'data': csv_data, 'format': 'csv'})

            elif format_type == 'json':
                json_data = generate_json(
                    data_rows, [
                        'id', 'name', 'email', 'role', 'status', 'created_at', 'last_login'])
                return jsonify(
                    {'msg': 'Relatório gerado com sucesso', 'data': json_data, 'format': 'json'})

            elif format_type == 'pdf':
                # Em uma implementação real, geraria o PDF
                return jsonify(
                    {'msg': 'Exportação de PDF disponível apenas para download direto'})

        # Relatório: Dados do dashboard
        elif report_id == 'dashboard_data':
            # Coletar dados do dashboard

            # 1. Total de usuários ativos
            total_usuarios = User.query.filter_by(is_active=True).count()

            # 2. Logins hoje
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
            days = []
            acessos_semana = []
            tentativas_bloqueadas = []

            for i in range(6, -1, -1):
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

                # Tentativas bloqueadas
                day_failed = AuthLog.query.filter(
                    AuthLog.action.like('%login%'),
                    AuthLog.success.is_(False),
                    AuthLog.timestamp >= day_start,
                    AuthLog.timestamp <= day_end
                ).count()

                day_label = day_date.strftime('%d/%m')
                days.append(day_label)
                acessos_semana.append(day_logins)
                tentativas_bloqueadas.append(day_failed)

            dashboard_data = {
                "total_usuarios": total_usuarios,
                "logins_hoje": logins_hoje,
                "alertas_criticos": alertas_criticos,
                "acessos_semana": acessos_semana,
                "tentativas_bloqueadas": tentativas_bloqueadas,
                "labels_dias": days
            }

            if format_type == 'json':
                return jsonify({
                    'msg': 'Relatório gerado com sucesso',
                    'data': dashboard_data,
                    'format': 'json'
                })

            elif format_type == 'csv':
                output = io.StringIO()
                writer = csv.writer(output)

                # Cabeçalho com informações gerais
                writer.writerow(['Relatório de Dashboard', f'Gerado em: {
                                datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'])
                writer.writerow([])

                # Métricas gerais
                writer.writerow(['Métrica', 'Valor'])
                writer.writerow(['Total de Usuários Ativos', total_usuarios])
                writer.writerow(['Logins Hoje', logins_hoje])
                writer.writerow(['Alertas Críticos', alertas_criticos])
                writer.writerow([])

                # Dados da semana
                writer.writerow(['Data', 'Acessos', 'Tentativas Bloqueadas'])
                for i in range(len(days)):
                    writer.writerow(
                        [days[i], acessos_semana[i], tentativas_bloqueadas[i]])

                return jsonify({
                    'msg': 'Relatório gerado com sucesso',
                    'data': output.getvalue(),
                    'format': 'csv'
                })

            elif format_type == 'pdf':
                # Em uma implementação real, geraria o PDF
                return jsonify(
                    {'msg': 'Exportação de PDF disponível apenas para download direto'})

        # Retornar erro para relatório desconhecido
        return jsonify({'msg': f'Exportação do relatório {
                       report_id} iniciada', 'status': 'success'})

    except Exception as e:
        return jsonify({'msg': f'Erro ao gerar relatório: {
                       str(e)}', 'status': 'error'}), 500

# Rota para obter detalhes de um relatório específico


@reports_bp.route('/<report_id>', methods=['GET'])
@jwt_required()
def get_report_details(report_id):
    # Verificar se o usuário tem permissão (admin ou gerente)
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    if not user or user.role not in ['admin', 'gerente']:
        return jsonify({'msg': 'Permissão negada'}), 403

    # Exemplo de implementação para um relatório específico
    if report_id == 'alerts_summary':
        # Dados de exemplo - em uma implementação real, viriam do banco de
        # dados
        report_data = {
            'id': 'alerts_summary',
            'name': 'Resumo de Alertas',
            'description': 'Relatório resumido dos alertas por tipo e severidade.',
            'type': 'summary',
            'data': {
                'total_alerts': Alert.query.count(),
                'resolved_alerts': Alert.query.filter_by(
                    resolved=True).count(),
                'unresolved_alerts': Alert.query.filter_by(
                    resolved=False).count(),
                'by_severity': {
                    'critical': Alert.query.filter_by(
                        severity='critical').count(),
                    'warning': Alert.query.filter_by(
                            severity='warning').count(),
                    'info': Alert.query.filter_by(
                                severity='info').count()}}}

        return jsonify({'report': report_data})

    return jsonify({'msg': 'Relatório não encontrado'}), 404
