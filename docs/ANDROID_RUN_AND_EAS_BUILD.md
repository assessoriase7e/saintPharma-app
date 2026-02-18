# Executar no Android e gerar build (EAS)

## Pré-requisitos

- Node e npm instalados
- Android Studio com:
  - Android SDK
  - Android SDK Command-line Tools (latest)
  - NDK (Side by side) `27.1.12297006`
- Java 17 ativo no shell

## Rodar no Android (emulador/dispositivo)

1. Instalar dependências:

```bash
npm install
```

2. Iniciar emulador Android (Android Studio > Device Manager) ou conectar dispositivo USB.

3. Rodar build e instalar no Android:

```bash
npm run android:run
# equivale a: npx expo run:android
```

## Rodar somente o Metro (após instalar dev build)

```bash
npx expo start --dev-client
```

No terminal do Expo, pressione `a` para abrir no Android.

## Build no Expo (EAS)

1. Login no EAS:

```bash
eas login
```

2. Configurar secrets (uma vez):

```bash
eas secret:create --scope project --name API_BASE_URL --value "https://..."
eas secret:create --scope project --name API_TOKEN --value "..."
eas secret:create --scope project --name CLERK_PUBLISHABLE_KEY --value "pk_..."
eas secret:create --scope project --name CLERK_SECRET_KEY --value "sk_..."
```

3. Gerar build Android:

```bash
# APK para testes
eas build --platform android --profile apk

# AAB para produção (Play Store)
eas build --platform android --profile production

# Build interno/dev client
eas build --platform android --profile preview
```

## Verificações úteis

```bash
java -version
adb devices
```

Se aparecer erro de NDK (`source.properties`), reinstale o NDK `27.1.12297006` no Android Studio.
