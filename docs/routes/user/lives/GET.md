# GET /api/user/lives

Retorna as vidas restantes do usuário.

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
GET /api/user/lives
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "userId": "507f1f77bcf86cd799439011",
  "totalLives": 3,
  "remainingLives": 2,
  "damageCount": 1,
  "lastDamage": "2024-01-01T00:00:00.000Z",
  "resetTime": "2024-01-01T10:00:00.000Z",
  "livesRegenerating": true
}
```

## Modelo de Dados (Banco de Dados)

### Damage (Prisma)

```prisma
model Damage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  User      User?    @relation(fields: [userId], references: [id])
}
```

## Sistema de Vidas

- **Total de vidas**: 3 (padrão)
- **Regeneração**: A cada 10 horas após o último dano
- **Cálculo**: `remainingLives = totalLives - damageCount (últimas 10 horas)`




