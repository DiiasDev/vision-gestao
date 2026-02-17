import type { ServicesTypes } from "../../../Backend/src/types/Services/Services.types";
import { getApiBaseUrl } from "../config/api";

export type ServicePayload = {
  nome: string;
  categoria?: string;
  preco: number | string;
  prazo?: string;
  descricao?: string;
  imagem?: string | { base64?: string; uri?: string };
  ativo?: boolean | number;
};

export type Service = ServicesTypes & {
  id?: string | number;
};

export type ServiceRealizedItem = {
  id?: string;
  servico_realizado_id?: string;
  produto_id?: number | null;
  produto_nome?: string | null;
  quantidade?: number | null;
  preco_unitario?: number | null;
  total_item?: number | null;
  custo_unitario?: number | null;
  total_custo_item?: number | null;
};

export type ServiceRealized = {
  id: string;
  cliente_id?: string | null;
  cliente_nome: string;
  contato?: string | null;
  servico_id?: string | null;
  servico_nome: string;
  equipamento?: string | null;
  descricao?: string | null;
  data_servico?: string | null;
  status?: string | null;
  valor_servico?: number | null;
  valor_produtos?: number | null;
  valor_total?: number | null;
  custo_servico?: number | null;
  custo_produtos?: number | null;
  custo_total?: number | null;
  observacoes?: string | null;
  criado_em?: string | null;
  items?: ServiceRealizedItem[];
};

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
    client_id?: string | null;
    client_name?: string | null;
    client_contact?: string | null;
    service_id?: string | null;
    service_name?: string | null;
    equipment?: string | null;
    description?: string | null;
    service_date?: string | null;
    status?: string | null;
    value?: number | null;
    cost?: number | null;
    items?: {
      product_id?: string | number | null;
      product_name?: string | null;
      quantity?: number | null;
      price?: number | null;
      cost?: number | null;
    }[];
    notes?: string | null;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getApiBaseUrl()}/services/realized`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          client_id: payload.client_id ?? null,
          client_name: payload.client_name ?? null,
          client_contact: payload.client_contact ?? null,
          service_id: payload.service_id ?? null,
          service_name: payload.service_name ?? null,
          equipment: payload.equipment ?? null,
          description: payload.description ?? null,
          service_date: payload.service_date ?? null,
          status: payload.status ?? null,
          value: payload.value ?? null,
          cost: payload.cost ?? null,
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

      const response = await fetch(`${getApiBaseUrl()}/services`, {
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

  static async getServicesRealized() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getApiBaseUrl()}/services/realized`, {
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
          message: data?.message ?? "Falha ao carregar serviços realizados",
          services_realized: [],
        };
      }

      return {
        success: true,
        message: data?.message ?? "Lista de serviços realizados",
        services_realized: data?.services_realized ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao listar serviços realizados: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        services_realized: [],
      };
    }
  }

  static async updateServiceRealized(
    id: string,
    payload: {
      client_id?: string | null;
      client_name?: string | null;
      client_contact?: string | null;
      service_id?: string | null;
      service_name?: string | null;
      equipment?: string | null;
      description?: string | null;
      service_date?: string | null;
      status?: string | null;
      value?: number | null;
      cost?: number | null;
      items?: {
        product_id?: string | number | null;
        product_name?: string | null;
        quantity?: number | null;
        price?: number | null;
        cost?: number | null;
      }[];
      notes?: string | null;
    }
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getApiBaseUrl()}/services/realized/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          client_id: payload.client_id ?? null,
          client_name: payload.client_name ?? null,
          client_contact: payload.client_contact ?? null,
          service_id: payload.service_id ?? null,
          service_name: payload.service_name ?? null,
          equipment: payload.equipment ?? null,
          description: payload.description ?? null,
          service_date: payload.service_date ?? null,
          status: payload.status ?? null,
          value: payload.value ?? null,
          cost: payload.cost ?? null,
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
          message: data?.message ?? "Falha ao atualizar serviço realizado",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao atualizar serviço realizado: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async deleteServiceRealized(id: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getApiBaseUrl()}/services/realized/${id}`, {
        method: "DELETE",
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
          message: data?.message ?? "Falha ao excluir serviço realizado",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao excluir serviço realizado: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async settleServiceRealized(
    id: string,
    payload?: {
      channel?: string | null;
      date?: string | null;
      notes?: string | null;
    }
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getApiBaseUrl()}/services/realized/${id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          channel: payload?.channel ?? null,
          date: payload?.date ?? null,
          notes: payload?.notes ?? null,
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
          message: data?.message ?? "Falha ao faturar serviço realizado",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao faturar serviço realizado: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async createService(payload: ServicePayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getApiBaseUrl()}/services`, {
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

  static async updateService(id: string, payload: ServicePayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getApiBaseUrl()}/services/${id}`, {
        method: "PUT",
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
          message: data?.message ?? "Falha ao atualizar serviço",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao atualizar serviço: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async deleteService(id: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getApiBaseUrl()}/services/${id}`, {
        method: "DELETE",
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
          message: data?.message ?? "Falha ao excluir serviço",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao excluir serviço: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }
}
