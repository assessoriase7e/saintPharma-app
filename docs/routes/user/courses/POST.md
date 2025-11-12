# POST /api/user/courses

Adiciona um curso como concluído para o usuário (cria certificado).

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk
- `Content-Type` (obrigatório): application/json

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
- **Descrição**: ID do curso a ser marcado como concluído

## Exemplo de Uso

```bash
POST /api/user/courses
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
    "message": "Curso marcado como concluído com sucesso",
    "certificate": {
      "id": "507f1f77bcf86cd799439012",
      "courseId": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
      "course": {
        "id": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
        "title": "Curso de Farmacologia",
        "description": "Curso completo de farmacologia básica",
        "imageUrl": null
      },
      "completedAt": "2024-01-01T00:00:00.000Z",
      "points": 100,
      "workload": 40
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
  "error": "courseId é obrigatório"
}
```

```json
{
  "error": "Nem todas as aulas do curso foram concluídas",
  "completed": 8,
  "total": 10
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
  "error": "Usuário já possui certificado para este curso",
  "certificateId": "507f1f77bcf86cd799439012"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao marcar curso como concluído"
}
```

## Validações

1. **Todas as aulas concluídas**: Todas as aulas do curso devem estar concluídas antes de criar o certificado
2. **Certificado único**: Não é possível criar mais de um certificado para o mesmo curso
3. **Curso existente**: O curso deve existir no sistema

## Notas Importantes

1. **Criação de certificado**: Um certificado é automaticamente criado quando o curso é marcado como concluído
2. **Verificação de progresso**: A API verifica se todas as aulas foram concluídas antes de criar o certificado
3. **Idempotência**: Se já existe um certificado, retorna erro 409 com o ID do certificado existente






