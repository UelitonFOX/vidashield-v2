import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, faEdit, faUserShield, 
  faToggleOn, faToggleOff, faLock, 
  faExclamationTriangle, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import './Users.css';

// Interface para definir a estrutura de um usuário
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  last_login?: string;
}

const UserAdmin: React.FC = () => {
  // Estados para gerenciar os dados
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Estado para formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
  });

  // Carregar usuários quando o componente montar
  useEffect(() => {
    loadUsers();
    checkAdmin();
  }, []);

  // Função para verificar se o usuário atual é administrador
  const checkAdmin = async () => {
    try {
      const response = await api.get('/auth/check-role');
      setIsAdmin(response.data.isAdmin);
    } catch (err) {
      setIsAdmin(false);
      console.error('Erro ao verificar permissões:', err);
    }
  };

  // Função para carregar a lista de usuários
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manipulador para alterações nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Função para abrir o modal de adição de usuário
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      password: '',
    });
    setShowModal(true);
  };

  // Função para abrir o modal de edição de usuário
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setShowModal(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Função para enviar o formulário (criar ou editar usuário)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedUser) {
        // Editar usuário existente
        await api.put(`/users/${selectedUser.id}`, formData);
      } else {
        // Criar novo usuário
        await api.post('/users', formData);
      }
      
      setShowModal(false);
      loadUsers(); // Recarregar a lista após a operação
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário');
      console.error('Erro ao salvar usuário:', err);
    }
  };

  // Função para alterar a função/cargo do usuário
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      loadUsers(); // Recarregar a lista após a operação
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar função do usuário');
      console.error('Erro ao alterar função do usuário:', err);
    }
  };

  // Função para promover usuário a administrador
  const handlePromoteToAdmin = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja promover este usuário a administrador? Esta ação concede acesso total ao sistema.')) {
      try {
        await api.patch(`/users/${userId}/promote`, { role: 'admin' });
        loadUsers(); // Recarregar a lista após a operação
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao promover usuário');
        console.error('Erro ao promover usuário:', err);
      }
    }
  };

  // Função para ativar/desativar um usuário
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desativar' : 'ativar';
    
    if (window.confirm(`Tem certeza que deseja ${action} este usuário?`)) {
      try {
        await api.patch(`/users/${userId}/status`, { active: !currentStatus });
        loadUsers(); // Recarregar a lista após a operação
      } catch (err: any) {
        setError(err.response?.data?.message || `Erro ao ${action} usuário`);
        console.error(`Erro ao ${action} usuário:`, err);
      }
    }
  };

  // Renderiza um indicador de carregamento
  if (loading) {
    return (
      <DashboardLayout title="Gerenciamento de Usuários">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Renderiza mensagem de erro se ocorrer algum problema
  if (error) {
    return (
      <DashboardLayout title="Gerenciamento de Usuários">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="error-icon" />
          <p className="error-message">{error}</p>
          <button 
            className="retry-button" 
            onClick={loadUsers}
          >
            Tentar novamente
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Renderiza mensagem de acesso negado para não-administradores
  if (!isAdmin) {
    return (
      <DashboardLayout title="Gerenciamento de Usuários">
        <div className="access-denied-container">
          <FontAwesomeIcon icon={faLock} size="3x" className="access-denied-icon" />
          <h2 className="access-denied-title">Acesso Restrito</h2>
          <p className="access-denied-message">
            Você não tem permissão para acessar esta área. 
            Este recurso está disponível apenas para administradores do sistema.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gerenciamento de Usuários">
      <div className="users-page">
        <div className="page-header">
          <h1 className="section-title">Gerenciamento de Usuários</h1>
          <button className="action-button" onClick={handleAddUser}>
            <FontAwesomeIcon icon={faUserPlus} />
            Adicionar Usuário
          </button>
        </div>

        {users.length === 0 ? (
          <div className="no-data">
            <div className="no-data-message">
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
              <p>Nenhum usuário encontrado no sistema.</p>
            </div>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Último login</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select 
                      className="role-select"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      aria-label="Selecionar função do usuário"
                    >
                      <option value="user">Usuário</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'Nunca'}</td>
                  <td className="actions-cell">
                    <div className="table-actions">
                      <button 
                        className="action-icon-button" 
                        onClick={() => handleEditUser(user)}
                        title="Editar usuário"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button 
                          className="action-icon-button promote"
                          onClick={() => handlePromoteToAdmin(user.id)}
                          title="Promover a administrador"
                        >
                          <FontAwesomeIcon icon={faUserShield} />
                        </button>
                      )}
                      
                      <button 
                        className="action-icon-button"
                        onClick={() => handleToggleStatus(user.id, user.active)}
                        title={user.active ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        <FontAwesomeIcon icon={user.active ? faToggleOn : faToggleOff} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para adicionar/editar usuário */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Função</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="user">Usuário</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  {selectedUser ? 'Nova Senha (deixe em branco para manter atual)' : 'Senha'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!selectedUser}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  {selectedUser ? 'Salvar Alterações' : 'Adicionar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserAdmin; 