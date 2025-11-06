# GET /api/certificate/[id]

Retorna um certificado específico por ID.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk

## Path Parameters

- `id` (obrigatório): ID do certificado

## Exemplo de Uso

```bash
GET /api/certificate/507f1f77bcf86cd799439012
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

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
  "error": "ID do certificado é obrigatório",
  "code": "MISSING_CERTIFICATE_ID"
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
  "error": "Acesso negado ao certificado",
  "code": "FORBIDDEN"
}
```

### 404 - Not Found

```json
{
  "error": "Usuário não encontrado",
  "code": "USER_NOT_FOUND"
}
```

```json
{
  "error": "Certificado não encontrado",
  "code": "CERTIFICATE_NOT_FOUND"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar certificado"
}
```

## Notas Importantes

1. **Acesso**: O usuário só pode acessar seus próprios certificados
2. **Validação**: A API verifica se o certificado pertence ao usuário antes de retornar
3. **Segurança**: Tentativas de acessar certificados de outros usuários retornam erro 403

