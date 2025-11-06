# POST /api/lectures/[id]/complete

Marca uma aula como concluída.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk
- `Content-Type` (obrigatório): application/json

## Path Parameters

- `id` (obrigatório): ID da aula

## Body

```json
{
  "courseId": "string (obrigatório)"
}
```

### Campos

#### courseId
- **Tipo**: string
- **Obrigatório**: Sim
- **Descrição**: ID do curso ao qual a aula pertence

## Exemplo de Uso

```bash
POST /api/lectures/lecture_id_123/complete
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
Body:
{
  "courseId": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9"
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "message": "Aula marcada como concluída",
    "userLecture": {
      "id": "507f1f77bcf86cd799439012",
      "lectureCmsId": "lecture_id_123",
      "courseId": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-01T00:00:00.000Z"
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

```json
{
  "error": "ID da aula é obrigatório"
}
```

```json
{
  "error": "courseId é obrigatório"
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

### 409 - Conflict

```json
{
  "error": "Aula já foi concluída",
  "userLecture": {
    "id": "507f1f77bcf86cd799439012",
    "lectureCmsId": "lecture_id_123",
    "courseId": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao marcar aula como concluída"
}
```

## Notas Importantes

1. **Idempotência**: Se a aula já foi concluída, retorna erro 409 com o registro existente
2. **Registro**: Cria um registro `UserLecture` associando o usuário à aula concluída
3. **Progresso**: Este registro é usado para calcular o progresso do usuário no curso


