# 🛡️ VidaShield - Guia de Configuração Local

Este guia ajudará você a configurar o ambiente de desenvolvimento local do VidaShield.

## 📋 Pré-requisitos

- **Node.js** 16+ e npm
- **Python** 3.11+
- **Git**

## 🚀 Configuração Rápida

### 1. Clone o repositório

```bash
git clone https://github.com/UelitonFOX/vidashield.git
cd vidashield
```

### 2. Configure as variáveis de ambiente

#### Backend (.env)

```bash
# Copie o arquivo de exemplo
cp backend/.env.example backend/.env

# Edite o arquivo backend/.env e configure:
# - Para usar SQLite local, mantenha: DATABASE_URL=sqlite:///app.db
# - Para usar PostgreSQL/Supabase, configure as credenciais
```

#### Frontend (.env)

```bash
# Copie o arquivo de exemplo
cp frontend-adm/.env.example frontend-adm/.env

# O arquivo já está configurado para desenvolvimento local
# Não precisa alterar nada para testes básicos
```

### 3. Inicie o ambiente de desenvolvimento

#### Windows (PowerShell)

```powershell
# Execute como Administrador se necessário
.\start-dev.ps1
```

#### Linux/Mac

```bash
chmod +x start-dev.sh
./start-dev.sh
```

### 4. Acesse o sistema

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000/api
- **Documentação API**: http://localhost:5000/api

## 🔧 Configuração Manual

Se preferir configurar manualmente:

### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor
python app.py
```

### Frontend

```bash
cd frontend-adm

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🗄️ Banco de Dados

### SQLite (Padrão para desenvolvimento)

O sistema criará automaticamente um arquivo `app.db` no diretório `backend/` na primeira execução.

#### Criar dados de teste

Para facilitar o desenvolvimento, você pode criar dados de teste:

```bash
cd backend
python init_db.py
```

Isso criará:
- Usuário admin: `admin@vidashield.com` / senha: `admin123`
- Outros usuários de teste com senha: `senha123`
- Alertas e logs de exemplo

### PostgreSQL/Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL:
   - `supabase_schema.sql` - Estrutura das tabelas
   - `supabase_security.sql` - Políticas de segurança
3. Configure a `DATABASE_URL` no arquivo `.env`

## 🔐 Autenticação

### Desenvolvimento Local

- Use as chaves de teste do hCaptcha (já configuradas)
- Auth0 está configurado com domínio de desenvolvimento
- OAuth (Google/GitHub) requer configuração adicional

### Credenciais de Teste

Para desenvolvimento local, você pode criar um usuário de teste:

1. Acesse http://localhost:3001
2. Use o sistema de registro (quando implementado)
3. Ou crie diretamente no banco via SQL

## 🐛 Solução de Problemas

### Porta já em uso

Se as portas 3001 ou 5000 estiverem em uso:

1. Edite `frontend-adm/vite.config.ts` e mude `port: 3001`
2. Edite `backend/.env` e mude `PORT=5000`
3. Atualize as URLs correspondentes nos arquivos `.env`

### Erro de CORS

Verifique se as URLs no `backend/app.py` incluem seu domínio local:

```python
CORS(app, resources={
    r"/api/*": {"origins": [
        "http://localhost:3001",  # Sua porta do frontend
        # ... outras origens
    ]}
})
```

### Dependências faltando

```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend-adm && npm install
```

## 📚 Estrutura do Projeto

```
vidashield/
├── backend/               # API Flask
│   ├── .env              # Variáveis de ambiente (criar do .env.example)
│   ├── app.py            # Aplicação principal
│   ├── models.py         # Modelos do banco
│   └── routes/           # Endpoints da API
├── frontend-adm/         # Interface React
│   ├── .env              # Variáveis de ambiente (criar do .env.example)
│   ├── src/              # Código fonte
│   └── vite.config.ts    # Configuração do Vite
└── start-dev.ps1/.sh     # Scripts de inicialização
```

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça as alterações necessárias
3. Teste localmente usando este guia
4. Envie um Pull Request

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique os logs do terminal (backend e frontend)
3. Consulte a seção de solução de problemas
4. Abra uma issue no GitHub

---

**Dica**: Use `Ctrl+C` nos terminais para parar os servidores. 