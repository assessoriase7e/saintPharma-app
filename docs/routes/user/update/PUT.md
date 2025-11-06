# PUT /api/user/update

Atualiza informações do usuário.

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

Todos os campos são opcionais, mas pelo menos um deve ser fornecido:

```json
{
  "firstName": "string (opcional)",
  "lastName": "string (opcional)",
  "email": "string (opcional)",
  "profileImage": "string (opcional)",
  "points": "number (opcional)",
  "quizzes": "string[] (opcional)"
}
```

### Campos

- `firstName` (string, opcional): Primeiro nome do usuário (não pode estar vazio se fornecido)
- `lastName` (string, opcional): Sobrenome do usuário (pode ser `null` para remover)
- `email` (string, opcional): Email do usuário (deve ser válido se fornecido)
- `profileImage` (string, opcional): URL da imagem de perfil (pode ser `null` para remover)
- `points` (number, opcional): Pontuação do usuário (deve ser não negativo)
- `quizzes` (string[], opcional): Array de IDs de quizzes

## Exemplo de Uso

```bash
PUT /api/user/update
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
Body:
{
  "firstName": "João",
  "lastName": "Silva Santos",
  "email": "novoemail@exemplo.com",
  "profileImage": "https://example.com/new-avatar.jpg",
  "points": 150,
  "quizzes": ["quiz1", "quiz2", "quiz3"]
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "clerkId": "user_2abc123def456",
    "firstName": "João",
    "lastName": "Silva Santos",
    "email": "novoemail@exemplo.com",
    "profileImage": "https://example.com/new-avatar.jpg",
    "points": 150,
    "quizzes": ["quiz1", "quiz2", "quiz3"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
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
  "error": "Pelo menos um campo deve ser fornecido para atualização"
}
```

```json
{
  "error": "Primeiro nome não pode estar vazio"
}
```

```json
{
  "error": "Email não pode estar vazio"
}
```

```json
{
  "error": "Formato de email inválido"
}
```

```json
{
  "error": "Pontos devem ser um número não negativo"
}
```

```json
{
  "error": "Quizzes deve ser um array"
}
```

```json
{
  "error": "Todos os quizzes devem ser strings"
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
  "error": "Email já está em uso por outro usuário"
}
```

## Validações

1. **X-User-Id**: Deve ser fornecido no header
2. **Campos vazios**: firstName e email não podem estar vazios se fornecidos
3. **lastName**: Pode ser string vazia (será definido como `null`)
4. **Email**: Deve ser um formato válido (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
5. **Pontos**: Deve ser um número não negativo
6. **Quizzes**: Deve ser um array de strings
7. **Unicidade**: Email deve ser único (se fornecido)

## Comportamento Especial

- **profileImage**: Se fornecido como string vazia, será definido como `null`
- **Atualização parcial**: Apenas os campos fornecidos são atualizados
- **Sanitização**: Strings são sanitizadas antes de serem salvas

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

