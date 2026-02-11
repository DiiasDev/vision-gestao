import { Platform } from "react-native";

const getBaseUrl = () =>
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "ios" ? "http://localhost:3333" : "http://10.0.2.2:3333");

const formatDateParam = (date: Date | string) => {
  if (typeof date === "string") return date;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildRangeQuery = (range?: { startDate?: Date | string; endDate?: Date | string }) => {
  if (!range?.startDate || !range?.endDate) return "";
  const start = formatDateParam(range.startDate);
  const end = formatDateParam(range.endDate);
  const params = new URLSearchParams({
    startDate: start,
    endDate: end,
  });
  const query = params.toString();
  return query ? `&${query}` : "";
};

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
  faturamentoPercent: number | null;
  custoPercent: number;
};

export type ValuesCardsResponse = {
  success: boolean;
  message?: string;
  data: ValuesCardsData;
};

export type CustoLucroItem = {
  servicoId: string;
  servicoNome: string;
  totalValor: number;
  totalVenda?: number;
  totalCusto: number;
  quantidade: number;
  lucroTotal: number;
  media: number;
};

export type CustoLucroData = {
  totalValor: number;
  totalVenda?: number;
  totalCusto: number;
  lucroTotal: number;
  media: number;
  qtdServicos: number;
  servicos: CustoLucroItem[];
};

export type CustoLucroResponse = {
  success: boolean;
  message?: string;
  data: CustoLucroData;
};

export type StatusOSData = {
  concluidas: number;
  emExecucao: number;
  agendadas: number;
};

export type StatusOSResponse = {
  success: boolean;
  message?: string;
  data: StatusOSData;
};

export type ServicosPorCategoriaItem = {
  categoria: string;
  quantidade: number;
  percentual: number;
};

export type ServicosPorCategoriaData = {
  total: number;
  categorias: ServicosPorCategoriaItem[];
  dias: number;
};

export type ServicosPorCategoriaResponse = {
  success: boolean;
  message?: string;
  data: ServicosPorCategoriaData;
};

export type EstoqueCriticoItem = {
  id: string | number;
  nome: string;
  estoque: number | string | null;
  unidade?: string | null;
};

export type EstoqueCriticoResponse = {
  success: boolean;
  message?: string;
  products: EstoqueCriticoItem[];
};

export class GraphicService {
  static async getVendasMensais(
    months = 6,
    range?: { startDate?: Date | string; endDate?: Date | string }
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const rangeQuery = buildRangeQuery(range);
      const response = await fetch(
        `${getBaseUrl()}/graphics/painel?months=${months}${rangeQuery}`,
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

  static async getValuesCards(range?: {
    startDate?: Date | string;
    endDate?: Date | string;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const rangeQuery = buildRangeQuery(range);
      const response = await fetch(`${getBaseUrl()}/graphics/cards?${rangeQuery.slice(1)}`, {
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
          data: {
            faturamento: 0,
            custo: 0,
            saldo: 0,
            faturamentoPercent: null,
            custoPercent: 0,
          },
        } as ValuesCardsResponse;
      }

      return (
        data ?? {
          success: true,
          data: {
            faturamento: 0,
            custo: 0,
            saldo: 0,
            faturamentoPercent: null,
            custoPercent: 0,
          },
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
        data: {
          faturamento: 0,
          custo: 0,
          saldo: 0,
          faturamentoPercent: null,
          custoPercent: 0,
        },
      } as ValuesCardsResponse;
    }
  }

  static async getCustoXLucro(range?: {
    startDate?: Date | string;
    endDate?: Date | string;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const rangeQuery = buildRangeQuery(range);
      const response = await fetch(
        `${getBaseUrl()}/graphics/custo-x-lucro?${rangeQuery.slice(1)}`,
        {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const raw = await response.text();
      let data: CustoLucroResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as CustoLucroResponse) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar custo x lucro",
          data: {
            totalValor: 0,
            totalCusto: 0,
            lucroTotal: 0,
            media: 0,
            qtdServicos: 0,
            servicos: [],
          },
        } as CustoLucroResponse;
      }

      return (
        data ?? {
          success: true,
          data: {
            totalValor: 0,
            totalCusto: 0,
            lucroTotal: 0,
            media: 0,
            qtdServicos: 0,
            servicos: [],
          },
        }
      );
    } catch (error: any) {
      const isAbort = error?.name === "AbortError";
      if (!isAbort) {
        console.error("Erro ao carregar custo x lucro:", error);
      }
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        data: {
          totalValor: 0,
          totalCusto: 0,
          lucroTotal: 0,
          media: 0,
          qtdServicos: 0,
          servicos: [],
        },
      } as CustoLucroResponse;
    }
  }

  static async getStatusOS(range?: {
    startDate?: Date | string;
    endDate?: Date | string;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const rangeQuery = buildRangeQuery(range);
      const response = await fetch(
        `${getBaseUrl()}/graphics/status-os?${rangeQuery.slice(1)}`,
        {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const raw = await response.text();
      let data: StatusOSResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as StatusOSResponse) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar status das OS",
          data: { concluidas: 0, emExecucao: 0, agendadas: 0 },
        } as StatusOSResponse;
      }

      return (
        data ?? {
          success: true,
          data: { concluidas: 0, emExecucao: 0, agendadas: 0 },
        }
      );
    } catch (error: any) {
      const isAbort = error?.name === "AbortError";
      if (!isAbort) {
        console.error("Erro ao carregar status das OS:", error);
      }
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        data: { concluidas: 0, emExecucao: 0, agendadas: 0 },
      } as StatusOSResponse;
    }
  }

  static async getServicosPorCategoria(range?: {
    startDate?: Date | string;
    endDate?: Date | string;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const rangeQuery = buildRangeQuery(range);
      const response = await fetch(
        `${getBaseUrl()}/graphics/servicos-por-categoria?${rangeQuery.slice(1)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const raw = await response.text();
      let data: ServicosPorCategoriaResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as ServicosPorCategoriaResponse) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar serviços por categoria",
          data: { total: 0, categorias: [], dias: 30 },
        } as ServicosPorCategoriaResponse;
      }

      return (
        data ?? {
          success: true,
          data: { total: 0, categorias: [], dias: 30 },
        }
      );
    } catch (error: any) {
      const isAbort = error?.name === "AbortError";
      if (!isAbort) {
        console.error("Erro ao carregar serviços por categoria:", error);
      }
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        data: { total: 0, categorias: [], dias: 30 },
      } as ServicosPorCategoriaResponse;
    }
  }

  static async getEstoqueCritico() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${getBaseUrl()}/graphics/estoque-critico`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const raw = await response.text();
      let data: EstoqueCriticoResponse | null = null;
      try {
        data = raw ? (JSON.parse(raw) as EstoqueCriticoResponse) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar estoque critico",
          products: [],
        } as EstoqueCriticoResponse;
      }

      const hasValidShape =
        data &&
        typeof data.success === "boolean" &&
        Array.isArray(data.products);

      if (!hasValidShape) {
        return {
          success: false,
          message: "Resposta invalida ao carregar estoque critico",
          products: [],
        } as EstoqueCriticoResponse;
      }

      return {
        success: data.success,
        message: data.message,
        products: data.products,
      } as EstoqueCriticoResponse;
    } catch (error: any) {
      const isAbort = error?.name === "AbortError";
      if (!isAbort) {
        console.error("Erro ao carregar estoque critico:", error);
      }
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        products: [],
      } as EstoqueCriticoResponse;
    }
  }
}
