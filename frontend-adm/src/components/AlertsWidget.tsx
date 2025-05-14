import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import api from '../services/api';
import './AlertsWidget.css';

interface Alert {
  id: number;
  tipo: 'critical' | 'warning' | 'success';
  mensagem: string;
  tempo: string;
}

interface AlertsWidgetProps {
  limit?: number;
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ limit = 5 }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/alerts/recent?limit=${limit}`);
        setAlerts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar alertas recentes:', err);
        setError('Não foi possível carregar os alertas');
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [limit]);

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critical':
        return <FiAlertTriangle size={20} className="alert-icon critical" />;
      case 'warning':
        return <FiAlertTriangle size={20} className="alert-icon warning" />;
      case 'success':
        return <FiCheckCircle size={20} className="alert-icon success" />;
      default:
        return <FiInfo size={20} className="alert-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="alerts-container loading">
        <h2 className="section-title">Alertas Recentes</h2>
        <div className="loading-indicator">Carregando alertas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alerts-container error">
        <h2 className="section-title">Alertas Recentes</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      <div className="section-header">
        <h2 className="section-title">Alertas Recentes</h2>
        <Link to="/alerts" className="view-all-link">
          Ver todos
        </Link>
      </div>
      
      <div className="alerts-list">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              {getAlertIcon(alert.tipo)}
              <div className="alert-content">
                <div className="alert-title">{alert.mensagem}</div>
                <div className="alert-time">{alert.tempo}</div>
              </div>
              <div className={`alert-severity ${alert.tipo}`}>
                {alert.tipo === 'critical' ? 'Crítico' : 
                 alert.tipo === 'warning' ? 'Atenção' : 'Sucesso'}
              </div>
            </div>
          ))
        ) : (
          <div className="no-alerts">
            Nenhum alerta recente
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsWidget; 