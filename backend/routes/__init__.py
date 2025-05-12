from flask import Blueprint
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.users import users_bp
from routes.logs import logs_bp
from routes.alerts import alerts_bp
from routes.settings import settings_bp
from routes.reports import reports_bp

__all__ = ['auth_bp', 'dashboard_bp', 'users_bp', 'logs_bp', 'alerts_bp', 'settings_bp', 'reports_bp'] 