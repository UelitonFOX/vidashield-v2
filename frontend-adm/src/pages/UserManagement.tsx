import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User, UserPlus, Search, Filter, MoreVertical, Shield } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { getAccessTokenSilently } = useAuth0();

  // Simular carregamento de usuários
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Em uma implementação real, você faria uma chamada à API aqui
        // const token = await getAccessTokenSilently();
        // const response = await fetch('/api/users', {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // });
        // const data = await response.json();
        // setUsers(data);

        // Usando dados simulados por enquanto
        setTimeout(() => {
          const mockUsers: UserData[] = [
            {
              id: '1',
              name: 'Administrador do Sistema',
              email: 'admin@vidashield.com',
              role: 'admin',
              status: 'ativo',
              lastLogin: '2023-08-15T14:30:22Z',
              createdAt: '2023-01-01T10:00:00Z'
            },
            {
              id: '2',
              name: 'Maria Silva',
              email: 'maria@clinica.com.br',
              role: 'gerente',
              status: 'ativo',
              lastLogin: '2023-08-14T09:15:30Z',
              createdAt: '2023-02-15T08:30:00Z'
            },
            {
              id: '3',
              name: 'João Costa',
              email: 'joao@clinica.com.br',
              role: 'usuario',
              status: 'ativo',
              lastLogin: '2023-08-10T16:45:10Z',
              createdAt: '2023-03-20T11:20:00Z'
            },
            {
              id: '4',
              name: 'Ana Souza',
              email: 'ana@clinica.com.br',
              role: 'usuario',
              status: 'inativo',
              lastLogin: '2023-07-25T10:30:15Z',
              createdAt: '2023-04-10T14:15:00Z'
            },
            {
              id: '5',
              name: 'Carlos Ferreira',
              email: 'carlos@clinica.com.br',
              role: 'usuario',
              status: 'pendente',
              createdAt: '2023-08-05T09:40:00Z'
            }
          ];
          
          setUsers(mockUsers);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [getAccessTokenSilently]);

  // Filtrar usuários com base no termo de pesquisa
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Cor de badge baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'inativo':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pendente':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h1>
        <button
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors">
          <Filter className="w-5 h-5 mr-2" />
          Filtros
        </button>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-700">
            <thead className="bg-zinc-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Papel
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Criado em
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-4 text-zinc-400">Carregando usuários...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-400">
                    Nenhum usuário encontrado com os critérios de busca.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                          {user.role === 'admin' ? (
                            <Shield className="h-5 w-5 text-green-400" />
                          ) : (
                            <User className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-zinc-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-300 capitalize">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-zinc-400 hover:text-white" title="Opções do usuário">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex justify-between items-center mt-6 text-zinc-400 text-sm">
        <div>
          Mostrando <span className="font-medium text-white">{filteredUsers.length}</span> de{' '}
          <span className="font-medium text-white">{users.length}</span> usuários
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-zinc-700 rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed">
            Anterior
          </button>
          <button className="px-3 py-1 bg-zinc-700 rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed">
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 