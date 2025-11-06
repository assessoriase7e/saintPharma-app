# GET /api/ranking

Retorna o ranking geral de usuários baseado nos pontos.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API

## Query Parameters

- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20, máximo: 100)

## Exemplo de Uso

```bash
GET /api/ranking?page=1&limit=20
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "ranking": [
    {
      "id": "user_id_1",
      "clerkId": "user_2abc123def456",
      "name": "João Silva",
      "email": "usuario@exemplo.com",
      "profileImage": "https://example.com/avatar.jpg",
      "points": 500,
      "position": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "month": "2024-01"
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
  email        String        @unique
  profileImage String?
  points       Int           @default(0)
}
```

## Ordenação

Os usuários são ordenados por pontos em ordem decrescente.

