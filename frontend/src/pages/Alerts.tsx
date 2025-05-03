import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  FiAlertTriangle, 
  FiDownload, 
  FiFilter, 
  FiX, 
  FiSearch, 
  FiCheckCircle, 
  FiInfo,
  FiArrowRight
} from 'react-icons/fi';
import api from '../services/api';
import './Alerts.css';
import { useLocation } from 'react-router-dom';

interface AlertDetail {
  user_id: number;
  user_email: string;
  ip_address?: string;
  attempts?: number;
  usual_ip?: string;
}

interface Alert {
  id: number;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  details: AlertDetail;
  timestamp: string;
  formatted_date: string;
  resolved: boolean;
  resolved_time: string | null;
  resolved_by: number | null;
}

interface AlertsResponse {
  alerts: Alert[];
  total: number;
  page: number;
  pages: number;
  severity_counts: {
    critical: number;
    warning: number;
    info: number;
  };
  alert_types: {
    id: number;
    name: string;
    severity: string;
  }[];
}

const Alerts: React.FC = () => {
  const location = useLocation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertTypes, setAlertTypes] = useState<{id: number, name: string, severity: string}[]>([]);
  const [severityCounts, setSeverityCounts] = useState({
    critical: 0,
    warning: 0,
    info: 0
  });
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  
  // Filtros
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [showResolved, setShowResolved] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de detalhes
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Ler parâmetros da URL ao carregar a página ou quando a URL mudar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const criticoParam = params.get('critico');
    
    // Aplicar filtro de criticidade apenas se estiver presente
    if (criticoParam === 'true') {
      setSelectedSeverity('critical');
      setShowResolved(false);
    }
  }, [location.search]);
  
  // Buscar dados quando filtros ou paginação mudarem
  useEffect(() => {
    fetchAlerts();
  }, [currentPage, selectedSeverity, showResolved, searchTerm]);
  
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Construir query params
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      
      if (selectedSeverity) params.append('severity', selectedSeverity);
      if (showResolved !== null) params.append('resolved', showResolved.toString());
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get<AlertsResponse>(`/alerts?${params.toString()}`);
      
      setAlerts(response.data.alerts);
      setTotalPages(response.data.pages);
      setTotalAlerts(response.data.total);
      setSeverityCounts(response.data.severity_counts);
      
      // Salvar tipos de alerta para o filtro, apenas na primeira carga
      if (alertTypes.length === 0 && response.data.alert_types) {
        setAlertTypes(response.data.alert_types);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
      setError('Falha ao carregar os alertas. Tente novamente mais tarde.');
      setLoading(false);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const clearFilters = () => {
    setSelectedSeverity('');
    setShowResolved(null);
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset para a primeira página ao buscar
  };
  
  const handleResolveAlert = async (alertId: number) => {
    try {
      await api.put(`/alerts/${alertId}/resolve`);
      
      // Atualizar o alerta na lista
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
      
      // Se o modal estiver aberto, atualize o alerta selecionado também
      if (selectedAlert && selectedAlert.id === alertId) {
        setSelectedAlert({ ...selectedAlert, resolved: true });
      }
      
      // Atualizar contadores de severidade
      const resolvedAlert = alerts.find(a => a.id === alertId);
      if (resolvedAlert && !resolvedAlert.resolved) {
        setSeverityCounts(prev => ({
          ...prev,
          [resolvedAlert.severity]: Math.max(0, prev[resolvedAlert.severity] - 1)
        }));
      }
      
    } catch (err) {
      console.error('Erro ao resolver alerta:', err);
      alert('Falha ao marcar alerta como resolvido. Tente novamente.');
    }
  };
  
  const openAlertDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };
  
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAlert(null);
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <FiAlertTriangle className="severity-icon critical" />;
      case 'warning':
        return <FiAlertTriangle className="severity-icon warning" />;
      case 'info':
        return <FiInfo className="severity-icon info" />;
      default:
        return <FiInfo className="severity-icon" />;
    }
  };
  
  return (
    <DashboardLayout title="Alertas de Segurança">
      <div className="alerts-page">
        {/* Cabeçalho com ações */}
        <div className="page-header">
          <h2 className="section-title">Sistema de Alertas</h2>
          <button className="btn-primary" onClick={() => window.print()}>
            <FiDownload size={18} />
            <span>Exportar Relatório</span>
          </button>
        </div>
        
        {/* Cards de contagem por severidade */}
        <div className="alert-summary-cards">
          <div className="alert-card critical">
            <FiAlertTriangle size={28} />
            <div className="alert-card-content">
              <h3>Críticos</h3>
              <div className="alert-count">{severityCounts.critical}</div>
            </div>
          </div>
          
          <div className="alert-card warning">
            <FiAlertTriangle size={28} />
            <div className="alert-card-content">
              <h3>Avisos</h3>
              <div className="alert-count">{severityCounts.warning}</div>
            </div>
          </div>
          
          <div className="alert-card info">
            <FiInfo size={28} />
            <div className="alert-card-content">
              <h3>Informativos</h3>
              <div className="alert-count">{severityCounts.info}</div>
            </div>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input 
                type="text" 
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button" title="Buscar alertas">
                <FiSearch size={18} />
              </button>
            </div>
            
            <div className="filters-container">
              {/* Filtro por severidade */}
              <div className="filter-group">
                <label htmlFor="severity-filter"><FiFilter /> Severidade:</label>
                <select 
                  id="severity-filter"
                  aria-label="Filtrar por severidade"
                  value={selectedSeverity} 
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todas</option>
                  <option value="critical">Crítico</option>
                  <option value="warning">Aviso</option>
                  <option value="info">Informativo</option>
                </select>
              </div>
              
              {/* Filtro por status */}
              <div className="filter-group">
                <label htmlFor="status-filter"><FiFilter /> Status:</label>
                <select 
                  id="status-filter"
                  aria-label="Filtrar por status"
                  value={showResolved === null ? '' : showResolved ? 'resolved' : 'active'}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setShowResolved(null);
                    } else {
                      setShowResolved(e.target.value === 'resolved');
                    }
                  }}
                  className="filter-select"
                >
                  <option value="">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="resolved">Resolvidos</option>
                </select>
              </div>
              
              {/* Botões para aplicar e limpar filtros */}
              {(selectedSeverity || showResolved !== null || searchTerm) && (
                <div className="filter-actions">
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={fetchAlerts}
                  >
                    <FiSearch size={18} />
                    <span>Aplicar Filtros</span>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={clearFilters}
                    className="btn-secondary"
                  >
                    <FiX size={18} />
                    <span>Limpar Filtros</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Lista de alertas */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando alertas...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button"
              onClick={fetchAlerts}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="alerts-list-container">
            <p className="results-count">
              Exibindo {alerts.length} de {totalAlerts} alertas
            </p>
            
            <div className="table-responsive">
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Severidade</th>
                    <th>Tipo</th>
                    <th>Data/Hora</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length > 0 ? (
                    alerts.map(alert => (
                      <tr key={alert.id} onClick={() => openAlertDetails(alert)}>
                        <td>
                          <div className="severity-display">
                            {getSeverityIcon(alert.severity)}
                            <span className={`severity-text ${alert.severity}`}>
                              {alert.severity === 'critical' ? 'Crítico' : 
                               alert.severity === 'warning' ? 'Aviso' : 'Informativo'}
                            </span>
                          </div>
                        </td>
                        <td>{alert.type}</td>
                        <td>{alert.formatted_date}</td>
                        <td>
                          <span className={`status-indicator ${alert.resolved ? 'resolved' : 'active'}`}>
                            {alert.resolved ? 'Resolvido' : 'Ativo'}
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="alert-actions">
                            <button 
                              className="alert-detail-button"
                              onClick={() => openAlertDetails(alert)}
                              title="Ver detalhes"
                            >
                              <FiArrowRight size={16} />
                            </button>
                            
                            {!alert.resolved && (
                              <button 
                                className="resolve-button"
                                onClick={() => handleResolveAlert(alert.id)}
                                title="Marcar como resolvido"
                              >
                                Resolver
                              </button>
                            )}
                            
                            {alert.resolved && (
                              <button 
                                className="resolve-button resolved"
                                disabled
                                title="Alerta já resolvido"
                              >
                                <FiCheckCircle size={16} />
                                Resolvido
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="empty-alerts-message">
                        Nenhum alerta encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className="page-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Modal de detalhes */}
        {showDetailsModal && selectedAlert && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Detalhes do Alerta</h3>
                <button className="close-button" onClick={closeDetailsModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Severidade</span>
                  <div className="severity-display">
                    {getSeverityIcon(selectedAlert.severity)}
                    <span className={`severity-text ${selectedAlert.severity}`}>
                      {selectedAlert.severity === 'critical' ? 'Crítico' : 
                      selectedAlert.severity === 'warning' ? 'Aviso' : 'Informativo'}
                    </span>
                  </div>
                </div>
                
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Tipo</span>
                  <span className="alert-detail-value">{selectedAlert.type}</span>
                </div>
                
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Usuário</span>
                  <span className="alert-detail-value">{selectedAlert.details.user_email}</span>
                </div>
                
                {selectedAlert.details.ip_address && (
                  <div className="alert-detail-item">
                    <span className="alert-detail-label">Endereço IP</span>
                    <span className="alert-detail-value">{selectedAlert.details.ip_address}</span>
                  </div>
                )}
                
                {selectedAlert.details.attempts && (
                  <div className="alert-detail-item">
                    <span className="alert-detail-label">Tentativas</span>
                    <span className="alert-detail-value">{selectedAlert.details.attempts}</span>
                  </div>
                )}
                
                {selectedAlert.details.usual_ip && (
                  <div className="alert-detail-item">
                    <span className="alert-detail-label">IP Usual</span>
                    <span className="alert-detail-value">{selectedAlert.details.usual_ip}</span>
                  </div>
                )}
                
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Data/Hora</span>
                  <span className="alert-detail-value">{selectedAlert.formatted_date}</span>
                </div>
                
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Status</span>
                  <span className={`status-indicator ${selectedAlert.resolved ? 'resolved' : 'active'}`}>
                    {selectedAlert.resolved ? 'Resolvido' : 'Ativo'}
                  </span>
                </div>
                
                {selectedAlert.resolved && (
                  <div className="alert-detail-item">
                    <span className="alert-detail-label">Resolvido em</span>
                    <span className="alert-detail-value">{selectedAlert.resolved_time}</span>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeDetailsModal}>
                  Fechar
                </button>
                
                {!selectedAlert.resolved && (
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id);
                      closeDetailsModal();
                    }}
                  >
                    <FiCheckCircle size={18} />
                    Marcar como Resolvido
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts; 