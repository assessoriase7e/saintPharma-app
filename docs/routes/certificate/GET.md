# GET /api/certificate

Lista todos os certificados do usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário

## Query Parameters

- `page` (opcional): Número da página (padrão: 0)
- `limit` (opcional): Itens por página (padrão: 20, máximo: 100)

## Exemplo de Uso

```bash
GET /api/certificate?page=0&limit=20
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "certificates": [
    {
      "id": "cert_id_1",
      "courseTitle": "Curso de Farmacologia",
      "workload": 40,
      "description": "Curso completo",
      "points": 100,
      "courseCmsId": "course_id_1",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 20,
    "total": 5,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Modelo de Dados (Banco de Dados)

### Certificate (Prisma)

```prisma
model Certificate {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  courseTitle String
  workload    Int
  description String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  courseCmsId String
  userId      String?  @db.ObjectId
  points      Int
  User        User?    @relation(fields: [userId], references: [id])
}
```

