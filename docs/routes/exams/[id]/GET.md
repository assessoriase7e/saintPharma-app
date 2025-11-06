# GET /api/exams/[id]

Busca detalhes de um exame específico.

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
GET /api/exams/507f1f77bcf86cd799439012
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "lectureCMSid": "lecture_id_123",
    "userId": "507f1f77bcf86cd799439011",
    "complete": false,
    "reproved": false,
    "timeLimit": 30,
    "passingScore": 70,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
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
  "error": "Acesso negado ao exame"
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
  "error": "Erro ao buscar exame"
}
```

## Notas Importantes

1. **Acesso**: O usuário só pode acessar seus próprios exames
2. **Auditoria**: Acesso ao exame é registrado para auditoria
3. **Validação**: A API verifica se o exame pertence ao usuário antes de retornar

