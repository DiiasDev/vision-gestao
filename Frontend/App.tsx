import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthComponent from "./src/components/Auth/AuthComponent";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <StatusBar style="dark" />
      <AuthComponent />
    </SafeAreaView>
  );
}
