# PUT /api/user/complete

Completa dados do usuário (sobrenome e/ou nome).

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário
- `Content-Type` (obrigatório): application/json

## Body

Pelo menos um campo deve ser fornecido:

```json
{
  "lastName": "string (opcional)",
  "firstName": "string (opcional)"
}
```

### Campos

- `lastName` (string, opcional): Sobrenome do usuário
- `firstName` (string, opcional): Nome do usuário

## Exemplo de Uso

```bash
PUT /api/user/complete
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
Body:
{
  "lastName": "Silva",
  "firstName": "João"
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Dados do usuário completados com sucesso",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "clerkId": "user_2abc123def456",
    "firstName": "João",
    "lastName": "Silva",
    "email": "user@example.com",
    "profileImage": "image_url",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "X-User-Id header é obrigatório"
}
```

```json
{
  "error": "Pelo menos um campo (lastName ou firstName) deve ser fornecido"
}
```

```json
{
  "error": "Sobrenome não pode estar vazio"
}
```

```json
{
  "error": "Nome não pode estar vazio"
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

## Comportamento

- Os campos `firstName` e `lastName` são atualizados diretamente no banco de dados
- Se `lastName` for fornecido, o `firstName` será atualizado também (mantendo o atual se não fornecido)
- Se apenas `firstName` for fornecido, apenas o primeiro nome será atualizado
- Campos são sanitizados antes de serem salvos

## Modelo de Dados (Banco de Dados)

O usuário atualizado segue o modelo `User` do Prisma:

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

