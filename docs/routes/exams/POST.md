# POST /api/exams

Cria um novo exame para uma aula específica.

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
  "lectureCMSid": "string (obrigatório)",
  "timeLimit": "number (opcional, em minutos)",
  "passingScore": "number (opcional, porcentagem mínima)"
}
```

## Exemplo de Uso

```bash
POST /api/exams
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
Body:
{
  "lectureCMSid": "lecture_id_1",
  "timeLimit": 60,
  "passingScore": 70
}
```

## Resposta de Sucesso (201)

```json
{
  "success": true,
  "exam": {
    "id": "exam_id_1",
    "lectureCMSid": "lecture_id_1",
    "userId": "user_id_1",
    "complete": false,
    "reproved": false,
    "timeLimit": 60,
    "passingScore": 70,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "quiz": { ... },
  "lecture": {
    "id": "lecture_id_1",
    "title": "Introdução"
  }
}
```

## Modelo de Dados (Banco de Dados)

### Exam (Prisma)

```prisma
model Exam {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  complete     Boolean?      @default(false)
  reproved     Boolean?      @default(false)
  lectureCMSid String
  userId       String        @db.ObjectId
  timeLimit    Int?
  passingScore Int?
  User         User?         @relation(fields: [userId], references: [id])
  attempts     ExamAttempt[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

## Validações

- O usuário deve ter vidas disponíveis (uma vida é consumida ao criar o exame)
- A aula deve existir no Sanity CMS
- Deve existir um quiz para a aula

