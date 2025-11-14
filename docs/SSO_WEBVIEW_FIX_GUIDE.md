# Guia: Solução para Tela Branca na WebView durante Autenticação SSO

## 📋 Visão Geral

Este documento descreve o problema de **tela branca** que ocorre durante a autenticação SSO (Single Sign-On) em builds de produção do Expo, especialmente com provedores como Google OAuth, e a solução implementada para forçar o uso do navegador externo ao invés de WebView embutida.

## 🔴 Problema

### Sintomas

- Tela branca aparece após iniciar o fluxo de autenticação SSO
- O usuário não consegue completar o login
- O app não retorna após a autenticação no navegador
- Problema ocorre principalmente em builds de produção (EAS Build)
- Funciona normalmente em desenvolvimento (Expo Go)

### Causa Raiz

O problema ocorre porque:

1. **Google OAuth bloqueia WebViews**: O Google não permite autenticação via WebViews embutidas por questões de segurança
2. **Comportamento padrão do Expo**: Em algumas configurações, o Expo pode tentar usar WebView ao invés do navegador externo
3. **Deep linking mal configurado**: Se o redirect URI não estiver corretamente configurado, o app não consegue "escutar" o retorno da autenticação

## ✅ Solução Implementada

### 1. Configuração do Redirect URI

A solução principal é garantir que o redirect URI use o **esquema nativo** do app, forçando o Expo a usar o navegador externo:

```typescript:hooks/useSSOAuth.ts
// ⚠️ IMPORTANTE: Usar apenas o esquema nativo (sem proxy) para forçar navegador externo
// O proxy usa WebView que é bloqueado pelo Google OAuth em produção
const redirectUrl = AuthSession.makeRedirectUri({
  scheme: "saintpharma-app", // Esquema personalizado do app
  path: "sso-callback", // Rota de callback
  // Não usar useProxy - deixar undefined para usar comportamento padrão do Expo
  // que prefere navegador externo quando o scheme está configurado
});
```

### 2. Configuração do App Scheme

O esquema do app deve estar configurado no `app.config.ts`:

```typescript:app.config.ts
export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    scheme: "saintpharma-app", // Esquema para deep linking
    // ... outras configurações
  };
};
```

### 3. Comportamento do Expo

Quando um `scheme` customizado está configurado e o redirect URI usa esse scheme, o Expo automaticamente:
- Prefere o navegador externo ao invés de WebView
- Configura o deep linking corretamente
- Permite que o app "escutar" o retorno da autenticação

## 🔧 Verificações Necessárias

### 1. Painel do Clerk

#### Native Applications → Allowlist for mobile SSO redirect

1. Acesse o painel do Clerk: https://dashboard.clerk.com
2. Vá em **User & Authentication** → **Native applications**
3. Em **Allowlist for mobile SSO redirect**, adicione:
   ```
   saintpharma-app://sso-callback
   ```
4. Certifique-se de que está habilitado para **produção**

#### Social Connections → Google

1. Vá em **User & Authentication** → **Social Connections**
2. Selecione **Google**
3. Verifique:
   - ✅ Habilitado para produção
   - ✅ Credenciais corretas configuradas
   - ✅ Redirect URIs autorizados no Google Console

### 2. Google Cloud Console

#### OAuth Client ID (Web Application)

1. Acesse: https://console.cloud.google.com
2. Vá em **APIs & Services** → **Credentials**
3. Selecione o **OAuth Client ID** do tipo **Web Application**
4. Em **Authorized redirect URIs**, adicione:
   - O redirect URI fornecido pela Clerk para produção
   - Exemplo: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
5. Verifique se o redirect URI inclui o scheme do app quando necessário

#### OAuth Client ID (Android/iOS)

1. Certifique-se de que existem clientes OAuth configurados para:
   - **Android**: Package name: `com.saintpharma.app`
   - **iOS**: Bundle ID: `com.saintpharma.app`

### 3. Configuração do AndroidManifest.xml

O deep linking deve estar configurado no `AndroidManifest.xml`:

```xml:android/app/src/main/AndroidManifest.xml
<activity android:name=".MainActivity" ...>
  <intent-filter>
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="saintpharma-app"/>
  </intent-filter>
</activity>
```

## 📱 Testando a Solução

### 1. Build de Produção

⚠️ **IMPORTANTE**: Teste sempre em build de produção, não apenas no Expo Go:

```bash
# Build para Android
eas build --platform android --profile production

# Build para iOS
eas build --platform ios --profile production
```

### 2. Verificação do Fluxo

1. Abra o app no dispositivo físico
2. Toque em "Login com Google"
3. **Esperado**: O navegador externo (Chrome/Safari) deve abrir
4. Complete a autenticação no Google
5. **Esperado**: O app deve retornar automaticamente após autenticação
6. **Esperado**: O usuário deve ser redirecionado para `/onboarding` ou `/home`

### 3. Logs para Debug

Monitore os logs durante o teste:

```bash
# Android
adb logcat | grep -i "sso\|auth\|clerk"

# iOS
# Use o Xcode Console ou:
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "saintpharma"'
```

## 🐛 Troubleshooting

### Problema: Tela branca ainda aparece

**Possíveis causas:**
1. Redirect URI não registrado no Clerk
2. Scheme não configurado corretamente no `app.config.ts`
3. Deep linking não configurado no `AndroidManifest.xml` (Android) ou `Info.plist` (iOS)

**Solução:**
- Verifique todas as configurações acima
- Rebuild o app após mudanças no `app.config.ts`
- Verifique logs nativos para erros de deep linking

### Problema: App não retorna após autenticação

**Possíveis causas:**
1. Redirect URI não corresponde ao registrado
2. Scheme não está no allowlist do Clerk
3. Erro no processamento do callback

**Solução:**
- Verifique o redirect URI gerado nos logs: `🔗 [useSSOAuth] URL de redirecionamento:`
- Confirme que corresponde ao registrado no Clerk
- Verifique a página de callback em `app/sso-callback.tsx`

### Problema: "No activity found to handle intent" (Android)

**Causa:** Deep linking não configurado corretamente

**Solução:**
- Verifique o `AndroidManifest.xml`
- Rebuild o app após mudanças
- Verifique se o scheme está correto

### Problema: Funciona em dev mas não em produção

**Causa:** Configurações diferentes entre dev e produção no Clerk

**Solução:**
- Verifique se as configurações estão habilitadas para **produção** no Clerk
- Use credenciais de produção no Google Console
- Teste sempre em build de produção

## 📚 Referências

- [Clerk - Deploy Expo Apps](https://clerk.com/docs/deployments/deploy-expo)
- [Expo - AuthSession](https://docs.expo.dev/guides/authentication/#google)
- [Expo - Deep Linking](https://docs.expo.dev/guides/linking/)
- [Google OAuth - Mobile Apps](https://developers.google.com/identity/protocols/oauth2/native-app)

## 🔄 Histórico de Mudanças

### 2024 - Implementação da Solução

- Configurado redirect URI para usar scheme nativo
- Adicionados comentários explicativos no código
- Documentação criada

## ⚠️ Notas Importantes

1. **Sempre teste em produção**: O comportamento pode diferir entre desenvolvimento e produção
2. **Mantenha as configurações sincronizadas**: Clerk, Google Console e `app.config.ts` devem estar alinhados
3. **Rebuild após mudanças**: Mudanças no `app.config.ts` requerem rebuild do app
4. **Monitore logs**: Use logs nativos para identificar problemas de deep linking

## ✅ Checklist de Verificação

Antes de fazer deploy, verifique:

- [ ] Scheme configurado no `app.config.ts`
- [ ] Redirect URI usando o scheme nativo
- [ ] Redirect URI registrado no Clerk (produção)
- [ ] Google OAuth habilitado para produção no Clerk
- [ ] Redirect URIs configurados no Google Console
- [ ] Deep linking configurado no `AndroidManifest.xml` (Android)
- [ ] Deep linking configurado no `Info.plist` (iOS)
- [ ] Testado em build de produção
- [ ] Logs verificados durante teste

---

**Última atualização**: 2024
**Mantido por**: Equipe SaintPharma

