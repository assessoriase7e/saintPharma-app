# POST /api/certificate/create

Cria um novo certificado para um usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `Content-Type` (obrigatório): application/json

## Body

```json
{
  "userId": "string (obrigatório)",
  "course": {
    "_id": "string (obrigatório)",
    "name": "string (obrigatório)",
    "description": "string (opcional)",
    "points": "number (opcional, padrão: 0)",
    "workload": "number (opcional, padrão: 0)",
    "premiumPoints": "number (opcional, padrão: 0)",
    "banner": "object (opcional)",
    "slug": "string (opcional)"
  }
}
```

### Campos

#### userId
- **Tipo**: string
- **Obrigatório**: Sim
- **Descrição**: ID do usuário no banco de dados (ObjectId do MongoDB) ou Clerk ID (começa com "user_")
- **Normalização**: Se for um Clerk ID (começa com "user_"), a API automaticamente converte para o userId do MongoDB

#### course
- **Tipo**: object
- **Obrigatório**: Sim
- **Descrição**: Objeto do curso

#### course._id
- **Tipo**: string
- **Obrigatório**: Sim
- **Descrição**: ID do curso no CMS (Sanity). Também aceita `course.id` como alternativa
- **Normalização**: A API aceita tanto `_id` quanto `id` como identificador do curso

#### course.name
- **Tipo**: string
- **Obrigatório**: Sim
- **Descrição**: Nome do curso. Também aceita `course.title` ou `course.courseTitle` como alternativa
- **Normalização**: A API aceita `name`, `title` ou `courseTitle` como nome do curso
- **Padrão**: String vazia se não fornecido

#### course.description
- **Tipo**: string
- **Obrigatório**: Não
- **Descrição**: Descrição do curso
- **Padrão**: String vazia se não fornecido

#### course.points
- **Tipo**: number
- **Obrigatório**: Não
- **Descrição**: Pontos concedidos ao completar o curso
- **Padrão**: 0 se não fornecido

#### course.workload
- **Tipo**: number
- **Obrigatório**: Não
- **Descrição**: Carga horária do curso em horas
- **Padrão**: 0 se não fornecido

#### course.premiumPoints
- **Tipo**: number
- **Obrigatório**: Não
- **Descrição**: Pontos premium do curso
- **Padrão**: 0 se não fornecido

#### course.banner
- **Tipo**: object
- **Obrigatório**: Não
- **Descrição**: Banner do curso com estrutura `{ asset: { url: string } }`
- **Padrão**: `{ asset: { url: "" } }` se não fornecido

#### course.slug
- **Tipo**: string
- **Obrigatório**: Não
- **Descrição**: Slug do curso para URLs amigáveis

## Normalização de Dados

A API normaliza automaticamente os dados para garantir compatibilidade com diferentes formatos de entrada:

### userId
- Se `userId` começar com `"user_"`, é tratado como Clerk ID e convertido automaticamente para o userId do MongoDB
- Se `userId` não começar com `"user_"`, é tratado como userId do MongoDB diretamente

### course
- `course._id` ou `course.id` → normalizado para `_id`
- `course.name`, `course.title` ou `course.courseTitle` → normalizado para `name`
- Campos numéricos (`points`, `workload`, `premiumPoints`) que sejam `null` ou `undefined` → normalizados para `0`
- `course.description` que seja `null` ou `undefined` → normalizado para string vazia `""`
- `course.banner` que seja `null` ou `undefined` → normalizado para `{ asset: { url: "" } }`

## Exemplo de Uso

### Exemplo 1: Formato completo

```bash
POST /api/certificate/create
Headers:
  Authorization: Bearer <API_TOKEN>
  Content-Type: application/json
Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "course": {
    "_id": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
    "name": "Curso de Farmacologia",
    "description": "Curso completo de farmacologia básica",
    "points": 100,
    "workload": 40,
    "premiumPoints": 50,
    "banner": {
      "asset": {
        "url": "https://example.com/banner.jpg"
      }
    },
    "slug": "curso-farmacologia"
  }
}
```

### Exemplo 2: Usando Clerk ID (com normalização)

```bash
POST /api/certificate/create
Headers:
  Authorization: Bearer <API_TOKEN>
  Content-Type: application/json
Body:
{
  "userId": "user_2abc123def456",
  "course": {
    "id": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
    "title": "Curso de Farmacologia"
  }
}
```

Neste exemplo, a API normalizará:
- `userId` (Clerk ID) → convertido para userId do MongoDB
- `id` → `_id`
- `title` → `name`
- Campos ausentes receberão valores padrão

### Exemplo 3: Formato mínimo (com normalização)

```bash
POST /api/certificate/create
Headers:
  Authorization: Bearer <API_TOKEN>
  Content-Type: application/json
Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "course": {
    "id": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
    "title": "Curso de Farmacologia"
  }
}
```

Neste exemplo, a API normalizará:
- `id` → `_id`
- `title` → `name`
- Campos ausentes receberão valores padrão

## Resposta de Sucesso (201)

```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "507f1f77bcf86cd799439012",
      "courseCmsId": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
      "courseTitle": "Curso de Farmacologia",
      "description": "Curso completo de farmacologia básica",
      "workload": 40,
      "points": 100,
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "userId (ou clerkId) e course são obrigatórios"
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
  "error": "Usuário não encontrado",
  "code": "USER_NOT_FOUND"
}
```

**Nota**: Este erro ocorre quando um Clerk ID é fornecido mas o usuário não existe no banco de dados.

### 500 - Internal Server Error

```json
{
  "error": "Erro ao criar certificado",
  "code": undefined,
  "details": undefined,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Comportamento

1. **Criação do Certificado**: Cria um novo certificado no banco de dados com os dados normalizados do curso
2. **Atribuição de Pontos**: Se `course.points > 0`, os pontos são automaticamente adicionados ao usuário
3. **Auditoria**: Um evento de auditoria é registrado com os detalhes da criação do certificado

## Validações

1. **userId**: Deve ser um ObjectId válido do MongoDB
2. **course**: Deve ser um objeto válido
3. **course._id ou course.id**: Deve estar presente (obrigatório)
4. **course.name, course.title ou course.courseTitle**: Pelo menos um deve estar presente (obrigatório)

## Modelo de Dados (Banco de Dados)

### Certificate (Prisma)

O certificado criado segue o modelo `Certificate` do Prisma:

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

### Campos Obrigatórios no Banco

- `courseTitle`: String (obrigatório)
- `workload`: Int (obrigatório, mínimo: 0)
- `description`: String (obrigatório)
- `points`: Int (obrigatório, mínimo: 0)
- `courseCmsId`: String (obrigatório)
- `userId`: String? (opcional, mas recomendado)

### Campos Gerados Automaticamente

- `id`: Gerado automaticamente pelo MongoDB
- `createdAt`: Data/hora de criação (automático)
- `updatedAt`: Data/hora de atualização (automático)

## Notas Importantes

1. **Normalização Automática**: A API normaliza automaticamente os dados do curso, então você pode enviar o objeto em diferentes formatos sem se preocupar com campos ausentes
2. **Valores Padrão**: Campos opcionais recebem valores padrão seguros (0 para números, "" para strings)
3. **Pontos do Usuário**: Os pontos do curso são automaticamente adicionados ao total de pontos do usuário se `course.points > 0`
4. **Duplicação**: Esta rota não verifica se já existe um certificado para o curso. Use `/api/certificate/for-user` se precisar dessa verificação

