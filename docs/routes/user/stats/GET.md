# GET /api/user/stats

Busca estatísticas detalhadas de um usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (opcional): Clerk ID do usuário (se não fornecido via query)

## Query Parameters

- `clerkId` (opcional): ID do usuário no Clerk (se não fornecido via header)
- `period` (opcional): Período para filtrar estatísticas
  - `week`: Última semana
  - `month`: Último mês
  - `year`: Último ano
  - `all`: Todos os dados (padrão)
- `includeDetails` (opcional): `true` para incluir detalhes das atividades (padrão: `false`)

## Exemplo de Uso

```bash
GET /api/user/stats?clerkId=user_2abc123def456&period=month&includeDetails=true
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "message": "Estatísticas do usuário encontradas com sucesso",
    "stats": {
      "period": "month",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "clerkId": "user_2abc123def456",
        "name": "João Silva",
        "email": "usuario@exemplo.com",
        "points": 150
      },
      "achievements": {
        "certificates": {
          "total": 3,
          "points": 150,
          "workload": 12
        },
        "lectures": {
          "completed": 25,
          "estimatedHours": 12.5
        },
        "exams": {
          "total": 10,
          "completed": 8,
          "passed": 6,
          "failed": 2,
          "averageScore": 75.5
        },
        "damages": {
          "total": 2
        }
      },
      "ranking": {
        "position": 15,
        "totalUsers": 100,
        "percentile": 85
      },
      "activity": {
        "totalActivities": 38,
        "lastActivity": 1704067200000
      },
      "details": {
        "recentCertificates": [...],
        "recentLectures": [...],
        "recentExams": [...],
        "recentExamAttempts": [...],
        "recentDamages": [...]
      }
    }
  },
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "clerkId é obrigatório (via query parameter ou header X-User-Id)"
}
```

### 401 - Unauthorized

```json
{
  "error": "Token de autorização inválido ou ausente",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

### 404 - Not Found

```json
{
  "error": "Usuário não encontrado"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar estatísticas do usuário",
  "code": "INTERNAL_SERVER_ERROR",
  "timestamp": "2024-01-10T12:00:00.000Z"
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
  points       Int           @default(0)
  certificates Certificate[]
  lectures     UserLecture[]
  Exam         Exam[]
  ExamAttempt  ExamAttempt[]
  Damage       Damage[]
}
```

### Certificate (Prisma)

```prisma
model Certificate {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  courseTitle String
  workload    Int
  description String
  points      Int
  userId      String?  @db.ObjectId
  createdAt   DateTime @default(now())
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
  createdAt    DateTime      @default(now())
}
```

### ExamAttempt (Prisma)

```prisma
model ExamAttempt {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  examId         String   @db.ObjectId
  userId         String   @db.ObjectId
  answers        Json
  score          Float    @default(0)
  totalQuestions Int      @default(0)
  correctAnswers Int      @default(0)
  timeSpent      Int      @default(0)
  passed         Boolean  @default(false)
  completedAt    DateTime?
  createdAt      DateTime @default(now())
}
```

### Damage (Prisma)

```prisma
model Damage {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  createdAt DateTime @default(now())
}
```

## Cálculos

- **Horas estudadas**: Estimativa baseada no número de aulas (30 minutos por aula)
- **Ranking**: Posição baseada nos pontos totais
- **Percentil**: `((totalUsers - position + 1) / totalUsers) * 100`
- **Média de pontuação**: Soma de todas as pontuações dividida pelo número de tentativas

