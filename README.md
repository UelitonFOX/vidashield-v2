# 🛡️ VidaShield - Sistema de Segurança Digital para Clínicas

![Logo VidaShield](frontend/public/logo.png)

> Projeto Integrador – Talento Tech PR 15  
> Desenvolvido com foco em clínicas de pequeno porte que não possuem equipe de TI.  
> Versão 2.0 - Dashboard moderno e responsivo, segurança avançada e relatórios

[![Made with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Made with Python](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)](https://github.com/UelitonFOX/vidashield)

---

## 📌 Visão Geral

**VidaShield** é uma solução completa de segurança digital, desenvolvida como parte do Projeto Integrador Talento Tech Paraná. Esta versão 2.0 traz um dashboard moderno e responsivo, sistema de autenticação seguro, monitoramento de acessos em tempo real e relatórios detalhados, projetado especificamente para atender às necessidades de clínicas de pequeno porte que não possuem equipe de TI dedicada.

Nossa missão é proteger dados sensíveis de pacientes e funcionários, detectar atividades suspeitas, e fornecer uma interface intuitiva que permita até mesmo usuários sem conhecimento técnico monitorar a segurança digital da clínica.

> **⚠️ Status do Projeto: Em Desenvolvimento Ativo**  
> Este projeto está sendo ativamente desenvolvido como parte do Projeto Integrador Talento Tech PR. Algumas funcionalidades descritas estão em processo de implementação.

---

## 🆕 Novidades Recentes

### Melhorias de Navegação e Filtros (20/05/2025)
✅ Implementamos melhorias na navegação e sistema de filtros:
- Cards do Dashboard transformados em links clicáveis para navegação rápida
- Redirecionamento inteligente com filtros pré-aplicados nas páginas de destino
- Adição de filtro exclusivo para "Tentativas de Login Bloqueadas"
- Botões "Aplicar Filtros" nas páginas que aparecem apenas quando existem filtros selecionados
- Correção do comportamento de filtros aplicados via URL
- Melhoria na comparação de datas para compatibilidade de timezones

### Implementação de Proteção CSRF (03/05/2025)
✅ Adicionamos proteção completa contra ataques CSRF:
- Implementação usando Flask-WTF para gerenciamento de tokens CSRF
- Tokens automaticamente enviados em requisições não seguras (POST, PUT, DELETE)
- Verificação no backend para garantir autenticidade das solicitações
- Integração completa com hCaptcha e Google OAuth

### Migração para Supabase (22/08/2024)
✅ Concluímos a migração do banco de dados local SQLite para o **Supabase PostgreSQL**!
- Melhor performance e escalabilidade para suportar mais usuários
- Infraestrutura em nuvem para disponibilidade 24/7
- Backups automáticos para segurança dos dados
- Suporte a políticas de segurança avançadas (RLS)
- Compatibilidade com SQLAlchemy mantida para transição suave

### Reforço de Segurança com hCaptcha
✅ Implementamos proteção **hCaptcha** nas telas de login e registro:
- Proteção eficaz contra ataques automatizados e bots
- Verificação invisível para não afetar a experiência do usuário
- Validação no backend para garantir autenticidade das solicitações

### Integração Completa com Supabase (Setembro/2024)
✅ Concluímos a integração total com Supabase:
- Modernização da estrutura de dados com UUID para IDs
- Implementação de Row Level Security (RLS) para proteção avançada por usuário
- Políticas de acesso baseadas em função (admin, gerente, usuário)
- Sistema de tipagem forte para todas as chamadas de API
- Correção de incompatibilidades entre tipos numéricos e UUID

### Arquitetura de Serviços API Tipados (Setembro/2024)
✅ Refatoramos completamente os serviços de API:
- Criação de interfaces TypeScript para todas as entidades (User, Alert, Log, etc.)
- Organização de serviços API por funcionalidade (authService, usersService, etc.)
- Tipagem forte para chamadas de API, eliminando "unknown" responses
- Interceptores para tratamento automático de tokens e erros
- Mapeamento automático entre formatos do backend e frontend

---

## ✅ Funcionalidades Já Implementadas

* **Sistema de Autenticação Completo**:
  * ✓ Tela de login com validação de usuário/senha
  * ✓ Cadastro de novos usuários
  * ✓ Recuperação de senha via e-mail
  * ✓ Autenticação persistente com armazenamento seguro de tokens
  * ✓ Proteção contra bots com hCaptcha nos formulários
  * ✓ Autenticação OAuth com Google e GitHub
  * ✓ Proteção CSRF em todas as requisições

* **Banco de Dados**:
  * ✓ Migração completa para PostgreSQL (Supabase)
  * ✓ Suporte para SQLite em ambiente de desenvolvimento
  * ✓ Esquema de segurança com Row Level Security

* **Dashboard Moderno**:
  * ✓ Interface responsiva adaptada para diferentes dispositivos
  * ✓ Layout com barra lateral de navegação
  * ✓ Cards informativos com principais métricas de segurança
  * ✓ Gráfico interativo de acessos com filtros de período (7, 15, 30 dias)
  * ✓ Seção de alertas recentes com classificação por severidade

* **Backend Estruturado**:
  * ✓ API RESTful para comunicação segura
  * ✓ Endpoints protegidos com autenticação JWT
  * ✓ Armazenamento seguro de senhas com bcrypt
  * ✓ Logging de atividades de acesso
  * ✓ Sistema de logs para rastreamento de autenticação OAuth
  * ✓ Proteção CSRF com Flask-WTF
  * ✓ Configuração CORS abrangente para todas as rotas

---

## 🔜 Próximos Passos (Em Desenvolvimento)

As seguintes funcionalidades estão em desenvolvimento ativo:

* 🔄 **Sistema de Alertas em Tempo Real** - Notificações push sobre eventos de segurança
* 🔄 **Detecção Avançada de Comportamentos Suspeitos** - Algoritmos para identificação de anomalias
* 🔄 **Módulo de Gerenciamento de Usuários** - Interface administrativa para gestão de acessos
* 🔄 **Exportação de Relatórios** - Geração de relatórios em PDF/CSV para análise offline
* 🔄 **Integração com Sistemas Externos** - Conexão com outros sistemas da clínica

---

## ✨ Funcionalidades Planejadas (v2.0)

* ✅ **Dashboard completamente redesenhado** com UI moderna e responsiva
* ✅ **Gráficos interativos** de acessos com filtros de período (7, 15 e 30 dias)
* ✅ **Painéis detalhados** com estatísticas de usuários, tentativas de invasão e alertas
* ✅ **Autenticação OAuth** com Google e GitHub para login seguro e simplificado
* ✅ **Design responsivo** que funciona em desktop, tablet e mobile
* ✅ **Tema escuro** com paleta de cores profissional para menor fadiga visual
* 🔄 **Sistema de alertas em tempo real** com notificações importantes

---

## 🚀 Funcionalidades Principais

* ✅ **Login seguro** com senhas criptografadas e autenticação OAuth
* ✅ **Dashboard interativo** com métricas e indicadores importantes
* ✅ **Gráficos analíticos** desenvolvidos com Recharts
* ✅ **Sistema de alertas** com classificações de severidade
* ✅ **Registro de acessos e atividades** com logs detalhados
* ✅ **Detecção de comportamentos suspeitos** para prevenção proativa
* ✅ **Gerenciamento de usuários** com diferentes níveis de acesso
* ✅ **Exportação de relatórios** para análise posterior

---

## 🔧 Tecnologias Utilizadas

### Frontend
* `React` - Biblioteca JavaScript para construção de interfaces
* `TypeScript` - Superset tipado de JavaScript
* `Recharts` - Biblioteca de gráficos para React
* `React Icons` - Pacote de ícones SVG
* `React Router` - Roteamento para navegação na aplicação
* `@hcaptcha/react-hcaptcha` - Integração com hCaptcha para proteção contra bots

### Backend
* `Python 3.11+` - Linguagem de programação do backend
* `Flask` - Framework web minimalista e eficiente
* `PostgreSQL/Supabase` - Banco de dados relacional em nuvem
* `SQLAlchemy` - ORM para abstração do banco de dados 
* `JWT` - Tokens seguros para autenticação
* `bcrypt` - Criptografia robusta para senhas
* `hcaptcha` - Biblioteca para verificação de tokens do hCaptcha
* `Authlib` - Biblioteca para implementação OAuth

---

## 📁 Estrutura do Projeto

```
vidashield/
├── frontend/              # Aplicação React/TypeScript
│   ├── public/            # Recursos públicos (logo, favicon)
│   ├── src/               # Código fonte do frontend
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos React (auth, tema)
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços e API
│   │   └── App.tsx        # Componente principal
│   └── package.json       # Dependências do frontend
│
├── backend/               # API e lógica do servidor
│   ├── routes/            # Rotas da API organizadas por funcionalidade
│   ├── migrations/        # Scripts de migração de banco de dados
│   ├── templates/         # Templates para e-mails e outras saídas
│   ├── app.py             # Ponto de entrada da aplicação
│   ├── models.py          # Definições dos modelos de dados
│   ├── config.py          # Configurações da aplicação
│   └── requirements.txt   # Dependências do backend
│
└── README.md              # Este arquivo
```

---

## 📊 Dashboard

O dashboard do VidaShield oferece uma visão clara e abrangente da segurança digital da clínica:

* **Cards de Métricas Principais**:
  * Usuários Ativos/Inativos
  * Logins nas últimas 24h
  * Alertas críticos
  * Tentativas de invasão bloqueadas
  * Relatórios exportados
  * Cards clicáveis para navegação rápida com filtros pré-aplicados

* **Sistema de Navegação Inteligente**:
  * Clique nos cards para acessar páginas com filtros já aplicados
  * Indicadores visuais de interatividade nos cards
  * Redirecionamento contextual baseado no tipo de métrica

* **Sistema de Filtros Avançados**:
  * Filtros por tipo de log, incluindo tentativas bloqueadas
  * Filtros por data com suporte a diferentes formatos de timezone
  * Busca por texto em usuários, ações e IPs
  * Botões "Aplicar Filtros" que aparecem dinamicamente

* **Gráfico de Acessos**:
  * Visualização de barras para acessos diários
  * Linha acumulativa para tendências
  * Filtros por período (7, 15 e 30 dias)
  * Tooltips interativos com detalhes

* **Painel de Alertas Recentes**:
  * Alertas classificados por severidade
  * Timestamp de ocorrência
  * Detalhes do evento

---

## 🔒 Segurança

O VidaShield foi projetado com foco em segurança:

* Senhas armazenadas com hash seguro (bcrypt)
* Autenticação JWT com expiração de tokens
* Proteção contra ataques de força bruta
* Detecção de padrões suspeitos de acesso
* Logs detalhados para auditoria
* Sanitização de dados em todas as entradas
* Proteção contra bots com hCaptcha nos formulários de autenticação
* Proteção CSRF em todas as requisições não seguras
* CORS configurado corretamente para permitir comunicação frontend-backend
* Banco de dados PostgreSQL com políticas de acesso (RLS)

### Proteção CSRF

O sistema implementa proteção CSRF (Cross-Site Request Forgery) para prevenir ataques de requisição forjada:

* **Tokens CSRF** gerados pelo servidor e enviados ao cliente
* **Verificação automática** de tokens em todas as requisições não seguras (POST, PUT, DELETE)
* **Integração no frontend** para incluir tokens em cabeçalhos `X-CSRF-TOKEN`
* **Configuração via Flask-WTF** para gerenciamento integrado com Flask
* **Endpoint especial** `/api/auth/csrf-token` para obtenção de novos tokens

Para habilitar a proteção CSRF, a configuração já está incluída no projeto. Não é necessário nenhuma alteração adicional além de:

```bash
# Instalar Flask-WTF
pip install flask-wtf

# Atualizar requirements.txt
pip freeze > requirements.txt
```

### Integração com hCaptcha

Para aumentar a segurança durante a autenticação, integramos o hCaptcha nas telas de login e registro:

* **Proteção contra bots** em formulários de login e registro
* **Verificação invisível** para melhor experiência do usuário
* **Verificação no backend** dos tokens de captcha antes de processar a autenticação
* **Configuração simples** via variáveis de ambiente:
  ```
  HCAPTCHA_SITE_KEY=[SUA-CHAVE-SITE]
  HCAPTCHA_SECRET=[SEU-SEGREDO]
  ```

> ⚠️ **Importante**: As chaves de teste do hCaptcha devem ser substituídas por chaves reais em ambiente de produção. Para desenvolvimento, as chaves de teste permitem validação mesmo sem confirmar o captcha.

### Configuração CORS

O sistema está configurado com CORS (Cross-Origin Resource Sharing) global para permitir requisições entre o frontend e backend:

```python
# No arquivo app.py
CORS(app, 
     origins=["http://localhost:3000", "https://vidashield.vercel.app"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-CSRF-TOKEN"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
```

Esta configuração:
- Permite requisições do frontend (localhost:3000 e o domínio de produção)
- Habilita o envio de credenciais em cookies
- Permite os cabeçalhos necessários, incluindo o token CSRF
- Suporta todos os métodos HTTP necessários

Para personalizar os domínios permitidos, edite a lista de `origins` no arquivo `app.py`.

### Configuração do Supabase

Para conectar sua instância ao Supabase, configure as seguintes variáveis de ambiente:

```
DATABASE_URL=postgres://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_KEY=[YOUR_SUPABASE_KEY]
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js 16+
* Python 3.11+
* Git

### Frontend
```bash
# Clonar o repositório
git clone https://github.com/UelitonFOX/vidashield.git

# Navegar para o diretório frontend
cd vidashield/frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

### Backend
```bash
# Navegar para o diretório backend
cd ../backend

# Criar ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente (criar arquivo .env baseado no .env.example)

# Iniciar o servidor
python app.py
```

A aplicação estará disponível em `http://localhost:3000` e a API em `http://localhost:5000`.

---

## 📝 Como Contribuir

Se você deseja contribuir com o desenvolvimento do VidaShield, siga os passos abaixo:

1. Faça um fork do repositório
2. Clone o seu fork: `git clone https://github.com/seu-usuario/vidashield.git`
3. Crie uma branch para sua feature: `git checkout -b minha-nova-feature`
4. Faça suas alterações e commit: `git commit -m 'Adiciona nova feature'`
5. Envie para o GitHub: `git push origin minha-nova-feature`
6. Abra um Pull Request no repositório original

Agradecemos antecipadamente por suas contribuições!

---

## 🧠 Desenvolvido por

**Equipe VidaShield**:
* **Ueliton Fermino (Fox)** - Desenvolvedor Full Stack
* **Beatriz Delgado** - UX/UI e Frontend
* **Camili Machado** - Backend e Segurança

> Projeto Integrador – Talento Tech PR 15

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

![Logo Talento Tech PR](frontend/public/images/talento-tech.png)

© 2024 VidaShield - Todos os direitos reservados 

---

## 📸 Screenshots

### Tela de Login
![Tela de Login](docs/screenshots/login-screen.png)
*Interface de login moderna e segura com opção de autenticação via Google.*

### Dashboard Principal
![Dashboard Principal](docs/screenshots/dashboard-main.png)
*Dashboard com métricas importantes, gráfico interativo de acessos e alertas recentes.*

### Gráfico de Acessos Interativo
![Gráfico de Acessos](docs/screenshots/access-chart.png)
*Gráfico interativo mostrando acessos diários com linha de acumulação e filtros de período.*

---

## 🚀 Utilizando Supabase como Banco de Dados (PostgreSQL)

1. Crie um projeto no Supabase e obtenha as variáveis:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `DATABASE_URL` (string de conexão PostgreSQL)

2. No arquivo `backend/.env`, configure:

```
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@[SEU-HOST].supabase.co:5432/postgres
SUPABASE_URL=https://[SEU-PROJETO].supabase.co
SUPABASE_KEY=[SUA-API-KEY]
HCAPTCHA_SITE_KEY=[SUA-CHAVE-SITE]
HCAPTCHA_SECRET=[SEU-SEGREDO]
```

3. Instale as dependências do backend, incluindo o PostgreSQL:

```
pip install -r requirements.txt
pip install psycopg2-binary hcaptcha
```

4. Se for necessário criar as tabelas no Supabase, execute o SQL disponível em `supabase_schema.sql`:

```bash
# Acesse o SQL Editor no painel do Supabase e importe/execute o arquivo SQL
# Ou use a CLI do Supabase para executar o script
```

5. Teste a conexão e rode o backend:

```bash
# Teste a conexão
python backend/test_db_connection.py

# Execute o backend
python backend/app.py
```

## 🔒 Segurança do Supabase

Para garantir a segurança das tabelas e dados no Supabase, siga estas recomendações:

1. **Desabilitar Permissões Públicas**:
   - Acesse o painel do Supabase > API > Tables & Views
   - Para cada tabela (`user` e `alert`), acesse a aba "Auth"
   - Desmarque todas as permissões para o role "anon" (SELECT, INSERT, UPDATE, DELETE)
   - Mantenha apenas permissões para `authenticated` e `service_role`

2. **Aplicar Configurações via SQL**:
   - Use o script `supabase_security.sql` para aplicar as configurações de segurança:
   ```bash
   # No SQL Editor do Supabase, execute:
   cat supabase_security.sql | psql [SUA-DATABASE-URL]
   ```

3. **Row Level Security (Opcional)**:
   - Para segurança avançada, considere ativar o RLS nas tabelas
   - Isso permite controlar o acesso por linha com base no usuário autenticado
   - Exemplos de políticas estão incluídos no arquivo `supabase_security.sql`

> ⚠️ **Atenção**: Nunca habilite permissões públicas para dados sensíveis. Use sempre a conexão autenticada via backend para operações no banco de dados.

---

> **Observação**: Se estiver usando o SDK do Supabase no frontend, certifique-se de que ele esteja configurado para usar o token JWT adequado para autenticação.

--- 