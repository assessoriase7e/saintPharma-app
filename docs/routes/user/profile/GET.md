# GET /api/user/profile

Busca o perfil completo de um usuário pelo Clerk ID.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (opcional): Clerk ID do usuário (se não fornecido via query)

## Query Parameters

- `clerkId` (opcional): ID do usuário no Clerk (se não fornecido via header)

## Exemplo de Uso

### Via Query Parameter

```bash
GET /api/user/profile?clerkId=user_2abc123def456
```

### Via Header

```bash
GET /api/user/profile
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Perfil do usuário encontrado com sucesso",
  "profile": {
    "id": "507f1f77bcf86cd799439011",
    "clerkId": "user_2abc123def456",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "profileImage": "https://example.com/avatar.jpg",
    "points": 100,
    "quizzes": ["quiz1", "quiz2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "clerkId é obrigatório (via query parameter ou header X-User-Id)"
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

## Diferença entre /api/user e /api/user/profile

- `/api/user`: Retorna o objeto `user` diretamente
- `/api/user/profile`: Retorna o objeto dentro de `profile`

Ambas retornam os mesmos dados, apenas a estrutura da resposta é diferente.

## Modelo de Dados (Banco de Dados)

### User (Prisma)

```prisma
model User {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  clerkId      String        @unique
  firstName    String?
  lastName     String?
  email        String        @unique
  profileImage String?
  quizzes      String[]      @default([])
  points       Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

