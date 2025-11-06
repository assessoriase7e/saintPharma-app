# GET /api/courses/[id]/progress

Retorna o progresso detalhado de um ou múltiplos cursos para o usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário

## Path Parameters

- `id` (opcional se `courseIds` for fornecido): ID do curso no Sanity CMS. Se não fornecer `courseIds` no query, este ID será usado.

## Query Parameters

- `courseIds` (opcional): IDs dos cursos separados por vírgula (ex: `"id1,id2,id3"`). Se fornecido, retorna progresso de múltiplos cursos. Se não fornecido, usa o `[id]` do path.
- `includeLectures` (opcional): `true` para incluir detalhes de cada lecture (padrão: `false`)
- `includeExams` (opcional): `true` para incluir informações de exames relacionados ao curso (padrão: `false`)

## Exemplos de Uso

### Um único curso (usando path)

```bash
GET /api/courses/course_id_1/progress?includeLectures=true&includeExams=true
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

### Múltiplos cursos (usando query parameter)

```bash
GET /api/courses/course_id_1/progress?courseIds=course_id_1,course_id_2,course_id_3&includeLectures=true
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

**Nota**: Quando usar `courseIds`, o `[id]` do path pode ser qualquer valor, pois será ignorado se `courseIds` estiver presente.

## Resposta de Sucesso (200)

### Resposta para um único curso (compatibilidade)

Quando um único curso é solicitado (sem `courseIds` no query), a resposta mantém o formato original:

```json
{
  "success": true,
  "course": {
    "id": "course_id_1",
    "name": "Curso de Farmacologia",
    "slug": "curso-farmacologia",
    "description": "Curso completo de farmacologia",
    "points": 100,
    "workload": 40,
    "imageUrl": "https://example.com/banner.jpg"
  },
  "progress": {
    "status": "in_progress",
    "percentage": 60,
    "completedLectures": 6,
    "totalLectures": 10,
    "remainingLectures": 4,
    "isCompleted": false,
    "isReadyForCertificate": false
  },
  "certificate": null,
  "lastActivity": "2024-01-15T10:30:00.000Z"
}
```

### Resposta com Detalhes de Lectures (`includeLectures=true`)

```json
{
  "success": true,
  "course": {
    "id": "course_id_1",
    "name": "Curso de Farmacologia",
    "slug": "curso-farmacologia",
    "description": "Curso completo de farmacologia",
    "points": 100,
    "workload": 40,
    "imageUrl": "https://example.com/banner.jpg"
  },
  "progress": {
    "status": "in_progress",
    "percentage": 60,
    "completedLectures": 6,
    "totalLectures": 10,
    "remainingLectures": 4,
    "isCompleted": false,
    "isReadyForCertificate": false
  },
  "lectures": [
    {
      "id": "lecture_id_1",
      "title": "Introdução à Farmacologia",
      "completed": true,
      "completedAt": "2024-01-10T08:00:00.000Z"
    },
    {
      "id": "lecture_id_2",
      "title": "Farmacocinética",
      "completed": true,
      "completedAt": "2024-01-12T14:20:00.000Z"
    },
    {
      "id": "lecture_id_3",
      "title": "Farmacodinâmica",
      "completed": false,
      "completedAt": null
    }
  ],
  "certificate": null,
  "lastActivity": "2024-01-15T10:30:00.000Z"
}
```

### Resposta com Detalhes de Exames (`includeExams=true`)

```json
{
  "success": true,
  "course": {
    "id": "course_id_1",
    "name": "Curso de Farmacologia",
    "slug": "curso-farmacologia",
    "description": "Curso completo de farmacologia",
    "points": 100,
    "workload": 40,
    "imageUrl": "https://example.com/banner.jpg"
  },
  "progress": {
    "status": "in_progress",
    "percentage": 60,
    "completedLectures": 6,
    "totalLectures": 10,
    "remainingLectures": 4,
    "isCompleted": false,
    "isReadyForCertificate": false
  },
  "exams": [
    {
      "id": "exam_id_1",
      "lectureId": "lecture_id_1",
      "complete": true,
      "reproved": false,
      "timeLimit": 30,
      "passingScore": 70,
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-10T09:15:00.000Z"
    }
  ],
  "examStats": {
    "total": 3,
    "completed": 2,
    "reproved": 0,
    "pending": 1
  },
  "certificate": null,
  "lastActivity": "2024-01-15T10:30:00.000Z"
}
```

### Resposta para Curso Concluído

```json
{
  "success": true,
  "course": {
    "id": "course_id_1",
    "name": "Curso de Farmacologia",
    "slug": "curso-farmacologia",
    "description": "Curso completo de farmacologia",
    "points": 100,
    "workload": 40,
    "imageUrl": "https://example.com/banner.jpg"
  },
  "progress": {
    "status": "completed",
    "percentage": 100,
    "completedLectures": 10,
    "totalLectures": 10,
    "remainingLectures": 0,
    "isCompleted": true,
    "isReadyForCertificate": false
  },
  "certificate": {
    "id": "cert_id_1",
    "courseTitle": "Curso de Farmacologia",
    "points": 100,
    "workload": 40,
    "createdAt": "2024-01-20T15:00:00.000Z"
  },
  "lastActivity": "2024-01-20T15:00:00.000Z"
}
```

### Resposta para múltiplos cursos

Quando múltiplos cursos são solicitados (usando `courseIds` no query), a resposta retorna um objeto com array de cursos:

```json
{
  "success": true,
  "courses": [
    {
      "course": {
        "id": "course_id_1",
        "name": "Curso de Farmacologia",
        "slug": "curso-farmacologia",
        "description": "Curso completo de farmacologia",
        "points": 100,
        "workload": 40,
        "imageUrl": "https://example.com/banner.jpg"
      },
      "progress": {
        "status": "in_progress",
        "percentage": 60,
        "completedLectures": 6,
        "totalLectures": 10,
        "remainingLectures": 4,
        "isCompleted": false,
        "isReadyForCertificate": false
      },
      "certificate": null,
      "lastActivity": "2024-01-15T10:30:00.000Z"
    },
    {
      "course": {
        "id": "course_id_2",
        "name": "Curso de Anatomia",
        "slug": "curso-anatomia",
        "description": "Curso completo de anatomia",
        "points": 150,
        "workload": 60,
        "imageUrl": "https://example.com/banner2.jpg"
      },
      "progress": {
        "status": "completed",
        "percentage": 100,
        "completedLectures": 15,
        "totalLectures": 15,
        "remainingLectures": 0,
        "isCompleted": true,
        "isReadyForCertificate": false
      },
      "certificate": {
        "id": "cert_id_2",
        "courseTitle": "Curso de Anatomia",
        "points": 150,
        "workload": 60,
        "createdAt": "2024-01-20T15:00:00.000Z"
      },
      "lastActivity": "2024-01-20T15:00:00.000Z"
    }
  ],
  "total": 2
}
```

**Campos da resposta para múltiplos cursos:**

- `courses`: Array com os dados de progresso de cada curso (mesma estrutura da resposta de um único curso)
- `total`: Número total de cursos retornados

## Status do Progresso

O campo `status` pode ter os seguintes valores:

- `not_started`: O usuário ainda não iniciou o curso (nenhuma lecture concluída)
- `in_progress`: O usuário está em progresso (algumas lectures concluídas, mas não todas)
- `completed`: O curso foi concluído e o certificado foi gerado

## Campos de Resposta

### course

Informações do curso obtidas do Sanity CMS.

- `id`: ID do curso no Sanity
- `name`: Nome do curso
- `slug`: Slug do curso
- `description`: Descrição do curso
- `points`: Pontos oferecidos pelo curso
- `workload`: Carga horária do curso (em horas)
- `imageUrl`: URL da imagem de banner do curso

### progress

Informações de progresso do usuário no curso.

- `status`: Status do curso (`not_started`, `in_progress`, `completed`)
- `percentage`: Porcentagem de conclusão (0-100)
- `completedLectures`: Número de lectures concluídas
- `totalLectures`: Total de lectures do curso
- `remainingLectures`: Número de lectures restantes
- `isCompleted`: Indica se o curso foi concluído (tem certificado)
- `isReadyForCertificate`: Indica se todas as lectures foram concluídas mas o certificado ainda não foi gerado

### certificate

Informações do certificado (se existir).

- `id`: ID do certificado
- `courseTitle`: Título do curso no certificado
- `points`: Pontos do certificado
- `workload`: Carga horária do certificado
- `createdAt`: Data de criação do certificado

### lectures (quando `includeLectures=true`)

Array com detalhes de cada lecture do curso.

- `id`: ID da lecture
- `title`: Título da lecture
- `completed`: Indica se a lecture foi concluída
- `completedAt`: Data de conclusão (se concluída)

### exams (quando `includeExams=true`)

Array com informações dos exames relacionados ao curso.

- `id`: ID do exame
- `lectureId`: ID da lecture relacionada
- `complete`: Indica se o exame foi completado
- `reproved`: Indica se o exame foi reprovado
- `timeLimit`: Limite de tempo em minutos (opcional)
- `passingScore`: Pontuação mínima para aprovação em porcentagem (opcional)
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

### examStats (quando `includeExams=true`)

Estatísticas dos exames do curso.

- `total`: Total de exames
- `completed`: Número de exames completados
- `reproved`: Número de exames reprovados
- `pending`: Número de exames pendentes

### lastActivity

Data da última atividade do usuário no curso (data da última lecture concluída).

## Respostas de Erro

### 400 - Bad Request

```json
{
  "error": "Header X-User-Id é obrigatório"
}
```

ou

```json
{
  "error": "ID do curso é obrigatório"
}
```

### 404 - Not Found

```json
{
  "error": "Usuário não encontrado"
}
```

ou

```json
{
  "error": "Curso não encontrado"
}
```

### 401 - Unauthorized

```json
{
  "error": "Token de API inválido ou ausente"
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
  courseTitle String
  workload    Int
  description String
  points      Int
  userId      String?  @db.ObjectId
  createdAt   DateTime @default(now())
}
```

### Exam (Prisma)

```prisma
model Exam {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  lectureCMSid String
  userId       String        @db.ObjectId
  complete     Boolean?      @default(false)
  reproved     Boolean?      @default(false)
  timeLimit    Int?          // em minutos
  passingScore Int?          // porcentagem mínima para aprovação
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

## Notas

- A rota busca informações do curso diretamente do Sanity CMS
- O progresso é calculado com base nas lectures concluídas pelo usuário
- A porcentagem de progresso é calculada como: `(lectures concluídas / total de lectures) * 100`
- O status `isReadyForCertificate` indica quando o usuário pode gerar o certificado (todas as lectures concluídas, mas certificado ainda não gerado)
- Quando `includeLectures=true`, apenas informações básicas das lectures são retornadas (id, title, completed, completedAt)
- Quando `includeExams=true`, apenas exames relacionados às lectures do curso são retornados
- **Múltiplos cursos**: Quando usar `courseIds` para buscar múltiplos cursos, a resposta retorna um objeto com array `courses` e campo `total`. Quando buscar um único curso (sem `courseIds`), a resposta mantém o formato original para compatibilidade.
- Cursos não encontrados são filtrados automaticamente - apenas cursos válidos são retornados na resposta

