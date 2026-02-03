import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Auth } from "../../services/auth.services";
import DashboardFinance from "../../screens/DashboardFinance/DashboardFinance";

const SESSION_STORAGE_KEY = "@vision-gestao/session";

export default function AuthComponent() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) {
          return;
        }
        const data = JSON.parse(raw);
        if (data) {
          setIsLoggedIn(true);
          setUserName(data?.user?.nome_completo ?? data?.userName);
          if (data?.email) {
            setEmail(data.email);
          }
        }
      } catch (loadError) {
        console.warn("Falha ao restaurar sessão:", loadError);
      } finally {
        setIsBooting(false);
      }
    };

    loadSession();
  }, []);

  const handleLogin = async () => {
    setError(null);

    if (!email || !senha) {
      setError("Informe e-mail e senha.");
      Alert.alert("Erro no login", "Informe e-mail e senha.");
      return;
    }

    setLoading(true);
    let result: any;
    try {
      result = await Auth.login({ email, password: senha, remember });
    } finally {
      setLoading(false);
    }

    if (!result?.success) {
      const message = result?.message ?? "Falha no login.";
      setError(message);
      Alert.alert("Erro no login", message);
      return;
    }

    setError(null);
    const resolvedUserName = result?.user?.nome_completo;
    setUserName(resolvedUserName);
    setIsLoggedIn(true);
    if (remember) {
      await AsyncStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          ...result,
          email,
          userName: resolvedUserName,
        })
      );
    } else {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    }
    Alert.alert("Login realizado", "Bem-vindo ao Vision Gestão!");
  };

  if (isBooting) {
    return (
      <View className="flex-1 items-center justify-center bg-background-primary">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-sm text-text-secondary">
          Verificando sua sessão...
        </Text>
      </View>
    );
  }

  if (isLoggedIn) {
    return <DashboardFinance userName={userName} />;
  }

  return (
    <View className="flex-1 bg-background-primary">
      <View className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-button-primary/10" />
      <View className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-state-info/10" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            <View className="mb-8">
              <Text className="text-text-secondary text-sm tracking-widest uppercase">
                Gestão inteligente
              </Text>
              <Text className="mt-2 text-3xl font-semibold text-text-primary">
                Vision Gestão
              </Text>
              <Text className="mt-2 text-base text-text-secondary">
                Serviços e produtos organizados em um só lugar.
              </Text>
            </View>

            <View className="rounded-3xl bg-card-background p-6 shadow-lg border border-divider">
              <Text className="text-xl font-semibold text-text-primary">
                Acesse sua conta
              </Text>
              <Text className="mt-2 text-sm text-text-secondary">
                Use seu e-mail e senha para entrar.
              </Text>

              <View className="mt-6 gap-4">
                <View>
                  <Text className="mb-2 text-sm text-text-secondary">
                    E-mail
                  </Text>
                  <TextInput
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
                    placeholder="voce@empresa.com"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm text-text-secondary">
                    Senha
                  </Text>
                  <TextInput
                    className="rounded-xl border border-divider bg-background-secondary px-4 py-3 text-text-primary"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                  />
                </View>
              </View>

              {error ? (
                <Text className="mt-4 text-sm text-state-error">{error}</Text>
              ) : null}

              <View className="mt-4 flex-row items-center justify-between">
                <Pressable
                  className="flex-row items-center gap-2"
                  onPress={() => setRemember((value) => !value)}
                >
                  <View
                    className={`h-5 w-5 rounded-md border border-divider ${
                      remember ? "bg-button-primary" : "bg-background-primary"
                    }`}
                  />
                  <Text className="text-sm text-text-secondary">
                    Lembrar-me
                  </Text>
                </Pressable>
                <Pressable>
                  <Text className="text-sm text-state-info">
                    Esqueci minha senha
                  </Text>
                </Pressable>
              </View>

              <Pressable
                className="mt-6 rounded-xl bg-button-primary py-3.5 pressed:bg-button-primary-pressed"
                onPress={handleLogin}
                disabled={loading}
              >
                <Text className="text-center text-base font-semibold text-white">
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </Pressable>

              <View className="my-6 flex-row items-center">
                <View className="h-px flex-1 bg-divider" />
                <Text className="mx-3 text-xs uppercase tracking-widest text-text-tertiary">
                  ou
                </Text>
                <View className="h-px flex-1 bg-divider" />
              </View>

              <Pressable className="rounded-xl border border-divider bg-button-secondary py-3.5">
                <Text className="text-center text-sm font-semibold text-button-secondary-text">
                  Continuar com Google
                </Text>
              </Pressable>
            </View>

            <View className="mt-6 items-center">
              <Text className="text-sm text-text-secondary">
                Não tem conta?{" "}
                <Text className="font-semibold text-text-primary">
                  Criar conta
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
