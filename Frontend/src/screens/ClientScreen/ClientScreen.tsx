import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ListClients from "../../components/ClientsComponent/ListClients";
import {
  ClienteService,
  type Client,
} from "../../services/Clients.services";

type ClientScreenProps = {
  onNewClient?: () => void;
};

export default function ClientScreen({ onNewClient }: ClientScreenProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = useCallback(async (silent?: boolean) => {
    if (!silent) setLoading(true);
    setError(null);
    const result = await ClienteService.getClients();
    if (result?.success) {
      setClients(result.clients ?? []);
    } else {
      setClients([]);
      setError(result?.message ?? "Falha ao carregar clientes.");
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClients(true);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-background-primary">
      <View className="relative z-20 px-6 pt-10">
        <View className="absolute inset-0" pointerEvents="none">
          <View
            className="absolute -right-16 -top-10 h-40 w-40 rounded-full"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}
          />
          <View
            className="absolute -left-20 top-24 h-32 w-32 rounded-full"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.12)" }}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm uppercase tracking-widest text-text-secondary">
              Relacionamento
            </Text>
            <Text className="mt-2 text-3xl font-semibold text-text-primary">
              Clientes & contatos
            </Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Visualize perfis, histórico e status de cada cliente.
            </Text>
          </View>
          <Pressable
            onPress={onNewClient}
            className="h-11 w-11 items-center justify-center rounded-2xl border border-divider bg-card-background"
          >
            <Ionicons name="add" size={20} color="#2563EB" />
          </Pressable>
        </View>
      </View>

      <View className="flex-1 z-0">
        <ListClients
          clients={clients}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onNewClient={onNewClient}
        />
      </View>
    </View>
  );
}
