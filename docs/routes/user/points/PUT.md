# PUT /api/user/points

Altera a pontuação do usuário.

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

```json
{
  "points": "number (obrigatório)",
  "operation": "string (opcional)",
  "reason": "string (opcional)"
}
```

### Campos

- `points` (number, obrigatório): Número de pontos
- `operation` (string, opcional): Tipo de operação
  - `set`: Define o valor exato (padrão)
  - `add`: Adiciona aos pontos atuais
  - `subtract`: Subtrai dos pontos atuais
- `reason` (string, opcional): Motivo da alteração

## Exemplo de Uso

```bash
PUT /api/user/points
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
Body:
{
  "points": 50,
  "operation": "add",
  "reason": "Conclusão de curso"
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Pontuação atualizada com sucesso",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "clerkId": "user_2abc123def456",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "points": 150
  },
  "pointsChange": {
    "previous": 100,
    "new": 150,
    "difference": 50,
    "operation": "add"
  },
  "reason": "Conclusão de curso"
}
```

## Modelo de Dados (Banco de Dados)

### User (Prisma)

```prisma
model User {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  clerkId      String        @unique
  points       Int           @default(0)
  updatedAt    DateTime      @updatedAt
}
```

## Operações

1. **set**: Define o valor exato: `newPoints = points`
2. **add**: Adiciona aos pontos atuais: `newPoints = currentPoints + points`
3. **subtract**: Subtrai dos pontos atuais: `newPoints = currentPoints - points`

**Nota**: Os pontos nunca podem ser negativos (mínimo: 0)




