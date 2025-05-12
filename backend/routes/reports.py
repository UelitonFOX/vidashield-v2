# -*- coding: utf-8 -*-
"""
Módulo para rotas de relatórios da aplicação.

Este módulo gerencia as funcionalidades relacionadas a relatórios e exportação de dados.
"""

from flask import Blueprint, jsonify, request, current_app, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Alert, JSONType
from sqlalchemy import func
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
    available_reports = [
        {
            'id': 'alerts_summary',
            'name': 'Resumo de Alertas',
            'description': 'Relatório resumido dos alertas por tipo e severidade.',
            'type': 'summary'
        },
        {
            'id': 'users_activity',
            'name': 'Atividade de Usuários',
            'description': 'Relatório de atividade recente dos usuários no sistema.',
            'type': 'activity'
        },
        {
            'id': 'security_events',
            'name': 'Eventos de Segurança',
            'description': 'Histórico detalhado de eventos de segurança.',
            'type': 'security'
        }
    ]
    
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
        'alerts_summary', 
        'users_activity', 
        'security_events',
        'all_users',
        'all_alerts',
        'system_stats'
    ]
    
    return jsonify({'available_reports': exportable_reports})

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
    
    if not report_id:
        return jsonify({'msg': 'ID do relatório não fornecido'}), 400
    
    # Implementação básica - poderia ser expandida para gerar relatórios reais
    if report_id == 'all_alerts':
        # Exemplo: exportar todos os alertas em formato CSV
        alerts = Alert.query.all()
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Cabeçalho
        writer.writerow(['ID', 'Tipo', 'Severidade', 'Timestamp', 'Resolvido', 'Resolvido Por', 'Usuário ID'])
        
        # Dados
        for alert in alerts:
            writer.writerow([
                alert.id,
                alert.type,
                alert.severity,
                alert.timestamp,
                alert.resolved,
                alert.resolved_by,
                alert.user_id
            ])
        
        return jsonify({'msg': 'Relatório gerado com sucesso', 'data': output.getvalue()})
    
    return jsonify({'msg': f'Exportação do relatório {report_id} iniciada', 'status': 'success'})

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
        # Dados de exemplo - em uma implementação real, viriam do banco de dados
        report_data = {
            'id': 'alerts_summary',
            'name': 'Resumo de Alertas',
            'description': 'Relatório resumido dos alertas por tipo e severidade.',
            'type': 'summary',
            'data': {
                'total_alerts': Alert.query.count(),
                'resolved_alerts': Alert.query.filter_by(resolved=True).count(),
                'unresolved_alerts': Alert.query.filter_by(resolved=False).count(),
                'by_severity': {
                    'critical': Alert.query.filter_by(severity='critical').count(),
                    'warning': Alert.query.filter_by(severity='warning').count(),
                    'info': Alert.query.filter_by(severity='info').count()
                }
            }
        }
        
        return jsonify({'report': report_data})
    
    return jsonify({'msg': 'Relatório não encontrado'}), 404 