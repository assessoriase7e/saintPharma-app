# 🐛 BUG REPORT: Double Lives Loss no Submit de Prova

## 📋 Descrição

Usuários estão perdendo **2 vidas ao errar 1 pergunta**, quando deveriam perder apenas **1 vida**.

## 🔍 Análise da Causa

### Fluxo Atual (COM BUG):

1. **Frontend:** Usuário submete prova com 1 erro
2. **Frontend:** `POST /api/exams/{id}/submit` é chamado
3. **Backend:** Backend processa a submissão e desconta 1 vida automaticamente
4. **Frontend:** Calcula `wrongAnswers = 1` e chama `DELETE /api/user/lives` com `amount: 1`
5. **Resultado:** 2 vidas perdidas total (1 do backend + 1 do frontend)

### Código Problemático:

**Frontend (`app/(tabs)/prova/[id].tsx`, linha 303-325):**
```typescript
// Submeter resultados via API
const submitResponse = await examsService.submitExam(examId, {
  answers: submitAnswers,
  timeSpent: timeSpent,
});

// ✅ Frontend calcula vidas a perder
const wrongAnswers = totalQuestions - results.correctAnswers;
const livesToLose = Math.min(wrongAnswers, MAX_LIVES_PER_EXAM);

if (livesToLose > 0) {
  await loseLives(livesToLose, ...); // <-- DESCONTA VIDAS
}
```

**Backend (`docs/routes/exams/[id]/PUT.md`, linha 194-197):**
```
### Ao reprovar exame (reproved = true)

1. **Atualiza o exame**: Marca como reprovado e não concluído
2. **Remove vida**: Cria um registro de dano (perde uma vida) <-- TAMBÉM DESCONTA VIDAS
```

## 🎯 Solução

A responsabilidade de descontar vidas deve ser **APENAS do frontend**, não do backend.

### Opção 1: Backend Não Desconta (RECOMENDADO)

```
POST /api/exams/{id}/submit - Apenas processa a submissão, não desconta vidas
```

O frontend é responsável por:
- Calcular número de erros
- Aplicar limite máximo (3 vidas)
- Chamar DELETE `/api/user/lives`

### Opção 2: Endpoint Separado para Marcar Prova como Reproved

```
POST /api/exams/{id}/reprove - Apenas marca como reproved, sem descontar vidas
```

O backend desconta vidas apenas neste endpoint.

## 📊 Teste

**Dados do teste realizado:**
- Total de questões: 1
- Questões corretas: 0
- Questões erradas: 1
- Vidas perdidas (observado): 2
- Vidas perdidas (esperado): 1
- **Status: ❌ BUG CONFIRMADO**

## ✅ Verificação Após Correção

```typescript
// Frontend deveria fazer:
const wrongAnswers = totalQuestions - results.correctAnswers; // 1
const livesToLose = Math.min(wrongAnswers, 3); // 1
await loseLives(livesToLose); // Desconta 1 vida

// Backend NUNCA deveria descontar vidas automaticamente
```

## 🔗 Arquivos Relacionados

- Frontend: `app/(tabs)/prova/[id].tsx` (linha 303-325)
- Backend: `POST /api/exams/{id}/submit` 
- Backend: `PUT /api/exams/{id}` (com `reproved: true`)
- Documentação: `docs/routes/exams/[id]/PUT.md`

## 💬 Status

- **Reportado por:** Lucas (usuário final)
- **Data:** 2025-11-13
- **Severidade:** 🔴 Alta
- **Impacto:** Usuários perdem vidas em dobro, prejudicando a experiência

## ✅ Solução Implementada (Frontend)

Removeu-se a lógica de desconto de vidas do frontend:

### Mudanças Realizadas:

1. **Removido** desconto manual de vidas em `app/(tabs)/prova/[id].tsx`:
   - Removida importação de `useLives`
   - Removidas chamadas `DELETE /api/user/lives`
   - Frontend agora apenas lê o valor de `livesLost` retornado pelo backend

2. **Simplificado** fluxo de submissão:
   ```typescript
   // ✅ NOVO: Apenas submeter e ler valor retornado pelo backend
   const submitResponse = await examsService.submitExam(examId, {...});
   const livesLostFromBackend = submitResponse.data?.livesLost ?? 0;
   ```

3. **Atualizada** tela de resultado (`app/(tabs)/resultado/[quizId].tsx`):
   - Removido `maxLivesLostPerExam` (controle apenas no backend)
   - Removido `useLives()` hook
   - Card de vidas perdidas agora apenas exibe o valor retornado

### Fluxo Correto Agora:

```
Frontend: POST /api/exams/{id}/submit (respostas + tempo)
         ↓
Backend: Processa submissão
         - Valida respostas
         - Calcula erros
         - Desconta vidas (0-3 dependendo dos erros)
         - Retorna livesLost na resposta
         ↓
Frontend: Lê livesLost e exibe resultado
```

---

**Aguardando:** Confirmar que o backend agora retorna `livesLost` no `POST /api/exams/{id}/submit`.

