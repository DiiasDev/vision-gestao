import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { FinanceFilter } from "../../../../Backend/src/types/Finance/FinanceTypes.types";
import {
  FinanceService,
  FinanceMovementView,
} from "../../services/Finance.services";
import FinanceMovimentForm from "./FinanceMovimentForm";

const quickInsights = [
  {
    id: "receivables",
    label: "A receber",
    value: "R$ 6.350",
    detail: "12 cobranças pendentes",
  },
  {
    id: "payables",
    label: "A pagar",
    value: "R$ 3.960",
    detail: "5 contas próximas",
  },
  {
    id: "avg",
    label: "Ticket médio",
    value: "R$ 380",
    detail: "Últimos 30 dias",
  },
];

const highlightCards = [
  {
    id: "goals",
    title: "Meta de faturamento",
    value: "76%",
    subtitle: "R$ 46.980 de R$ 62.000",
    footer: "Faltam R$ 15.020",
  },
  {
    id: "cashflow",
    title: "Fluxo previsto (7 dias)",
    value: "+ R$ 2.410",
    subtitle: "Entradas R$ 5.200 · Saídas R$ 2.790",
    footer: "Próxima revisão: 07 Fev",
  },
];

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR")}`;

const formatDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

const buildSummaries = (items: FinanceMovementView[]) => {
  const income = items
    .filter((item) => item.type === "in")
    .reduce((acc, item) => acc + item.value, 0);
  const expense = items
    .filter((item) => item.type === "out")
    .reduce((acc, item) => acc + item.value, 0);
  const pending = items
    .filter((item) => item.status !== "Pago")
    .reduce((acc, item) => acc + item.value, 0);
  const balance = income - expense;

  return [
    {
      id: "balance",
      label: "Saldo atual",
      value: formatCurrency(balance),
      meta: "Atualizado há 2h",
      tone: "info",
    },
    {
      id: "income",
      label: "Entradas do período",
      value: formatCurrency(income),
      meta: "Movimentos filtrados",
      tone: "success",
    },
    {
      id: "expense",
      label: "Saídas do período",
      value: formatCurrency(expense),
      meta: "Movimentos filtrados",
      tone: "error",
    },
    {
      id: "pending",
      label: "Pendências",
      value: formatCurrency(pending),
      meta: "Pagamentos em aberto",
      tone: "warning",
    },
  ];
};

const toneMap = {
  success: "text-state-success",
  warning: "text-state-warning",
  error: "text-state-error",
  info: "text-state-info",
  default: "text-text-primary",
};

const chipMap = {
  Pago: "bg-state-success/15 text-state-success",
  Pendente: "bg-state-warning/15 text-state-warning",
  Agendado: "bg-state-info/15 text-state-info",
};

export default function ListFinance() {
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState<FinanceFilter["range"]>("30d");
  const [category, setCategory] = useState<"Todas" | "Entrada" | "Saída">(
    "Todas"
  );
  const [dateFrom, setDateFrom] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30)
  );
  const [dateTo, setDateTo] = useState<Date>(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<"from" | "to">("from");
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);
  const [quickFormType, setQuickFormType] = useState<"in" | "out" | null>(null);
  const [rawMovements, setRawMovements] = useState<FinanceMovementView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await FinanceService.getMovements();
      if (!active) return;
      if (result?.success) {
        setRawMovements(FinanceService.toView(result.movements ?? []));
      } else {
        setRawMovements([]);
        setError(result?.message ?? "Falha ao carregar movimentações.");
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const movements = useMemo(() => rawMovements, [rawMovements]);
  const activeFilters = useMemo<FinanceFilter>(
    () => ({
      range,
      type:
        category === "Entrada"
          ? "in"
          : category === "Saída"
            ? "out"
            : undefined,
      dateFrom: range === "custom" ? dateFrom.toISOString() : undefined,
      dateTo: range === "custom" ? dateTo.toISOString() : undefined,
    }),
    [range, category, dateFrom, dateTo]
  );

  const filteredMovements = useMemo(
    () => FinanceService.filterMovements(movements, activeFilters),
    [movements, activeFilters]
  );

  const summaries = useMemo(
    () => buildSummaries(filteredMovements),
    [filteredMovements]
  );

  return (
    <ScrollView
      className="flex-1 bg-background-primary"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-10">
        <View className="mb-6">
          <Text className="text-sm uppercase tracking-widest text-text-secondary">
            Financeiro
          </Text>
          <Text className="mt-2 text-3xl font-semibold text-text-primary">
            Controle inteligente do caixa
          </Text>
          <Text className="mt-2 text-base text-text-secondary">
            Acompanhe entradas, saídas, metas e movimentos do período.
          </Text>
        </View>

        <View className="mb-6 flex-row gap-3">
          <Pressable
            onPress={() => {
              setQuickFormType("out");
              setIsQuickFormOpen(true);
            }}
            className="flex-1 rounded-2xl bg-state-error/10 px-4 py-3 border border-state-error/20"
          >
            <Text className="text-xs uppercase tracking-widest text-state-error">
              Registrar Despesa
            </Text>
            <Text className="mt-1 text-base font-semibold text-state-error">
              Saída rápida
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setQuickFormType("in");
              setIsQuickFormOpen(true);
            }}
            className="flex-1 rounded-2xl bg-state-success/10 px-4 py-3 border border-state-success/20"
          >
            <Text className="text-xs uppercase tracking-widest text-state-success">
              Registrar Ganho
            </Text>
            <Text className="mt-1 text-base font-semibold text-state-success">
              Entrada imediata
            </Text>
          </Pressable>
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Filtros rápidos
            </Text>
            <Pressable
              onPress={() => {
                setRange("30d");
                setCategory("Todas");
              }}
              className="rounded-full bg-background-secondary px-3 py-1"
            >
              <Text className="text-xs text-text-secondary">Limpar</Text>
            </Pressable>
          </View>
          <Text className="mt-2 text-xs text-text-tertiary">
            Ajuste o período e o tipo de movimento para refinar o extrato.
          </Text>

          <View className="mt-4 gap-4">
            <View>
              <Text className="text-xs uppercase tracking-widest text-text-secondary">
                Período
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-2"
                contentContainerStyle={{ gap: 8 }}
              >
                {[
                  { label: "7 dias", value: "7d" },
                  { label: "15 dias", value: "15d" },
                  { label: "30 dias", value: "30d" },
                  { label: "90 dias", value: "90d" },
                  { label: "Personalizado", value: "custom" },
                ].map((item) => {
                  const isActive = range === item.value;
                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setRange(item.value as FinanceFilter["range"])}
                      className={`rounded-full border px-4 py-2 ${
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
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {range === "custom" ? (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    setActiveDateField("from");
                    setShowDatePicker(true);
                  }}
                  className="flex-1 rounded-2xl border border-divider bg-card-background px-4 py-3"
                >
                  <Text className="text-[11px] uppercase tracking-widest text-text-tertiary">
                    De
                  </Text>
                  <Text className="mt-1 text-sm text-text-primary">
                    {formatDate(dateFrom)}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setActiveDateField("to");
                    setShowDatePicker(true);
                  }}
                  className="flex-1 rounded-2xl border border-divider bg-card-background px-4 py-3"
                >
                  <Text className="text-[11px] uppercase tracking-widest text-text-tertiary">
                    Até
                  </Text>
                  <Text className="mt-1 text-sm text-text-primary">
                    {formatDate(dateTo)}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View>
              <Text className="text-xs uppercase tracking-widest text-text-secondary">
                Categoria
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-2"
                contentContainerStyle={{ gap: 8 }}
              >
                {["Todas", "Entrada", "Saída"].map((item) => {
                  const isActive = category === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() =>
                        setCategory(item as "Todas" | "Entrada" | "Saída")
                      }
                      className={`rounded-full border px-4 py-2 ${
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
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text-primary">
              Resumo financeiro
            </Text>
            <Text className="text-xs text-text-tertiary">Fevereiro 2026</Text>
          </View>
          <View className="mt-4 flex-row flex-wrap gap-3">
            {summaries.map((summary) => (
              <View
                key={summary.id}
                className="w-[48%] rounded-2xl bg-background-secondary p-4"
              >
                <Text className="text-xs text-text-secondary">
                  {summary.label}
                </Text>
                <Text
                  className={`mt-1 text-lg font-semibold ${toneMap[summary.tone]}`}
                >
                  {summary.value}
                </Text>
                <Text className="mt-1 text-[11px] text-text-tertiary">
                  {summary.meta}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-6 flex-row gap-3">
          {quickInsights.map((item) => (
            <View
              key={item.id}
              className="flex-1 rounded-2xl bg-card-background p-4 border border-divider shadow-lg"
            >
              <Text className="text-xs text-text-secondary">{item.label}</Text>
              <Text className="mt-1 text-lg font-semibold text-text-primary">
                {item.value}
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                {item.detail}
              </Text>
            </View>
          ))}
        </View>

        <View className="mb-6 flex-row gap-3">
          {highlightCards.map((card, index) => (
            <View
              key={card.id}
              className={`flex-1 rounded-[28px] p-5 border shadow-lg ${
                index === 0
                  ? "bg-state-info/10 border-state-info/20"
                  : "bg-background-secondary border-divider"
              }`}
            >
              <Text className="text-xs uppercase tracking-widest text-text-secondary">
                {card.title}
              </Text>
              <Text className="mt-3 text-2xl font-semibold text-text-primary">
                {card.value}
              </Text>
              <Text className="mt-1 text-xs text-text-secondary">
                {card.subtitle}
              </Text>
              <View className="mt-4 h-2 rounded-full bg-divider">
                <View
                  className="h-2 rounded-full bg-state-info"
                  style={{ width: index === 0 ? "76%" : "60%" }}
                />
              </View>
              <Text className="mt-3 text-xs text-text-tertiary">
                {card.footer}
              </Text>
            </View>
          ))}
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-text-primary">
                Registros recentes
              </Text>
              <Text className="mt-1 text-xs text-text-tertiary">
                Últimas movimentações confirmadas
              </Text>
            </View>
            <View className="rounded-full bg-background-secondary px-3 py-1">
              <Text className="text-xs text-text-secondary">Ver tudo</Text>
            </View>
          </View>
          <View className="mt-4 gap-3">
            {loading ? (
              <View className="items-center gap-3 rounded-2xl border border-divider bg-background-secondary p-6">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-sm text-text-secondary">
                  Carregando movimentações...
                </Text>
              </View>
            ) : error ? (
              <View className="rounded-2xl border border-divider bg-background-secondary p-4">
                <Text className="text-sm font-semibold text-text-primary">
                  Não foi possível carregar
                </Text>
                <Text className="mt-1 text-xs text-text-tertiary">
                  {error}
                </Text>
              </View>
            ) : filteredMovements.length === 0 ? (
              <View className="rounded-2xl border border-divider bg-background-secondary p-4">
                <Text className="text-sm font-semibold text-text-primary">
                  Nenhuma movimentação encontrada
                </Text>
                <Text className="mt-1 text-xs text-text-tertiary">
                  Ajuste os filtros ou registre uma nova movimentação.
                </Text>
              </View>
            ) : (
              filteredMovements.map((movement) => (
                <View
                  key={movement.id}
                  className="rounded-2xl border border-divider bg-background-secondary p-4"
                >
                <View className="flex-row items-center justify-between gap-3">
                  <Text
                    className="flex-1 text-sm font-semibold text-text-primary"
                    numberOfLines={2}
                  >
                    {movement.title}
                  </Text>
                  <Text
                    className={`text-sm font-semibold ${
                      movement.type === "in"
                        ? "text-state-success"
                        : "text-state-error"
                    }`}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {`${movement.type === "in" ? "+" : "-"} ${formatCurrency(
                      movement.value
                    )}`}
                  </Text>
                </View>
                  <View className="mt-2 flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs text-text-secondary">
                        {movement.category}
                      </Text>
                      <Text className="mt-1 text-[11px] text-text-tertiary">
                        {movement.dateLabel} · {movement.channel}
                      </Text>
                    </View>
                    <View
                      className={`rounded-full px-3 py-1 ${
                        chipMap[movement.status]
                      }`}
                    >
                      <Text className="text-[11px] font-semibold">
                        {movement.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="mb-6 rounded-[28px] bg-card-background p-5 border border-divider shadow-lg">
          <Text className="text-base font-semibold text-text-primary">
            Cards de atenção
          </Text>
          <View className="mt-4 gap-3">
            <View className="rounded-2xl bg-background-secondary p-4">
              <Text className="text-xs uppercase tracking-widest text-text-secondary">
                Projeção semanal
              </Text>
              <Text className="mt-2 text-lg font-semibold text-text-primary">
                Fluxo positivo até 12 Fev
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                Mantendo o ritmo, o caixa fecha com +R$ 4.800.
              </Text>
            </View>
            <View className="rounded-2xl bg-background-secondary p-4">
              <Text className="text-xs uppercase tracking-widest text-text-secondary">
                Alertas
              </Text>
              <Text className="mt-2 text-lg font-semibold text-text-primary">
                2 cobranças vencem amanhã
              </Text>
              <Text className="mt-1 text-[11px] text-text-tertiary">
                Clientes: Marcos Silva, Ana Pereira.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Modal
        transparent
        visible={isQuickFormOpen}
        animationType="slide"
        onRequestClose={() => setIsQuickFormOpen(false)}
      >
        <View className="flex-1 bg-background-primary">
          <View className="flex-row items-center justify-between px-6 pt-6">
            <Text className="text-lg font-semibold text-text-primary">
              {quickFormType === "out"
                ? "Nova saída"
                : quickFormType === "in"
                  ? "Nova entrada"
                  : "Nova movimentação"}
            </Text>
            <Pressable
              onPress={() => setIsQuickFormOpen(false)}
              className="rounded-full border border-divider px-3 py-1"
            >
              <Text className="text-sm text-text-secondary">Fechar</Text>
            </Pressable>
          </View>
          <FinanceMovimentForm
            onBack={() => setIsQuickFormOpen(false)}
            initialData={quickFormType ? { type: quickFormType } : null}
          />
        </View>
      </Modal>

      <Modal
        transparent
        visible={showDatePicker}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          onPress={() => setShowDatePicker(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6"
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            className="w-full rounded-3xl bg-card-background p-5"
          >
            <Text className="text-lg font-semibold text-text-primary">
              Selecionar data
            </Text>
            <View className="mt-4">
              <DateTimePicker
                value={activeDateField === "from" ? dateFrom : dateTo}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selected) => {
                  const chosen =
                    selected ??
                    (activeDateField === "from" ? dateFrom : dateTo);
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (event.type === "set") {
                    if (activeDateField === "from") {
                      setDateFrom(chosen);
                      if (chosen > dateTo) {
                        setDateTo(chosen);
                      }
                    } else {
                      setDateTo(chosen);
                      if (chosen < dateFrom) {
                        setDateFrom(chosen);
                      }
                    }
                  }
                }}
              />
            </View>
            {Platform.OS === "ios" ? (
              <Pressable
                onPress={() => setShowDatePicker(false)}
                className="mt-4 items-center rounded-2xl bg-button-primary px-4 py-3"
              >
                <Text className="text-sm font-semibold text-white">
                  Confirmar
                </Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
