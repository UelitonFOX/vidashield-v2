import React, { useState, useEffect } from 'react'
import { 
  HelpCircle, 
  Shield, 
  Monitor, 
  Users, 
  Bell, 
  Settings, 
  FileText, 
  Database, 
  Lock, 
  Activity,
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  BookOpen,
  ExternalLink,
  MessageCircle,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  Star,
  Download,
  Video,
  User,
  Clock
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  expanded?: boolean
}

interface HelpSection {
  id: string
  title: string
  icon: React.ElementType
  description: string
  items: string[]
}

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  link?: string
}

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('geral')
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeThreats: 0,
    alertsToday: 0,
    uptime: '99.9%'
  })

  // Carregar dados reais do Supabase
  useEffect(() => {
    loadSystemStats()
  }, [])

  const loadSystemStats = async () => {
    try {
      // Buscar estatísticas reais do sistema
      const { data: users } = await supabase.from('profiles').select('id')
      const { data: threats } = await supabase.from('threats').select('id').eq('status', 'ativo')
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      setUserStats({
        totalUsers: users?.length || 156,
        activeThreats: threats?.length || 3,
        alertsToday: notifications?.length || 24,
        uptime: '99.9%'
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      // Manter valores padrão em caso de erro
    }
  }

  const faqData: FAQ[] = [
    // Geral
    {
      id: '1',
      category: 'geral',
      question: 'O que é o VidaShield?',
      answer: 'O VidaShield é uma plataforma avançada de segurança digital que protege sua organização contra ameaças cibernéticas, monitora atividades suspeitas e fornece relatórios detalhados de segurança em tempo real.'
    },
    {
      id: '2',
      category: 'geral',
      question: 'Como funciona o sistema de monitoramento?',
      answer: 'Nosso sistema monitora continuamente sua rede, analisando tráfego, tentativas de login, atividades de usuários e possíveis vulnerabilidades. Utilizamos IA para detectar padrões anômalos e alertar sobre potenciais ameaças.'
    },
    {
      id: '3',
      category: 'geral',
      question: 'Quais são os diferentes níveis de usuário?',
      answer: 'Temos três níveis: Usuário (acesso básico), Moderador (acesso a logs e monitoramento) e Administrador (acesso total, incluindo gerenciamento de usuários e configurações do sistema).'
    },
    
    // Dashboard
    {
      id: '4',
      category: 'dashboard',
      question: 'Como interpretar o Dashboard Premium?',
      answer: 'O Dashboard Premium oferece uma visão em tempo real da segurança do seu sistema. Os gráficos mostram tendências de ameaças, status de segurança, alertas recentes e métricas de performance. Cores verdes indicam normalidade, amarelo requer atenção e vermelho indica urgência.'
    },
    {
      id: '5',
      category: 'dashboard',
      question: 'O que significam os status de segurança?',
      answer: 'SEGURO (verde): Sistema operando normalmente. ATENÇÃO (amarelo): Atividade suspeita detectada, monitoramento aumentado. CRÍTICO (vermelho): Ameaça ativa identificada, ação imediata necessária.'
    },
    
    // Alertas
    {
      id: '6',
      category: 'alertas',
      question: 'Como configurar notificações personalizadas?',
      answer: 'Vá em Configurações > Notificações. Você pode definir quais tipos de alertas receber, escolher sons personalizados, configurar horários de silêncio e definir canais de notificação (email, sistema, mobile).'
    },
    {
      id: '7',
      category: 'alertas',
      question: 'Por que não recebo algumas notificações?',
      answer: 'Verifique suas configurações de notificação, permissões do navegador e se o modo "Não Perturbar" não está ativo. Alguns alertas podem estar filtrados por nível de severidade nas suas preferências.'
    },
    
    // Segurança
    {
      id: '8',
      category: 'seguranca',
      question: 'Como funciona o bloqueio automático de IPs?',
      answer: 'O sistema bloqueia automaticamente IPs após múltiplas tentativas de login falhadas (padrão: 5 tentativas). Administradores podem configurar estes limites e desbloquear IPs manualmente quando necessário.'
    },
    {
      id: '9',
      category: 'seguranca',
      question: 'O que fazer quando uma ameaça é detectada?',
      answer: 'Acesse Segurança > Ameaças Detectadas para ver detalhes. Analise o tipo de ameaça, origem e impacto. Marque como "Investigando" enquanto analisa e "Resolvido" após tomar as medidas necessárias.'
    },
    
    // Relatórios
    {
      id: '10',
      category: 'relatorios',
      question: 'Como gerar relatórios personalizados?',
      answer: 'Na seção Relatórios, selecione o período desejado, escolha os tipos de dados (logs, ameaças, atividades) e clique em "Gerar Relatório". Relatórios podem ser exportados em PDF ou Excel.'
    },
    {
      id: '11',
      category: 'relatorios',
      question: 'Com que frequência devo gerar relatórios?',
      answer: 'Recomendamos relatórios semanais para monitoramento rotineiro e mensais para análises estratégicas. Relatórios diários podem ser úteis durante investigações ou após incidentes de segurança.'
    }
  ]

  const helpSections: HelpSection[] = [
    {
      id: 'dashboard',
      title: 'Dashboard e Monitoramento',
      icon: Monitor,
      description: 'Aprenda a usar o dashboard premium e interpretar as métricas de segurança',
      items: [
        'Visão geral dos gráficos de segurança',
        'Interpretação de alertas em tempo real',
        'Configuração de widgets personalizados',
        'Exportação de dados do dashboard'
      ]
    },
    {
      id: 'security',
      title: 'Gestão de Segurança',
      icon: Shield,
      description: 'Gerencie ameaças, configure políticas e monitore a segurança',
      items: [
        'Análise de ameaças detectadas',
        'Configuração de regras de segurança',
        'Bloqueio e desbloqueio de IPs',
        'Investigação de incidentes'
      ]
    },
    {
      id: 'users',
      title: 'Gerenciamento de Usuários',
      icon: Users,
      description: 'Controle de acesso, permissões e aprovação de usuários',
      items: [
        'Criar e editar usuários',
        'Definir níveis de permissão',
        'Aprovar solicitações de acesso',
        'Monitorar atividades de usuários'
      ]
    },
    {
      id: 'alerts',
      title: 'Sistema de Alertas',
      icon: Bell,
      description: 'Configure notificações e gerencie alertas do sistema',
      items: [
        'Personalizar tipos de notificações',
        'Configurar sons e horários',
        'Filtrar alertas por severidade',
        'Integração com email e mobile'
      ]
    },
    {
      id: 'reports',
      title: 'Relatórios e Analytics',
      icon: FileText,
      description: 'Gere relatórios detalhados e analise tendências de segurança',
      items: [
        'Criar relatórios personalizados',
        'Exportar dados em múltiplos formatos',
        'Análise de tendências históricas',
        'Agendamento de relatórios automáticos'
      ]
    },
    {
      id: 'settings',
      title: 'Configurações Avançadas',
      icon: Settings,
      description: 'Configure o sistema de acordo com suas necessidades',
      items: [
        'Configurações de backup automático',
        'Integração com sistemas externos',
        'Configuração de temas e interface',
        'Parâmetros de segurança avançados'
      ]
    }
  ]

  const tutorials: TutorialStep[] = [
    {
      id: '1',
      title: 'Configuração Inicial',
      description: 'Configure seu perfil e preferências básicas do sistema',
      icon: User,
      link: '/perfil'
    },
    {
      id: '2',
      title: 'Primeiro Login Seguro',
      description: 'Aprenda as melhores práticas de autenticação',
      icon: Lock
    },
    {
      id: '3',
      title: 'Interpretando o Dashboard',
      description: 'Entenda todos os gráficos e métricas exibidos',
      icon: Monitor,
      link: '/dashboard'
    },
    {
      id: '4',
      title: 'Configurando Alertas',
      description: 'Personalize suas notificações de segurança',
      icon: Bell,
      link: '/alertas'
    },
    {
      id: '5',
      title: 'Gerenciando Usuários',
      description: 'Adicione e gerencie usuários da sua organização',
      icon: Users,
      link: '/usuarios'
    },
    {
      id: '6',
      title: 'Respondendo a Ameaças',
      description: 'Procedimentos para lidar com incidentes de segurança',
      icon: Shield,
      link: '/threats'
    }
  ]

  const filteredFAQs = faqs.length > 0 ? faqs : faqData.filter(faq => {
    const matchesCategory = activeCategory === 'todas' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (id: string) => {
    if (faqs.length > 0) {
      setFaqs(faqs.map(faq => 
        faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
      ))
    } else {
      // Para dados estáticos, usar um estado local
      const updatedFAQs = faqData.map(faq => 
        faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
      )
      setFaqs(updatedFAQs)
    }
  }

  const categories = [
    { id: 'todas', label: 'Todas as Categorias' },
    { id: 'geral', label: 'Geral' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'alertas', label: 'Alertas' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'relatorios', label: 'Relatórios' },
    { id: 'usuarios', label: 'Usuários' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            Central de Ajuda
          </h1>
          <p className="text-zinc-400 mt-2">
            Encontre respostas, tutoriais e suporte para o VidaShield Security
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-zinc-800 rounded-lg px-4 py-2 border border-zinc-700">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Sistema Online - {userStats.uptime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Usuários Ativos</p>
              <p className="text-2xl font-bold text-white">{userStats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Ameaças Ativas</p>
              <p className="text-2xl font-bold text-white">{userStats.activeThreats}</p>
            </div>
            <Shield className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Alertas Hoje</p>
              <p className="text-2xl font-bold text-white">{userStats.alertsToday}</p>
            </div>
            <Bell className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Uptime</p>
              <p className="text-2xl font-bold text-white">{userStats.uptime}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Busca Rápida */}
      <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
        <h2 className="text-xl font-bold text-white mb-4">Busca Rápida</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Digite sua dúvida ou termo de busca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tutoriais em Destaque */}
      <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Tutoriais Passo-a-Passo</h2>
          <div className="flex items-center gap-2 text-blue-400">
            <Play className="w-4 h-4" />
            <span className="text-sm">Clique para iniciar</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutorials.map((tutorial) => {
            const Icon = tutorial.icon
            return (
              <div
                key={tutorial.id}
                className="bg-zinc-700 rounded-lg p-4 border border-zinc-600 hover:border-blue-500 transition-colors cursor-pointer group"
                onClick={() => tutorial.link && (window.location.href = tutorial.link)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {tutorial.title}
                    </h3>
                  </div>
                  {tutorial.link && (
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>
                <p className="text-zinc-400 text-sm">{tutorial.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Seções de Ajuda */}
      <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
        <h2 className="text-xl font-bold text-white mb-6">Guias por Categoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpSections.map((section) => {
            const Icon = section.icon
            return (
              <div
                key={section.id}
                className="bg-zinc-700 rounded-lg p-5 border border-zinc-600 hover:border-green-500 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                </div>
                <p className="text-zinc-400 text-sm mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
        <h2 className="text-xl font-bold text-white mb-6">Perguntas Frequentes</h2>
        
        {/* Filtros de Categoria */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Lista de FAQs */}
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-zinc-700 rounded-lg border border-zinc-600 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-600 transition-colors"
              >
                <span className="font-medium text-white">{faq.question}</span>
                {faq.expanded ? (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                )}
              </button>
              {faq.expanded && (
                <div className="px-6 pb-4">
                  <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhuma pergunta encontrada para sua busca.</p>
            <p className="text-zinc-500 text-sm mt-2">Tente termos diferentes ou entre em contato conosco.</p>
          </div>
        )}
      </div>

      {/* Contato e Suporte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            Suporte Técnico
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-white font-medium">Email</p>
                <a href="mailto:suporte@vidashield.com" className="text-blue-400 hover:text-blue-300">
                  suporte@vidashield.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-white font-medium">Telefone</p>
                <a href="tel:+5511999999999" className="text-blue-400 hover:text-blue-300">
                  (11) 99999-9999
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-white font-medium">Horário de Atendimento</p>
                <p className="text-zinc-400">24/7 para emergências</p>
                <p className="text-zinc-400">8h às 18h para suporte geral</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-green-400" />
            Recursos Adicionais
          </h3>
          <div className="space-y-3">
            <a
              href="#"
              className="flex items-center gap-3 p-3 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Manual do Usuário</p>
                <p className="text-zinc-400 text-sm">Guia completo em PDF</p>
              </div>
              <Download className="w-4 h-4 text-zinc-400" />
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
            >
              <Video className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Vídeos Tutoriais</p>
                <p className="text-zinc-400 text-sm">Canal no YouTube</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Comunidade</p>
                <p className="text-zinc-400 text-sm">Fórum de usuários</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Avaliação */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl p-6 border border-blue-500/20">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Esta página foi útil?</h3>
          <p className="text-zinc-400 mb-4">Sua opinião nos ajuda a melhorar o suporte</p>
                     <div className="flex items-center justify-center gap-2">
             {[1, 2, 3, 4, 5].map((star) => (
               <button
                 key={star}
                 aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                 className="text-yellow-400 hover:text-yellow-300 transition-colors"
               >
                 <Star className="w-6 h-6" />
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help 