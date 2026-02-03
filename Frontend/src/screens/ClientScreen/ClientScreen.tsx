import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ClientScreenProps = {
  onNewClient?: () => void;
};

export default function ClientScreen({ onNewClient }: ClientScreenProps) {
  return (
    <View className="flex-1 bg-background-primary px-6 pt-10">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-semibold text-text-primary">
            Clientes
          </Text>
          <Text className="mt-2 text-base text-text-secondary">
            Organize contatos, histórico e preferências.
          </Text>
        </View>
        <Pressable
          onPress={onNewClient}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-divider bg-card-background"
        >
          <Ionicons name="add" size={20} color="#2563EB" />
        </Pressable>
      </View>

      <View className="mt-8 rounded-3xl border border-divider bg-card-background p-6">
        <Text className="text-base font-semibold text-text-primary">
          Nenhum cliente cadastrado
        </Text>
        <Text className="mt-2 text-sm text-text-secondary">
          Use o botão acima para adicionar seu primeiro cliente.
        </Text>
        <Pressable
          onPress={onNewClient}
          className="mt-4 rounded-xl bg-button-primary px-4 py-3"
        >
          <Text className="text-center text-sm font-semibold text-white">
            Novo cliente
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
