# GET /api/courses

Retorna lista de todos os cursos disponíveis.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API

## Exemplo de Uso

```bash
GET /api/courses
Headers:
  Authorization: Bearer <API_TOKEN>
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "courses": [
    {
      "_id": "course_id_1",
      "name": "Curso de Farmacologia",
      "description": "Curso completo de farmacologia",
      "banner": {
        "asset": {
          "url": "https://example.com/banner.jpg"
        }
      },
      "points": 100,
      "workload": 40
    }
  ],
  "total": 10
}
```

## Nota

Os cursos são armazenados no Sanity CMS, não no banco de dados MongoDB. Esta rota busca os dados do Sanity.



