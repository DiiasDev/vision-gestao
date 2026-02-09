import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export type ServicesCategoryOption = {
  id: string;
  label: string;
  count?: number;
};

type ServicesCategoriesProps = {
  options: ServicesCategoryOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

const unique = (items: string[]) => Array.from(new Set(items));

export function ServicesCategories({
  options,
  selected,
  onChange,
}: ServicesCategoriesProps) {
  const [open, setOpen] = useState(false);
  const allIds = useMemo(() => options.map((item) => item.id), [options]);
  const isAllSelected =
    allIds.length > 0 && selected.length === allIds.length;
  const selectedCount = selected.length;

  const toggleAll = () => {
    onChange(isAllSelected ? [] : allIds);
  };

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
      return;
    }

    onChange(unique([...selected, id]));
  };

  if (!options.length) {
    return (
      <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
        <Text className="text-sm text-text-tertiary">
          Nenhuma categoria disponível para filtrar.
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">
          Filtrar categorias
        </Text>
        <Pressable
          onPress={() => setOpen((prev) => !prev)}
          className="rounded-full border border-divider bg-card-background px-4 py-1.5"
        >
          <Text className="text-[11px] text-text-secondary">
            {isAllSelected
              ? "Todas"
              : selectedCount > 0
                ? `${selectedCount} selecionadas`
                : "Selecionar"}
          </Text>
        </Pressable>
      </View>

      {open ? (
        <View className="mt-3 rounded-2xl border border-divider bg-background-secondary p-3">
          <Pressable
            onPress={toggleAll}
            className={`mb-2 flex-row items-center justify-between rounded-xl border px-3 py-2 ${
              isAllSelected
                ? "bg-state-info/20 border-state-info/30"
                : "bg-card-background border-divider"
            }`}
          >
            <Text
              className={`text-xs ${
                isAllSelected ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              {isAllSelected ? "Todas selecionadas" : "Selecionar todas"}
            </Text>
            <View
              className={`h-4 w-4 items-center justify-center rounded border ${
                isAllSelected
                  ? "border-state-info bg-state-info"
                  : "border-divider bg-card-background"
              }`}
            >
              {isAllSelected ? (
                <View className="h-2 w-2 rounded-sm bg-white" />
              ) : null}
            </View>
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 200 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {options.map((item) => {
              const isActive = selected.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggleOption(item.id)}
                  className={`flex-row items-center justify-between rounded-xl border px-3 py-2 ${
                    isActive
                      ? "bg-state-info/20 border-state-info/30"
                      : "bg-card-background border-divider"
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      isActive ? "text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    {item.label}
                    {typeof item.count === "number"
                      ? ` (${item.count})`
                      : ""}
                  </Text>
                  <View
                    className={`h-4 w-4 items-center justify-center rounded border ${
                      isActive
                        ? "border-state-info bg-state-info"
                        : "border-divider bg-card-background"
                    }`}
                  >
                    {isActive ? (
                      <View className="h-2 w-2 rounded-sm bg-white" />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
