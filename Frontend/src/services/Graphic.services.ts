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

export class GraphicService {
  static async getVendasMensais(months = 6) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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
      console.error("Erro ao listar vendas mensais: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        meses: [],
        porMes: {},
      } as VendasMensaisResponse;
    }
  }
}
