# GET /api/exams

Lista todos os exames do usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk

## Query Parameters (opcionais)

- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20, máximo: 100)
- `status` (opcional): Filtro por status - `'completed'`, `'pending'`, `'all'` (padrão: `'all'`)

## Exemplo de Uso

```bash
GET /api/exams?page=1&limit=20&status=completed
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "507f1f77bcf86cd799439012",
        "lectureCMSid": "lecture_id_123",
        "userId": "507f1f77bcf86cd799439011",
        "complete": true,
        "reproved": false,
        "timeLimit": 30,
        "passingScore": 70,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
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

### 401 - Unauthorized

```json
{
  "error": "Token de API inválido ou ausente"
}
```

### 404 - Not Found

```json
{
  "error": "Usuário não encontrado"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar exames"
}
```

## Filtros de Status

- `completed`: Retorna apenas exames concluídos
- `pending`: Retorna apenas exames pendentes (não concluídos)
- `all`: Retorna todos os exames (padrão)

## Notas Importantes

1. **Paginação**: Os exames são paginados para melhor performance
2. **Ordenação**: Os exames são retornados ordenados por data de criação (mais recentes primeiro)
3. **Acesso**: O usuário só pode ver seus próprios exames

