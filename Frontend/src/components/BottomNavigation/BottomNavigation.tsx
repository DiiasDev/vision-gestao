import { Pressable, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type TabKey = "dashboard" | "products" | "action" | "services" | "finance";

type BottomNavigationProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

export default function BottomNavigation({
  activeTab,
  onChange,
}: BottomNavigationProps) {
  const isActive = (tab: TabKey) => activeTab === tab;

  return (
    <View className="absolute bottom-4 left-4 right-4">
      <View className="rounded-3xl bg-card-background border border-divider shadow-lg px-6 py-3 flex-row items-center justify-between">
        <Pressable
          className="items-center gap-1"
          onPress={() => onChange("dashboard")}
        >
          <Ionicons
            name={isActive("dashboard") ? "grid" : "grid-outline"}
            size={22}
            color={isActive("dashboard") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("dashboard") ? "text-state-info" : "text-text-tertiary"
            }`}
          >
            Painel
          </Text>
        </Pressable>

        <Pressable
          className="items-center gap-1"
          onPress={() => onChange("products")}
        >
          <MaterialCommunityIcons
            name={isActive("products") ? "cube" : "cube-outline"}
            size={22}
            color={isActive("products") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("products") ? "text-state-info" : "text-text-tertiary"
            }`}
          >
            Produtos
          </Text>
        </Pressable>

        <Pressable
          className="items-center -mt-6"
          onPress={() => onChange("action")}
        >
          <View className="h-14 w-14 items-center justify-center rounded-full bg-button-primary shadow-lg">
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </View>
          <Text className="mt-2 text-[10px] text-text-tertiary">Novo</Text>
        </Pressable>

        <Pressable
          className="items-center gap-1"
          onPress={() => onChange("services")}
        >
          <MaterialCommunityIcons
            name={isActive("services") ? "tools" : "tools"}
            size={22}
            color={isActive("services") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("services") ? "text-state-info" : "text-text-tertiary"
            }`}
          >
            Serviços
          </Text>
        </Pressable>

        <Pressable
          className="items-center gap-1"
          onPress={() => onChange("finance")}
        >
          <Ionicons
            name={isActive("finance") ? "card" : "card-outline"}
            size={22}
            color={isActive("finance") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("finance") ? "text-state-info" : "text-text-tertiary"
            }`}
          >
            Financeiro
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
