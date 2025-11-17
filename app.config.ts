import * as dotenv from "dotenv";
import { ConfigContext, ExpoConfig } from "expo/config";
import * as fs from "fs";
import * as path from "path";

// Carregar .env de forma mais robusta
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ [app.config] Arquivo .env carregado de:", envPath);
} else {
  console.warn("⚠️ [app.config] Arquivo .env não encontrado em:", envPath);
}

// Também tentar carregar do diretório atual
dotenv.config();

// Helper para limpar variáveis de ambiente (remover aspas e espaços)
const cleanEnvVar = (value: string | undefined): string => {
  if (!value) return "";
  // Remover aspas no início e fim, e espaços em branco
  return value.replace(/^["']|["']$/g, "").trim();
};

export default ({ config }: ConfigContext): ExpoConfig => {
  // Limpar e obter variáveis de ambiente
  const apiBaseUrl = cleanEnvVar(process.env.API_BASE_URL);
  const apiToken = cleanEnvVar(process.env.API_TOKEN);
  const clerkPublishableKey = cleanEnvVar(process.env.CLERK_PUBLISHABLE_KEY);
  const clerkSecretKey = cleanEnvVar(process.env.CLERK_SECRET_KEY);

  // Log para debug (apenas em desenvolvimento)
  if (process.env.NODE_ENV !== "production") {
    console.log("🔧 [app.config] Carregando variáveis de ambiente:", {
      hasApiBaseUrl: !!apiBaseUrl,
      hasApiToken: !!apiToken,
      hasClerkPublishableKey: !!clerkPublishableKey,
      hasClerkSecretKey: !!clerkSecretKey,
      apiBaseUrl: apiBaseUrl
        ? `${apiBaseUrl.substring(0, 30)}...`
        : "NÃO ENCONTRADO",
      clerkPublishableKey: clerkPublishableKey
        ? `${clerkPublishableKey.substring(0, 20)}...`
        : "NÃO ENCONTRADO",
    });
  }

  return {
    ...config,
    name: "SaintPharma",
    slug: "saintPharma-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/ic_launcher/play_store_512.png",
    scheme: "saintpharma-app",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.saintpharma.app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/ic_launcher/play_store_512.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.saintpharma.app",
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-font",
      "expo-secure-store",
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...config.extra,
      router: {},
      eas: {
        projectId: "e4d29185-2b06-45a0-8de4-10cae8ed58a9",
      },
      // Variáveis de ambiente injetadas no build
      // Acessíveis via Constants.expoConfig.extra
      apiBaseUrl,
      apiToken,
      clerkPublishableKey,
      clerkSecretKey,
    },
  };
};
