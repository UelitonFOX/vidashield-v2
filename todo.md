# TODO.md – Implementação Auth0 no VidaShield

## ✅ Objetivo

Integrar o Auth0 como solução de autenticação centralizada no VidaShield, substituindo autenticação própria do backend e Supabase Auth.

## 🛠️ Tarefas Gerais

* [ ] Criar conta no Auth0
* [ ] Criar Application (SPA) no Auth0
* [ ] Configurar Allowed Callback URLs, Logout URLs, e Web Origins
* [ ] Obter Client ID e Domain do Auth0
* [ ] Configurar ambiente (.env) com variáveis AUTH0\_CLIENT\_ID, AUTH0\_DOMAIN, AUTH0\_CALLBACK\_URL

## 🔐 Backend (Flask)

* [ ] Instalar dependências (authlib, python-jose)
* [ ] Configurar middleware de validação do token JWT do Auth0
* [ ] Refatorar endpoint `/auth/me` para validar JWT do Auth0
* [ ] Criar rota de callback se necessário (/callback)
* [ ] Configurar verificação de roles/claims para controle de acesso

## 🖥️ Frontend (React)

* [ ] Instalar SDK do Auth0 (auth0-react)
* [ ] Configurar provider do Auth0 no App.tsx
* [ ] Refatorar AuthContext para consumir o Auth0 diretamente
* [ ] Alterar fluxo de login/logout para usar Auth0
* [ ] Adicionar proteção de rotas (PrivateRoutes com Auth0)

## 🔒 2FA e Segurança

* [ ] Habilitar Multifactor Authentication (MFA) no Auth0 (Authenticator App)
* [ ] Configurar regras/policies de login no Auth0 Dashboard
* [ ] Habilitar botões de login social (Google opcional)
* [ ] Implementar proteção CSRF/XSRF conforme docs Auth0

## 📝 Testes

* [ ] Testar login e logout no ambiente local
* [ ] Testar validação de token no backend
* [ ] Testar fluxos de erro (token inválido, expiração, sem permissão)
* [ ] Validar 2FA funcionando

## 🚀 Deploy & Ajustes

* [ ] Atualizar README com instruções de Auth0
* [ ] Validar fluxo completo em produção (login -> dashboard)
* [ ] Ajustar rotas públicas e privadas conforme hierarquia de cargos

## 🎯 Meta

Implementar tudo até **23/05** com testes finais dia **22/05**.

## 🔗 Referências

* [Auth0 Quickstart React](https://auth0.com/docs/quickstart/spa/react)
* [Auth0 Quickstart Flask](https://auth0.com/docs/quickstart/backend/python/01-authorization)
* [Auth0 MFA Docs](https://auth0.com/docs/mfa)
* [Auth0 API Tokens](https://auth0.com/docs/secure/tokens/access-tokens/get-access-tokens)

---

📊 **Status atual**: aguardando configuração inicial do Auth0 no dashboard.

