import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  EstoqueCriticoItem,
  GraphicService,
} from "../../../services/Graphic.services";

type EstoqueCriticoProps = {
  dateRange?: { startDate: Date; endDate: Date };
  onInfoPress?: () => void;
};

const normalizeText = (value: unknown, fallback: string) => {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const parseStockNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export function EstoqueCritico({ dateRange, onInfoPress }: EstoqueCriticoProps) {
  const [products, setProducts] = useState<EstoqueCriticoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const range = dateRange
    ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
    : undefined;

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const result = await GraphicService.getEstoqueCritico(range);
      if (!active) return;

      if (result?.success) {
        setProducts(result.products ?? []);
      } else {
        setProducts([]);
        setError(result?.message ?? "Falha ao carregar estoque critico.");
      }

      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [range?.endDate, range?.startDate]);

  const formatRangeLabel = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  const periodLabel = dateRange
    ? `${formatRangeLabel(dateRange.startDate)} - ${formatRangeLabel(
        dateRange.endDate
      )}`
    : "Reposição";

  const displayProducts = useMemo(() => products.slice(0, 6), [products]);

  return (
    <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2 pr-2">
          <Text
            className="flex-1 text-base font-semibold text-text-primary"
            numberOfLines={2}
          >
            Estoque crítico
          </Text>
          {onInfoPress ? (
            <Pressable
              onPress={onInfoPress}
              className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background-secondary"
              accessibilityRole="button"
              accessibilityLabel="Informacoes sobre estoque critico"
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#2563EB"
              />
            </Pressable>
          ) : null}
        </View>
        <View className="w-[42%] shrink-0 items-end">
          <Text
            className="text-right text-xs text-text-tertiary"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {periodLabel}
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-3">
        {loading ? (
          <View className="rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-sm text-text-secondary">
              Carregando estoque crítico...
            </Text>
          </View>
        ) : error ? (
          <View className="rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-sm text-state-error">{error}</Text>
          </View>
        ) : displayProducts.length === 0 ? (
          <View className="rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-sm text-text-secondary">
              Nenhum item em estoque crítico.
            </Text>
          </View>
        ) : (
          displayProducts.map((item, index) => {
            const level = parseStockNumber(item.estoque);
            const percent = Math.max(0, Math.min((((level ?? 0) / 5) * 100), 100));
            const name = normalizeText(item.nome, "Produto sem nome");
            const unit = normalizeText(item.unidade, "");
            const itemKey = item.id ?? `${name}-${index}`;
            const stockLabel =
              level !== null ? String(level) : normalizeText(item.estoque, "0");

            return (
              <View
                key={String(itemKey)}
                className="rounded-2xl bg-background-secondary px-4 py-3"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-text-secondary">{name}</Text>
                  <Text className="text-sm font-semibold text-text-primary">
                    {stockLabel}
                    {unit ? ` ${unit}` : ""}
                  </Text>
                </View>
                <View className="mt-2 h-2 rounded-full bg-divider">
                  <View
                    className="h-2 rounded-full bg-state-error"
                    style={{ width: `${percent}%` }}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
