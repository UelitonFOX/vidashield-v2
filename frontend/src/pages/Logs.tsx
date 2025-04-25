import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FiList, FiDownload, FiFilter, FiSearch, FiX, FiCalendar } from 'react-icons/fi';
import api from '../services/api';
import './Dashboard.css';

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
  
  return (
    <DashboardLayout title="Logs do Sistema">
      <div className="logs-page">
        {/* Cabeçalho com ações */}
        <div className="page-header">
          <h2 className="section-title">Registro de Atividades</h2>
          <button className="btn-primary" onClick={handleExport}>
            <FiDownload size={18} />
            <span>Exportar Logs</span>
          </button>
        </div>
        
        {/* Filtros */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input 
                type="text" 
                placeholder="Buscar por usuário, ação ou IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button" title="Buscar logs">
                <FiSearch size={18} />
              </button>
            </div>
            
            <div className="filters-container">
              {/* Filtro por tipo de log */}
              <div className="filter-group">
                <label htmlFor="log-type-filter"><FiFilter /> Tipo:</label>
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
              <div className="filter-group">
                <label htmlFor="from-date"><FiCalendar /> De:</label>
                <input 
                  id="from-date"
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="date-input"
                />
              </div>
              
              {/* Filtro de data final */}
              <div className="filter-group">
                <label htmlFor="to-date"><FiCalendar /> Até:</label>
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
                  className="clear-filters-btn"
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
          <div className="logs-table-container">
            <p className="results-count">Exibindo {logs.length} de {totalLogs} registros</p>
            
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Usuário</th>
                  <th>IP</th>
                  <th>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className={`action-badge ${getActionClassname(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.user_name}</td>
                      <td>{log.ip_address}</td>
                      <td>{log.formatted_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="no-results">
                      Nenhum log encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Anterior
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
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