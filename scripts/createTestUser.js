import { createClient } from '@supabase/supabase-js';

// ⚠️ CONFIGURE AS VARIÁVEIS DE AMBIENTE:
// VITE_SUPABASE_URL=sua_url_supabase
// SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
// TEST_USER_EMAIL=email_do_teste
// TEST_USER_PASSWORD=senha_do_teste

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testEmail = process.env.TEST_USER_EMAIL || 'admin@example.com';
const testPassword = process.env.TEST_USER_PASSWORD || 'MinhaSenh@123!';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configure as variáveis VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

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
      email: testEmail,
      password: testPassword,
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
        email: testEmail,
        password: testPassword,
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
    console.log(`Email: ${testEmail}`);
    console.log(`Senha: [CONFIGURADA VIA ENV]`);
    console.log('\n🚀 Agora você pode fazer login na página de login!');

  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
})(); 