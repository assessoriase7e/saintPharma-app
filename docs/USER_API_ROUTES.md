# Rotas API para Usuários

Este documento descreve as rotas API disponíveis para gerenciamento de usuários no sistema SaintPharma.

## Autenticação

Todas as rotas requerem autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Rotas Disponíveis

### 📋 **Índice das Rotas**

#### Criação de Usuários

- [POST /api/user/create](#1-criar-usuário-individual) - Criar usuário individual
- [POST /api/user/bulk-create](#2-criar-múltiplos-usuários) - Criar múltiplos usuários

#### Busca de Informações

- [GET /api/user](#3-buscar-usuário) - Buscar usuário básico
- [GET /api/user/profile](#4-buscar-perfil-completo) - Buscar perfil completo
- [GET /api/user/summary](#5-resumo-do-usuário) - Resumo detalhado do usuário
- [GET /api/user/stats](#6-estatísticas-do-usuário) - Estatísticas detalhadas
- [GET /api/user/activities](#7-atividades-do-usuário) - Histórico de atividades
- [GET /api/user/progress](#8-progresso-por-curso) - Progresso por curso
- [GET /api/user/points](#9-pontuação-do-usuário) - Buscar pontuação

#### Atualização de Informações

- [PUT /api/user/update](#10-atualizar-usuário) - Atualizar informações do usuário
- [PUT /api/user/complete](#11-completar-dados) - Completar dados do usuário
- [PUT /api/user/points](#12-alterar-pontuação) - Alterar pontuação do usuário

---

### 1. Criar Usuário Individual

**POST** `/api/user/create`

Cria um novo usuário no banco de dados.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `Content-Type: application/json` (obrigatório)

#### Body

```json
{
  "clerkId": "user_2abc123def456",
  "email": "usuario@exemplo.com",
  "name": "João Silva",
  "profileImage": "https://example.com/avatar.jpg"
}
```

#### Campos

- `clerkId` (string, obrigatório): ID do usuário no Clerk
- `email` (string, obrigatório): Email do usuário
- `name` (string, opcional): Nome do usuário
- `profileImage` (string, opcional): URL da imagem de perfil

#### Resposta de Sucesso (201)

```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "user_id",
    "clerkId": "user_2abc123def456",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "profileImage": "https://example.com/avatar.jpg",
    "points": 0,
    "quizzes": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Resposta de Erro (409)

```json
{
  "error": "Usuário já existe com este Clerk ID"
}
```

### 2. Criar Múltiplos Usuários

**POST** `/api/user/bulk-create`

Cria múltiplos usuários no banco de dados em uma única requisição.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `Content-Type: application/json` (obrigatório)

#### Body

```json
{
  "users": [
    {
      "clerkId": "user_2abc123def456",
      "email": "usuario1@exemplo.com",
      "name": "João Silva"
    },
    {
      "clerkId": "user_2def456ghi789",
      "email": "usuario2@exemplo.com",
      "name": "Maria Santos",
      "profileImage": "https://example.com/avatar2.jpg"
    }
  ]
}
```

#### Limitações

- Máximo de 100 usuários por requisição
- Array não pode estar vazio

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Processamento concluído: 2 criados, 0 com erro",
  "results": {
    "created": [
      {
        "index": 0,
        "user": {
          "id": "user_id_1",
          "clerkId": "user_2abc123def456",
          "name": "João Silva",
          "email": "usuario1@exemplo.com",
          "points": 0,
          "quizzes": [],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      }
    ],
    "errors": []
  }
}
```

### 3. Buscar Usuário

**GET** `/api/user`

Busca um usuário pelo Clerk ID.

### 4. Buscar Perfil Completo

**GET** `/api/user/profile`

Busca o perfil completo de um usuário pelo Clerk ID.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `X-User-Id: <clerk_user_id>` (opcional, se não fornecido via query)

#### Query Parameters

- `clerkId` (string, opcional): ID do usuário no Clerk

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Perfil do usuário encontrado com sucesso",
  "profile": {
    "id": "user_id",
    "clerkId": "user_2abc123def456",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "profileImage": "https://example.com/avatar.jpg",
    "points": 100,
    "quizzes": ["quiz1", "quiz2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Resumo do Usuário

**GET** `/api/user/summary`

Retorna um resumo detalhado do usuário incluindo estatísticas de estudo, certificados e ranking.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `X-User-Id: <clerk_user_id>` (obrigatório)

#### Query Parameters

- `period` (string, opcional): "week", "month", "all" (padrão: "all")

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "clerkId": "user_2abc123def456",
      "name": "João Silva",
      "email": "usuario@exemplo.com",
      "profileImage": "https://example.com/avatar.jpg",
      "points": 150
    },
    "studyHours": {
      "total": 25.5,
      "thisWeek": 5.0,
      "thisMonth": 15.5
    },
    "courses": {
      "completed": 3,
      "inProgress": 2,
      "total": 5
    },
    "certificates": {
      "total": 3,
      "recent": [...]
    },
    "ranking": {
      "position": 15,
      "totalUsers": 100
    },
    "activities": {
      "recentLectures": [...],
      "recentExams": [...]
    }
  }
}
```

### 6. Estatísticas do Usuário

**GET** `/api/user/stats`

Busca estatísticas detalhadas de um usuário com filtros por período.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `X-User-Id: <clerk_user_id>` (opcional, se não fornecido via query)

#### Query Parameters

- `clerkId` (string, opcional): ID do usuário no Clerk
- `period` (string, opcional): "week", "month", "year", "all" (padrão: "all")
- `includeDetails` (boolean, opcional): "true" para incluir detalhes (padrão: "false")

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Estatísticas do usuário encontradas com sucesso",
  "stats": {
    "period": "month",
    "user": {
      "id": "user_id",
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
    }
  }
}
```

### 7. Atividades do Usuário

**GET** `/api/user/activities`

Busca o histórico de atividades de um usuário com filtros e paginação.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `X-User-Id: <clerk_user_id>` (opcional, se não fornecido via query)

#### Query Parameters

- `clerkId` (string, opcional): ID do usuário no Clerk
- `type` (string, opcional): "certificate", "lecture", "exam", "damage", "all" (padrão: "all")
- `period` (string, opcional): "week", "month", "year", "all" (padrão: "all")
- `page` (number, opcional): Página para paginação (padrão: 1)
- `limit` (number, opcional): Limite de resultados por página (padrão: 20, máximo: 100)

#### Resposta de Sucesso (200)

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

### 8. Progresso por Curso

**GET** `/api/user/progress`

Retorna progresso detalhado do usuário por curso com filtros e paginação.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `X-User-Id: <clerk_user_id>` (obrigatório)

#### Query Parameters

- `courseId` (string, opcional): ID específico do curso para filtrar
- `status` (string, opcional): "in_progress", "completed", "not_started", "all" (padrão: "all")
- `includeDetails` (boolean, opcional): "true" para incluir detalhes das aulas (padrão: "false")
- `page` (number, opcional): Número da página para paginação (padrão: 1)
- `limit` (number, opcional): Limite de resultados por página (padrão: 10)

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
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
          "courseId": "course_123",
          "status": "completed",
          "progress": {
            "completed": 10,
            "total": null,
            "percentage": null
          },
          "isCompleted": true,
          "certificateId": "cert_123",
          "completedAt": "2024-01-01T00:00:00.000Z",
          "lastActivity": "2024-01-01T00:00:00.000Z"
        }
      ],
      "stats": {
        "totalCourses": 5,
        "completedCourses": 3,
        "inProgressCourses": 2,
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
    },
    "filters": {
      "courseId": null,
      "status": "all",
      "includeDetails": false
    }
  }
}
```

### 9. Pontuação do Usuário

**GET** `/api/user/points`

Busca a pontuação atual do usuário.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `X-User-Id: <clerk_user_id>` (obrigatório)

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "clerkId": "user_2abc123def456",
      "name": "João Silva",
      "email": "usuario@exemplo.com",
      "points": 150
    }
  }
}
```

### 10. Atualizar Usuário

**PUT** `/api/user/update`

Atualiza informações do usuário.

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `X-User-Id: <clerk_user_id>` (obrigatório)
- `Content-Type: application/json` (obrigatório)

#### Body (todos os campos são opcionais)

- `name` (string): Nome do usuário
- `email` (string): Email do usuário
- `profileImage` (string): URL da imagem de perfil
- `points` (number): Pontuação do usuário
- `quizzes` (string[]): Array de IDs de quizzes

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "user": {
    "id": "user_id",
    "clerkId": "clerk_user_id",
    "name": "João Silva Santos",
    "email": "novoemail@exemplo.com",
    "profileImage": "https://example.com/new-avatar.jpg",
    "points": 150,
    "quizzes": ["quiz1", "quiz2", "quiz3"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 11. Completar Dados

**PUT** `/api/user/complete`

Completa dados do usuário (sobrenome e/ou nome).

#### Query Parameters

- `clerkId` (string, opcional): ID do usuário no Clerk

#### Exemplo de Uso

```
GET /api/user?clerkId=user_2abc123def456
```

ou

```
GET /api/user
```

(com header `X-User-Id: user_2abc123def456`)

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Usuário encontrado com sucesso",
  "user": {
    "id": "user_id",
    "clerkId": "user_2abc123def456",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "profileImage": "https://example.com/avatar.jpg",
    "points": 100,
    "quizzes": ["quiz1", "quiz2"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Resposta de Erro (404)

```json
{
  "error": "Usuário não encontrado"
}
```

### 4. Completar Dados do Usuário

**PUT** `/api/user/complete`

Completa dados do usuário (sobrenome e/ou nome).

#### Headers

- `Authorization: Bearer <API_TOKEN>` (obrigatório)
- `X-User-Id: <clerk_user_id>` (obrigatório)
- `Content-Type: application/json` (obrigatório)

#### Body

```json
{
  "lastName": "Silva",
  "firstName": "João"
}
```

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Dados do usuário completados com sucesso",
  "user": {
    "id": "user_id",
    "clerkId": "clerk_user_id",
    "name": "João Silva",
    "email": "user@example.com",
    "profileImage": "image_url",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Erro de validação (dados inválidos)
- `401`: Não autorizado (token inválido)
- `404`: Usuário não encontrado
- `409`: Conflito (usuário já existe)
- `500`: Erro interno do servidor

## Validações

### Email

- Deve ter formato válido de email
- Deve ser único no sistema

### ClerkId

- Deve ser único no sistema
- Não pode estar vazio

### Nome

- Opcional
- Se fornecido, não pode estar vazio

### ProfileImage

- Opcional
- Deve ser uma URL válida se fornecido

## Exemplos de Uso com cURL

### Criar usuário individual

```bash
curl -X POST http://localhost:3000/api/user/create \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "user_2abc123def456",
    "email": "usuario@exemplo.com",
    "name": "João Silva"
  }'
```

### Buscar usuário

```bash
curl -X GET "http://localhost:3000/api/user?clerkId=user_2abc123def456" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Buscar perfil completo

```bash
curl -X GET "http://localhost:3000/api/user/profile?clerkId=user_2abc123def456" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Buscar estatísticas do usuário

```bash
curl -X GET "http://localhost:3000/api/user/stats?clerkId=user_2abc123def456&period=month&includeDetails=true" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Buscar atividades do usuário

```bash
curl -X GET "http://localhost:3000/api/user/activities?clerkId=user_2abc123def456&type=exam&period=month&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Atualizar usuário

```bash
curl -X PUT http://localhost:3000/api/user/update \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "X-User-Id: user_2abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Santos",
    "email": "novoemail@exemplo.com",
    "points": 150
  }'
```

### Alterar pontuação do usuário

```bash
curl -X PUT http://localhost:3000/api/user/points \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "X-User-Id: user_2abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "points": 50,
    "operation": "add",
    "reason": "Conclusão de curso"
  }'
```

### Criar múltiplos usuários

```bash
curl -X POST http://localhost:3000/api/user/bulk-create \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {
        "clerkId": "user_2abc123def456",
        "email": "usuario1@exemplo.com",
        "name": "João Silva"
      },
      {
        "clerkId": "user_2def456ghi789",
        "email": "usuario2@exemplo.com",
        "name": "Maria Santos"
      }
    ]
  }'
```
