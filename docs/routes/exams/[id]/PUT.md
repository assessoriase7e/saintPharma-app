# PUT /api/exams/[id]

Atualiza um exame (concluir ou reprovar).

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
  "complete": "boolean",
  "reproved": "boolean",
  "courseId": "string (obrigatório se complete = true)"
}
```

### Campos

#### complete
- **Tipo**: boolean
- **Obrigatório**: Não
- **Descrição**: Marca o exame como concluído

#### reproved
- **Tipo**: boolean
- **Obrigatório**: Não
- **Descrição**: Marca o exame como reprovado

#### courseId
- **Tipo**: string
- **Obrigatório**: Sim (quando `complete = true`)
- **Descrição**: ID do curso relacionado ao exame

## Exemplo de Uso

### Concluir exame

```bash
PUT /api/exams/507f1f77bcf86cd799439012
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
Body:
{
  "complete": true,
  "reproved": false,
  "courseId": "5ca1ccb6-0c3d-4584-b5c8-fc1ef87541a9"
}
```

### Reprovar exame

```bash
PUT /api/exams/507f1f77bcf86cd799439012
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
  Content-Type: application/json
Body:
{
  "complete": false,
  "reproved": true
}
```

## Resposta de Sucesso (200)

### Exame concluído

```json
{
  "success": true,
  "data": {
    "message": "Exame concluído com sucesso",
    "exam": {
      "id": "507f1f77bcf86cd799439012",
      "complete": true,
      "reproved": false,
      "lectureCMSid": "lecture_id_123"
    },
    "lectureCompleted": true,
    "pointsEarned": 15
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Exame reprovado

```json
{
  "success": true,
  "data": {
    "message": "Exame reprovado, vida perdida",
    "exam": {
      "id": "507f1f77bcf86cd799439012",
      "complete": false,
      "reproved": true,
      "lectureCMSid": "lecture_id_123"
    },
    "lifeLost": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "error": "Header X-User-Id é obrigatório"
}
```

```json
{
  "error": "ID do exame é obrigatório"
}
```

```json
{
  "error": "courseId é obrigatório para concluir exame"
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
  "error": "Acesso negado ao exame"
}
```

### 404 - Not Found

```json
{
  "error": "Usuário não encontrado"
}
```

```json
{
  "error": "Exame não encontrado"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao atualizar exame"
}
```

## Comportamento

### Ao concluir exame (complete = true)

1. **Atualiza o exame**: Marca como concluído e não reprovado
2. **Cria UserLecture**: Se não existir, cria um registro de aula concluída
3. **Atribui pontos**:
   - 15 pontos se a aula ainda não estava concluída (10 do exame + 5 da aula)
   - 10 pontos se a aula já estava concluída (apenas do exame)

### Ao reprovar exame (reproved = true)

1. **Atualiza o exame**: Marca como reprovado e não concluído
2. **Remove vida**: Cria um registro de dano (perde uma vida)

## Notas Importantes

1. **Pontos**: Os pontos são automaticamente adicionados ao total do usuário
2. **Vidas**: Ao reprovar, uma vida é automaticamente perdida
3. **Auditoria**: Todas as atualizações são registradas para auditoria
4. **Validação**: A API verifica se o exame pertence ao usuário antes de atualizar


