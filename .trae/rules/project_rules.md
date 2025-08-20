# Regras do Projeto SaintPharma App

## 1. Sistema de Temas

### Uso Obrigatório das Variáveis do Tema Global

**REGRA FUNDAMENTAL**: Todas as classes de estilo relacionadas a cores, fundos e bordas DEVEM usar as variáveis do tema global definidas em `utils/themes.ts` e configuradas no `tailwind.config.js`.

#### Variáveis Disponíveis:

- **Cores Primárias:**
  - `bg-primary` - Cor primária de fundo
  - `text-primary` - Cor primária de texto
  - `border-primary` - Borda primária

- **Cores Secundárias:**
  - `bg-secondary` - Cor secundária de fundo
  - `text-secondary` - Cor secundária de texto

- **Cores de Fundo:**
  - `bg-background` - Fundo principal da aplicação
  - `bg-card` - Fundo de cards e componentes

- **Cores de Texto:**
  - `text-text-primary` - Texto principal
  - `text-text-secondary` - Texto secundário

- **Bordas:**
  - `border-border` - Bordas padrão

#### Classes PROIBIDAS:

❌ **NÃO USE:**
- `bg-gray-*` (ex: `bg-gray-50`, `bg-gray-900`)
- `text-gray-*` (ex: `text-gray-600`, `text-gray-400`)
- `border-gray-*` (ex: `border-gray-200`, `border-gray-700`)
- `bg-white` / `text-white` (exceto em casos específicos como gradientes)
- Classes com `dark:` quando há variável equivalente

✅ **USE SEMPRE:**
- `bg-background` em vez de `bg-gray-50 dark:bg-gray-900`
- `bg-card` em vez de `bg-white dark:bg-gray-800`
- `text-text-primary` em vez de `text-gray-900 dark:text-white`
- `text-text-secondary` em vez de `text-gray-600 dark:text-gray-400`
- `border-border` em vez de `border-gray-200 dark:border-gray-700`

#### Exemplos de Conversão:

```tsx
// ❌ ERRADO
<View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
  <Text className="text-gray-900 dark:text-white">Título</Text>
  <Text className="text-gray-600 dark:text-gray-400">Subtítulo</Text>
</View>

// ✅ CORRETO
<View className="bg-card border border-border">
  <Text className="text-text-primary">Título</Text>
  <Text className="text-text-secondary">Subtítulo</Text>
</View>
```

#### Exceções:

- **Gradientes e overlays**: Classes como `bg-white/20` para transparências são permitidas
- **Cores específicas de status**: Verde, vermelho, amarelo para indicadores de status
- **Cores de ícones**: Cores específicas para ícones quando necessário

### Benefícios:

1. **Consistência Visual**: Todos os componentes seguem o mesmo padrão de cores
2. **Manutenibilidade**: Mudanças de tema centralizadas
3. **Acessibilidade**: Suporte automático a temas claro/escuro
4. **Performance**: Menos classes condicionais no código

### Verificação:

Antes de fazer commit, verifique se não há classes hardcoded usando:
```bash
grep -r "bg-gray-\|text-gray-\|border-gray-\|bg-white\|text-white" app/ --exclude-dir=node_modules
```

---

## 2. Estrutura de Componentes

- Todos os componentes devem ser criados na pasta `components/`
- Use TypeScript para tipagem
- Implemente props para customização quando necessário

## 3. Navegação

- Use Expo Router para navegação
- Mantenha a estrutura de abas consistente
- Headers devem ser gerenciados individualmente por cada tela

## 4. Gerenciamento de Estado

- Use Zustand para estado global (como tema)
- Context API para providers específicos
- Estado local com useState quando apropriado