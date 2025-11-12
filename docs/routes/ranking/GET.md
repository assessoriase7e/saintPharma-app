# GET /api/ranking

Retorna o ranking geral de usuários baseado nos **pontos da semana atual**.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API

## Query Parameters

- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20, máximo: 100)

## Exemplo de Uso

```bash
GET /api/ranking?page=1&limit=20
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "ranking": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "name": "João Silva",
        "profileImage": "https://example.com/avatar.jpg",
        "points": 500,
        "position": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "week": {
      "start": "2024-01-07",
      "end": "2024-01-13"
    }
  },
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## Modelo de Dados (Banco de Dados)

### User (Prisma)

```prisma
model User {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  clerkId      String        @unique
  firstName    String?
  lastName     String?
  email        String        @unique
  profileImage String?
  points       Int           @default(0)
}
```

## Ordenação

Os usuários são ordenados por **pontos semanais** em ordem decrescente.

## Cálculo de Pontos Semanais

Os pontos semanais são calculados com base em:
- **Certificados**: Pontos do certificado (definido no curso)
- **Exames**: 10 pontos por exame concluído
- **Aulas**: 5 pontos por aula concluída

A semana é calculada de domingo a sábado (semana brasileira).

## Resposta de Erro

### 401 - Unauthorized

```json
{
  "error": "Token de autorização inválido ou ausente",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

### 500 - Internal Server Error

```json
{
  "error": "Erro ao buscar ranking",
  "code": "INTERNAL_SERVER_ERROR",
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

## Notas Importantes

- O ranking é **resetado semanalmente** - mostra apenas os pontos da semana atual
- Pontos totais acumulados não são usados para o ranking
- A semana é calculada automaticamente com base na data atual
- Apenas usuários com pontos na semana atual aparecem no ranking (usuários com 0 pontos são filtrados)

