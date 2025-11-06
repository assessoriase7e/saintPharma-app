# GET /api/user/summary

Retorna um resumo detalhado do usuário, incluindo estatísticas de estudo, cursos, certificados e ranking.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário

## Query Parameters

- `period` (opcional): Período para filtrar estatísticas
  - `week`: Última semana
  - `month`: Último mês
  - `all`: Todos os dados (padrão)

## Exemplo de Uso

```bash
GET /api/user/summary?period=month
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "clerkId": "user_2abc123def456",
      "name": "João Silva",
      "email": "usuario@exemplo.com",
      "profileImage": "https://example.com/avatar.jpg",
      "points": 150
    },
    "studyHours": {
      "total": 12.5,
      "thisWeek": 3.5,
      "thisMonth": 8.0
    },
    "courses": {
      "completed": 3,
      "inProgress": 2,
      "total": 5
    },
    "certificates": {
      "total": 3,
      "recent": [
        {
          "id": "cert_id_1",
          "courseId": "course_id_1",
          "courseTitle": "Curso de Farmacologia",
          "courseThumbnail": null,
          "workload": 40,
          "description": "Curso completo de farmacologia",
          "points": 100,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    },
    "ranking": {
      "position": 15,
      "totalUsers": 100
    },
    "activities": {
      "recentLectures": [
        {
          "id": "lecture_id_1",
          "courseId": "course_id_1",
          "lectureId": "lecture_cms_id_1",
          "lectureTitle": "Aula concluída",
          "completedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "recentExams": [
        {
          "id": "exam_id_1",
          "lectureId": "lecture_cms_id_1",
          "lectureTitle": "Exame concluído",
          "score": 0,
          "passed": true,
          "completedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
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

## Modelos de Dados Relacionados (Banco de Dados)

### User (Prisma)

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
  certificates Certificate[]
  lectures     UserLecture[]
  Exam         Exam[]
}
```

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

### UserLecture (Prisma)

```prisma
model UserLecture {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  lectureCmsId String
  courseId     String
  userId       String?  @db.ObjectId
  createdAt    DateTime @default(now())
  User         User?    @relation(fields: [userId], references: [id])
}
```

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

## Cálculos

- **Horas de estudo**: Estimativa baseada no número de aulas concluídas (30 minutos por aula)
- **Ranking**: Posição baseada nos pontos totais do usuário
- **Cursos em progresso**: Cursos com aulas concluídas mas sem certificado

