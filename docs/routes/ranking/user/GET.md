# GET /api/ranking/user

Retorna os pontos do usuário (total e da semana).

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário

## Exemplo de Uso

```bash
GET /api/ranking/user
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "userName": "João Silva",
    "totalPoints": 500,
    "weekPoints": 150,
    "profileImage": "https://example.com/avatar.jpg"
  },
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## Modelo de Dados (Banco de Dados)

### User (Prisma)

```prisma
model User {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  clerkId      String        @unique
  firstName    String?
  lastName     String?
  points       Int           @default(0)
}
```

## Resposta de Erro

### 400 - Bad Request

Quando o header `X-User-Id` não é fornecido:

```json
{
  "error": "Header X-User-Id é obrigatório",
  "code": "MISSING_USER_ID"
}
```

### 401 - Unauthorized

```json
{
  "error": "Token de autorização inválido ou ausente",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

### 404 - Not Found

Quando o usuário não é encontrado:

```json
{
  "error": "Usuário não encontrado",
  "code": "USER_NOT_FOUND"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar pontos do usuário",
  "code": "INTERNAL_SERVER_ERROR",
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## Cálculos

- **totalPoints**: Pontos totais do usuário (campo `points` do modelo User)
- **weekPoints**: Pontos obtidos na semana atual (calculado através de certificados, exames e aulas concluídas na semana)

