# Integração da API SaintPharma

## ✅ Implementação Concluída

A integração com a API foi implementada com sucesso! O aplicativo agora busca cursos diretamente da API em `localhost:3000`.

## 🔧 Configuração

### Variáveis de Ambiente

O arquivo `.env` foi configurado com:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_API_TOKEN=12345678
```

### Estrutura da API

A API retorna cursos no seguinte formato:

```json
{
  "courses": [
    {
      "_id": "4e3a37db-30a9-42da-9d7b-4d0372c418f9",
      "name": "Curso Teste",
      "description": "Descrição do curso",
      "workload": 100,
      "points": 100,
      "premiumPoints": null,
      "slug": null,
      "banner": {
        "asset": {
          "url": "https://cdn.sanity.io/images/..."
        }
      }
    }
  ],
  "total": 1
}
```

## 📱 Funcionalidades Implementadas

### 1. Busca de Cursos

- ✅ Integração com endpoint `/courses`
- ✅ Exibição dos cursos na tela principal
- ✅ Fallback para dados mockados em caso de erro
- ✅ Indicador de carregamento
- ✅ Tratamento de erros

### 2. Tipos TypeScript

- ✅ Interface `Course` atualizada com campos reais da API
- ✅ Interface `CoursesResponse` para resposta da API
- ✅ Tipos para configuração e erros da API

### 3. Cliente da API

- ✅ Classe `ApiClient` configurada
- ✅ Autenticação com Bearer token
- ✅ Headers personalizados (`X-User-Id`)
- ✅ Tratamento de erros HTTP

## 🧪 Testes

### Script de Teste

Um script de teste foi criado em `test-api.js` para verificar a conectividade:

```bash
node test-api.js
```

**Resultado do teste:**

- ✅ API respondendo corretamente
- ✅ Endpoint `/courses` funcionando
- ✅ 1 curso encontrado na base de dados
- ✅ Estrutura de dados validada

## 🚀 Como Executar

1. **Certifique-se de que a API está rodando:**

   ```bash
   # A API deve estar disponível em localhost:3000
   curl http://localhost:3000/api/courses
   ```

2. **Execute o aplicativo:**

   ```bash
   yarn start
   ```

3. **Abra no dispositivo/emulador:**
   - Escaneie o QR code com Expo Go
   - Ou use um emulador iOS/Android

## 📋 Arquivos Modificados

### Criados:

- `app/types/api.ts` - Tipos TypeScript para API
- `test-api.js` - Script de teste da API
- `API_INTEGRATION.md` - Esta documentação

### Modificados:

- `.env` - URL da API corrigida (https → http)
- `app/index.tsx` - Integração com API real
- `services/api.ts` - Cliente da API (já existia)

## 🔄 Fluxo de Dados

1. **Inicialização:** App carrega e inicializa `ApiClient`
2. **Busca:** `useEffect` chama `apiClient.getCourses()`
3. **Sucesso:** Cursos são exibidos na interface
4. **Erro:** Fallback para dados mockados + mensagem de erro
5. **Loading:** Indicador visual durante requisições

## 🛠️ Próximos Passos

### Funcionalidades Sugeridas:

- [ ] Implementar cache local dos cursos
- [ ] Adicionar pull-to-refresh
- [ ] Implementar paginação
- [ ] Adicionar filtros e busca
- [ ] Integrar outros endpoints da API
- [ ] Implementar sincronização offline

### Melhorias Técnicas:

- [ ] Adicionar testes unitários
- [ ] Implementar retry automático
- [ ] Adicionar logs detalhados
- [ ] Configurar diferentes ambientes (dev/prod)

## 🐛 Troubleshooting

### API não responde

```bash
# Verifique se a API está rodando
curl http://localhost:3000/api/courses

# Verifique as variáveis de ambiente
echo $EXPO_PUBLIC_API_BASE_URL
```

### Erro de CORS

- Certifique-se de que a API permite requisições do localhost
- Verifique os headers CORS no servidor

### Dados não aparecem

- Verifique o console do Expo para erros
- Execute o script de teste: `node test-api.js`
- Verifique se o token de API está correto

---

**Status:** ✅ **CONCLUÍDO**  
**Data:** $(date)  
**Versão:** 1.0.0
