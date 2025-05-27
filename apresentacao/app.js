const { createApp } = Vue;

createApp({
    data() {
        return {
            currentSlide: 0,
            currentDemo: 0,
            sidebarOpen: true,
            
            // Imagens da apresentação
            images: {
                logo: 'images/logo-vidashield.png',
                teamPhoto: 'images/team-photo.jpg',
                clinicaVidaMais: 'images/clinica-vidamais.jpg',
                drRodrigo: 'images/dr-rodrigo.jpg',
                dashboardPreview: 'images/dashboard-preview.png',
                loginScreen: 'images/login-screen.png',
                dashboardFull: 'images/dashboard-full.png',
                alertsPanel: 'images/alerts-panel.png',
                metricsChart: 'images/metrics-chart.png',
                aiIntegration: 'images/ai-integration.png',
                mobileApp: 'images/mobile-app.png',
                successIllustration: 'images/success-illustration.png'
            },
            
            slides: [
                { title: 'Apresentação', icon: 'fas fa-home' },
                { title: 'O Problema', icon: 'fas fa-exclamation-triangle' },
                { title: 'Nossa Solução', icon: 'fas fa-lightbulb' },
                { title: 'Stack Tecnológico', icon: 'fas fa-cogs' },
                { title: 'Demonstração', icon: 'fas fa-desktop' },
                { title: 'Resultados', icon: 'fas fa-chart-bar' },
                { title: 'Próximos Passos', icon: 'fas fa-rocket' },
                { title: 'Fechamento', icon: 'fas fa-heart' }
            ],
            
            team: [
                { 
                    name: 'Ueliton Fermino', 
                    role: 'Tech Lead & Desenvolvedor',
                    initials: 'UF',
                    photo: 'images/ueliton.jpg',
                    contacts: {
                        linkedin: 'https://linkedin.com/in/ueliton-fermino',
                        github: 'https://github.com/ueliton-fermino',
                        instagram: 'https://instagram.com/ueliton.fermino',
                        whatsapp: 'https://wa.me/5544999999999'
                    }
                },
                { 
                    name: 'Beatriz Delgado', 
                    role: 'Frontend Developer',
                    initials: 'BD',
                    photo: 'images/beatriz.jpg',
                    contacts: {
                        linkedin: 'https://linkedin.com/in/beatriz-delgado',
                        github: 'https://github.com/beatriz-delgado',
                        instagram: 'https://instagram.com/beatriz.delgado',
                        whatsapp: 'https://wa.me/5544888888888'
                    }
                },
                { 
                    name: 'Camili Machado', 
                    role: 'UI/UX Designer',
                    initials: 'CM',
                    photo: 'images/camili.jpg',
                    contacts: {
                        linkedin: 'https://linkedin.com/in/camili-machado',
                        github: 'https://github.com/camili-machado',
                        instagram: 'https://instagram.com/camili.machado',
                        whatsapp: 'https://wa.me/5544777777777'
                    }
                }
            ],
            
            problems: [
                {
                    id: 1,
                    icon: 'fas fa-file-alt',
                    title: 'Falta de Monitoramento',
                    description: 'Ausência total de logs de segurança e atividade do sistema'
                },
                {
                    id: 2,
                    icon: 'fas fa-bug',
                    title: 'Detecção de Ameaças',
                    description: 'Nenhum sistema para identificar tentativas de invasão'
                },
                {
                    id: 3,
                    icon: 'fas fa-user-shield',
                    title: 'Dados Vulneráveis',
                    description: 'Informações sensíveis de pacientes sem proteção adequada'
                },
                {
                    id: 4,
                    icon: 'fas fa-balance-scale',
                    title: 'Compliance LGPD',
                    description: 'Não conformidade com a Lei Geral de Proteção de Dados'
                }
            ],
            
            features: [
                {
                    id: 1,
                    icon: 'fas fa-bullseye',
                    title: 'Foco em Clínicas',
                    description: 'Desenvolvido especificamente para necessidades médicas'
                },
                {
                    id: 2,
                    icon: 'fas fa-dollar-sign',
                    title: 'Custo Acessível',
                    description: 'Solução nacional com preço competitivo'
                },
                {
                    id: 3,
                    icon: 'fas fa-mouse-pointer',
                    title: 'Interface Intuitiva',
                    description: 'Design simplificado para profissionais de saúde'
                },
                {
                    id: 4,
                    icon: 'fas fa-user-md',
                    title: 'Fácil de Usar',
                    description: 'Dr. Rodrigo consegue operar sem equipe técnica'
                },
                {
                    id: 5,
                    icon: 'fas fa-shield-alt',
                    title: 'Compliance Garantido',
                    description: 'Conformidade LGPD específica para área da saúde'
                }
            ],
            
            frontendTech: [
                { name: 'React', version: '18.2.0', icon: 'fab fa-react', logo: 'images/react-logo.png' },
                { name: 'TypeScript', version: '5.2.2', icon: 'fas fa-code', logo: 'images/typescript-logo.png' },
                { name: 'Vite', version: 'Build Tool', icon: 'fas fa-bolt', logo: 'images/vite-logo.png' },
                { name: 'TailwindCSS', version: 'Styling', icon: 'fas fa-paint-brush', logo: 'images/tailwind-logo.png' }
            ],
            
            backendTech: [
                { name: 'Supabase', version: 'BaaS', icon: 'fas fa-database', logo: 'images/supabase-logo.png' },
                { name: 'PostgreSQL', version: 'Database', icon: 'fas fa-server', logo: 'images/postgresql-logo.png' },
                { name: 'Node.js', version: 'Runtime', icon: 'fab fa-node-js', logo: 'images/nodejs-logo.png' },
                { name: 'REST API', version: 'Protocol', icon: 'fas fa-plug' }
            ],
            
            securityTech: [
                { name: 'OAuth 2.0', description: 'Autenticação Segura', icon: 'fas fa-key' },
                { name: '2FA', description: 'Autenticação Dupla', icon: 'fas fa-mobile-alt' },
                { name: 'RLS', description: 'Row Level Security', icon: 'fas fa-lock' },
                { name: 'JWT', description: 'JSON Web Tokens', icon: 'fas fa-certificate' }
            ],
            
            demoSteps: [
                { title: 'Login Seguro', icon: 'fas fa-sign-in-alt' },
                { title: 'Dashboard', icon: 'fas fa-chart-pie' },
                { title: 'Alertas', icon: 'fas fa-bell' }
            ],
            
            dashboardWidgets: [
                { id: 1, icon: 'fas fa-users', value: '247', label: 'Usuários Ativos' },
                { id: 2, icon: 'fas fa-shield-alt', value: '99.9%', label: 'Uptime' },
                { id: 3, icon: 'fas fa-bell', value: '12', label: 'Alertas Hoje' },
                { id: 4, icon: 'fas fa-clock', value: '1.2s', label: 'Resposta Média' }
            ],
            
            alerts: [
                {
                    id: 1,
                    type: 'success',
                    icon: 'fas fa-check-circle',
                    title: 'Sistema Seguro',
                    message: 'Todos os sistemas operando normalmente',
                    time: 'há 2 minutos'
                },
                {
                    id: 2,
                    type: 'warning',
                    icon: 'fas fa-exclamation-triangle',
                    title: 'Tentativa de Login',
                    message: 'Login suspeito detectado e bloqueado',
                    time: 'há 15 minutos'
                },
                {
                    id: 3,
                    type: 'danger',
                    icon: 'fas fa-times-circle',
                    title: 'Ameaça Bloqueada',
                    message: 'Tentativa de SQL Injection interceptada',
                    time: 'há 1 hora'
                }
            ],
            
            metrics: [
                {
                    id: 1,
                    icon: 'fas fa-clock',
                    value: '99.9%',
                    label: 'Disponibilidade',
                    percentage: '99%'
                },
                {
                    id: 2,
                    icon: 'fas fa-shield-alt',
                    value: '100%',
                    label: 'Ameaças Bloqueadas',
                    percentage: '100%'
                },
                {
                    id: 3,
                    icon: 'fas fa-bolt',
                    value: '85%',
                    label: 'Redução Tempo Resposta',
                    percentage: '85%'
                },
                {
                    id: 4,
                    icon: 'fas fa-chart-line',
                    value: '3 meses',
                    label: 'ROI Positivo',
                    percentage: '75%'
                }
            ],
            
            benefits: [
                {
                    id: 1,
                    icon: 'fas fa-shield-alt',
                    title: '90% Menos Vulnerabilidades',
                    description: 'Proteção avançada contra ameaças cibernéticas'
                },
                {
                    id: 2,
                    icon: 'fas fa-heart',
                    title: 'Maior Confiança dos Pacientes',
                    description: 'Segurança visível aumenta credibilidade da clínica'
                },
                {
                    id: 3,
                    icon: 'fas fa-balance-scale',
                    title: 'Conformidade Legal Garantida',
                    description: 'Total adequação às normas LGPD e regulamentações'
                }
            ],
            
            roadmap: [
                {
                    icon: 'fas fa-robot',
                    title: 'IA Integrada',
                    description: 'Sistema de inteligência artificial para predição de ameaças',
                    timeline: 'Q1 2024'
                },
                {
                    icon: 'fas fa-mobile-alt',
                    title: 'App Mobile Nativo',
                    description: 'Aplicativo para iOS e Android com notificações push',
                    timeline: 'Q2 2024'
                },
                {
                    icon: 'fas fa-hospital',
                    title: 'Expansão Hospitalar',
                    description: 'Versão enterprise para hospitais de grande porte',
                    timeline: 'Q3 2024'
                },
                {
                    icon: 'fas fa-globe',
                    title: 'Integração Internacional',
                    description: 'Compatibilidade com sistemas de saúde globais',
                    timeline: 'Q4 2024'
                }
            ]
        };
    },
    
    methods: {
        goToSlide(index) {
            this.currentSlide = index;
        },
        
        nextSlide() {
            if (this.currentSlide < this.slides.length - 1) {
                this.currentSlide++;
            }
        },
        
        previousSlide() {
            if (this.currentSlide > 0) {
                this.currentSlide--;
            }
        },
        
        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },
        
        handleKeyPress(event) {
            switch(event.key) {
                case 'ArrowRight':
                case ' ':
                    event.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.previousSlide();
                    break;
                case 'Home':
                    event.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    event.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
                case 'Escape':
                    this.sidebarOpen = !this.sidebarOpen;
                    break;
            }
        }
    },
    
    mounted() {
        // Adiciona listener para navegação por teclado
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Auto-detecta se deve esconder sidebar no mobile
        if (window.innerWidth <= 1024) {
            this.sidebarOpen = false;
        }
        
        // Listener para redimensionamento da tela
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024) {
                this.sidebarOpen = false;
            } else {
                this.sidebarOpen = true;
            }
        });
        
        // Animação automática das progress bars quando entrar no slide de resultados
        this.$watch('currentSlide', (newSlide) => {
            if (newSlide === 5) { // Slide de resultados
                setTimeout(() => {
                    const progressBars = document.querySelectorAll('.progress-fill');
                    progressBars.forEach(bar => {
                        bar.style.width = bar.style.width || '0%';
                    });
                }, 100);
            }
        });
    },
    
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('resize', this.handleResize);
    }
}).mount('#app'); 