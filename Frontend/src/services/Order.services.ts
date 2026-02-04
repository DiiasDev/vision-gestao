import { Platform } from "react-native";

export type OrderItemPayload = {
  product_id?: string | null;
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
  items?: OrderItemPayload[];
  estimated_value?: number | null;
  validity?: string | null;
  status?: string | null;
  notes?: string | null;
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
          items: payload.items ?? [],
          estimated_value: payload.estimated_value ?? null,
          validity: payload.validity ?? null,
          status: payload.status ?? null,
          notes: payload.notes ?? null,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

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
}
