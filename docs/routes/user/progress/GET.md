# GET /api/user/progress

Retorna progresso detalhado do usuário por curso.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário

## Query Parameters

- `courseId` (opcional): ID específico do curso para filtrar
- `status` (opcional): Status do curso para filtrar
  - `in_progress`: Cursos em progresso
  - `completed`: Cursos concluídos
  - `not_started`: Cursos não iniciados
  - `all`: Todos os cursos (padrão)
- `includeDetails` (opcional): `true` para incluir detalhes das aulas (padrão: `false`)
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de resultados por página (padrão: 10, máximo: 50)

## Exemplo de Uso

```bash
GET /api/user/progress?status=in_progress&includeDetails=true&page=1&limit=10
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "clerkId": "user_2abc123def456",
    "name": "João Silva",
    "email": "usuario@exemplo.com"
  },
  "progress": {
    "overall": {
      "percentage": null,
      "completedLectures": 25,
      "totalLectures": null
    },
    "courses": [
      {
        "courseId": "course_id_1",
        "status": "in_progress",
        "progress": {
          "completed": 5,
          "total": null,
          "percentage": null
        },
        "isCompleted": false,
        "certificateId": null,
        "completedAt": null,
        "lastActivity": "2024-01-01T00:00:00.000Z",
        "completedLectures": [
          {
            "lectureCmsId": "lecture_id_1",
            "courseId": "course_id_1",
            "completedAt": "2024-01-01T00:00:00.000Z"
          }
        ],
        "exams": [...]
      }
    ],
    "stats": {
      "totalCourses": 5,
      "completedCourses": 2,
      "inProgressCourses": 3,
      "notStartedCourses": 0,
      "totalLectures": null,
      "completedLectures": 25
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Modelos de Dados Relacionados (Banco de Dados)

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

### Certificate (Prisma)

```prisma
model Certificate {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  courseCmsId String
  userId      String?  @db.ObjectId
  createdAt   DateTime @default(now())
}
```

### Exam (Prisma)

```prisma
model Exam {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  lectureCMSid String
  userId       String   @db.ObjectId
  complete     Boolean? @default(false)
  reproved     Boolean? @default(false)
  createdAt    DateTime @default(now())
}
```



