/**
 * Suprime avisos específicos do react-native-web sobre propriedades shadow* depreciadas
 * que são usadas internamente pelo expo-router
 * 
 * Este arquivo deve ser importado o mais cedo possível para interceptar os avisos
 * antes que o expo-router carregue o Sitemap.js
 */

// Executar imediatamente quando o módulo é carregado
(function suppressShadowWarnings() {
  if (typeof console === 'undefined' || !console.warn) {
    return;
  }

  // Verificar se já foi aplicado
  if ((console.warn as any).__shadowSuppressed) {
    return;
  }

  const originalWarn = console.warn;
  
  console.warn = function (...args: any[]) {
    // Verificar se é o aviso sobre shadow* props
    const firstArg = args[0];
    
    // Suprimir avisos sobre shadow* props deprecadas
    if (typeof firstArg === 'string') {
      // Verificar múltiplas variações da mensagem
      if (
        firstArg.includes('"shadow*" style props are deprecated') ||
        (firstArg.includes('shadow') && firstArg.includes('deprecated') && firstArg.includes('boxShadow'))
      ) {
        // Suprimir este aviso específico
        return;
      }
      
      // Suprimir avisos do Reanimated sobre leitura de valores compartilhados durante render
      if (
        firstArg.includes('[Reanimated]') && 
        (firstArg.includes('Reading from `value` during component render') ||
         firstArg.includes('strict mode'))
      ) {
        return;
      }
    }
    
    // Verificar também se há uma stack trace relacionada ao expo-router/Sitemap
    const lastArg = args[args.length - 1];
    if (
      typeof lastArg === 'string' &&
      lastArg.includes('Sitemap.js') &&
      typeof firstArg === 'string' &&
      firstArg.includes('shadow')
    ) {
      return;
    }
    
    // Verificar em todos os argumentos
    const allArgs = args.join(' ');
    if (
      (allArgs.includes('shadow') && allArgs.includes('deprecated')) ||
      (allArgs.includes('[Reanimated]') && allArgs.includes('Reading from `value`'))
    ) {
      return;
    }
    
    // Chamar o console.warn original para outros avisos
    originalWarn.apply(console, args);
  } as typeof console.warn;

  // Marcar como aplicado
  (console.warn as any).__shadowSuppressed = true;

  // Tentar interceptar também o warnOnce se disponível
  try {
    // @ts-ignore - Tentar acessar o módulo warnOnce do react-native-web
    if (typeof require !== 'undefined') {
      const warnOnceModule = require('react-native-web/dist/modules/warnOnce');
      if (warnOnceModule && warnOnceModule.default) {
        const originalWarnOnce = warnOnceModule.default;
        warnOnceModule.default = function (...args: any[]) {
          const message = args[0];
          if (
            typeof message === 'string' &&
            (message.includes('shadow') && message.includes('deprecated'))
          ) {
            return;
          }
          return originalWarnOnce.apply(this, args);
        };
      }
    }
  } catch (e) {
    // Ignorar erros ao tentar acessar o módulo
  }
})();

