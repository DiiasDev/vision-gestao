import type {
  FinanceFilter,
  FinanceMovement,
  FinanceMovementStatus,
} from "../../../Backend/src/types/Finance/FinanceTypes.types";
import { Platform } from "react-native";

export type FinanceMovementView = FinanceMovement & {
  dateISO: string;
  dateLabel: string;
  channel: NonNullable<FinanceMovement["channel"]>;
};

const getBaseUrl = () =>
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "ios" ? "http://localhost:3333" : "http://10.0.2.2:3333");

const buildRangeStart = (range: FinanceFilter["range"]) => {
  if (range === "custom") return null;
  const days = range === "7d" ? 7 : range === "15d" ? 15 : range === "30d" ? 30 : 90;
  const base = new Date();
  base.setDate(base.getDate() - days);
  return base;
};

const formatDateLabel = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeLabel = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Hoje · ${timeLabel}`;
  if (diffDays === 1) return `Ontem · ${timeLabel}`;

  const dateLabel = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return `${dateLabel} · ${timeLabel}`;
};

const toMovementView = (movement: FinanceMovement): FinanceMovementView => {
  const dateISO = movement.date ?? new Date().toISOString();
  const dateObj = new Date(dateISO);
  const rawValue = (movement as any).value;
  const value =
    typeof rawValue === "number"
      ? rawValue
      : Number(String(rawValue ?? 0).replace(",", "."));
  return {
    ...movement,
    value: Number.isFinite(value) ? value : 0,
    dateISO,
    dateLabel: formatDateLabel(dateObj),
    channel: movement.channel ?? "PIX",
  };
};

export class FinanceService {
  static async getMovements() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/finance/movements`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const raw = await response.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar movimentações",
          movements: [],
        };
      }

      return {
        success: true,
        message: data?.message ?? "Movimentações financeiras",
        movements: (data?.movements ?? []) as FinanceMovement[],
      };
    } catch (error: any) {
      console.error("Erro ao listar movimentações: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        movements: [],
      };
    }
  }

  static filterMovements(
    movements: FinanceMovementView[],
    filters: FinanceFilter
  ) {
    const rangeStart = buildRangeStart(filters.range);

    return movements.filter((movement) => {
      const movementDate = new Date(movement.dateISO);

      if (rangeStart && movementDate < rangeStart) return false;

      if (filters.range === "custom") {
        if (filters.dateFrom) {
          const from = new Date(filters.dateFrom);
          if (movementDate < from) return false;
        }
        if (filters.dateTo) {
          const to = new Date(filters.dateTo);
          to.setHours(23, 59, 59, 999);
          if (movementDate > to) return false;
        }
      }

      if (filters.status && movement.status !== filters.status) return false;
      if (filters.category && movement.category !== filters.category) return false;
      if (filters.channel && movement.channel !== filters.channel) return false;
      if (filters.type && movement.type !== filters.type) return false;

      return true;
    });
  }

  static toView(movements: FinanceMovement[]) {
    return movements.map(toMovementView);
  }

  static getCategories(movements: FinanceMovement[]) {
    return Array.from(new Set(movements.map((item) => item.category))).filter(
      Boolean
    );
  }

  static getChannels(movements: FinanceMovement[]) {
    return Array.from(new Set(movements.map((item) => item.channel))).filter(
      Boolean
    );
  }

  static getStatuses() {
    const statuses: FinanceMovementStatus[] = [
      "Pago",
      "Pendente",
      "Agendado",
    ];
    return statuses;
  }
}
