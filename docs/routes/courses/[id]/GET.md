# GET /api/courses/[id]

Retorna detalhes de um curso específico com suas aulas.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (opcional): Clerk ID do usuário (para verificar progresso)

## Path Parameters

- `id` (obrigatório): ID do curso no Sanity CMS

## Exemplo de Uso

```bash
GET /api/courses/course_id_1
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "course": {
    "_id": "course_id_1",
    "name": "Curso de Farmacologia",
    "description": "Curso completo",
    "banner": { ... },
    "points": 100,
    "workload": 40
  },
  "lectures": [
    {
      "_id": "lecture_id_1",
      "title": "Introdução à Farmacologia",
      "completed": true
    }
  ],
  "totalLectures": 10,
  "completedLectures": 5
}
```

## Modelos Relacionados (Banco de Dados)

### UserLecture (Prisma)

```prisma
model UserLecture {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  lectureCmsId String
  courseId     String
  userId       String?  @db.ObjectId
  createdAt    DateTime @default(now())
}
```

