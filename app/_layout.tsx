import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import "./global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
