# GET /api/exams/[id]/questions

Retorna um exame com suas perguntas e respostas.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk

## Path Parameters

- `id` (obrigatório): ID do exame

## Exemplo de Uso

```bash
GET /api/exams/507f1f77bcf86cd799439012/questions
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "exam": {
      "id": "507f1f77bcf86cd799439012",
      "lectureCMSid": "lecture_id_123",
      "userId": "507f1f77bcf86cd799439011",
      "complete": false,
      "reproved": false,
      "timeLimit": 30,
      "passingScore": 70,
      "questions": [
        {
          "id": "question_id_1",
          "title": "Título da questão",
          "question": "Pergunta da questão",
          "cover": "url_da_imagem",
          "answers": [
            {
              "answer": "Resposta 1",
              "isCorrect": true
            },
            {
              "answer": "Resposta 2",
              "isCorrect": false
            }
          ]
        }
      ],
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
  "error": "ID do exame é obrigatório",
  "code": "MISSING_EXAM_ID"
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

```json
{
  "error": "Exame não encontrado",
  "code": "EXAM_NOT_FOUND"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar exame com perguntas"
}
```

## Notas Importantes

1. **Acesso**: O usuário só pode acessar perguntas de seus próprios exames
2. **Estrutura**: As perguntas incluem todas as respostas possíveis e indicam qual é a correta
3. **Quiz**: As perguntas são buscadas do quiz associado à lecture do exame

