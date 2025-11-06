# GET /api/exams/[id]/attempts

Retorna tentativas de um exame.

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

## Query Parameters (opcionais)

- `page` (opcional): Número da página (padrão: 0)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 50)

## Exemplo de Uso

```bash
GET /api/exams/507f1f77bcf86cd799439012/attempts?page=0&limit=10
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "id": "507f1f77bcf86cd799439013",
        "examId": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439011",
        "score": 80,
        "passed": true,
        "totalQuestions": 10,
        "correctAnswers": 8,
        "timeSpent": 1200,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 0,
      "limit": 10,
      "total": 5,
      "pages": 1,
      "hasNext": false,
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
  "error": "Header X-User-Id é obrigatório",
  "code": "MISSING_USER_ID"
}
```

```json
{
  "error": "ID do exame é obrigatório",
  "code": "MISSING_EXAM_ID"
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
  "error": "Erro ao buscar tentativas do exame"
}
```

## Notas Importantes

1. **Paginação**: As tentativas são paginadas para melhor performance
2. **Ordenação**: As tentativas são retornadas ordenadas por data de criação (mais recentes primeiro)
3. **Acesso**: O usuário só pode ver tentativas de seus próprios exames
4. **Histórico**: Todas as tentativas do exame são mantidas para histórico


