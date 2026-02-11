import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  GraphicService,
  StatusOSData,
} from "../../../services/Graphic.services";

type StatusOSProps = {
  title?: string;
  periodLabel?: string;
  agendadasLabel?: string;
  emExecucaoLabel?: string;
  concluidasLabel?: string;
  dateRange?: { startDate: Date; endDate: Date };
  onInfoPress?: () => void;
};

type StatusItem = {
  key: "agendadas" | "emExecucao" | "concluidas";
  label: string;
  value: number;
  barClass: string;
};

export function StatusOS({
  title = "Status das ordens de serviço",
  periodLabel,
  agendadasLabel = "Agendadas",
  emExecucaoLabel = "Em andamento",
  concluidasLabel = "Concluídas",
  dateRange,
  onInfoPress,
}: StatusOSProps) {
  const [data, setData] = useState<StatusOSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await GraphicService.getStatusOS(
        dateRange
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : undefined
      );
      if (!active) return;
      if (result?.success) {
        setData(result.data);
      } else {
        setData(null);
        setError(result?.message ?? "Falha ao carregar status das OS.");
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [dateRange?.endDate, dateRange?.startDate]);

  const formatRangeLabel = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  const periodText =
    periodLabel ??
    (dateRange
      ? `${formatRangeLabel(dateRange.startDate)} - ${formatRangeLabel(
          dateRange.endDate
        )}`
      : "Hoje");

  const items = useMemo<StatusItem[]>(() => {
    const source = data ?? {
      concluidas: 0,
      emExecucao: 0,
      agendadas: 0,
    };
    return [
      {
        key: "agendadas",
        label: agendadasLabel,
        value: source.agendadas ?? 0,
        barClass: "bg-state-warning",
      },
      {
        key: "emExecucao",
        label: emExecucaoLabel,
        value: source.emExecucao ?? 0,
        barClass: "bg-state-info",
      },
      {
        key: "concluidas",
        label: concluidasLabel,
        value: source.concluidas ?? 0,
        barClass: "bg-state-success",
      },
    ];
  }, [agendadasLabel, concluidasLabel, data, emExecucaoLabel]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.value, 0),
    [items]
  );

  return (
    <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2 pr-2">
          <Text
            className="flex-1 text-base font-semibold text-text-primary"
            numberOfLines={2}
          >
            {title}
          </Text>
          {onInfoPress ? (
            <Pressable
              onPress={onInfoPress}
              className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background-secondary"
              accessibilityRole="button"
              accessibilityLabel={`Informacoes sobre ${title}`}
            >
              <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
            </Pressable>
          ) : null}
        </View>
        <View className="w-[42%] shrink-0 items-end">
          <Text
            className="text-right text-xs text-text-tertiary"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {periodText}
          </Text>
        </View>
      </View>
      {loading ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Carregando status das OS...
          </Text>
        </View>
      ) : error ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-state-error">{error}</Text>
        </View>
      ) : total === 0 ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Nenhuma OS no período.
          </Text>
        </View>
      ) : (
        <View className="mt-4 gap-3">
          {items.map((item) => {
            const percent =
              total > 0 ? Math.min(100, (item.value / total) * 100) : 0;
            return (
              <View
                key={item.key}
                className="rounded-2xl bg-background-secondary px-4 py-3"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-text-secondary">
                    {item.label}
                  </Text>
                  <Text className="text-sm font-semibold text-text-primary">
                    {item.value}
                  </Text>
                </View>
                <View className="mt-2 h-2 rounded-full bg-divider">
                  <View
                    className={`h-2 rounded-full ${item.barClass}`}
                    style={{ width: `${percent}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
