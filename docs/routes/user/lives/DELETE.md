# DELETE /api/user/lives

Remove uma vida do usuário (cria um dano).

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário
- `Content-Type` (opcional): application/json

## Body (opcional)

```json
{
  "amount": "number (opcional)"
}
```

### Campos

- `amount` (number, opcional): Número de vidas a remover (padrão: 1)

## Exemplo de Uso

```bash
DELETE /api/user/lives
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
Body:
{
  "amount": 1
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "1 vida(s) removida(s) com sucesso",
  "userId": "507f1f77bcf86cd799439011",
  "livesRemoved": 1,
  "totalLives": 3,
  "remainingLives": 2,
  "resetTime": "2024-01-01T10:00:00.000Z",
  "livesRegenerating": true
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "Usuário não possui vidas para remover",
  "remainingLives": 0
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

## Comportamento

- Cria um registro de `Damage` para cada vida removida
- Limita a quantidade removida pelas vidas disponíveis
- Próximo reset: 10 horas após a remoção








