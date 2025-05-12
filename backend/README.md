# VidaShield API (Branch Notebook)

Backend da aplicação VidaShield, desenvolvido em Flask com SQLAlchemy. Esta branch **notebook** está configurada para usar **PostgreSQL via Supabase** como banco de dados principal.

## Configuração do Ambiente

### Requisitos

- Python 3.8+
- PostgreSQL (via Supabase)
- Pacotes Python listados em `requirements.txt`

### Instalação

1. Clone o repositório e mude para a branch notebook
   ```bash
   git clone https://github.com/seu-usuario/vidashield_new.git
   cd vidashield_new
   git checkout notebook
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure o arquivo `.env` usando o exemplo `.env.example` como base

## Banco de Dados

### Supabase (PostgreSQL)

Esta branch está configurada para usar PostgreSQL através do Supabase como banco de dados principal.

#### Configuração do Supabase

Para configurar o Supabase, crie um arquivo `.env` na raiz com as seguintes informações:

```
# Supabase
SUPABASE_URL=https://seu-projeto-ref.supabase.co
SUPABASE_KEY=sua-chave-service-role
SUPABASE_ANON_KEY=sua-chave-anonima

# Banco de Dados PostgreSQL
DATABASE_URL=postgresql://postgres.seu-projeto-ref:sua-senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

#### Modelos e UUIDs

Todos os modelos do sistema utilizam UUIDs como chaves primárias para garantir compatibilidade com o Supabase/PostgreSQL. A implementação usa um tipo personalizado `UUIDType` que funciona tanto com PostgreSQL quanto com SQLite para desenvolvimento local.

### SQLite (Desenvolvimento Alternativo)

Para desenvolvimento offline sem Supabase, você pode configurar o SQLite modificando o arquivo `.env`:

```
# Usar SQLite para desenvolvimento local
DATABASE_URL='sqlite:///app.db'
```

## Migrações

O diretório `migrations` contém scripts para migração entre diferentes bancos de dados:

- `migrate_alert_id_to_uuid.py`: Migra a tabela `alert` para usar UUID como chave primária
- `sync_with_supabase.py`: Sincroniza o esquema do banco de dados local com o Supabase
- `postgres_migration.sql`: Script SQL para migração direta das tabelas para PostgreSQL
- `add_email_verified.py`: Adiciona a coluna `email_verified` à tabela de usuários

Para executar uma migração específica:

```bash
python migrations/[script].py
```

## Inicialização

Para iniciar o servidor:

```bash
python app.py
```

## Estrutura do Projeto

- `app.py`: Ponto de entrada do aplicativo, contém a configuração do Flask
- `config.py`: Configurações do aplicativo
- `models.py`: Definição dos modelos de dados usando SQLAlchemy
- `routes/`: Contém as rotas da API
  - `auth.py`: Autenticação e registro
  - `user.py`: Gestão de usuários 
  - `alerts.py`: Gestão de alertas
- `utils.py`: Funções utilitárias
- `log_oauth.py`: Funções para logging de eventos de autenticação OAuth

## API Endpoints

### Autenticação

- `POST /api/auth/register` - Registro de novos usuários
- `POST /api/auth/login` - Login de usuários
- `GET /api/auth/logout` - Logout de usuários
- `GET /api/auth/google` - Iniciar autenticação Google OAuth
- `GET /api/auth/google/callback` - Callback da autenticação Google OAuth

### Usuários

- `GET /api/users` - Listar usuários
- `GET /api/users/<id>` - Obter usuário específico
- `PUT /api/users/<id>` - Atualizar usuário
- `DELETE /api/users/<id>` - Remover usuário

### Alertas

- `GET /api/alerts` - Listar alertas
- `POST /api/alerts` - Criar alerta
- `GET /api/alerts/<id>` - Obter alerta específico
- `PUT /api/alerts/<id>` - Atualizar alerta
- `DELETE /api/alerts/<id>` - Remover alerta
- `POST /api/alerts/<id>/resolve` - Resolver alerta

## Segurança

- JWT para autenticação e autorização
- Google OAuth integrado
- Validação de dados de entrada
- Logs de atividades de autenticação

## Logs

Os logs da aplicação são salvos na pasta `logs/`. Você pode ajustar o nível de log no arquivo `config.py`.

## Solução de Problemas

### Erro de Conexão com PostgreSQL

Se estiver enfrentando problemas com a conexão PostgreSQL:

1. Verifique se a senha no `DATABASE_URL` está formatada corretamente
2. Confirme que o ambiente suporta IPv6 ou use a URL do pooler (aws-0-...)
3. Verifique as políticas de firewall da sua rede

### Problemas com Tabelas

Se as tabelas não estiverem sendo criadas corretamente:

```python
from app import app, db
with app.app_context():
    db.create_all()
```

## Diferenças com a Branch Main

A branch **notebook** contém apenas o backend do VidaShield, com as seguintes diferenças:

1. Contém apenas o **código do backend**, sem o frontend React
2. Está **configurada para usar PostgreSQL via Supabase** por padrão
3. Possui uma estrutura de diretórios simplificada e centralizada na raiz
4. Ideal para desenvolvimento e teste separado do backend

Para trabalhar com o projeto completo (frontend + backend), use a branch `main`.

## Ambiente de Produção

Para produção, certifique-se de:

1. Configurar `FLASK_ENV='production'`
2. Usar o PostgreSQL via Supabase como banco de dados
3. Configurar corretamente as variáveis de segurança (JWT_SECRET_KEY, SECRET_KEY)
4. Usar um servidor WSGI como Gunicorn 