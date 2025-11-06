# GET /api/certificate

Lista todos os certificados do usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk

## Query Parameters (opcionais)

- `page` (opcional): Número da página (padrão: 0)
- `limit` (opcional): Itens por página (padrão: 20, máximo: 100)

## Exemplo de Uso

```bash
GET /api/certificate?page=0&limit=20
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "certificates": [
      {
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
    ],
    "pagination": {
      "page": 0,
      "limit": 20,
      "total": 5,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
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
  "error": "Erro ao buscar certificados do usuário"
}
```

## Notas Importantes

1. **Paginação**: A paginação é aplicada manualmente após buscar todos os certificados do usuário
2. **Ordenação**: Os certificados são retornados na ordem em que foram criados (mais recentes primeiro)
3. **Acesso**: O usuário só pode ver seus próprios certificados
