import { vars } from "nativewind";

export const themes = {
  light: vars({
    "--color-primary": "#3b82f6", // blue-500
    "--color-primary-light": "#60a5fa", // blue-400
    "--color-primary-dark": "#1d4ed8", // blue-700
    "--color-secondary": "#10b981", // emerald-500
    "--color-secondary-light": "#34d399", // emerald-400
    "--color-background": "#ffffff",
    "--color-foreground": "#000000",
    "--color-card": "#f8fafc",
    "--color-border": "#e2e8f0",
    "--color-text-primary": "#1f2937",
    "--color-text-secondary": "#6b7280",
  }),
  dark: vars({
    "--color-primary": "#3b82f6",
    "--color-primary-light": "#60a5fa",
    "--color-primary-dark": "#1e40af",
    "--color-secondary": "#10b981",
    "--color-secondary-light": "#34d399",
    "--color-background": "#0f172a",
    "--color-foreground": "#ffffff",
    "--color-card": "#1e293b",
    "--color-border": "#334155",
    "--color-text-primary": "#f1f5f9",
    "--color-text-secondary": "#94a3b8",
  }),
};
