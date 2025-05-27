-- Criar perfil do Dr. Rodrigo Silva - Clínica VidaMais
INSERT INTO public.user_profiles (
  id,
  email,
  name,
  role,
  department,
  phone,
  avatar_url,
  two_factor_enabled,
  email_verified,
  status,
  preferences,
  bio,
  emergency_contact,
  job_title
) VALUES (
  '612816cb-ad38-4182-8b80-87c36ad35735',
  'dr.rodrigo@vidamais.com.br',
  'Dr. Rodrigo Silva',
  'admin',
  'Administração',
  '(43) 99999-0001',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  false,
  true,
  'active',
  jsonb_build_object(
    'theme', 'dark',
    'notifications', jsonb_build_object(
      'email', true,
      'push', true,
      'security', true,
      'updates', true
    ),
    'language', 'pt-BR',
    'timezone', 'America/Sao_Paulo',
    'notificationSound', 'chime'
  ),
  'Proprietário e diretor médico da Clínica VidaMais em Palmital/PR. Especialista em administração hospitalar com foco em segurança cibernética para dados médicos. Após recente tentativa de invasão, implementou sistema automatizado de detecção e resposta a ameaças para proteger 12 mil prontuários digitais da população local.',
  jsonb_build_object(
    'name', 'Dra. Maria Silva',
    'phone', '(43) 99999-0002',
    'relationship', 'Esposa',
    'email', 'dra.maria@vidamais.com.br'
  ),
  'Proprietário da Clínica VidaMais'
) ON CONFLICT (id) DO NOTHING; 