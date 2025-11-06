# DELETE /api/exams/[id]

Deleta um exame específico.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk

## Path Parameters

- `id` (obrigatório): ID do exame

## Exemplo de Uso

```bash
DELETE /api/exams/507f1f77bcf86cd799439012
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "message": "Exame deletado com sucesso"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "Header X-User-Id é obrigatório"
}
```

```json
{
  "error": "ID do exame é obrigatório"
}
```

### 401 - Unauthorized

```json
{
  "error": "Token de API inválido ou ausente"
}
```

### 403 - Forbidden

```json
{
  "error": "Não autorizado a deletar este exame"
}
```

### 404 - Not Found

```json
{
  "error": "Usuário não encontrado"
}
```

```json
{
  "error": "Exame não encontrado"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao deletar exame"
}
```

## Notas Importantes

1. **Acesso**: O usuário só pode deletar seus próprios exames
2. **Auditoria**: A deleção é registrada para auditoria antes de executar
3. **Irreversível**: A operação de deleção é permanente e não pode ser desfeita
4. **Validação**: A API verifica se o exame pertence ao usuário antes de deletar

