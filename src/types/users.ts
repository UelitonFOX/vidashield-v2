export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'admin' | 'moderator' | 'user' | 'viewer';
  department: string | null;
  position: string | null;
  phone: string | null;
  location: string | null;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  login_count: number;
  last_login: string | null;
  last_ip: string | null;
  two_factor_enabled: boolean;
  email_verified: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  pending: number;
  admins: number;
  moderators: number;
  users: number;
  viewers: number;
  withTwoFactor: number;
  verified: number;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  department: string;
  twoFactor: boolean | null;
  emailVerified: boolean | null;
  dateFrom: string;
  dateTo: string;
}

export interface AvatarProps {
  src: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export interface UserModalData {
  id: string;
  mode: 'view' | 'edit' | 'create';
} 