import { Platform } from "react-native";

const getBaseUrl = () =>
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "ios" ? "http://localhost:3333" : "http://10.0.2.2:3333");

export type VendasMensaisItem = {
  id: string;
  key: string;
  label: string;
  valor: number;
  year: number;
  month: number;
};

export type VendasMensaisResponse = {
  success: boolean;
  message?: string;
  meses: VendasMensaisItem[];
  porMes: Record<
    string,
    {
      valor: number;
      label: string;
      year: number;
      month: number;
    }
  >;
};

export type ValuesCardsData = {
  faturamento: number;
  custo: number;
  saldo: number;
};

export type ValuesCardsResponse = {
  success: boolean;
  message?: string;
  data: ValuesCardsData;
};

export class GraphicService {
  static async getVendasMensais(months = 6) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${getBaseUrl()}/graphics/painel?months=${months}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const raw = await response.text();
      let data: VendasMensaisResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as VendasMensaisResponse) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar vendas mensais",
          meses: [],
          porMes: {},
        } as VendasMensaisResponse;
      }

      return (
        data ?? {
          success: true,
          meses: [],
          porMes: {},
        }
      );
    } catch (error: any) {
      const isAbort = error?.name === "AbortError";
      if (!isAbort) {
        console.error("Erro ao listar vendas mensais: ", error);
      }
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        meses: [],
        porMes: {},
      } as VendasMensaisResponse;
    }
  }

  static async getValuesCards() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${getBaseUrl()}/graphics/cards`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const raw = await response.text();
      let data: ValuesCardsResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as ValuesCardsResponse) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar valores dos cards",
          data: { faturamento: 0, custo: 0, saldo: 0 },
        } as ValuesCardsResponse;
      }

      return (
        data ?? {
          success: true,
          data: { faturamento: 0, custo: 0, saldo: 0 },
        }
      );
    } catch (error: any) {
      const isAbort = error?.name === "AbortError";
      if (!isAbort) {
        console.error("Erro ao listar valores dos cards: ", error);
      }
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        data: { faturamento: 0, custo: 0, saldo: 0 },
      } as ValuesCardsResponse;
    }
  }
}
