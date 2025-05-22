# Configuração do hCaptcha no VidaShield

Este documento explica como configurar e utilizar o hCaptcha para proteção contra bots na tela de login do VidaShield.

## Configurações Necessárias

### 1. Frontend (.env para frontend-adm)

Crie ou edite o arquivo `.env` na pasta `frontend-adm` e adicione:

```
# hCaptcha Configuration
VITE_HCAPTCHA_SITE_KEY=seu_site_key_hcaptcha
```

Para ambiente de desenvolvimento, você pode usar a chave de teste:
`10000000-ffff-ffff-ffff-000000000001`

### 2. Backend (.env na raiz ou variáveis de ambiente)

Adicione as seguintes variáveis ao seu ambiente ou arquivo `.env` na pasta `backend`:

```
# hCaptcha Configuration
HCAPTCHA_SITE_KEY=seu_site_key_hcaptcha
HCAPTCHA_SECRET_KEY=sua_chave_secreta_hcaptcha
```

Para ambiente de desenvolvimento, você pode usar a chave secreta de teste:
`0x0000000000000000000000000000000000000000`

## Como Funciona

1. **Frontend**: 
   - O componente hCaptcha foi adicionado à tela de login
   - A validação do captcha é obrigatória antes de prosseguir com o login
   - O token do captcha é verificado no backend antes de prosseguir

2. **Backend**:
   - Novo endpoint `/api/auth/verify-captcha` para validar tokens hCaptcha
   - Integração com a API do hCaptcha para verificação segura

## Obtenção de Chaves hCaptcha

Para produção, obtenha suas chaves em [https://www.hcaptcha.com/](https://www.hcaptcha.com/):

1. Crie uma conta ou faça login
2. Registre seu domínio
3. Obtenha o Site Key (público) e Secret Key (privado)
4. Configure as variáveis de ambiente conforme descrito acima

## Teste em Ambiente de Desenvolvimento

Em desenvolvimento, o sistema aceitará as chaves de teste mencionadas acima, que permitem o funcionamento do hCaptcha sem validação real.

## Alterações Realizadas

- Adicionado componente hCaptcha à tela de login
- Removidos botões de login Auth0 exceto Google
- Adicionada verificação de token no backend
- Implementada integração completa frontend-backend

## Suporte

Em caso de problemas, verifique:

1. Se as variáveis de ambiente estão configuradas corretamente
2. Se a conexão com a API do hCaptcha está funcionando
3. Se os tokens estão sendo enviados corretamente entre frontend e backend 