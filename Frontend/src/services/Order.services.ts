import { Platform } from "react-native";

export type OrderItemPayload = {
  product_id?: string | null;
  product_name?: string | null;
  quantity?: number | null;
  price?: number | null;
};

export type OrderPayload = {
  client_id?: string | null;
  client_name?: string | null;
  client_contact?: string | null;
  equipment?: string | null;
  problem?: string | null;
  service_id?: string | null;
  service_description?: string | null;
  service_value?: number | null;
  items?: OrderItemPayload[];
  estimated_value?: number | null;
  validity?: string | null;
  status?: string | null;
  notes?: string | null;
};

export type OrderItem = {
  id?: string;
  orcamento_id?: string;
  produto_id?: number | null;
  produto_nome?: string | null;
  quantidade?: number | null;
  preco_unitario?: number | null;
  total_item?: number | null;
};

export type Order = {
  id: string;
  cliente_id?: string | null;
  cliente_nome?: string | null;
  contato?: string | null;
  equipamento?: string | null;
  problema?: string | null;
  servico_id?: string | null;
  servico_descricao?: string | null;
  valor_servico?: number | null;
  valor_itens?: number | null;
  valor_total?: number | null;
  validade?: string | null;
  status?: string | null;
  observacoes?: string | null;
  criado_em?: string | null;
  items?: OrderItem[];
};

const getBaseUrl = () =>
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "ios" ? "http://localhost:3333" : "http://10.0.2.2:3333");

export class OrderService {
  static async createOrder(payload: OrderPayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          client_id: payload.client_id ?? null,
          client_name: payload.client_name ?? null,
          client_contact: payload.client_contact ?? null,
          equipment: payload.equipment ?? null,
          problem: payload.problem ?? null,
          service_id: payload.service_id ?? null,
          service_description: payload.service_description ?? null,
          service_value: payload.service_value ?? null,
          items: payload.items ?? [],
          estimated_value: payload.estimated_value ?? null,
          validity: payload.validity ?? null,
          status: payload.status ?? null,
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
          message: data?.message ?? "Falha ao salvar orçamento",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Erro ao salvar orçamento: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async getOrders() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/orders`, {
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
          message: data?.message ?? "Falha ao carregar orçamentos",
          orders: [],
        };
      }

      return {
        success: true,
        message: data?.message ?? "Lista de orçamentos",
        orders: data?.orders ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao listar orçamentos: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        orders: [],
      };
    }
  }

  static async updateOrder(id: string, payload: OrderPayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          client_id: payload.client_id ?? null,
          client_name: payload.client_name ?? null,
          client_contact: payload.client_contact ?? null,
          equipment: payload.equipment ?? null,
          problem: payload.problem ?? null,
          service_id: payload.service_id ?? null,
          service_description: payload.service_description ?? null,
          service_value: payload.service_value ?? null,
          items: payload.items ?? [],
          estimated_value: payload.estimated_value ?? null,
          validity: payload.validity ?? null,
          status: payload.status ?? null,
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
          message: data?.message ?? "Falha ao atualizar orçamento",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao atualizar orçamento: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async deleteOrder(id: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/orders/${id}`, {
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
          message: data?.message ?? "Falha ao excluir orçamento",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao excluir orçamento: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async convertToServiceRealized(id: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/orders/${id}/realize`, {
        method: "POST",
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
          message: data?.message ?? "Falha ao converter orçamento",
        };
      }

      return data ?? { success: true };
    } catch (error: any) {
      console.error("Erro ao converter orçamento: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }
}
