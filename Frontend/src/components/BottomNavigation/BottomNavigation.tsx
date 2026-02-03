import { Modal, Pressable, Switch, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

type TabKey =
  | "dashboard"
  | "products"
  | "action"
  | "services"
  | "finance"
  | "clients";

type BottomNavigationProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  onActionPress?: () => void;
  onLogout?: () => void;
};

export default function BottomNavigation({
  activeTab,
  onChange,
  onActionPress,
  onLogout,
}: BottomNavigationProps) {
  const isActive = (tab: TabKey) => activeTab === tab;
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <View className="absolute bottom-4 left-4 right-4">
      <View className="rounded-3xl bg-card-background border border-divider shadow-lg px-2 py-2.5 flex-row items-center justify-between">
        <Pressable
          className="flex-1 items-center gap-0.5 px-1"
          onPress={() => onChange("dashboard")}
        >
          <Ionicons
            name={isActive("dashboard") ? "grid" : "grid-outline"}
            size={20}
            color={isActive("dashboard") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("dashboard") ? "text-state-info" : "text-text-tertiary"
            } text-center leading-tight`}
            numberOfLines={1}
          >
            Painel
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 items-center gap-0.5 px-1"
          onPress={() => onChange("products")}
        >
          <MaterialCommunityIcons
            name={isActive("products") ? "cube" : "cube-outline"}
            size={20}
            color={isActive("products") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("products") ? "text-state-info" : "text-text-tertiary"
            } text-center leading-tight`}
            numberOfLines={1}
          >
            Produtos
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 items-center gap-0.5 px-1"
          onPress={() => onChange("clients")}
        >
          <Ionicons
            name={isActive("clients") ? "people" : "people-outline"}
            size={20}
            color={isActive("clients") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("clients") ? "text-state-info" : "text-text-tertiary"
            } text-center leading-tight`}
            numberOfLines={1}
          >
            Clientes
          </Text>
        </Pressable>

        <Pressable
          className="items-center -mt-5 px-1"
          onPress={() => (onActionPress ? onActionPress() : onChange("action"))}
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-button-primary shadow-lg">
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
          <Text className="mt-1 text-[9px] text-text-tertiary" numberOfLines={1}>
            Novo
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 items-center gap-0.5 px-1"
          onPress={() => onChange("services")}
        >
          <MaterialCommunityIcons
            name={isActive("services") ? "tools" : "tools"}
            size={20}
            color={isActive("services") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("services") ? "text-state-info" : "text-text-tertiary"
            } text-center leading-tight`}
            numberOfLines={1}
          >
            Serviços
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 items-center gap-0.5 px-1"
          onPress={() => onChange("finance")}
        >
          <Ionicons
            name={isActive("finance") ? "cash" : "cash-outline"}
            size={20}
            color={isActive("finance") ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              isActive("finance") ? "text-state-info" : "text-text-tertiary"
            } text-center leading-tight`}
            numberOfLines={1}
          >
            Financeiro
          </Text>
        </Pressable>

        <Pressable
          className="flex-1 items-center gap-0.5 px-1"
          onPress={() => setProfileMenuOpen(true)}
        >
          <Ionicons
            name={profileMenuOpen ? "person-circle" : "person-circle-outline"}
            size={20}
            color={profileMenuOpen ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            className={`text-[10px] ${
              profileMenuOpen ? "text-state-info" : "text-text-tertiary"
            } text-center leading-tight`}
            numberOfLines={1}
          >
            Perfil
          </Text>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={profileMenuOpen}
        animationType="fade"
        onRequestClose={() => setProfileMenuOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setProfileMenuOpen(false)}
        >
          <Pressable
            className="absolute bottom-24 right-4 w-56 rounded-2xl border border-divider bg-card-background p-4"
            onPress={() => {}}
          >
            <Text className="text-xs uppercase tracking-widest text-text-tertiary">
              Preferências
            </Text>
            <View className="mt-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={theme === "dark" ? "moon" : "sunny"}
                  size={18}
                  color="#9CA3AF"
                />
                <Text className="text-sm text-text-primary">Tema escuro</Text>
              </View>
              <Switch
                value={theme === "dark"}
                onValueChange={() => toggleTheme()}
              />
            </View>

            <View className="my-3 h-px bg-divider" />

            <Pressable
              onPress={() => {
                setProfileMenuOpen(false);
                onLogout?.();
              }}
              className="flex-row items-center gap-2"
            >
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              <Text className="text-sm font-semibold text-state-error">
                Sair
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
