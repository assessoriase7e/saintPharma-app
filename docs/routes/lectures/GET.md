# GET /api/lectures

Retorna aulas de um curso específico com progresso do usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (opcional): ID do usuário no Clerk (para incluir progresso)

## Query Parameters (obrigatórios)

- `courseId` (obrigatório): ID do curso

## Exemplo de Uso

```bash
GET /api/lectures?courseId=5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "lectures": [
      {
        "_id": "lecture_id_1",
        "title": "Aula 1: Introdução",
        "description": "Introdução ao curso",
        "completed": true
      },
      {
        "_id": "lecture_id_2",
        "title": "Aula 2: Conceitos Básicos",
        "description": "Conceitos básicos do curso",
        "completed": false
      }
    ],
    "totalLectures": 10,
    "completedLectures": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "Query param courseId é obrigatório"
}
```

### 401 - Unauthorized

```json
{
  "error": "Token de API inválido ou ausente"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar aulas"
}
```

## Notas Importantes

1. **Progresso**: Se `X-User-Id` for fornecido, cada aula incluirá o campo `completed` indicando se foi concluída
2. **Fonte de dados**: As aulas são buscadas do Sanity CMS
3. **Ordenação**: As aulas são retornadas na ordem definida no curso

