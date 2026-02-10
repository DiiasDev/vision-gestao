import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import {
  GraphicService,
  ValuesCardsData,
} from "../../../services/Graphic.services";
import { formatCurrencyBR } from "../../../utils/formatter";

type ValuesCardsProps = {
  title?: string;
  periodLabel?: string;
  faturamentoLabel?: string;
  faturamentoValue?: string;
  faturamentoHint?: string;
  custosLabel?: string;
  custosValue?: string;
  custosHint?: string;
  saldoLabel?: string;
  saldoValue?: string;
  dateRange?: { startDate: Date; endDate: Date };
};

export function ValuesCards({
  title = "Visão geral do caixa",
  periodLabel,
  faturamentoLabel = "Faturamento",
  faturamentoHint,
  custosLabel = "Custos",
  custosHint,
  saldoLabel = "Saldo em caixa",
  dateRange,
}: ValuesCardsProps) {
  const [data, setData] = useState<ValuesCardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await GraphicService.getValuesCards(
        dateRange
          ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
          : undefined
      );
      if (!active) return;
      if (result?.success) {
        setData(result.data);
      } else {
        setData(null);
        setError(result?.message ?? "Falha ao carregar valores dos cards.");
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
      : "Ano atual");

  const hasData =
    (data?.faturamento ?? 0) !== 0 ||
    (data?.custo ?? 0) !== 0 ||
    (data?.saldo ?? 0) !== 0;

  const formatted = useMemo(() => {
    return {
      faturamento: formatCurrencyBR(data?.faturamento ?? 0),
      custo: formatCurrencyBR(data?.custo ?? 0),
      saldo: formatCurrencyBR(data?.saldo ?? 0),
    };
  }, [data]);

  const formattedHints = useMemo(() => {
    const formatPercentChange = (value: number | null | undefined) => {
      if (value === null || value === undefined || !Number.isFinite(value)) {
        return "Sem histórico";
      }
      const rounded = Math.round(value * 10) / 10;
      const sign = rounded > 0 ? "+" : "";
      return `${sign}${rounded}%`;
    };

    const formatSharePercent = (value: number | null | undefined) => {
      if (value === null || value === undefined || !Number.isFinite(value)) {
        return "0%";
      }
      const rounded = Math.round(value * 10) / 10;
      return `${rounded}%`;
    };

    return {
      faturamento:
        faturamentoHint ??
        `${formatPercentChange(data?.faturamentoPercent)} no ano`,
      custo:
        custosHint ?? `${formatSharePercent(data?.custoPercent)} do total`,
    };
  }, [data, faturamentoHint, custosHint]);

  const faturamentoValue = formatted.faturamento;
  const custosValue = formatted.custo;
  const saldoValue = formatted.saldo;
  return (
    <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-text-primary">
          {title}
        </Text>
        <Text
          className="text-xs text-text-tertiary"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {periodText}
        </Text>
      </View>
      {loading ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Carregando valores...
          </Text>
        </View>
      ) : error ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-state-error">{error}</Text>
        </View>
      ) : !hasData ? (
        <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
          <Text className="text-sm text-text-secondary">
            Sem movimentações no período.
          </Text>
        </View>
      ) : (
        <>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-background-secondary p-4">
              <Text className="text-xs text-text-secondary">
                {faturamentoLabel}
              </Text>
              <Text className="mt-1 text-lg font-semibold text-state-success">
                {faturamentoValue}
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                {formattedHints.faturamento}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-background-secondary p-4">
              <Text className="text-xs text-text-secondary">{custosLabel}</Text>
              <Text className="mt-1 text-lg font-semibold text-state-error">
                {custosValue}
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                {formattedHints.custo}
              </Text>
            </View>
          </View>
          <View className="mt-4 rounded-2xl bg-background-secondary px-4 py-3">
            <Text className="text-xs text-text-secondary">{saldoLabel}</Text>
            <Text className="mt-1 text-xl font-semibold text-text-primary">
              {saldoValue}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
