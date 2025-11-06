# POST /api/courses/[id]/complete

Marca um curso como concluído e gera certificado se aplicável.

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

- `id` (obrigatório): ID do curso

## Exemplo de Uso

```bash
POST /api/courses/5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9/complete
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
```

## Resposta de Sucesso (201)

```json
{
  "success": true,
  "data": {
    "message": "Curso concluído com sucesso",
    "certificate": {
      "id": "507f1f77bcf86cd799439012",
      "courseCmsId": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
      "courseTitle": "Curso de Farmacologia",
      "description": "Curso completo de farmacologia básica",
      "workload": 40,
      "points": 100,
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "course": {
      "id": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
      "name": "Curso de Farmacologia",
      "points": 100
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
  "error": "ID do curso é obrigatório"
}
```

```json
{
  "error": "Todas as aulas devem ser concluídas antes de gerar o certificado",
  "progress": {
    "total": 10,
    "completed": 8,
    "remaining": 2
  }
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

```json
{
  "error": "Curso não encontrado"
}
```

### 409 - Conflict

```json
{
  "error": "Certificado já foi gerado para este curso",
  "certificate": {
    "id": "507f1f77bcf86cd799439012",
    "courseCmsId": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
    "courseTitle": "Curso de Farmacologia"
  }
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao concluir curso"
}
```

## Validações

1. **Todas as aulas concluídas**: Todas as lectures do curso devem estar concluídas antes de gerar o certificado
2. **Certificado único**: Não é possível gerar mais de um certificado para o mesmo curso
3. **Curso existente**: O curso deve existir no sistema

## Notas Importantes

1. **Geração automática**: O certificado é gerado automaticamente quando todas as aulas são concluídas
2. **Verificação de progresso**: A API verifica se todas as lectures foram concluídas antes de criar o certificado
3. **Idempotência**: Se já existe um certificado, retorna erro 409 com o certificado existente

