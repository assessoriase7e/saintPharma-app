# GET /api/user/activities

Busca o histórico de atividades de um usuário.

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
- `type` (opcional): Tipo de atividade para filtrar
  - `certificate`: Apenas certificados
  - `lecture`: Apenas aulas concluídas
  - `exam`: Apenas tentativas de exames
  - `damage`: Apenas vidas perdidas
  - `all`: Todas as atividades (padrão)
- `period` (opcional): Período para filtrar
  - `week`: Última semana
  - `month`: Último mês
  - `year`: Último ano
  - `all`: Todos os dados (padrão)
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de resultados por página (padrão: 20, máximo: 100)

## Exemplo de Uso

```bash
GET /api/user/activities?clerkId=user_2abc123def456&type=exam&period=month&page=1&limit=10
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Atividades do usuário encontradas com sucesso",
  "activities": [
    {
      "id": "activity_id",
      "type": "exam",
      "title": "Exame aprovado",
      "description": "8/10 questões corretas (80%)",
      "points": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "metadata": {
        "score": 80,
        "passed": true,
        "totalQuestions": 10,
        "correctAnswers": 8,
        "timeSpent": 1200
      }
    },
    {
      "id": "certificate_id",
      "type": "certificate",
      "title": "Certificado obtido: Curso de Farmacologia",
      "description": "40h de curso concluído",
      "points": 100,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "metadata": {
        "courseTitle": "Curso de Farmacologia",
        "workload": 40
      }
    }
  ],
  "stats": {
    "total": 25,
    "byType": {
      "certificate": 3,
      "lecture": 15,
      "exam": 5,
      "damage": 2
    },
    "period": "month",
    "type": "exam"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
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
  "error": "Token de API inválido ou ausente"
}
```

### 404 - Not Found

```json
{
  "error": "Usuário não encontrado"
}
```

## Tipos de Atividades

### Certificate

```json
{
  "type": "certificate",
  "title": "Certificado obtido: {courseTitle}",
  "description": "{workload}h de curso concluído",
  "points": 100,
  "metadata": {
    "courseTitle": "string",
    "workload": 40
  }
}
```

### Lecture

```json
{
  "type": "lecture",
  "title": "Aula concluída",
  "description": "Aula {lectureCmsId} do curso {courseId}",
  "points": 0,
  "metadata": {
    "courseId": "string",
    "lectureCmsId": "string"
  }
}
```

### Exam

```json
{
  "type": "exam",
  "title": "Exame {aprovado|reprovado}",
  "description": "{correctAnswers}/{totalQuestions} questões corretas ({score}%)",
  "points": 0,
  "metadata": {
    "score": 80,
    "passed": true,
    "totalQuestions": 10,
    "correctAnswers": 8,
    "timeSpent": 1200
  }
}
```

### Damage

```json
{
  "type": "damage",
  "title": "Vida perdida",
  "description": "Uma vida foi perdida",
  "points": 0,
  "metadata": {}
}
```

## Modelos de Dados Relacionados (Banco de Dados)

### Certificate (Prisma)

```prisma
model Certificate {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  courseTitle String
  workload    Int
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

### ExamAttempt (Prisma)

```prisma
model ExamAttempt {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  score          Float    @default(0)
  totalQuestions Int      @default(0)
  correctAnswers Int      @default(0)
  timeSpent      Int      @default(0)
  passed         Boolean  @default(false)
  userId         String   @db.ObjectId
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

## Ordenação

As atividades são ordenadas por data de criação (mais recentes primeiro).




