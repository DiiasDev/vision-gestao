import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AuthComponent from "./src/components/Auth/AuthComponent";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";

function AppContent() {
  const { theme, themeVars } = useTheme();

  return (
    <SafeAreaView style={themeVars} className="flex-1 bg-background-primary">
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <AuthComponent />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
