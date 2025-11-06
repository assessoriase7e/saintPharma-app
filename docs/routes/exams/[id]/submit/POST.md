# POST /api/exams/[id]/submit

Submete respostas de um exame.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): ID do usuário no Clerk
- `Content-Type` (obrigatório): application/json

## Path Parameters

- `id` (obrigatório): ID do exame

## Body

```json
{
  "answers": [
    {
      "questionId": "string (obrigatório)",
      "selectedAnswer": "string (obrigatório)"
    }
  ],
  "timeSpent": "number (obrigatório, em segundos)"
}
```

### Campos

#### answers
- **Tipo**: array
- **Obrigatório**: Sim
- **Descrição**: Array de respostas do exame

#### answers[].questionId
- **Tipo**: string
- **Obrigatório**: Sim
- **Descrição**: ID da questão

#### answers[].selectedAnswer
- **Tipo**: string
- **Obrigatório**: Sim
- **Descrição**: Resposta selecionada pelo usuário

#### timeSpent
- **Tipo**: number
- **Obrigatório**: Sim
- **Descrição**: Tempo gasto no exame em segundos

## Exemplo de Uso

```bash
POST /api/exams/507f1f77bcf86cd799439012/submit
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
Body:
{
  "answers": [
    {
      "questionId": "question_id_1",
      "selectedAnswer": "Resposta 1"
    },
    {
      "questionId": "question_id_2",
      "selectedAnswer": "Resposta 2"
    }
  ],
  "timeSpent": 1200
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "message": "Exame aprovado!",
    "result": {
      "examId": "507f1f77bcf86cd799439012",
      "totalQuestions": 10,
      "correctAnswers": 8,
      "score": 80,
      "passed": true,
      "timeSpent": 1200,
      "attemptId": "507f1f77bcf86cd799439013"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Resposta quando reprovado

```json
{
  "success": true,
  "data": {
    "message": "Exame reprovado",
    "result": {
      "examId": "507f1f77bcf86cd799439012",
      "totalQuestions": 10,
      "correctAnswers": 5,
      "score": 50,
      "passed": false,
      "timeSpent": 1200,
      "attemptId": "507f1f77bcf86cd799439013"
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

```json
{
  "error": "answers deve ser um array não vazio",
  "code": "INVALID_ANSWERS_FORMAT"
}
```

```json
{
  "error": "timeSpent deve ser um número positivo",
  "code": "INVALID_TIME_SPENT"
}
```

```json
{
  "error": "Cada resposta deve ter questionId e selectedAnswer",
  "code": "INVALID_ANSWER_FORMAT"
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
  "error": "Erro ao submeter exame"
}
```

## Validações

1. **answers**: Deve ser um array não vazio
2. **timeSpent**: Deve ser um número positivo
3. **Cada resposta**: Deve ter `questionId` e `selectedAnswer`

## Comportamento

1. **Cálculo de pontuação**: A API calcula automaticamente a pontuação baseada nas respostas corretas
2. **Aprovação**: O exame é aprovado se a pontuação for maior ou igual à nota de aprovação (`passingScore`)
3. **Registro de tentativa**: Uma tentativa (`ExamAttempt`) é criada com os resultados
4. **Atualização do exame**: O exame pode ser atualizado como concluído ou reprovado baseado no resultado

## Notas Importantes

1. **Tentativa única**: Cada submissão cria uma nova tentativa de exame
2. **Pontuação**: A pontuação é calculada como (respostas corretas / total de questões) * 100
3. **Aprovação**: A nota mínima para aprovação é definida no exame (`passingScore`)

