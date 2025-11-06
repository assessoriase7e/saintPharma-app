# POST /api/sanity/revalidate

Revalida o cache do Next.js quando há atualizações no Sanity CMS.

## Autenticação

Requer assinatura válida do webhook do Sanity.

## Headers

- `Content-Type` (obrigatório): application/json
- Assinatura do webhook do Sanity (validada automaticamente)

## Body

```json
{
  "_type": "string (obrigatório)",
  "slug": "string (opcional)"
}
```

### Campos

#### _type
- **Tipo**: string
- **Obrigatório**: Sim
- **Descrição**: Tipo do documento atualizado no Sanity

#### slug
- **Tipo**: string
- **Obrigatório**: Não
- **Descrição**: Slug do documento (se aplicável)

## Exemplo de Uso

```bash
POST /api/sanity/revalidate
Headers:
  Content-Type: application/json
Body:
{
  "_type": "course",
  "slug": "curso-farmacologia"
}
```

## Resposta de Sucesso (200)

```json
{
  "status": 200,
  "revalidated": true,
  "now": 1704067200000,
  "body": {
    "_type": "course",
    "slug": "curso-farmacologia"
  }
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "status": 400,
  "message": "Bad Request"
}
```

### 401 - Unauthorized

```json
{
  "status": 401,
  "message": "Invalid Signature"
}
```

### 500 - Internal Server Error

```json
{
  "status": 500,
  "message": "Erro ao processar revalidação"
}
```

## Comportamento

1. **Validação de assinatura**: Verifica se a requisição veio do Sanity usando `SANITY_HOOK_SECRET`
2. **Revalidação**: Revalida o cache do Next.js para a rota raiz (`/`)
3. **Log**: Registra o tipo de documento atualizado

## Notas Importantes

1. **Webhook**: Esta rota é chamada automaticamente pelo Sanity quando há atualizações
2. **Segurança**: A assinatura do webhook é validada para garantir que a requisição veio do Sanity
3. **Cache**: A revalidação força o Next.js a buscar dados atualizados do Sanity na próxima requisição
4. **Configuração**: Requer a variável de ambiente `SANITY_HOOK_SECRET` configurada

