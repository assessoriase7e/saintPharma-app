# API Documentation - SaintPharma Mobile

Documentação das APIs REST criadas para o aplicativo React Native da SaintPharma.

## Autenticação

Todas as rotas da API requerem autenticação via token único armazenado em variáveis de ambiente.

### Headers Obrigatórios

```
Authorization: Bearer <API_TOKEN>
X-User-Id: <clerk_user_id>
Content-Type: application/json
```

- `Authorization`: Token de API definido na variável de ambiente `API_TOKEN`
- `X-User-Id`: ID do usuário no Clerk (obtido após login)

## Endpoints

### 1. Autenticação e Usuário

#### GET /api/auth/user
Retorna informações do usuário autenticado, incluindo pontos e vidas.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Resposta de Sucesso (200):**
```json
{
  "user": {
    "id": "string",
    "clerkId": "string",
    "name": "string",
    "email": "string",
    "profileImage": "string"
  },
  "points": 150,
  "lives": {
    "totalLives": 5,
    "remainingLives": 3,
    "damageCount": 2,
    "lastDamageAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Cursos

#### GET /api/courses
Retorna lista de todos os cursos disponíveis.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`

**Resposta de Sucesso (200):**
```json
{
  "courses": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "workload": 40,
      "points": 100,
      "image": "string"
    }
  ]
}
```

#### GET /api/courses/[id]
Retorna detalhes de um curso específico e suas aulas.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>` (opcional, para incluir progresso)

**Resposta de Sucesso (200):**
```json
{
  "course": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "workload": 40,
    "points": 100,
    "image": "string"
  },
  "lectures": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string"
    }
  ],
  "userProgress": [
    {
      "lectureCmsId": "string",
      "courseId": "string",
      "userId": "string"
    }
  ]
}
```

#### POST /api/courses/[id]/complete
Marca um curso como concluído e gera certificado.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Resposta de Sucesso (201):**
```json
{
  "message": "Curso concluído com sucesso",
  "certificate": {
    "id": "string",
    "courseTitle": "string",
    "workload": 40,
    "points": 100,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Ranking

#### GET /api/ranking
Retorna ranking geral de usuários baseado nos pontos do mês atual.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`

**Resposta de Sucesso (200):**
```json
{
  "ranking": [
    {
      "user": {
        "name": "string",
        "profileImage": "string"
      },
      "points": 250,
      "certificatesCount": 3
    }
  ]
}
```

#### GET /api/ranking/user
Retorna pontos totais e semanais do usuário.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Resposta de Sucesso (200):**
```json
{
  "totalPoints": 350,
  "weeklyPoints": 75,
  "position": 5
}
```

### 4. Vidas

#### GET /api/user/lives
Retorna informações sobre as vidas do usuário.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Resposta de Sucesso (200):**
```json
{
  "totalLives": 5,
  "remainingLives": 3,
  "damageCount": 2,
  "lastDamageAt": "2024-01-15T10:30:00Z"
}
```

### 5. Exames

#### POST /api/exams
Cria um novo exame para uma aula.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Body:**
```json
{
  "lectureCMSid": "string"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Exame criado com sucesso",
  "exam": {
    "id": "string",
    "lectureCMSid": "string",
    "complete": false,
    "reproved": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /api/exams/[id]
Busca detalhes de um exame específico.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Resposta de Sucesso (200):**
```json
{
  "id": "string",
  "lectureCMSid": "string",
  "complete": false,
  "reproved": false,
  "userId": "string",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### PUT /api/exams/[id]
Atualiza um exame (concluir ou reprovar).

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Body para Conclusão:**
```json
{
  "complete": true,
  "courseId": "string"
}
```

**Body para Reprovação:**
```json
{
  "reproved": true
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Exame concluído com sucesso",
  "exam": {
    "id": "string",
    "complete": true,
    "reproved": false
  },
  "lectureCompleted": true
}
```

### 6. Certificados

#### GET /api/certificates
Retorna todos os certificados do usuário.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Query Params (opcionais):**
- `page`: número da página (default: 0)
- `limit`: limite por página (default: 10)

**Resposta de Sucesso (200):**
```json
{
  "certificates": [
    {
      "id": "string",
      "courseTitle": "string",
      "workload": 40,
      "points": 100,
      "description": "string",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 10,
    "total": 5
  }
}
```

### 7. Aulas

#### GET /api/lectures
Retorna aulas de um curso com progresso do usuário.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Query Params:**
- `courseId`: ID do curso (obrigatório)

**Resposta de Sucesso (200):**
```json
{
  "lectures": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string",
      "completed": true
    }
  ],
  "totalLectures": 10,
  "completedLectures": 7
}
```

#### POST /api/lectures/[id]/complete
Marca uma aula como concluída.

**Headers:**
- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Body:**
```json
{
  "courseId": "string"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Aula marcada como concluída",
  "userLecture": {
    "id": "string",
    "lectureCmsId": "string",
    "courseId": "string",
    "userId": "string"
  }
}
```

## Códigos de Erro

### 400 - Bad Request
```json
{
  "error": "Parâmetro obrigatório ausente"
}
```

### 401 - Unauthorized
```json
{
  "error": "Token de API inválido ou ausente"
}
```

### 403 - Forbidden
```json
{
  "error": "Acesso negado ao recurso"
}
```

### 404 - Not Found
```json
{
  "error": "Recurso não encontrado"
}
```

### 409 - Conflict
```json
{
  "error": "Recurso já existe ou conflito de estado"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Erro interno do servidor"
}
```

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
# Token de API para autenticação do app mobile
API_TOKEN=seu_token_secreto_aqui

# Outras variáveis existentes...
DATABASE_URL=...
CLERK_SECRET_KEY=...
```

### Uso no React Native

Exemplo de configuração do cliente HTTP:

```javascript
// api.js
const API_BASE_URL = 'https://seudominio.com/api';
const API_TOKEN = 'seu_token_aqui';

const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'X-User-Id': await getUserId(), // Função para obter ID do usuário logado
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    return response.json();
  },

  // Métodos específicos
  getCourses: () => apiClient.request('/courses'),
  getUserInfo: () => apiClient.request('/auth/user'),
  completeCourse: (courseId) => 
    apiClient.request(`/courses/${courseId}/complete`, { method: 'POST' }),
};
```

## Notas Importantes

1. **Segurança**: O token de API deve ser mantido seguro e não exposto no código do cliente.
2. **Rate Limiting**: Considere implementar rate limiting para evitar abuso.
3. **Versionamento**: As APIs seguem versionamento semântico.
4. **Logs**: Todos os erros são logados no servidor para debugging.
5. **CORS**: Configure CORS adequadamente para permitir requisições do app mobile.

## Suporte

Para dúvidas ou problemas com a API, entre em contato com a equipe de desenvolvimento.