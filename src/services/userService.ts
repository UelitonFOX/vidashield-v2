import { supabase } from './supabaseClient';
import { Profile, UserStats } from '../types/users';

export class UserService {
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar profiles:', error);
      throw error;
    }

    return data || [];
  }

  async getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar profile:', error);
      return null;
    }

    return data;
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar profile:', error);
      throw error;
    }

    return data;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar profile:', error);
      throw error;
    }

    return true;
  }

  async getUserStats(): Promise<UserStats> {
    const profiles = await this.getProfiles();

    const stats: UserStats = {
      total: profiles.length,
      active: profiles.filter(p => p.status === 'active').length,
      inactive: profiles.filter(p => p.status === 'inactive').length,
      suspended: profiles.filter(p => p.status === 'suspended').length,
      pending: profiles.filter(p => p.status === 'pending').length,
      admins: profiles.filter(p => p.role === 'admin').length,
      moderators: profiles.filter(p => p.role === 'moderator').length,
      users: profiles.filter(p => p.role === 'user').length,
      viewers: profiles.filter(p => p.role === 'viewer').length,
      withTwoFactor: profiles.filter(p => p.two_factor_enabled).length,
      verified: profiles.filter(p => p.email_verified).length,
    };

    return stats;
  }

  async updateUserStatus(id: string, status: Profile['status']): Promise<Profile | null> {
    return this.updateProfile(id, { status });
  }

  async toggleTwoFactor(id: string): Promise<Profile | null> {
    const profile = await this.getProfile(id);
    if (!profile) throw new Error('Usuário não encontrado');

    return this.updateProfile(id, { 
      two_factor_enabled: !profile.two_factor_enabled 
    });
  }

  // Função para gerar avatar fallback usando UI Avatars
  generateAvatarUrl(name: string, size: number = 200): string {
    const colors = [
      '16a34a', '3b82f6', '8b5cf6', 'f59e0b', 'ec4899', 
      'ef4444', '06b6d4', 'dc2626', '6b7280', 'd97706'
    ];
    
    const colorIndex = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const backgroundColor = colors[colorIndex % colors.length];
    
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=${backgroundColor}&color=ffffff&size=${size}`;
  }

  // Função para exportar dados para CSV
  async exportToCSV(): Promise<string> {
    const profiles = await this.getProfiles();
    
    const headers = [
      'Nome', 'Email', 'Função', 'Departamento', 'Cargo', 'Status', 
      'Telefone', 'Localização', '2FA', 'Email Verificado', 
      'Último Login', 'Total de Logins', 'Criado em'
    ];

    const rows = profiles.map(profile => [
      profile.full_name || '',
      profile.email || '',
      profile.role || '',
      profile.department || '',
      profile.position || '',
      profile.status || '',
      profile.phone || '',
      profile.location || '',
      profile.two_factor_enabled ? 'Sim' : 'Não',
      profile.email_verified ? 'Sim' : 'Não',
      profile.last_login ? new Date(profile.last_login).toLocaleDateString('pt-BR') : '',
      profile.login_count?.toString() || '0',
      new Date(profile.created_at).toLocaleDateString('pt-BR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

export const userService = new UserService(); 