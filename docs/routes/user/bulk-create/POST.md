# POST /api/user/bulk-create

Cria múltiplos usuários no banco de dados em uma única requisição.

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
  "users": [
    {
      "clerkId": "string (obrigatório)",
      "email": "string (obrigatório)",
      "name": "string (opcional, será dividido em firstName/lastName)",
      "firstName": "string (opcional)",
      "lastName": "string (opcional)",
      "profileImage": "string (opcional)"
    }
  ]
}
```

### Campos

- `users` (array, obrigatório): Array de objetos de usuário
  - `clerkId` (string, obrigatório): ID do usuário no Clerk
  - `email` (string, obrigatório): Email do usuário
  - `name` (string, opcional): Nome completo (será automaticamente dividido em firstName/lastName se firstName/lastName não forem fornecidos)
  - `firstName` (string, opcional): Primeiro nome do usuário
  - `lastName` (string, opcional): Sobrenome do usuário
  - `profileImage` (string, opcional): URL da imagem de perfil

**Nota**: Se `name` for fornecido mas `firstName`/`lastName` não, o `name` será dividido automaticamente. Caso contrário, use `firstName` e `lastName` diretamente.

## Limitações

- Máximo de 100 usuários por requisição
- Array não pode estar vazio

## Exemplo de Uso

```bash
POST /api/user/bulk-create
Headers:
  Authorization: Bearer <API_TOKEN>
  Content-Type: application/json
Body:
{
  "users": [
    {
      "clerkId": "user_2abc123def456",
      "email": "usuario1@exemplo.com",
      "firstName": "João",
      "lastName": "Silva"
    },
    {
      "clerkId": "user_2def456ghi789",
      "email": "usuario2@exemplo.com",
      "name": "Maria Santos",
      "profileImage": "https://example.com/avatar2.jpg"
    }
  ]
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Processamento concluído: 2 criados, 0 com erro",
  "results": {
    "created": [
      {
        "index": 0,
        "user": {
          "id": "507f1f77bcf86cd799439011",
          "clerkId": "user_2abc123def456",
          "firstName": "João",
          "lastName": "Silva",
          "email": "usuario1@exemplo.com",
          "points": 0,
          "quizzes": [],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      },
      {
        "index": 1,
        "user": {
          "id": "507f1f77bcf86cd799439012",
          "clerkId": "user_2def456ghi789",
          "firstName": "Maria",
          "lastName": "Santos",
          "email": "usuario2@exemplo.com",
          "points": 0,
          "quizzes": [],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      }
    ],
    "errors": []
  }
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "Campo 'users' deve ser um array"
}
```

```json
{
  "error": "Array de usuários não pode estar vazio"
}
```

```json
{
  "error": "Máximo de 100 usuários por requisição"
}
```

```json
{
  "error": "Usuário na posição 0: clerkId e email são obrigatórios"
}
```

```json
{
  "error": "Usuário na posição 0: formato de email inválido"
}
```

### 401 - Unauthorized

```json
{
  "error": "Token de API inválido ou ausente"
}
```

## Processamento

A rota processa cada usuário individualmente. Se um usuário falhar na criação (por exemplo, email duplicado), ele será adicionado ao array `errors`, mas o processamento continuará para os demais usuários.

### Estrutura de Erros

```json
{
  "index": 0,
  "userData": {
    "clerkId": "user_2abc123def456",
    "email": "usuario@exemplo.com"
  },
  "error": "Usuário já existe com este Clerk ID"
}
```

## Modelo de Dados (Banco de Dados)

Cada usuário criado segue o modelo `User` do Prisma:

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

