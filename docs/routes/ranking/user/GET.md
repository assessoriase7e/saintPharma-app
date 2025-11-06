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
  "userId": "507f1f77bcf86cd799439011",
  "userName": "João Silva",
  "totalPoints": 500,
  "weekPoints": 150,
  "profileImage": "https://example.com/avatar.jpg"
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

## Cálculos

- **totalPoints**: Pontos totais do usuário (campo `points` do modelo User)
- **weekPoints**: Pontos obtidos na última semana (calculado através de certificados e atividades)

