import { Platform } from "react-native";
import type { ServicesTypes } from "../../../Backend/src/types/Services/Services.types";

export type ServicePayload = {
  nome: string;
  categoria?: string;
  preco: number | string;
  prazo?: string;
  descricao?: string;
  imagem?: string | { base64?: string; uri?: string };
  ativo?: boolean | number;
};

export type Service = ServicesTypes;

const getBaseUrl = () =>
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "ios" ? "http://localhost:3333" : "http://10.0.2.2:3333");

const toNumberOrNull = (value: number | string | undefined) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeImage = (imagem?: ServicePayload["imagem"]) => {
  if (!imagem) return null;
  if (typeof imagem === "string") return imagem;
  if (imagem.base64) {
    return `data:image/jpeg;base64,${imagem.base64}`;
  }
  return imagem.uri ?? null;
};

const normalizeImageData = (imagem?: string | null) => {
  if (!imagem) return null;
  const trimmed = String(imagem).trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://")
  ) {
    return trimmed;
  }
  const looksLikeBase64 =
    trimmed.length > 40 && /^[A-Za-z0-9+/=\s]+$/.test(trimmed);
  return looksLikeBase64 ? `data:image/jpeg;base64,${trimmed}` : trimmed;
};

export class ServicesService {
  static async createServiceRealized(payload: {
    client_name?: string | null;
    client_contact?: string | null;
    service_name?: string | null;
    equipment?: string | null;
    description?: string | null;
    service_date?: string | null;
    status?: string | null;
    value?: number | null;
    items?: {
      product_id?: string | number | null;
      product_name?: string | null;
      quantity?: number | null;
      price?: number | null;
    }[];
    notes?: string | null;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/services/realized`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          client_name: payload.client_name ?? null,
          client_contact: payload.client_contact ?? null,
          service_name: payload.service_name ?? null,
          equipment: payload.equipment ?? null,
          description: payload.description ?? null,
          service_date: payload.service_date ?? null,
          status: payload.status ?? null,
          value: payload.value ?? null,
          items: payload.items ?? [],
          notes: payload.notes ?? null,
        }),
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
          message: data?.message ?? "Falha ao registrar serviço",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao registrar serviço: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async getServices() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/services`, {
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
          message: data?.message ?? "Falha ao carregar serviços",
          services: [],
        };
      }

      const rawServices = data?.services ?? data?.servicos ?? data?.result ?? [];
      const normalizedServices = rawServices.map((service: Service) => ({
        ...service,
        imagem: normalizeImageData(service?.imagem ?? null),
      }));

      return {
        success: true,
        message: data?.message ?? "Lista de serviços",
        services: normalizedServices,
      };
    } catch (error: any) {
      console.error("Erro ao listar serviços: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        services: [],
      };
    }
  }

  static async createService(payload: ServicePayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          nome_servico: payload.nome ?? null,
          categoria: payload.categoria ?? null,
          preco: toNumberOrNull(payload.preco),
          prazo: payload.prazo ?? null,
          descricao: payload.descricao ?? null,
          imagem: normalizeImage(payload.imagem),
          status:
            payload.ativo === true || payload.ativo === 1
              ? true
              : payload.ativo === false || payload.ativo === 0
                ? false
                : null,
        }),
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
          message:
            data?.message ??
            "Falha ao cadastrar serviço. Verifique o backend.",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao cadastrar serviço: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }
}
