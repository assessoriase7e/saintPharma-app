# POST /api/clerk/upsert

Webhook do Clerk para criar ou atualizar usuários no banco de dados.

## Autenticação

Esta rota é um webhook do Clerk e não requer autenticação via token de API.

## Headers

- `Content-Type` (obrigatório): application/json

## Body

O body varia conforme o tipo de evento:

### Evento: user.created ou user.updated

```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123def456",
    "email_addresses": [
      {
        "email_address": "usuario@exemplo.com"
      }
    ],
    "first_name": "João",
    "last_name": "Silva",
    "image_url": "https://example.com/avatar.jpg"
  }
}
```

### Evento: user.deleted

```json
{
  "type": "user.deleted",
  "data": {
    "id": "user_2abc123def456"
  }
}
```

## Exemplo de Uso

```bash
POST /api/clerk/upsert
Headers:
  Content-Type: application/json
Body:
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123def456",
    "email_addresses": [
      {
        "email_address": "usuario@exemplo.com"
      }
    ],
    "first_name": "João",
    "last_name": "Silva"
  }
}
```

## Resposta de Sucesso (200)

### Usuário criado/atualizado

```json
{
  "status": 200,
  "message": "Usuário processado com sucesso"
}
```

### Usuário deletado

```json
{
  "status": 200,
  "message": "Usuário deletado com sucesso"
}
```

## Resposta de Erro

### 400 - Bad Request

```json
{
  "status": 400,
  "message": "Email é obrigatório"
}
```

```json
{
  "status": 400,
  "message": "ClerkId é obrigatório para delete"
}
```

### 404 - Not Found

```json
{
  "status": 404,
  "message": "Usuário não encontrado"
}
```

### 500 - Internal Server Error

```json
{
  "status": 500,
  "message": "Erro interno do servidor"
}
```

## Comportamento

### Evento: user.created ou user.updated

1. **Criação**: Se o usuário não existe, cria um novo registro no banco
2. **Atualização**: Se o usuário já existe (por email), atualiza os dados
3. **Campos atualizados**: `clerkId`, `email`, `firstName`, `lastName`, `profileImage`

### Evento: user.deleted

1. **Deleção em cascata**: Deleta todos os dados relacionados ao usuário:
   - Certificados
   - Aulas concluídas (UserLecture)
   - Exames
   - Danos (vidas perdidas)
2. **Deleção do usuário**: Por fim, deleta o registro do usuário

## Notas Importantes

1. **Webhook**: Esta rota é chamada automaticamente pelo Clerk quando eventos de usuário ocorrem
2. **Transação**: A deleção de usuário é feita em uma transação para garantir consistência
3. **Idempotência**: Criar/atualizar é idempotente - múltiplas chamadas com os mesmos dados não causam problemas
4. **Eventos não processados**: Eventos não reconhecidos retornam 200 sem processar


