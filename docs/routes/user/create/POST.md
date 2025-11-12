# POST /api/user/create

Cria um novo usuário no banco de dados.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `Content-Type` (obrigatório): application/json

## Body

```json
{
  "clerkId": "string (obrigatório)",
  "email": "string (obrigatório)",
  "firstName": "string (opcional)",
  "lastName": "string (opcional)",
  "profileImage": "string (opcional)"
}
```

### Campos

- `clerkId` (string, obrigatório): ID do usuário no Clerk
- `email` (string, obrigatório): Email do usuário (deve ser válido)
- `firstName` (string, opcional): Primeiro nome do usuário (padrão: "Usuário" se não fornecido)
- `lastName` (string, opcional): Sobrenome do usuário
- `profileImage` (string, opcional): URL da imagem de perfil

## Exemplo de Uso

```bash
POST /api/user/create
Headers:
  Authorization: Bearer <API_TOKEN>
  Content-Type: application/json
Body:
{
  "clerkId": "user_2abc123def456",
  "email": "usuario@exemplo.com",
  "firstName": "João",
  "lastName": "Silva",
  "profileImage": "https://example.com/avatar.jpg"
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "message": "Usuário criado com sucesso",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "clerkId": "user_2abc123def456",
      "firstName": "João",
      "lastName": "Silva",
      "email": "usuario@exemplo.com",
      "profileImage": "https://example.com/avatar.jpg",
      "points": 0,
      "quizzes": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "clerkId e email são obrigatórios"
}
```

```json
{
  "error": "Formato de email inválido"
}
```

```json
{
  "error": "ClerkId não pode estar vazio"
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

### 409 - Conflict

```json
{
  "error": "Usuário já existe com este Clerk ID"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao criar usuário",
  "code": "INTERNAL_SERVER_ERROR",
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## Validações

1. **clerkId**: Não pode estar vazio
2. **email**: Deve ser um formato válido de email (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
3. **Unicidade**: 
   - `clerkId` deve ser único
   - `email` deve ser único

## Modelo de Dados (Banco de Dados)

### User (Prisma)

O usuário criado segue o modelo `User` do Prisma:

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

## Campos Padrão

- `points`: Inicializado com `0`
- `quizzes`: Inicializado como array vazio `[]`
- `createdAt`: Data/hora de criação (automático)
- `updatedAt`: Data/hora de atualização (automático)

