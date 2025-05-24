# 🛡️ VidaShield - Sistema de Segurança Digital para Clínicas

![Logo VidaShield](frontend-adm/public/logo.png)

<!-- 🔗 [Acessar Demonstração Online](https://vidashield.vercel.app) -->

> Projeto Integrador – Talento Tech PR 15  
> Desenvolvido com foco em clínicas de pequeno porte que não possuem equipe de TI.  
> Versão 2.0 - Dashboard moderno e responsivo, segurança avançada e relatórios

[![Made with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Made with Python](https://img.shields.io/badge/Python-14354C?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue?style=for-the-badge)](https://github.com/UelitonFOX/vidashield)

---

## 📌 Visão Geral

**VidaShield** é uma solução completa de segurança digital, desenvolvida como versão final apresentada no Projeto Integrador Talento Tech Paraná 15. Esta versão 2.0 traz um dashboard moderno e responsivo, sistema de autenticação seguro, monitoramento de acessos em tempo real e relatórios detalhados, projetado especificamente para atender às necessidades de clínicas de pequeno porte que não possuem equipe de TI dedicada.

Nossa missão é proteger dados sensíveis de pacientes e funcionários, detectar atividades suspeitas, e fornecer segurança digital automatizada e monitoramento contínuo através de uma interface intuitiva que permita até mesmo usuários sem conhecimento técnico monitorar a segurança digital da clínica.

> **✅ Status do Projeto: Em Desenvolvimento**  
> Este projeto representa o encerramento do ciclo como projeto integrador, com entrega em maio de 2025.

---

## 🆕 Novidades Recentes

### Menu Dropdown de Configurações Rápidas (12/05/2025)
✅ Substituímos o modal de configurações por um menu dropdown intuitivo:
- Acesso rápido às configurações ao passar o mouse sobre o ícone
- Navegação direta para as principais seções do sistema
- Design responsivo e moderno com efeitos visuais
- Melhor experiência de usuário sem interrupção do fluxo de trabalho

### Melhorias de Navegação e Filtros (03/05/2025)
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

### Migração Completa para Supabase Auth (23/05/2025)
✅ Concluímos a migração completa de Auth0 para **Supabase Auth**!
- Sistema de autenticação unificado com login via email/senha e Google OAuth
- Eliminação de dependências externas do Auth0
- Integração nativa com Supabase para melhor performance
- Tokens JWT nativos do Supabase para maior segurança
- Configuração simplificada com menos variáveis de ambiente
- Documentação completa de configuração em `SUPABASE_SETUP.md`

### Migração para Supabase Database (22/04/2025)
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

* **Sistema de Autenticação**:
  * ✓ Tela de login com validação de usuário/senha
  * ✓ Autenticação persistente com armazenamento seguro de tokens
  * ✓ Proteção contra bots com hCaptcha nos formulários
  * ✓ Autenticação OAuth com Google
  * ✓ Proteção CSRF em todas as requisições

* **Banco de Dados**:
  * ✓ Migração completa para PostgreSQL (Supabase)
  * ✓ Suporte para SQLite em ambiente de desenvolvimento
  * ✓ Esquema de segurança com Row Level Security

* **Dashboard Moderno**:
  * ✓ Interface responsiva adaptada para diferentes dispositivos
  * ✓ Layout com barra lateral de navegação
  * ✓ Cards informativos com principais métricas de segurança
  * ✓ Visualização de logs de acesso com filtros e pesquisa
  * ✓ Tema escuro com design moderno e tecnológico

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

* Cadastro de novos usuários
* Tela de login
* Recuperação de senha
* Exportação de relatórios PDF/CSV
* Integração com sistemas externos
* Autenticação com GitHub

---

## ✨ Funcionalidades Entregues na Versão 2.0

* Dashboard moderno com cards informativos e logs filtráveis
* Sistema de navegação inteligente com filtros dinâmicos
* Menu dropdown de configurações rápidas para acesso imediato
* Visualização detalhada de logs com filtros avançados
* Responsividade total em diferentes dispositivos (desktop e mobile)
* Integração completa com Supabase
* Segurança via JWT, CSRF e hCaptcha
* Tema escuro com design tecnológico

---

## 🚀 Funcionalidades Principais

* ✅ **Dashboard interativo** com métricas e indicadores importantes
* ✅ **Visualização de logs** com filtros avançados
* ✅ **Registro de acessos e atividades** com logs detalhados
* ✅ **Detecção de comportamentos suspeitos** para prevenção proativa
* ✅ **Interface totalmente responsiva** adaptada a múltiplos dispositivos
* 🔄 **Gerenciamento de usuários** com diferentes níveis de acesso
* 🔄 **Exportação de relatórios** para análise posterior
* 🔄 **Login seguro** com senhas criptografadas e autenticação OAuth

---

## 📚 Documentação Interna

O VidaShield possui uma documentação interna completa acessível diretamente pelo menu lateral em `Documentação`. Esta seção fornece instruções detalhadas sobre o uso do sistema, suas funcionalidades e melhores práticas de segurança.

![Documentação Interna](docs/screenshots/documentacao.png)
_Tela da documentação interna do sistema VidaShield._

A documentação é organizada por tópicos e inclui:
- Tutoriais passo a passo para tarefas comuns
- Explicações detalhadas das funcionalidades
- Políticas de segurança recomendadas
- Perguntas frequentes e suas respostas
- Glossário de termos técnicos 

O acesso à documentação está disponível para todos os usuários do sistema, independentemente do nível de permissão.

---

## 🔧 Tecnologias Utilizadas

### Frontend

* **React 19** - Biblioteca JavaScript para construção de interfaces
* **TypeScript** - Superset tipado de JavaScript
* **Vite** - Build tool rápida para desenvolvimento moderno
* **TailwindCSS** - Framework CSS utilitário para design responsivo
* **Lucide-react** - Biblioteca de ícones SVG moderna para React
* **React Router DOM** - Roteamento e navegação SPA
* **Chart.js & react-chartjs-2** - Bibliotecas de gráficos interativos
* **Recharts** - Gráficos simples e integrados ao React
* **Axios** - Cliente HTTP para chamadas de API
* **date-fns** - Biblioteca moderna de manipulação de datas
* **jspdf & jspdf-autotable** - Geração de PDFs customizados e com tabelas
* **file-saver** - Exportação de arquivos direto do navegador
* **@hcaptcha/react-hcaptcha** - Integração com hCaptcha para proteção contra bots

### Backend

* **Python 3.11+** - Linguagem de programação do backend
* **Flask 2.3.3** - Framework web minimalista e eficiente
* **SQLAlchemy 2.0.21** - ORM para abstração do banco de dados
* **PostgreSQL/Supabase** - Banco de dados relacional em nuvem Supabase
* **Flask-JWT-Extended** - Tokens seguros para autenticação JWT
* **python-jose** - Manipulação avançada de tokens JWT
* **bcrypt** - Criptografia robusta para senhas
* **Flask-WTF** - Proteção CSRF e validação de formulários
* **Flask-CORS** - Configuração de CORS para comunicação frontend-backend
* **Authlib** - Biblioteca para autenticação OAuth (Google OAuth)

---

### Configuração CORS

O sistema está configurado com CORS (Cross-Origin Resource Sharing) global para permitir requisições entre o frontend e backend:

```python
# No arquivo app.py
from flask_cors import CORS

CORS(app, 
     origins=["http://localhost:3001", "https://vidashield.vercel.app"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-CSRF-TOKEN"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
```

Esta configuração permite:

* Requisições do frontend local (`localhost:3001`) e produção (`vidashield.vercel.app`)
* Envio de credenciais via cookies
* Uso dos cabeçalhos necessários, incluindo o token CSRF
* Suporte a todos os métodos HTTP essenciais (GET, POST, PUT, DELETE, OPTIONS)

> Para personalizar os domínios permitidos, edite a lista de `origins` no `app.py`.

---

## 📁 Estrutura Atualizada do Projeto

```
vidashield/
├── frontend-adm/                # Aplicação React/TypeScript
│   ├── public/                  # Recursos públicos (logo, favicon, etc.)
│   ├── src/                     # Código fonte do frontend
│   │   ├── assets/              # Imagens e ícones centralizados
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── contexts/            # Contextos React (auth, tema, etc.)
│   │   ├── pages/               # Páginas principais do sistema
│   │   ├── services/            # Serviços e API
│   │   └── App.tsx              # Componente principal
│   ├── package.json             # Dependências do frontend
│   └── .env.example             # Exemplo de variáveis de ambiente
│
├── backend/                     # API e lógica do servidor
│   ├── routes/                  # Rotas da API organizadas por funcionalidade
│   ├── migrations/              # Scripts de migração de banco de dados
│   ├── templates/               # Templates para e-mails e outras saídas
│   ├── static/                  # Arquivos estáticos do backend
│   ├── logs/                    # Logs de acesso e erros
│   ├── app.py                   # Ponto de entrada da aplicação
│   ├── models.py                # Definições dos modelos de dados
│   ├── config.py                # Configurações da aplicação
│   ├── utils.py                 # Funções utilitárias
│   ├── log_oauth.py             # Sistema de logs para autenticação OAuth
│   └── requirements.txt         # Dependências do backend
│
├── docs/                        # Documentação e screenshots
│   └── screenshots/             # Capturas de tela do sistema
│
├── supabase_schema.sql          # Esquema do banco de dados para Supabase
├── supabase_security.sql        # Configurações de segurança para Supabase
├── limpeza-repositorio.ps1      # Script de limpeza para máquina zerada
├── LIMPEZA-INSTALACAO.md        # Guia de instalação limpa
└── README.md                    # Este arquivo atualizado
```

---

## 🚀 Instruções de Execução

### Pré-requisitos

* Node.js 16+
* Python 3.11+
* Git

### Frontend

```bash
# Clonar o repositório
git clone https://github.com/UelitonFOX/vidashield.git

# Navegar para o diretório frontend-adm
cd vidashield/frontend-adm

# Instalar dependências
npm install

# Configurar ambiente (criar .env baseado no .env.example)
cp .env.example .env

# Iniciar o servidor de desenvolvimento
npm run dev
```

### Backend

```bash
# Navegar para o diretório backend
cd ../backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente (criar arquivo .env baseado no .env.example)
cp .env.example .env

# Iniciar o servidor
python app.py
```

### Preparação para instalação em máquina zerada

```bash
# Executar script de limpeza para remover cache e arquivos temporários
./limpeza-repositorio.ps1

# Seguir instruções do LIMPEZA-INSTALACAO.md
```

Aplicação disponível em `http://localhost:3001` e API em `http://localhost:5000`

---

## 🛡️ Configuração do Supabase Simplificada

1. Crie seu projeto no Supabase e obtenha as variáveis:

   * `SUPABASE_URL`
   * `SUPABASE_KEY`
   * `DATABASE_URL`

2. Configure seu arquivo `.env` no backend:

```
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@[SEU-HOST].supabase.co:5432/postgres
SUPABASE_URL=https://[SEU-PROJETO].supabase.co
SUPABASE_KEY=[SUA-API-KEY]
HCAPTCHA_SITE_KEY=[SUA-CHAVE-SITE]
HCAPTCHA_SECRET=[SEU-SEGREDO]
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Crie as tabelas no Supabase usando `supabase_schema.sql`.

5. Aplique as políticas de segurança usando `supabase_security.sql`.

> ⚠️ Nunca habilite permissões públicas para tabelas sensíveis. Sempre use o backend como intermediário seguro.

---

## 📊 Dashboard

Esta nova versão apresenta um dashboard **totalmente responsivo**, com navegação fluida e design moderno focado na **experiência do usuário**:

* **Cards de Métricas Principais**:
  * Usuários Ativos/Inativos
  * Logins nas últimas 24h
  * Alertas críticos
  * Tentativas de invasão bloqueadas
  * Cards clicáveis para navegação rápida com filtros pré-aplicados

* **Menu Dropdown de Configurações**:
  * Acesso instantâneo ao passar o mouse sobre o ícone de configurações
  * Links diretos para configurações do sistema, usuários, relatórios e documentação
  * Design contextual com ícones específicos para cada seção
  * Efeitos visuais de hover para melhor interatividade

* **Sistema de Navegação Inteligente**:
  * Clique nos cards para acessar páginas com filtros já aplicados
  * Indicadores visuais de interatividade nos cards
  * Redirecionamento contextual baseado no tipo de métrica

* **Sistema de Filtros Avançados**:
  * Filtros por tipo de log, incluindo tentativas bloqueadas
  * Filtros por data com suporte a diferentes formatos de timezone
  * Busca por texto em usuários, ações e IPs
  * Botões "Aplicar Filtros" que aparecem dinamicamente

* **Visualização de Logs**:
  * Tabela detalhada de atividades do sistema
  * Organização por data e hora das ocorrências
  * Filtros contextuais para análise específica
  * Interface responsiva adaptada a diferentes dispositivos

---

## 📷 Galeria de Telas

Abaixo apresentamos uma galeria visual completa com capturas de tela do sistema **VidaShield**, incluindo diferentes seções, gráficos, dashboards e páginas administrativas.

| Nome da Página                 | Screenshot                                                     |
|---------------------------------|---------------------------------------------------------------|
| Dashboard Principal             | ![Dashboard](docs/screenshots/dashboard.png)                 |
| Gráfico de Barras Neon          | ![Gráfico de Barras](docs/screenshots/dashboard_grafico_barras.png) |
| Gráfico de Linhas Neon          | ![Gráfico de Linhas](docs/screenshots/dashboard_grafico_linhas.png) |
| Gráfico de Área Neon            | ![Gráfico de Área](docs/screenshots/dashboard_grafico_area.png) |
| Estatísticas                    | ![Estatísticas](docs/screenshots/estatisticas.png)           |
| Usuários                        | ![Usuários](docs/screenshots/usuarios.png)                   |
| Logs de Acesso                  | ![Logs](docs/screenshots/logs.png)                           |
| Alertas de Segurança            | ![Alertas](docs/screenshots/alertas.png)                     |
| Relatórios                      | ![Relatórios](docs/screenshots/relatorios.png)               |
| Exportações                     | ![Exportações](docs/screenshots/exportacoes.png)             |
| Configurações do Sistema        | ![Configurações do Sistema](docs/screenshots/configuracoes_sistema.png) |
| Configurações de Segurança      | ![Configurações de Segurança](docs/screenshots/configuracoes_seguranca.png) |
| Configurações de Notificações   | ![Configurações de Notificações](docs/screenshots/configuracoes_notificacoes.png) |
| Perfil de Usuário               | ![Perfil de Usuário](docs/screenshots/configuracoes_perfil_usuario.png) |
| Documentação do Sistema         | ![Documentação](docs/screenshots/documentacao.png)           |
| Central de Ajuda                | ![Central de Ajuda](docs/screenshots/ajuda.png)              |
| Ajuda - Alertas                 | ![Ajuda sobre Alertas](docs/screenshots/ajuda_alerta.png)    |
| Ajuda - Automação               | ![Ajuda sobre Automação](docs/screenshots/ajuda_automacao.png) |
| Ajuda - Usuários Bloqueados     | ![Ajuda sobre Bloqueios](docs/screenshots/ajuda_bloqueados.png) |
| Ajuda - Contato com Suporte     | ![Ajuda - Suporte](docs/screenshots/ajuda_contato_suporte.png) |

> **Observação:** Certifique-se que as imagens estejam presentes na pasta `docs/screenshots` e com os nomes corretos em minúsculo conforme listados acima.  
> Caso utilize o GitHub, a tabela e imagens funcionarão corretamente na visualização Markdown da plataforma.

---

> **Observação**: Todas as capturas refletem a versão atualizada do VidaShield 2.0 com design responsivo, tema escuro e interface tecnológica.

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
* **Ueliton Fermino (Fox)**
* **Beatriz Delgado** 
* **Camili Machado** 

> Projeto Integrador – Talento Tech PR 15 – Encerramento do ciclo

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## ♿ Acessibilidade

O VidaShield foi desenvolvido com atenção às boas práticas de acessibilidade:

- Todos os botões possuem `aria-label` e `title` descritivos
- Campos de formulário associados corretamente com `label` e `htmlFor`
- Navegação via teclado garantida
- Compatível com leitores de tela como NVDA e JAWS
- Indicadores visuais e semânticos para ações importantes

---

![Logo Talento Tech PR](frontend-adm/public/tt_vsh.png)

© 2024 VidaShield - Todos os direitos reservados

---

## Ícones

O projeto utiliza ícones do [Lucide](https://lucide.dev/) através do pacote lucide-react.

Para usar os ícones, importe-os de `../assets/icons`:

```jsx
import { Dashboard, Users, CriticalAlerts } from "../assets/icons";

<Dashboard className="w-6 h-6 text-green-400" />
```

Todos os ícones estão centralizados em `/src/assets/icons/index.ts` para facilitar manutenção.

## Desenvolvimento

```bash
npm install
npm run dev
``` 