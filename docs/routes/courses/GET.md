# GET /api/courses

Retorna lista de todos os cursos disponíveis.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (opcional): Clerk ID do usuário (para verificar acesso a cursos premium)

## Exemplo de Uso

```bash
GET /api/courses
Headers:
  Authorization: Bearer <API_TOKEN>
  X-User-Id: user_2abc123def456
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
      "workload": 40,
      "premiumPoints": null,
      "canAccess": true,
      "weekPointsRequired": null,
      "userWeekPoints": null
    },
    {
      "_id": "course_id_2",
      "name": "Curso Premium de Anatomia",
      "description": "Curso premium de anatomia",
      "banner": {
        "asset": {
          "url": "https://example.com/banner2.jpg"
        }
      },
      "points": 150,
      "workload": 60,
      "premiumPoints": 500,
      "canAccess": true,
      "weekPointsRequired": 500,
      "userWeekPoints": 750
    },
    {
      "_id": "course_id_3",
      "name": "Curso Premium Avançado",
      "description": "Curso premium avançado",
      "banner": {
        "asset": {
          "url": "https://example.com/banner3.jpg"
        }
      },
      "points": 200,
      "workload": 80,
      "premiumPoints": 1000,
      "canAccess": false,
      "weekPointsRequired": 1000,
      "userWeekPoints": 750
    }
  ],
  "total": 10
}
```

## Campos da Resposta

### Campos do Curso

- `_id`: ID do curso no Sanity CMS
- `name`: Nome do curso
- `description`: Descrição do curso
- `banner`: Objeto com informações da imagem de banner
- `points`: Pontos oferecidos pelo curso
- `workload`: Carga horária do curso (em horas)
- `premiumPoints`: Pontos semanais necessários para acessar o curso premium (null se não for premium)
- `canAccess`: Indica se o usuário pode acessar o curso premium (baseado em pontos da semana)
- `weekPointsRequired`: Pontos semanais necessários para acessar (null se não for premium)
- `userWeekPoints`: Pontos semanais do usuário (null se X-User-Id não foi fornecido)

## Acesso a Cursos Premium

Cursos premium são identificados pelo campo `premiumPoints` maior que 0. O acesso a esses cursos é determinado pelos pontos que o usuário ganhou durante a semana atual:

- **Lógica de acesso**: Se `userWeekPoints > premiumPoints`, então `canAccess = true`
- **Cursos não premium**: Cursos sem `premiumPoints` (ou `premiumPoints = null`) sempre têm `canAccess = true`
- **Sem usuário**: Se `X-User-Id` não for fornecido, `canAccess` será `true` para todos os cursos, mas `userWeekPoints` será `null`

### Cálculo de Pontos da Semana

Os pontos da semana são calculados com base em:
- **Certificados**: Pontos do certificado (definido no curso)
- **Exames**: 10 pontos por exame concluído
- **Aulas**: 5 pontos por aula concluída

A semana é calculada de domingo a sábado (semana brasileira).

## Nota

Os cursos são armazenados no Sanity CMS, não no banco de dados MongoDB. Esta rota busca os dados do Sanity.




