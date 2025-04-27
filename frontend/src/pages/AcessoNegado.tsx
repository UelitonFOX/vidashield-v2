import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { FiAlertTriangle, FiHome, FiArrowLeft } from 'react-icons/fi';
import './Dashboard.css';

const AcessoNegado: React.FC = () => {
  return (
    <DashboardLayout title="Acesso Restrito">
      <div className="access-denied-container">
        <div className="access-denied-icon">
          <FiAlertTriangle size={80} />
        </div>
        <h1 className="access-denied-title">Acesso Negado</h1>
        <p className="access-denied-message">
          Você não possui permissão para acessar esta área do sistema.
        </p>
        <p className="access-denied-submessage">
          Entre em contato com um administrador caso precise fazer alterações.
        </p>
        
        <div className="access-denied-actions">
          <Link to="/dashboard" className="action-button">
            <FiHome size={20} />
            <span>Voltar ao Dashboard</span>
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="action-button secondary"
          >
            <FiArrowLeft size={20} />
            <span>Voltar à página anterior</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AcessoNegado; 