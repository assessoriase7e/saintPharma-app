# Documentação da API - Rotas

Esta documentação descreve todas as rotas da API do sistema SaintPharma, organizadas por funcionalidade.

## Estrutura

Cada rota possui sua própria documentação em markdown, organizada em pastas que refletem a estrutura da API:

```
docs/routes/
├── user/              # Rotas de usuário
├── courses/           # Rotas de cursos
├── exams/             # Rotas de exames
├── lectures/          # Rotas de aulas
├── certificate/       # Rotas de certificados
├── auth/              # Rotas de autenticação
├── ranking/           # Rotas de ranking
└── README.md          # Este arquivo
```

## Autenticação

Todas as rotas requerem autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Índice de Rotas

### Usuário (/api/user)

- [GET /api/user](user/GET.md) - Buscar usuário
- [POST /api/user/create](user/create/POST.md) - Criar usuário
- [POST /api/user/bulk-create](user/bulk-create/POST.md) - Criar múltiplos usuários
- [PUT /api/user/update](user/update/PUT.md) - Atualizar usuário
- [PUT /api/user/complete](user/complete/PUT.md) - Completar dados do usuário
- [GET /api/user/profile](user/profile/GET.md) - Buscar perfil completo
- [GET /api/user/summary](user/summary/GET.md) - Resumo do usuário
- [GET /api/user/stats](user/stats/GET.md) - Estatísticas do usuário
- [GET /api/user/activities](user/activities/GET.md) - Atividades do usuário
- [GET /api/user/progress](user/progress/GET.md) - Progresso por curso
- [PUT /api/user/points](user/points/PUT.md) - Alterar pontuação
- [GET /api/user/lives](user/lives/GET.md) - Buscar vidas
- [DELETE /api/user/lives](user/lives/DELETE.md) - Remover vida
- [GET /api/user/courses](user/courses/GET.md) - Cursos do usuário

### Cursos (/api/courses)

- [GET /api/courses](courses/GET.md) - Listar cursos
- [GET /api/courses/[id]](courses/[id]/GET.md) - Detalhes do curso
- [GET /api/courses/[id]/progress](courses/[id]/progress/GET.md) - Progresso do curso para o usuário
- [POST /api/courses/[id]/complete](courses/[id]/complete/POST.md) - Completar curso

### Exames (/api/exams)

- [GET /api/exams](exams/GET.md) - Listar exames
- [POST /api/exams](exams/POST.md) - Criar exame
- [GET /api/exams/eligibility](exams/eligibility/GET.md) - Verificar elegibilidade
- [GET /api/exams/[id]](exams/[id]/GET.md) - Detalhes do exame
- [PUT /api/exams/[id]](exams/[id]/PUT.md) - Atualizar exame
- [DELETE /api/exams/[id]](exams/[id]/DELETE.md) - Deletar exame
- [GET /api/exams/[id]/questions](exams/[id]/questions/GET.md) - Questões do exame
- [POST /api/exams/[id]/submit](exams/[id]/submit/POST.md) - Submeter respostas
- [GET /api/exams/[id]/attempts](exams/[id]/attempts/GET.md) - Tentativas do exame

### Aulas (/api/lectures)

- [GET /api/lectures](lectures/GET.md) - Listar aulas
- [GET /api/lectures/[id]](lectures/[id]/GET.md) - Detalhes da aula
- [POST /api/lectures/[id]/complete](lectures/[id]/complete/POST.md) - Completar aula

### Certificados (/api/certificate)

- [GET /api/certificate](certificate/GET.md) - Listar certificados
- [POST /api/certificate/create](certificate/create/POST.md) - Criar certificado
- [GET /api/certificate/[id]](certificate/[id]/GET.md) - Detalhes do certificado

### Autenticação (/api/auth)

- [POST /api/auth/login](auth/login/POST.md) - Login
- [POST /api/auth/logout](auth/logout/POST.md) - Logout
- [GET /api/auth/user](auth/user/GET.md) - Usuário autenticado

### Ranking (/api/ranking)

- [GET /api/ranking](ranking/GET.md) - Ranking geral
- [GET /api/ranking/user](ranking/user/GET.md) - Pontos do usuário

### Outras Rotas

- [POST /api/clerk/upsert](clerk/upsert/POST.md) - Webhook do Clerk
- [POST /api/sanity/revalidate](sanity/revalidate/POST.md) - Revalidação do Sanity

## Modelo de Dados (Banco de Dados)

O banco de dados utiliza MongoDB com Prisma ORM. Os modelos principais são:

- **User**: Usuários do sistema
- **Certificate**: Certificados obtidos
- **UserLecture**: Aulas concluídas pelos usuários
- **Exam**: Exames criados
- **ExamAttempt**: Tentativas de exames
- **Damage**: Vidas perdidas (danos)

Consulte o arquivo `prisma/schema.prisma` para detalhes completos dos modelos.

## Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Requisição inválida
- `401`: Não autorizado
- `403`: Proibido
- `404`: Não encontrado
- `409`: Conflito (recurso já existe)
- `500`: Erro interno do servidor

## Padrões de Resposta

### Sucesso

```json
{
  "success": true,
  "message": "Mensagem de sucesso",
  "data": { ... }
}
```

### Erro

```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

