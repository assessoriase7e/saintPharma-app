# POST /api/certificate/for-user

Cria ou retorna certificado existente para o usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk
- `Content-Type` (obrigatório): application/json

## Body

```json
{
  "course": {
    "_id": "string (obrigatório)",
    "name": "string (opcional)",
    "description": "string (opcional)",
    "points": "number (opcional)",
    "workload": "number (opcional)",
    "banner": "object (opcional)",
    "slug": "string (opcional)"
  }
}
```

### Campos

#### course
- **Tipo**: object
- **Obrigatório**: Sim
- **Descrição**: Objeto do curso

#### course._id
- **Tipo**: string
- **Obrigatório**: Sim
- **Descrição**: ID do curso no CMS (Sanity)

## Exemplo de Uso

```bash
POST /api/certificate/for-user
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
Body:
{
  "course": {
    "_id": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9",
    "name": "Curso de Farmacologia",
    "description": "Curso completo de farmacologia básica",
    "points": 100,
    "workload": 40
  }
}
```

## Resposta de Sucesso

### 200 - Certificado Existente

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

### 201 - Certificado Criado

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
  "error": "Header X-User-Id é obrigatório",
  "code": "MISSING_USER_ID"
}
```

```json
{
  "error": "course é obrigatório"
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

### 500 - Internal Server Error

```json
{
  "error": "Erro ao processar certificado"
}
```

## Notas Importantes

1. **Autenticação**: Esta rota usa token de API, não autenticação do Clerk
2. **Comportamento**: Se já existe um certificado para o curso, retorna o existente (200). Caso contrário, cria um novo (201)
3. **Usuário**: O usuário é identificado através do header `X-User-Id` com o Clerk ID
4. **Idempotência**: Múltiplas chamadas com os mesmos parâmetros retornam o mesmo certificado

