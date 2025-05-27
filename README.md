# 🛡️ VidaShield - Sistema de Segurança Digital para Clínicas

<div align="center">

![VidaShield Logo](https://img.shields.io/badge/VidaShield-v2.0-00d4aa?style=for-the-badge&logo=shield&logoColor=white)

**Sistema Avançado de Segurança Cibernética para Clínicas Médicas**

[![Deploy](https://img.shields.io/badge/Deploy-Em_Desenvolvimento-FFA500?style=for-the-badge&logo=rocket&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3.6-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

---

### 🎓 **Projeto Integrador - Talento Tech Paraná**
**Disciplina: Projeto Integrador | Área: Infraestrutura de TI, Redes e Cibersegurança**

**Cenário**: Clínica VidaMais – Palmital/PR | **Cliente**: Dr. Rodrigo, 40 anos

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Contexto Acadêmico](#-contexto-acadêmico)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Demonstração](#-demonstração)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [API](#-api)
- [Segurança](#-segurança)
- [Contribuição](#-contribuição)
- [Equipe](#-equipe)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **VidaShield** é uma solução completa de segurança digital desenvolvida especificamente para **clínicas de pequeno porte** que não possuem equipe especializada de TI. O sistema oferece monitoramento em tempo real, detecção de ameaças, gestão de usuários e relatórios avançados de segurança.

### 🎯 Cenário do Projeto

**Empresa**: Clínica VidaMais – Palmital/PR  
**Personagem**: Dr. Rodrigo, 40 anos, proprietário da única clínica médica da cidade

**Desafio**: A clínica sofreu uma tentativa de invasão recentemente. Ela usa um sistema simples de agendamento online, mas não monitora logs de acesso e nem implementa mecanismos para reportar e coibir invasões.

**Dados Locais**: População de 12 mil; 6 clínicas e consultórios ativos; grande volume de prontuários digitais sem controle técnico adequado.

### 🎯 Problemas Identificados

- **Falta de monitoramento** de logs de acesso
- **Ausência de sistema** de detecção de ameaças  
- **Dados sensíveis** de pacientes vulneráveis
- **Necessidade de compliance** LGPD para saúde

### 💡 Solução Oferecida

- Dashboard intuitivo com monitoramento em tempo real
- Sistema de alertas automáticos para ameaças
- Gestão completa de usuários e permissões
- Relatórios detalhados para compliance
- Interface responsiva para acesso mobile
- Implementação plug-and-play

---

## 🎓 Contexto Acadêmico

Este projeto foi desenvolvido como **Projeto Integrador** do curso **Talento Tech Paraná**, promovido pela **UEPG** (Universidade Estadual de Ponta Grossa) em parceria com o **Governo do Estado do Paraná**.

### 📚 Informações do Curso

| **Atributo** | **Detalhes** |
|--------------|--------------|
| **Programa** | Talento Tech Paraná |
| **Disciplina** | Projeto Integrador |
| **Área** | Infraestrutura de TI, Redes e Cibersegurança |
| **Instituição** | UEPG + Governo do Estado do Paraná |
| **Modalidade** | Híbrido (Presencial + EAD) |
| **Duração** | 800h + módulo adicional |
| **Objetivo** | Formação especializada em tecnologia |
| **Certificação** | Certificado de Conclusão + Portfolio |

### 🎯 Competências Desenvolvidas

- **Frontend**: React, TypeScript, Responsive Design
- **Backend**: Node.js, APIs RESTful, Autenticação
- **Database**: PostgreSQL, Supabase, Migrations
- **DevOps**: Deploy, Versionamento, CI/CD
- **Soft Skills**: Trabalho em equipe, Metodologias ágeis

---

## ✨ Funcionalidades

### 🔐 **Autenticação & Segurança**
- [x] Login/Registro com validação segura
- [x] Autenticação Google OAuth 2.0
- [x] Sistema de 2FA (Two-Factor Authentication)
- [x] Proteção contra ataques de força bruta
- [x] Captcha hCaptcha integrado
- [x] Gerenciamento de sessões ativas

### 📊 **Dashboard & Analytics**
- [x] Dashboard premium com gráficos interativos
- [x] Métricas em tempo real do sistema
- [x] Widgets configuráveis
- [x] Análise de tendências e padrões
- [x] KPIs de segurança automatizados

### 🚨 **Monitoramento & Alertas**
- [x] Detecção automática de ameaças
- [x] Sistema de notificações em tempo real
- [x] Alertas por email (integração planejada)
- [x] Push notifications (desenvolvimento futuro)
- [x] Classificação de severidade (baixa → crítica)
- [x] Centro de notificações unificado

### 👥 **Gestão de Usuários**
- [x] CRUD completo de usuários
- [x] Sistema de roles e permissões
- [x] Aprovação de novos usuários
- [x] Histórico de atividades
- [x] Bloqueio automático por suspeita

### 🛡️ **Segurança Avançada**
- [x] Firewall dinâmico com bloqueio de IPs
- [x] Logs detalhados de autenticação
- [x] Análise comportamental de usuários
- [x] Backup automático de dados
- [x] Trilha de auditoria completa

### 📈 **Relatórios & Compliance**
- [x] Relatórios personalizáveis
- [x] Exportação PDF/Excel
- [x] Agendamento automático
- [x] Relatórios de compliance LGPD
- [x] Analytics de performance

---

## 🚀 Tecnologias

### **Frontend**
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=black) | 18.2.0 | Biblioteca para interfaces |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=flat&logo=typescript&logoColor=white) | 5.2.2 | Tipagem estática |
| ![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat&logo=vite&logoColor=white) | 5.0.0 | Build tool moderna |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3.6-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | 3.3.6 | Framework CSS utilitário |
| ![React Router](https://img.shields.io/badge/React_Router-6.30.1-CA4245?style=flat&logo=reactrouter&logoColor=white) | 6.30.1 | Roteamento SPA |

### **Backend & Database**
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| ![Supabase](https://img.shields.io/badge/Supabase-2.45.4-3ECF8E?style=flat&logo=supabase&logoColor=white) | 2.45.4 | Backend-as-a-Service |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql&logoColor=white) | 15 | Banco de dados relacional |
| ![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=nodedotjs&logoColor=white) | 20.x | Runtime JavaScript |

### **APIs & Serviços Integrados**
| Serviço | Versão | Descrição |
|---------|--------|-----------|
| ![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat&logo=google&logoColor=white) | 2.0 | Autenticação social |
| ![hCaptcha](https://img.shields.io/badge/hCaptcha-00D4AA?style=flat&logo=hcaptcha&logoColor=white) | Latest | Proteção anti-bot |
| ![Recharts](https://img.shields.io/badge/Recharts-8884D8?style=flat&logo=react&logoColor=white) | 2.12.7 | Gráficos e visualizações |
| ![Lucide React](https://img.shields.io/badge/Lucide-0A0A0A?style=flat&logo=lucide&logoColor=white) | 0.451.0 | Biblioteca de ícones |
| ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat&logo=reacthookform&logoColor=white) | 7.48.2 | Validação de formulários |

### **Ferramentas & Desenvolvimento**
| Tecnologia | Descrição |
|------------|-----------|
| ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) | Controle de versão |
| ![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat&logo=visualstudiocode&logoColor=white) | Editor de código |
| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white) | Linting de código |
| ![Vite Dev](https://img.shields.io/badge/Vite_Dev-646CFF?style=flat&logo=vite&logoColor=white) | Servidor de desenvolvimento |

---

## 🏗️ Arquitetura

```mermaid
graph TB
    subgraph "Frontend (React + TypeScript)"
        A[Dashboard] --> B[Components]
        B --> C[Services]
        C --> D[Hooks]
        D --> E[Context]
    end
    
    subgraph "Backend (Supabase)"
        F[Auth] --> G[Database]
        G --> H[Storage]
        H --> I[Edge Functions]
        I --> J[Realtime]
    end
    
    subgraph "External Services"
        K[Google OAuth]
        L[hCaptcha]
        M[Email Provider]
        N[Push Notifications]
    end
    
    A --> F
    C --> G
    D --> J
    F --> K
    A --> L
    I --> M
    J --> N
```

### 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base
│   ├── dashboard/      # Componentes do dashboard
│   └── modals/         # Modais e pop-ups
├── pages/              # Páginas da aplicação
├── services/           # Serviços e APIs
├── hooks/              # Custom hooks
├── context/            # Context providers
├── types/              # Definições TypeScript
└── styles/             # Estilos globais
```

---

## 🎬 Demonstração

### 🌐 **Demo Local**
🔗 **Execute localmente:** `npm run dev` → `http://localhost:3001`

### 📱 **Interface Atual**

> 🚧 **Em Desenvolvimento**: Screenshots serão adicionadas após finalização da interface

### 🎯 **Status Atual de Desenvolvimento**

- ✅ **Dashboard Base**: Interface principal implementada
- ✅ **Autenticação**: Sistema de login/registro funcional
- ✅ **Database**: Supabase configurado com tabelas completas
- 🚧 **Frontend Integration**: Conectando interface com backend
- 🚧 **Real-time Features**: Implementando notificações live
- 📋 **Próximas Etapas**: Deploy em produção

---

## 📦 Instalação

### 📋 **Pré-requisitos**

- Node.js 18+ 
- npm ou yarn
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [Google Cloud Console](https://console.cloud.google.com) (para OAuth)
- Conta no [hCaptcha](https://hcaptcha.com) (para proteção anti-bot)
- Git

### 🚀 **Passo a Passo**

1. **Clone o repositório**
```bash
git clone https://github.com/UelitonFOX/vidashield.git
cd vidashield
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.local.example .env.local
```

4. **Configure o Supabase**
```bash
# Execute os scripts SQL no Supabase
- supabase_schema.sql
- supabase_security.sql
```

5. **Execute a aplicação**
```bash
npm run dev
```

🎉 **Aplicação rodando em:** `http://localhost:3001`

> ⚠️ **Nota**: Esta versão ainda não possui deploy em produção. Para testar, execute localmente.

---

## ⚙️ Configuração

### 🔐 **Variáveis de Ambiente**

Crie o arquivo `.env.local` com:

```env
# Supabase Configuration
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Google OAuth (configurar no Supabase)
VITE_GOOGLE_CLIENT_ID=seu_google_client_id

# hCaptcha (ativar no Supabase)
VITE_HCAPTCHA_SITE_KEY=sua_hcaptcha_site_key

# Environment
VITE_APP_ENVIRONMENT=development
```

### 🗄️ **Configuração do Banco**

1. **Crie projeto no Supabase**
2. **Execute os scripts SQL:**
   - `supabase_schema.sql` - Estrutura das tabelas
   - `supabase_security.sql` - Políticas RLS
3. **Configure autenticação Google OAuth**
4. **Ative Realtime nas tabelas necessárias**

### 🔑 **Google OAuth Setup**

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto ou selecione existente
3. Ative Google+ API
4. Configure OAuth Consent Screen
5. Crie credenciais OAuth 2.0
6. Configure URLs autorizadas

---

## 💻 Uso

### 🎯 **Para Clínicas**

1. **Cadastro**: Registre sua clínica no sistema
2. **Configuração**: Configure usuários e permissões
3. **Monitoramento**: Acompanhe métricas de segurança
4. **Alertas**: Receba notificações de ameaças
5. **Relatórios**: Gere relatórios para compliance

### 👨‍💻 **Para Desenvolvedores**

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

### 🧪 **Usuários de Teste**

| Usuário | Email | Senha | Role |
|---------|-------|-------|------|
| Ueliton Ferminno | ueliton.talento.tech@gmail.com | - | admin |
| Administrador | admin@teste.com | - | admin |

> 💡 **Nota**: Usuários criados via sistema de aprovação ou OAuth do Google

---

## 📡 API

### 🔗 **Endpoints Principais**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/dashboard/stats` | Estatísticas do dashboard |
| `GET` | `/api/notifications` | Lista de notificações |
| `GET` | `/api/users` | Lista de usuários |
| `POST` | `/api/auth/login` | Login de usuário |
| `GET` | `/api/threats` | Ameaças detectadas |
| `GET` | `/api/reports` | Relatórios do sistema |

### 📊 **Exemplo de Response**

```json
{
  "success": true,
  "data": {
    "totalUsers": 125,
    "activeUsers": 98,
    "threatsBlocked": 247,
    "systemUptime": 99.97
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔒 Segurança

### 🛡️ **Medidas Implementadas**

- [x] **Autenticação JWT** com refresh tokens
- [x] **2FA** com Google Authenticator
- [x] **Rate Limiting** para APIs
- [x] **SQL Injection** prevenção via RLS
- [x] **XSS Protection** sanitização de inputs
- [x] **CSRF Protection** tokens em requisições
- [x] **Data Encryption** dados sensíveis criptografados
- [x] **Audit Trails** logs completos de ações

### 🔐 **Compliance**

- ✅ **LGPD**: Proteção de dados pessoais (Lei 13.709/2018)
- 🚧 **ISO 27001**: Gestão de segurança da informação (em desenvolvimento)
- 🚧 **CFM**: Normas do Conselho Federal de Medicina (futuro)
- 🚧 **HIPAA**: Padrões internacionais de privacidade (futuro)

---

## 🤝 Contribuição

Adoramos contribuições! Siga os passos:

### 📝 **Como Contribuir**

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Commit** suas mudanças
5. **Push** para a branch
6. **Abra** um Pull Request

### 🎯 **Diretrizes**

- Use TypeScript
- Siga o padrão ESLint
- Adicione testes para novas features
- Documente mudanças no CHANGELOG
- Mantenha commits semânticos

### 🐛 **Reportar Bugs**

Use o [GitHub Issues](https://github.com/UelitonFOX/vidashield/issues) para reportar bugs.

---

## 👥 Equipe

<div align="center">

### 🎓 **Equipe Talento Tech Paraná**

| Membro | Role | LinkedIn | GitHub |
|--------|------|----------|--------|
| **Ueliton Fermino** | Full Stack Developer & Team Lead | [LinkedIn](https://linkedin.com/in/ueliton-fermino) | [@UelitonFOX](https://github.com/UelitonFOX) |
| **Beatriz Delgado** | Frontend Developer & UX/UI Designer | [LinkedIn](#) | [@beatrizdelgado](#) |
| **Camili Machado** | Backend Developer & Database Specialist | [LinkedIn](#) | [@camilimachado](#) |


### 🏆 **Contribuições**

| Contribuidor | Commits | Principais Contribuições |
|-------------|---------|-------------------------|
| Ueliton Fermino | 100+ | Arquitetura, Full Stack, Deploy |
| Beatriz Delgado | 30+ | Interface, Componentes, Design System |
| Camili Machado | 25+ | Database, APIs, Segurança Backend |

### 🎯 **Orientação Acadêmica**

**Talento Tech Paraná**
- Coordenação: UEPG + Governo do Estado do Paraná
- Mentoria técnica: Especialistas da indústria
- Suporte pedagógico: Equipe acadêmica dedicada

</div>

---

## 📜 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2024 VidaShield Team - Talento Tech PR 15

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software")...
```

---

## 🙏 Agradecimentos

### 🎓 **Agradecimentos Especiais**

- **Governo do Estado do Paraná** pelo programa Talento Tech
- **Mentores e Instrutores** pela orientação técnica
- **Colegas de turma** pelo apoio e colaboração
- **Comunidade Open Source** pelas ferramentas utilizadas

### 🏢 **Parceiros do Programa**

- Governo do Estado do Paraná
- Empresas de tecnologia parceiras
- Instituições de ensino apoiadoras

---

<div align="center">

### 🌟 **Se este projeto te ajudou, considere dar uma ⭐!**

[![GitHub stars](https://img.shields.io/github/stars/UelitonFOX/vidashield?style=social)](https://github.com/UelitonFOX/vidashield/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/UelitonFOX/vidashield?style=social)](https://github.com/UelitonFOX/vidashield/network/members)

---

**Desenvolvido com ❤️ pela equipe VidaShield**

**Talento Tech Paraná | 2024**

![Talento Tech](https://img.shields.io/badge/Talento_Tech-Paraná-ff6b35?style=for-the-badge&logo=star&logoColor=white)

</div> 