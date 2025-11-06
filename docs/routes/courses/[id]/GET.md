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
    "workload": 40,
    "premiumPoints": null,
    "canAccess": true,
    "weekPointsRequired": null,
    "userWeekPoints": 750
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

## Campos da Resposta

### course

- `_id`: ID do curso no Sanity CMS
- `name`: Nome do curso
- `description`: Descrição do curso
- `banner`: Objeto com informações da imagem de banner
- `points`: Pontos oferecidos pelo curso
- `workload`: Carga horária do curso (em horas)
- `premiumPoints`: Pontos semanais necessários para acessar o curso premium (null se não for premium)
- `canAccess`: Indica se o usuário pode acessar o curso premium (baseado em pontos da semana)
- `weekPointsRequired`: Pontos semanais necessários para acessar (null se não for premium)
- `userWeekPoints`: Pontos semanais do usuário (null se X-User-Id não foi fornecido)

## Acesso a Cursos Premium

Cursos premium são identificados pelo campo `premiumPoints` maior que 0. O acesso a esses cursos é determinado pelos pontos que o usuário ganhou durante a semana atual:

- **Lógica de acesso**: Se `userWeekPoints > premiumPoints`, então `canAccess = true`
- **Cursos não premium**: Cursos sem `premiumPoints` (ou `premiumPoints = null`) sempre têm `canAccess = true`
- **Sem usuário**: Se `X-User-Id` não for fornecido, `canAccess` será `true` para todos os cursos, mas `userWeekPoints` será `null`

### Cálculo de Pontos da Semana

Os pontos da semana são calculados com base em:
- **Certificados**: Pontos do certificado (definido no curso)
- **Exames**: 10 pontos por exame concluído
- **Aulas**: 5 pontos por aula concluída

A semana é calculada de domingo a sábado (semana brasileira).

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




