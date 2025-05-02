# VidaShield Backend

Este é o backend do sistema VidaShield para monitoramento e proteção de contas de usuários.

## Guia de Inicialização

### Iniciando o Backend

Para iniciar o servidor backend, **sempre** use o script `start.py` que configura corretamente o ambiente:

```bash
# Na pasta backend
python start.py --debug
```

### Opções disponíveis:

- `--env dev`: Usar SQLite local (padrão)
- `--env prod`: Usar PostgreSQL/Supabase (requer configuração no .env)
- `--port 5000`: Definir porta (padrão: 5000)
- `--debug`: Ativar modo de debug
- `--sync-admin`: Sincronizar usuário admin com Supabase (apenas para ambiente prod)

## Iniciando o Frontend

Para iniciar o cliente React:

```bash
# Na pasta frontend
npm start
```

## Solução de problemas comuns

### Erro CORS

Se você encontrar erros de CORS como este:

```
Access to XMLHttpRequest at 'http://localhost:5000/api/alerts?page=1&limit=10' from origin 'http://localhost:3000' has been blocked by CORS policy
```

Certifique-se de:
1. O servidor backend está rodando na porta 5000
2. O frontend está rodando na porta 3000
3. Os dois serviços foram iniciados corretamente

### Erros de banco de dados

Se ocorrerem erros ao conectar com o banco de dados:

1. Verifique se o arquivo `.env` está configurado corretamente
2. Para ambiente local, o SQLite deve estar funcionando corretamente
3. Para ambiente de produção, verifique se a conexão com o Supabase está configurada

## Principais endpoints da API

- `/api/auth/login`: Login com email/senha
- `/api/auth/google`: Login com Google OAuth
- `/api/auth/me`: Obter dados do usuário atual
- `/api/dashboard/data`: Obter dados do dashboard
- `/api/alerts`: Obter alertas
- `/api/users`: Listar usuários
- `/api/logs`: Obter logs do sistema
- `/api/settings`: Obter/atualizar configurações

## Verificação de status

Para verificar se a API está funcionando corretamente, acesse:

```
http://localhost:5000/ping
``` 