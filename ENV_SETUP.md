# Configuração de Variáveis de Ambiente

Este projeto usa variáveis de ambiente injetadas no build através do `app.config.ts`. As variáveis são acessadas via `Constants.expoConfig.extra` no código.

## Desenvolvimento Local

1. Crie um arquivo `.env` na raiz do projeto:

```env
API_BASE_URL=https://www.saintpharmacursos.com.br
API_TOKEN=seu-token-aqui
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

2. O `app.config.ts` carrega automaticamente o `.env` usando `dotenv/config`

3. Execute o app normalmente:
```bash
npx expo start
# ou
npx expo run:android
```

## Builds com EAS (Produção)

Para builds na nuvem com EAS, você deve usar **EAS Secrets** ao invés de variáveis no `eas.json`.

### Configurando EAS Secrets

1. Instale o EAS CLI (se ainda não tiver):
```bash
npm install -g eas-cli
```

2. Faça login:
```bash
eas login
```

3. Configure as secrets do projeto:
```bash
# Configurar cada variável de ambiente
eas secret:create --scope project --name API_BASE_URL --value "https://www.saintpharmacursos.com.br"
eas secret:create --scope project --name API_TOKEN --value "seu-token-aqui"
eas secret:create --scope project --name CLERK_PUBLISHABLE_KEY --value "pk_live_..."
eas secret:create --scope project --name CLERK_SECRET_KEY --value "sk_live_..."
```

4. Verificar secrets configuradas:
```bash
eas secret:list
```

### Como Funciona

- **Desenvolvimento local**: O `app.config.ts` lê o arquivo `.env` usando `dotenv/config`
- **EAS Build**: O EAS injeta as secrets como variáveis de ambiente durante o build
- **No código**: Use `getApiBaseUrl()`, `getApiToken()`, etc. de `@/utils/env` ao invés de `process.env`

### Importante

- **NÃO** commite o arquivo `.env` no repositório (já está no `.gitignore`)
- **NÃO** coloque valores sensíveis no `eas.json` (use EAS Secrets)
- As variáveis são injetadas no build e ficam disponíveis via `Constants.expoConfig.extra`
- Variáveis sem o prefixo `EXPO_PUBLIC_` não são expostas ao JavaScript por padrão, mas são injetadas via `app.config.ts` → `extra`

## Estrutura

```
app.config.ts          # Carrega .env e injeta em extra
  ↓
Constants.expoConfig.extra
  ↓
utils/env.ts          # Helper para acessar as variáveis
  ↓
services/*.ts         # Usa getApiBaseUrl(), getApiToken(), etc.
```








