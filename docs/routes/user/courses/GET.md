# GET /api/user/courses

Retorna os cursos do usuário (em progresso e concluídos) com informações detalhadas de progresso.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário

## Query Parameters

- `status` (opcional): Status do curso para filtrar
  - `completed`: Apenas cursos concluídos
  - `in_progress`: Apenas cursos em progresso
  - `all`: Todos os cursos (padrão)

## Exemplo de Uso

```bash
GET /api/user/courses?status=completed
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

### Resposta com todos os cursos (status=all ou sem parâmetro)

```json
{
  "success": true,
  "completed": [
    {
      "id": "course_id_1",
      "title": "Curso de Farmacologia",
      "slug": "curso-farmacologia",
      "description": "Curso completo de farmacologia",
      "imageUrl": "https://example.com/image.jpg",
      "points": 100,
      "workload": 40,
      "status": "completed",
      "progress": 100,
      "progressDetails": {
        "status": "completed",
        "percentage": 100,
        "completedLectures": 10,
        "totalLectures": 10,
        "remainingLectures": 0,
        "isCompleted": true,
        "isReadyForCertificate": false
      },
      "completedLectures": 10,
      "totalLectures": 10,
      "certificate": {
        "id": "cert_id_1",
        "courseTitle": "Curso de Farmacologia",
        "points": 100,
        "workload": 40,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "certificateId": "cert_id_1",
      "completedAt": "2024-01-01T00:00:00.000Z",
      "lastActivity": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "inProgress": [
    {
      "id": "course_id_2",
      "title": "Curso de Anatomia",
      "slug": "curso-anatomia",
      "description": "Curso completo de anatomia",
      "imageUrl": "https://example.com/image2.jpg",
      "points": 150,
      "workload": 60,
      "status": "in_progress",
      "progress": 60,
      "progressDetails": {
        "status": "in_progress",
        "percentage": 60,
        "completedLectures": 6,
        "totalLectures": 10,
        "remainingLectures": 4,
        "isCompleted": false,
        "isReadyForCertificate": false
      },
      "completedLectures": 6,
      "totalLectures": 10,
      "certificate": null,
      "certificateId": null,
      "completedAt": null,
      "lastActivity": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-10T08:00:00.000Z"
    },
    {
      "id": "course_id_3",
      "title": "Curso de Fisiologia",
      "slug": "curso-fisiologia",
      "description": "Curso completo de fisiologia",
      "imageUrl": "https://example.com/image3.jpg",
      "points": 120,
      "workload": 50,
      "status": "ready_for_certificate",
      "progress": 100,
      "progressDetails": {
        "status": "in_progress",
        "percentage": 100,
        "completedLectures": 12,
        "totalLectures": 12,
        "remainingLectures": 0,
        "isCompleted": false,
        "isReadyForCertificate": true
      },
      "completedLectures": 12,
      "totalLectures": 12,
      "certificate": null,
      "certificateId": null,
      "completedAt": null,
      "lastActivity": "2024-01-20T14:00:00.000Z",
      "createdAt": "2024-01-05T09:00:00.000Z"
    }
  ],
  "totals": {
    "completed": 1,
    "inProgress": 2,
    "total": 3
  }
}
```

### Resposta filtrada por status (status=completed)

```json
{
  "success": true,
  "courses": [
    {
      "id": "course_id_1",
      "title": "Curso de Farmacologia",
      "slug": "curso-farmacologia",
      "description": "Curso completo de farmacologia",
      "imageUrl": "https://example.com/image.jpg",
      "points": 100,
      "workload": 40,
      "status": "completed",
      "progress": 100,
      "progressDetails": {
        "status": "completed",
        "percentage": 100,
        "completedLectures": 10,
        "totalLectures": 10,
        "remainingLectures": 0,
        "isCompleted": true,
        "isReadyForCertificate": false
      },
      "completedLectures": 10,
      "totalLectures": 10,
      "certificate": {
        "id": "cert_id_1",
        "courseTitle": "Curso de Farmacologia",
        "points": 100,
        "workload": 40,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "certificateId": "cert_id_1",
      "completedAt": "2024-01-01T00:00:00.000Z",
      "lastActivity": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "status": "completed"
}
```

### Resposta filtrada por status (status=in_progress)

```json
{
  "success": true,
  "courses": [
    {
      "id": "course_id_2",
      "title": "Curso de Anatomia",
      "slug": "curso-anatomia",
      "description": "Curso completo de anatomia",
      "imageUrl": "https://example.com/image2.jpg",
      "points": 150,
      "workload": 60,
      "status": "in_progress",
      "progress": 60,
      "progressDetails": {
        "status": "in_progress",
        "percentage": 60,
        "completedLectures": 6,
        "totalLectures": 10,
        "remainingLectures": 4,
        "isCompleted": false,
        "isReadyForCertificate": false
      },
      "completedLectures": 6,
      "totalLectures": 10,
      "certificate": null,
      "certificateId": null,
      "completedAt": null,
      "lastActivity": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-10T08:00:00.000Z"
    }
  ],
  "total": 1,
  "status": "in_progress"
}
```

## Campos da Resposta

### Campos do Curso

- `id`: ID do curso no Sanity CMS
- `title`: Nome do curso
- `slug`: Slug do curso (opcional)
- `description`: Descrição do curso
- `imageUrl`: URL da imagem de banner do curso
- `points`: Pontos oferecidos pelo curso
- `workload`: Carga horária do curso (em horas)

### Campos de Status e Progresso

- `status`: Status do curso (`not_started`, `in_progress`, `ready_for_certificate`, `completed`)
- `progress`: Porcentagem de conclusão (0-100) - **mantido para compatibilidade**
- `progressDetails`: Objeto detalhado com informações de progresso:
  - `status`: Status do curso
  - `percentage`: Porcentagem de conclusão (0-100)
  - `completedLectures`: Número de lectures concluídas
  - `totalLectures`: Total de lectures do curso
  - `remainingLectures`: Número de lectures restantes
  - `isCompleted`: Indica se o curso foi concluído (tem certificado)
  - `isReadyForCertificate`: Indica se todas as lectures foram concluídas mas o certificado ainda não foi gerado

### Campos de Lectures

- `completedLectures`: Número de lectures concluídas - **mantido para compatibilidade**
- `totalLectures`: Total de lectures do curso - **mantido para compatibilidade**

### Campos de Certificado

- `certificate`: Objeto completo do certificado (se existir):
  - `id`: ID do certificado
  - `courseTitle`: Título do curso no certificado
  - `points`: Pontos do certificado
  - `workload`: Carga horária do certificado
  - `createdAt`: Data de criação do certificado
- `certificateId`: ID do certificado - **mantido para compatibilidade**
- `completedAt`: Data de conclusão do curso - **mantido para compatibilidade**

### Campos de Atividade

- `lastActivity`: Data da última atividade do usuário no curso (data da última lecture concluída)
- `createdAt`: Data de início do curso (data da primeira lecture concluída)

## Status do Curso

O campo `status` pode ter os seguintes valores:

- `not_started`: O usuário ainda não iniciou o curso (nenhuma lecture concluída)
- `in_progress`: O usuário está em progresso (algumas lectures concluídas, mas não todas)
- `ready_for_certificate`: Todas as lectures foram concluídas, mas o certificado ainda não foi gerado
- `completed`: O curso foi concluído e o certificado foi gerado

## Notas

- A rota busca informações dos cursos diretamente do Sanity CMS
- O progresso é calculado com base nas lectures concluídas pelo usuário
- A porcentagem de progresso é calculada como: `(lectures concluídas / total de lectures) * 100`
- Campos marcados como "mantido para compatibilidade" são mantidos para não quebrar integrações existentes, mas recomenda-se usar os novos campos (`progressDetails`, `certificate`, etc.)
- O campo `progressDetails` contém todas as informações de progresso de forma estruturada
- O campo `isReadyForCertificate` indica quando o usuário pode gerar o certificado (todas as lectures concluídas, mas certificado ainda não gerado)

## Modelos de Dados Relacionados (Banco de Dados)

### Certificate (Prisma)

```prisma
model Certificate {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  courseCmsId String
  courseTitle String
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

