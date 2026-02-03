import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type Movimentacao = {
  id: string;
  produto: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  unidade: string;
  data: string;
  responsavel: string;
  motivo?: string;
};

type MovimentacaoEstoqueProps = {
  data: Movimentacao[];
};

const getBadge = (tipo: Movimentacao["tipo"]) => {
  switch (tipo) {
    case "entrada":
      return {
        label: "Entrada",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        icon: "arrow-down-circle-outline" as const,
      };
    case "saida":
      return {
        label: "Saída",
        color: "text-rose-600",
        bg: "bg-rose-100",
        icon: "arrow-up-circle-outline" as const,
      };
    default:
      return {
        label: "Ajuste",
        color: "text-amber-600",
        bg: "bg-amber-100",
        icon: "swap-horizontal-outline" as const,
      };
  }
};

export default function MovimentacaoEstoque({
  data,
}: MovimentacaoEstoqueProps) {
  return (
    <View>
      {data.map((item) => {
        const badge = getBadge(item.tipo);
        return (
          <View
            key={item.id}
            className="mb-3 rounded-2xl border border-divider bg-card-background px-4 py-3"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-semibold text-text-primary">
                  {item.produto}
                </Text>
                <Text className="mt-1 text-xs text-text-tertiary">
                  {item.data} • {item.responsavel}
                </Text>
                {item.motivo ? (
                  <Text className="mt-2 text-xs text-text-secondary">
                    {item.motivo}
                  </Text>
                ) : null}
              </View>
              <View className="items-end">
                <View
                  className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${badge.bg}`}
                >
                  <Ionicons name={badge.icon} size={12} color="#111827" />
                  <Text className={`text-[11px] font-semibold ${badge.color}`}>
                    {badge.label}
                  </Text>
                </View>
                <Text className="mt-2 text-base font-semibold text-text-primary">
                  {item.tipo === "saida" ? "-" : "+"}
                  {item.quantidade} {item.unidade}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
