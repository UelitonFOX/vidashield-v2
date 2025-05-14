# Preparação para Instalação Limpa do VidaShield

Este documento descreve o processo para preparar o repositório do VidaShield para uma instalação limpa em máquinas zeradas.

## Etapa 1 – Limpeza Geral do Repositório

Utilizamos o script `limpeza-repositorio.ps1` para realizar uma limpeza completa do projeto. Este script irá:

1. Remover pastas desnecessárias:
   - `node_modules`
   - `__pycache__`
   - `.vscode`
   - `.idea`
   - `dist`
   - `build`
   - Outras pastas temporárias

2. Eliminar arquivos desnecessários:
   - Arquivos de log (*.log)
   - Arquivos de cache (.DS_Store)
   - Arquivos compilados Python (*.pyc, *.pyo)
   - Arquivos temporários

3. Gerenciar arquivos de ambiente:
   - Remover arquivos `.env` com informações sensíveis
   - Criar ou preservar arquivos `.env.example` com valores genéricos
   
4. Verificar dependências no projeto:
   - Confirma a presença de `package.json` no frontend
   - Confirma a presença de `requirements.txt` no backend

## Como executar a limpeza

1. Abra o PowerShell como administrador
2. Navegue até a pasta raiz do projeto
3. Execute o script:

```powershell
./limpeza-repositorio.ps1
```

## Preparação para Uso

Após a limpeza, o projeto estará pronto para ser instalado em uma nova máquina. Siga estas etapas:

### Backend

1. Navegue até a pasta `backend`
2. Crie um ambiente virtual Python:
   ```bash
   python -m venv venv
   ```
3. Ative o ambiente virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
5. Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```
6. Edite o arquivo `.env` com suas configurações específicas

### Frontend

1. Navegue até a pasta `frontend-adm`
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```
4. Edite o arquivo `.env` com suas configurações específicas

## Verificação do Ambiente

Após a instalação, verifique se tudo está funcionando corretamente:

### Backend
```bash
cd backend
python app.py
```

### Frontend
```bash
cd frontend-adm
npm run dev
```

## Observações Importantes

1. **Não commite arquivos .env**: Sempre mantenha arquivos com credenciais fora do controle de versão.
2. **Atualize o .env.example quando necessário**: Se adicionar novas variáveis de ambiente ao projeto, atualize também o arquivo de exemplo.
3. **Versões de dependências**: Mantenha as versões específicas nos arquivos package.json e requirements.txt para garantir compatibilidade. 