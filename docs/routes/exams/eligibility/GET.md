# GET /api/exams/eligibility

Verifica se o usuário pode iniciar um exame (tem vidas disponíveis).

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk

## Exemplo de Uso

```bash
GET /api/exams/eligibility
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "eligible": true,
    "lives": 3,
    "message": "Usuário pode iniciar o exame"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Resposta quando não elegível

```json
{
  "success": true,
  "data": {
    "eligible": false,
    "lives": 0,
    "message": "Usuário não possui vidas suficientes para iniciar o exame"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "Header X-User-Id é obrigatório",
  "code": "MISSING_USER_ID"
}
```

### 401 - Unauthorized

```json
{
  "error": "Token de API inválido ou ausente"
}
```

### 404 - Not Found

```json
{
  "error": "Usuário não encontrado",
  "code": "USER_NOT_FOUND"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao verificar elegibilidade do exame"
}
```

## Notas Importantes

1. **Vidas necessárias**: Para iniciar um exame, o usuário precisa ter pelo menos 1 vida disponível
2. **Consumo de vida**: Ao criar um exame, uma vida é automaticamente consumida
3. **Regeneração**: As vidas regeneram a cada 10 horas


