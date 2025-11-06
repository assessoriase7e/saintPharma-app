# GET /api/lectures/[id]/questions

Retorna as questões de uma aula específica no formato QuestionResponse.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API

## Path Parameters

- `id` (obrigatório): ID da aula

## Exemplo de Uso

```bash
GET /api/lectures/lecture_id_123/questions
Headers:
  Authorization: Bearer <API_TOKEN>
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "questions": [
      {
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
    "totalQuestions": 10,
    "timeLimit": 30,
    "passingScore": 70
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

```json
{
  "error": "Quiz não encontrado para esta aula"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar questões da aula"
}
```

## Campos da Resposta

### questions
- **Tipo**: array
- **Descrição**: Array de questões do quiz da aula

### totalQuestions
- **Tipo**: number
- **Descrição**: Total de questões no quiz

### timeLimit
- **Tipo**: number
- **Descrição**: Limite de tempo em minutos (padrão: 30)

### passingScore
- **Tipo**: number
- **Descrição**: Nota mínima para aprovação em porcentagem (padrão: 70)

## Notas Importantes

1. **Formato**: As questões são retornadas no formato `QuestionResponse` padronizado
2. **Quiz**: As questões são buscadas do quiz associado à aula no Sanity CMS
3. **Respostas corretas**: O campo `isCorrect` indica qual resposta está correta
4. **Valores padrão**: `timeLimit` e `passingScore` têm valores padrão (30 minutos e 70% respectivamente)

