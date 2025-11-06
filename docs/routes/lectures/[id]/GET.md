# GET /api/lectures/[id]

Retorna detalhes de uma aula específica.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (opcional): ID do usuário no Clerk (para verificar se foi concluída)

## Path Parameters

- `id` (obrigatório): ID da aula

## Exemplo de Uso

```bash
GET /api/lectures/lecture_id_123
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "_id": "lecture_id_123",
    "title": "Aula 1: Introdução",
    "description": "Introdução ao curso",
    "completed": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "ID da aula é obrigatório"
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
  "error": "Aula não encontrada"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar detalhes da aula"
}
```

## Notas Importantes

1. **Progresso**: Se `X-User-Id` for fornecido, a resposta incluirá o campo `completed` indicando se a aula foi concluída
2. **Fonte de dados**: A aula é buscada do Sanity CMS
3. **Informações completas**: Retorna todas as informações da aula, incluindo conteúdo, vídeos, etc.

