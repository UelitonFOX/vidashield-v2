import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  MoreVertical,
  Phone,
  MapPin,
  Calendar,
  Activity,
  ChevronDown
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { Profile, UserStats, UserFilters } from '../types/users';
import { userService } from '../services/userService';

const GerenciamentoUsuarios: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    department: 'all',
    twoFactor: null,
    emailVerified: null,
    dateFrom: '',
    dateTo: ''
  });

  // Estado para dropdowns
  const [showFilters, setShowFilters] = useState(false);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profilesData, statsData] = await Promise.all([
        userService.getProfiles(),
        userService.getUserStats()
      ]);
      setProfiles(profilesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Busca por texto
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchMatch = 
          profile.full_name?.toLowerCase().includes(searchLower) ||
          profile.email?.toLowerCase().includes(searchLower) ||
          profile.department?.toLowerCase().includes(searchLower) ||
          profile.position?.toLowerCase().includes(searchLower);
        
        if (!searchMatch) return false;
      }

      // Filtro por role
      if (filters.role !== 'all' && profile.role !== filters.role) {
        return false;
      }

      // Filtro por status
      if (filters.status !== 'all' && profile.status !== filters.status) {
        return false;
      }

      // Filtro por departamento
      if (filters.department !== 'all' && profile.department !== filters.department) {
        return false;
      }

      // Filtro por 2FA
      if (filters.twoFactor !== null && profile.two_factor_enabled !== filters.twoFactor) {
        return false;
      }

      // Filtro por email verificado
      if (filters.emailVerified !== null && profile.email_verified !== filters.emailVerified) {
        return false;
      }

      return true;
    });
  }, [profiles, filters]);

  // Departamentos únicos para filtro
  const departments = useMemo(() => {
    const depts = profiles
      .map(p => p.department)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return depts;
  }, [profiles]);

  // Funções de ação
  const handleStatusChange = async (profileId: string, newStatus: Profile['status']) => {
    try {
      setActionLoading(profileId);
      await userService.updateUserStatus(profileId, newStatus);
      await loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleTwoFactor = async (profileId: string) => {
    try {
      setActionLoading(profileId);
      await userService.toggleTwoFactor(profileId);
      await loadData();
    } catch (error) {
      console.error('Erro ao alterar 2FA:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await userService.exportToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `usuarios_vidashield_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      suspended: 'Suspenso',
      pending: 'Pendente'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // Role badge  
  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
      viewer: 'bg-orange-100 text-orange-800'
    };
    
    const labels = {
      admin: 'Admin',
      moderator: 'Moderador',
      user: 'Usuário',
      viewer: 'Visualizador'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie usuários, permissões e configurações de segurança
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Usuários</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Usuários Ativos</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Com 2FA</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.withTwoFactor}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserX className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Suspensos</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.suspended}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Buscar usuários..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrar por função"
              >
                <option value="all">Todas as funções</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderador</option>
                <option value="user">Usuário</option>
                <option value="viewer">Visualizador</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrar por status"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="suspended">Suspenso</option>
                <option value="pending">Pendente</option>
              </select>

              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrar por departamento"
              >
                <option value="all">Todos os departamentos</option>
                {departments.map(dept => (
                  <option key={dept} value={dept || ''}>{dept}</option>
                ))}
              </select>

              <select
                value={filters.twoFactor === null ? 'all' : filters.twoFactor ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? null : e.target.value === 'true';
                  setFilters(prev => ({ ...prev, twoFactor: value }));
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filtrar por 2FA"
              >
                <option value="all">2FA - Todos</option>
                <option value="true">Com 2FA</option>
                <option value="false">Sem 2FA</option>
              </select>
            </div>
          )}
        </div>

        {/* Lista de usuários */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segurança
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        src={profile.avatar_url}
                        name={profile.full_name || 'Usuário'}
                        size="lg"
                        className="mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {profile.full_name || 'Nome não informado'}
                        </div>
                        <div className="text-sm text-gray-500">{profile.email}</div>
                        {profile.phone && (
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {profile.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getRoleBadge(profile.role)}
                      {getStatusBadge(profile.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{profile.department || '-'}</div>
                    <div className="text-sm text-gray-500">{profile.position || '-'}</div>
                    {profile.location && (
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {profile.location}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profile.last_login ? (
                      <div>
                        <div>{formatDate(profile.last_login)}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Activity className="h-3 w-3 mr-1" />
                          {profile.login_count} logins
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Nunca acessou</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.two_factor_enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.two_factor_enabled ? '2FA Ativo' : '2FA Inativo'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.email_verified 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {profile.email_verified ? 'Verificado' : 'Não Verificado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                         <div className="flex items-center space-x-2">
                       <button
                         onClick={() => {
                           setSelectedProfile(profile);
                           setShowModal(true);
                         }}
                         className="text-blue-600 hover:text-blue-900"
                         title="Visualizar usuário"
                         aria-label="Visualizar usuário"
                       >
                         <Eye className="h-4 w-4" />
                       </button>
                       <button 
                         className="text-gray-600 hover:text-gray-900"
                         title="Editar usuário"
                         aria-label="Editar usuário"
                       >
                         <Edit className="h-4 w-4" />
                       </button>
                       <button 
                         className="text-red-600 hover:text-red-900"
                         title="Excluir usuário"
                         aria-label="Excluir usuário"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProfiles.length === 0 && (
          <div className="p-6 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalhes do usuário */}
      {showModal && selectedProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalhes do Usuário</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Avatar e informações básicas */}
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={selectedProfile.avatar_url}
                    name={selectedProfile.full_name || 'Usuário'}
                    size="2xl"
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedProfile.full_name || 'Nome não informado'}
                    </h4>
                    <p className="text-gray-500">{selectedProfile.email}</p>
                    <div className="mt-2 space-x-2">
                      {getRoleBadge(selectedProfile.role)}
                      {getStatusBadge(selectedProfile.status)}
                    </div>
                  </div>
                </div>

                {/* Informações detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Informações Profissionais</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><strong>Departamento:</strong> {selectedProfile.department || 'Não informado'}</div>
                      <div><strong>Cargo:</strong> {selectedProfile.position || 'Não informado'}</div>
                      <div><strong>Telefone:</strong> {selectedProfile.phone || 'Não informado'}</div>
                      <div><strong>Localização:</strong> {selectedProfile.location || 'Não informado'}</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Atividade & Segurança</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><strong>Total de Logins:</strong> {selectedProfile.login_count}</div>
                      <div><strong>Último Acesso:</strong> {selectedProfile.last_login ? formatDate(selectedProfile.last_login) : 'Nunca'}</div>
                      <div><strong>Último IP:</strong> {selectedProfile.last_ip || 'Não disponível'}</div>
                      <div><strong>2FA:</strong> {selectedProfile.two_factor_enabled ? 'Ativo' : 'Inativo'}</div>
                      <div><strong>Email Verificado:</strong> {selectedProfile.email_verified ? 'Sim' : 'Não'}</div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleToggleTwoFactor(selectedProfile.id)}
                    disabled={actionLoading === selectedProfile.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {selectedProfile.two_factor_enabled ? 'Desativar 2FA' : 'Ativar 2FA'}
                  </button>
                  
                                     <select
                     value={selectedProfile.status}
                     onChange={(e) => handleStatusChange(selectedProfile.id, e.target.value as Profile['status'])}
                     className="px-3 py-2 border border-gray-300 rounded-md"
                     disabled={actionLoading === selectedProfile.id}
                     aria-label="Alterar status do usuário"
                   >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciamentoUsuarios; 