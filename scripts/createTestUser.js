import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rqucoiabfiocasxuuvea.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Criando usuário de teste para VidaShield...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

(async () => {
  try {
    // Primeira tentativa: criar usuário via Admin API
    console.log('📧 Tentando criar usuário via Admin API...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@vidashield.test',
      password: 'VidaShield123!',
      email_confirm: true,
      user_metadata: {
        name: 'Admin VidaShield',
        role: 'admin'
      }
    });

    if (error) {
      console.log('⚠️  Erro na Admin API:', error.message);
      
      // Segunda tentativa: signup normal
      console.log('📧 Tentando signup normal...');
      
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: 'admin@vidashield.test',
        password: 'VidaShield123!',
        options: {
          data: {
            name: 'Admin VidaShield',
            role: 'admin'
          }
        }
      });

      if (signupError) {
        console.error('❌ Erro no signup:', signupError.message);
      } else {
        console.log('✅ Usuário criado via signup:', signupData);
      }
    } else {
      console.log('✅ Usuário criado via Admin API:', data);
    }

    console.log('\n📋 Credenciais do usuário de teste:');
    console.log('Email: admin@vidashield.test');
    console.log('Senha: VidaShield123!');
    console.log('\n🚀 Agora você pode fazer login usando o botão "Admin Teste" na página de login!');

  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
})(); 