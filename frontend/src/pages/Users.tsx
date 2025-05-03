import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import usersService from '../services/api/usersService';
import { User } from '../services/api/types';
import { FiEdit, FiKey, FiUserCheck, FiUserMinus, FiUserPlus, FiSearch, FiFilter, FiX, FiAlertCircle } from 'react-icons/fi';
import './Dashboard.css';
import './Users.css';
import { isAdmin, isManagerOrAdmin } from '../services/api/permissionService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

// Interface local para o componente
interface LocalUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  role: 'admin' | 'user' | 'manager';
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'manager'>('all');
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);
  
  // Verificar se o usuário atual é admin
  const userIsAdmin = isAdmin(currentUser);
  
  // Verificar se pode gerenciar (admin ou gerente)
  const canManageUsers = isManagerOrAdmin(currentUser);
  
  // Ler parâmetros da URL ao carregar a página ou quando a URL mudar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    
    // Aplicar filtros de status apenas se estiverem presentes
    if (statusParam === 'active' || statusParam === 'ativo') {
      setStatusFilter('active');
    } else if (statusParam === 'inactive' || statusParam === 'inativo') {
      setStatusFilter('inactive');
    }
  }, [location.search]);
  
  // Buscar dados quando filtros ou paginação mudarem
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Usar o serviço usersService
      const data = await usersService.getUsers({
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined
      });
      
      // Converter o formato dos usuários do backend para o formato usado no componente
      const formattedUsers: LocalUser[] = data.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        // Mapear status do backend para o formato do componente
        status: (user.status === 'ativo' || user.status === 'active') ? 'active' : 'inactive',
        // Mapear role do backend para o formato do componente
        role: user.role === 'admin' ? 'admin' : 
              user.role === 'gerente' ? 'manager' : 'user',
        lastLogin: user.lastLogin
      }));
      
      setUsers(formattedUsers);
      setTotalPages(Math.ceil(data.total / usersPerPage));
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Falha ao carregar a lista de usuários. Tente novamente mais tarde.');
      setLoading(false);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset para a primeira página ao buscar
  };
  
  const handleEditUser = (user: LocalUser) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  
  const handleResetPassword = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja resetar a senha deste usuário?')) {
      try {
        // Usar a função do serviço
        await usersService.resetPassword(userId);
        alert('Uma nova senha foi enviada para o e-mail do usuário.');
      } catch (err) {
        console.error('Erro ao resetar senha:', err);
        alert('Falha ao resetar senha. Tente novamente.');
      }
    }
  };
  
  const handlePromoteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja promover este usuário a administrador?')) {
      try {
        // Usar a função do serviço
        await usersService.promoteUser(userId);
        // Atualizar a lista após a promoção
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: 'admin' } : user
        ));
      } catch (err) {
        console.error('Erro ao promover usuário:', err);
        alert('Falha ao promover usuário. Tente novamente.');
      }
    }
  };
  
  const handleToggleStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
    // Converter status para o formato esperado pelo backend
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'ativar' : 'desativar';
    
    if (window.confirm(`Tem certeza que deseja ${actionText} este usuário?`)) {
      try {
        // Usar a função do serviço
        await usersService.updateUserStatus(userId, newStatus);
        // Atualizar a lista após a alteração
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
      } catch (err) {
        console.error(`Erro ao ${actionText} usuário:`, err);
        alert(`Falha ao ${actionText} usuário. Tente novamente.`);
      }
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setCurrentPage(1);
  };
  
  return (
    <DashboardLayout title="Gerenciamento de Usuários">
      <div className="users-page">
        {/* Cabeçalho com ações */}
        <div className="page-header">
          <h2 className="section-title">Usuários do Sistema</h2>
          {canManageUsers && (
            <button 
              className="action-button"
              onClick={() => {
                setSelectedUser(null);
                setShowModal(true);
              }}
            >
              <FiUserPlus size={18} />
              <span>Novo Usuário</span>
            </button>
          )}
        </div>
        
        {/* Seção de Filtros */}
        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <div className="stat-card">
                <input 
                  type="text" 
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button" title="Buscar usuários">
                  <FiSearch size={18} color="#339999" />
                </button>
              </div>
            </div>
            
            <div className="filters-container">
              <div className="filter-group stat-card">
                <label htmlFor="status-filter">
                  <FiFilter color="#339999" /> Status:
                </label>
                <select 
                  id="status-filter"
                  aria-label="Filtrar por status"
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
              
              <div className="filter-group stat-card">
                <label htmlFor="role-filter">
                  <FiFilter color="#339999" /> Função:
                </label>
                <select 
                  id="role-filter"
                  aria-label="Filtrar por função"
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="all">Todas</option>
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="user">Usuário</option>
                </select>
              </div>
              
              {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                <>
                  <button 
                    type="button" 
                    className="action-button primary-button"
                    onClick={() => fetchUsers()}
                  >
                    <FiSearch size={18} />
                    <span>Aplicar Filtros</span>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={clearFilters}
                    className="action-button"
                  >
                    <FiX size={18} />
                    <span>Limpar Filtros</span>
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
        
        {/* Tabela de Usuários */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando usuários...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="users-table-container chart-container">
            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Função</th>
                    <th>Status</th>
                    <th>Último Acesso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role === 'admin' ? 'Administrador' : 
                             user.role === 'manager' ? 'Gerente' : 'Usuário'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>{user.lastLogin}</td>
                        <td className="actions-cell">
                          <div className="table-actions">
                            {canManageUsers && (
                              <button 
                                className="action-icon-button"
                                onClick={() => handleEditUser(user)}
                                title="Editar usuário"
                              >
                                <FiEdit size={18} />
                              </button>
                            )}
                            
                            {canManageUsers && (
                              <button 
                                className="action-icon-button"
                                onClick={() => handleResetPassword(user.id)}
                                title="Resetar senha"
                              >
                                <FiKey size={18} />
                              </button>
                            )}
                            
                            {userIsAdmin && user.role !== 'admin' && (
                              <button 
                                className="action-icon-button promote"
                                onClick={() => handlePromoteUser(user.id)}
                                title="Promover a administrador"
                              >
                                <FiUserCheck size={18} />
                              </button>
                            )}
                            
                            {canManageUsers && (
                              <button 
                                className="action-icon-button"
                                onClick={() => handleToggleStatus(user.id, user.status)}
                                title={user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'}
                              >
                                {user.status === 'active' ? 
                                  <FiUserMinus size={18} /> : 
                                  <FiUserCheck size={18} />
                                }
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="no-data">
                        <div className="no-data-message">
                          <FiAlertCircle size={24} />
                          <p>Nenhum usuário encontrado</p>
                        </div>
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
        
        {/* Modal para novo usuário ou edição */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <form>
                <div className="form-group">
                  <label>Nome</label>
                  <input 
                    type="text" 
                    placeholder="Nome completo" 
                    defaultValue={selectedUser?.name || ''} 
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    defaultValue={selectedUser?.email || ''} 
                  />
                </div>
                {userIsAdmin && (
                  <div className="form-group">
                    <label>Função</label>
                    <select 
                      id="user-role" 
                      aria-label="Selecionar função do usuário"
                      defaultValue={selectedUser?.role || 'user'}
                    >
                      <option value="user">Usuário</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                )}
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={() => {
                      // Implementar lógica para salvar
                      setShowModal(false);
                    }}
                  >
                    {selectedUser ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users; 