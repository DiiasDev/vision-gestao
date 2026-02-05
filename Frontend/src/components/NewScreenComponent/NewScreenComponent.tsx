import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export type NewActionKey =
  | "products"
  | "services"
  | "services_realized"
  | "budgets"
  | "transactions"
  | "clients";

type NewScreenComponentProps = {
  onSelect?: (key: NewActionKey) => void;
  showSelectorOnOpen?: boolean;
  modalOnly?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
};

type ActionItem = {
  key: NewActionKey;
  title: string;
  subtitle: string;
  icon:
    | { family: "Ionicons"; name: keyof typeof Ionicons.glyphMap }
    | {
        family: "MaterialCommunityIcons";
        name: keyof typeof MaterialCommunityIcons.glyphMap;
      };
  tag: string;
  accent: string;
};

export default function NewScreenComponent({
  onSelect,
  showSelectorOnOpen = true,
  modalOnly = false,
  isVisible,
  onClose,
}: NewScreenComponentProps) {
  const [selectorVisible, setSelectorVisible] = useState(showSelectorOnOpen);
  const [selected, setSelected] = useState<NewActionKey | null>(null);

  useEffect(() => {
    if (showSelectorOnOpen) {
      setSelectorVisible(true);
    }
  }, [showSelectorOnOpen]);

  const actions: ActionItem[] = useMemo(
    () => [
      {
        key: "products",
        title: "Produto",
        subtitle: "Crie itens do catálogo e controle de estoque.",
        icon: { family: "MaterialCommunityIcons", name: "cube-outline" },
        tag: "Estoque",
        accent: "#DBEAFE",
      },
      {
        key: "services",
        title: "Serviço (catálogo)",
        subtitle: "Cadastre serviços para o catálogo.",
        icon: { family: "MaterialCommunityIcons", name: "tools" },
        tag: "Operações",
        accent: "#DCFCE7",
      },
      {
        key: "services_realized",
        title: "Serviço realizado",
        subtitle: "Registre atendimentos concluídos.",
        icon: { family: "MaterialCommunityIcons", name: "clipboard-check" },
        tag: "Execução",
        accent: "#E0F2FE",
      },
      {
        key: "budgets",
        title: "Orçamento",
        subtitle: "Gere propostas e acompanhe aprovações.",
        icon: { family: "Ionicons", name: "document-text-outline" },
        tag: "Comercial",
        accent: "#FEF9C3",
      },
      {
        key: "transactions",
        title: "Movimentação",
        subtitle: "Lance entradas e saídas financeiras.",
        icon: { family: "Ionicons", name: "swap-horizontal" },
        tag: "Financeiro",
        accent: "#EDE9FE",
      },
      {
        key: "clients",
        title: "Cliente",
        subtitle: "Cadastre contatos e dados de relacionamento.",
        icon: { family: "Ionicons", name: "people-outline" },
        tag: "Relacionamento",
        accent: "#FCE7F3",
      },
    ],
    []
  );

  const handleSelect = (key: NewActionKey) => {
    setSelected(key);
    setSelectorVisible(false);
    onSelect?.(key);
    onClose?.();
  };

  const renderIcon = (item: ActionItem, size = 20) => {
    if (item.icon.family === "Ionicons") {
      return <Ionicons name={item.icon.name} size={size} color="#111827" />;
    }

    return (
      <MaterialCommunityIcons
        name={item.icon.name}
        size={size}
        color="#111827"
      />
    );
  };

  const selectedItem = actions.find((item) => item.key === selected);

  const modalVisible =
    typeof isVisible === "boolean" ? isVisible : selectorVisible;

  if (modalOnly) {
    return (
      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-3xl bg-card-background p-5">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-lg font-semibold text-text-primary">
                  O que você deseja cadastrar?
                </Text>
                <Text className="mt-1 text-sm text-text-secondary">
                  Escolha o tipo de registro para continuar.
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setSelectorVisible(false);
                  onClose?.();
                }}
                className="h-8 w-8 items-center justify-center rounded-full border border-divider"
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </Pressable>
            </View>

            <View className="mt-4 gap-3">
              {actions.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => handleSelect(item.key)}
                  className="flex-row items-center justify-between rounded-2xl border border-divider px-4 py-3"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: item.accent }}
                    >
                      {renderIcon(item, 18)}
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-text-primary">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-text-tertiary">
                        {item.tag}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#9CA3AF"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View className="flex-1 bg-background-primary">
      <View className="relative overflow-hidden px-6 pt-10 pb-6">
        <View
          className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-40"
          style={{ backgroundColor: "#DBEAFE" }}
        />
        <View
          className="absolute top-24 -left-16 h-32 w-32 rounded-full opacity-30"
          style={{ backgroundColor: "#EDE9FE" }}
        />
        <Text className="text-3xl font-semibold text-text-primary">
          Novo cadastro
        </Text>
        <Text className="mt-2 text-base text-text-secondary">
          Selecione o tipo de registro e avance direto para o formulário.
        </Text>
        <View className="mt-5 rounded-2xl border border-divider bg-card-background px-4 py-4 shadow-sm">
          <Text className="text-sm text-text-tertiary">
            Fluxo inteligente
          </Text>
          <Text className="mt-1 text-base font-semibold text-text-primary">
            Tudo em um só lugar para manter seu negócio organizado.
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-text-primary">
            Cadastros disponíveis
          </Text>
          <Pressable
            onPress={() => setSelectorVisible(true)}
            className="rounded-full border border-divider px-3 py-1"
          >
            <Text className="text-xs text-text-secondary">Selecionar</Text>
          </Pressable>
        </View>

        <View className="mt-4 gap-4">
          {actions.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => handleSelect(item.key)}
              className="rounded-2xl border border-divider bg-card-background p-4"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: item.accent }}
                    >
                      {renderIcon(item, 20)}
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-text-primary">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-text-tertiary">
                        {item.tag}
                      </Text>
                    </View>
                  </View>
                  <Text className="mt-3 text-sm text-text-secondary">
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#2563EB" />
              </View>
            </Pressable>
          ))}
        </View>

        {selectedItem ? (
          <View className="mt-6 rounded-2xl bg-background-secondary p-4">
            <Text className="text-xs uppercase text-text-tertiary">
              Selecionado
            </Text>
            <Text className="mt-1 text-base font-semibold text-text-primary">
              {selectedItem.title}
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Continue para o formulário de {selectedItem.title.toLowerCase()}.
            </Text>
            <Pressable className="mt-4 rounded-xl bg-button-primary px-4 py-3">
              <Text className="text-center text-sm font-semibold text-white">
                Ir para cadastro
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-6 rounded-2xl bg-background-secondary p-4">
            <Text className="text-sm text-text-secondary">
              Escolha uma opção acima para iniciar um novo cadastro.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-3xl bg-card-background p-5">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-lg font-semibold text-text-primary">
                  O que você deseja cadastrar?
                </Text>
                <Text className="mt-1 text-sm text-text-secondary">
                  Escolha o tipo de registro para continuar.
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setSelectorVisible(false);
                  onClose?.();
                }}
                className="h-8 w-8 items-center justify-center rounded-full border border-divider"
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </Pressable>
            </View>

            <View className="mt-4 gap-3">
              {actions.map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => handleSelect(item.key)}
                  className="flex-row items-center justify-between rounded-2xl border border-divider px-4 py-3"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: item.accent }}
                    >
                      {renderIcon(item, 18)}
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-text-primary">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-text-tertiary">
                        {item.tag}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
