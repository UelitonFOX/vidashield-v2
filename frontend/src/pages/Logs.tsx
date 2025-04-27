import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FiList, FiDownload, FiFilter, FiSearch, FiX, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import './Dashboard.css';
import './Logs.css';

interface Log {
  id: number;
  action: string;
  user_id: number;
  user_name: string;
  ip_address: string;
  timestamp: string;
  formatted_date: string;
}

interface LogsResponse {
  logs: Log[];
  total: number;
  page: number;
  pages: number;
  log_types: string[];
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logTypes, setLogTypes] = useState<string[]>([]);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogType, setSelectedLogType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  
  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchTerm, selectedLogType, fromDate, toDate, selectedUser]);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Construir query params
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedLogType) params.append('type', selectedLogType);
      if (fromDate) params.append('from', new Date(fromDate).toISOString());
      if (toDate) params.append('to', new Date(toDate).toISOString());
      if (selectedUser) params.append('user_id', selectedUser);
      
      const response = await api.get<LogsResponse>(`/logs?${params.toString()}`);
      
      setLogs(response.data.logs);
      setTotalPages(response.data.pages);
      setTotalLogs(response.data.total);
      
      // Salvar tipos de log para o filtro, apenas na primeira carga
      if (logTypes.length === 0 && response.data.log_types) {
        setLogTypes(response.data.log_types);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
      setError('Falha ao carregar os logs. Tente novamente mais tarde.');
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset para a primeira página ao buscar
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLogType('');
    setFromDate('');
    setToDate('');
    setSelectedUser('');
    setCurrentPage(1);
  };
  
  const handleExport = async () => {
    try {
      const response = await api.get('/logs/export');
      alert(response.data.message);
      // Em uma implementação real, aqui iniciaria o download do arquivo
    } catch (err) {
      console.error('Erro ao exportar logs:', err);
      alert('Falha ao exportar logs. Tente novamente.');
    }
  };
  
  const getActionClassname = (action: string) => {
    if (action.includes('falha') || action.includes('bloqueio')) {
      return 'action-error';
    } else if (action.includes('sucedido') || action.includes('Criação')) {
      return 'action-success';
    } else {
      return 'action-info';
    }
  };
  
  const getActionIcon = (action: string) => {
    if (action.includes('falha') || action.includes('bloqueio')) {
      return <div className="alert-icon critical"><FiAlertCircle size={16} /></div>;
    } else if (action.includes('sucedido') || action.includes('Criação')) {
      return <div className="alert-icon success"><FiAlertCircle size={16} /></div>;
    } else {
      return <div className="alert-icon warning"><FiAlertCircle size={16} /></div>;
    }
  };
  
  return (
    <DashboardLayout title="Logs do Sistema">
      <div className="logs-page">
        {/* Cabeçalho com ações */}
        <div className="page-header">
          <h2 className="section-title">Registro de Atividades</h2>
          <button className="action-button" onClick={handleExport}>
            <FiDownload size={18} />
            <span>Exportar Logs</span>
          </button>
        </div>
        
        {/* Filtros */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <div className="stat-card">
                <input 
                  type="text" 
                  placeholder="Buscar por usuário, ação ou IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button" title="Buscar logs">
                  <FiSearch size={18} color="#339999" />
                </button>
              </div>
            </div>
            
            <div className="filters-container">
              {/* Filtro por tipo de log */}
              <div className="filter-group stat-card">
                <label htmlFor="log-type-filter">
                  <FiFilter color="#339999" /> Tipo:
                </label>
                <select 
                  id="log-type-filter"
                  aria-label="Filtrar por tipo de log"
                  value={selectedLogType} 
                  onChange={(e) => setSelectedLogType(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos</option>
                  {logTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Filtro de data inicial */}
              <div className="filter-group stat-card">
                <label htmlFor="from-date">
                  <FiCalendar color="#339999" /> De:
                </label>
                <input 
                  id="from-date"
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="date-input"
                />
              </div>
              
              {/* Filtro de data final */}
              <div className="filter-group stat-card">
                <label htmlFor="to-date">
                  <FiCalendar color="#339999" /> Até:
                </label>
                <input 
                  id="to-date"
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="date-input"
                />
              </div>
              
              {/* Botão para limpar filtros */}
              {(searchTerm || selectedLogType || fromDate || toDate || selectedUser) && (
                <button 
                  type="button" 
                  onClick={clearFilters}
                  className="action-button"
                >
                  <FiX size={18} />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Tabela de Logs */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando logs...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button"
              onClick={fetchLogs}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="logs-table-container chart-container">
            <p className="results-count">
              Exibindo {logs.length} de {totalLogs} registros
            </p>
            
            <div className="table-responsive">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ação</th>
                    <th>Usuário</th>
                    <th>IP</th>
                    <th>Data/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>
                        <div className="log-action">
                          {getActionIcon(log.action)}
                          <span className={getActionClassname(log.action)}>{log.action}</span>
                        </div>
                      </td>
                      <td>{log.user_name}</td>
                      <td>{log.ip_address}</td>
                      <td>{log.formatted_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Anterior
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className="pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Logs; 