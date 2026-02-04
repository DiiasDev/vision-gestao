import type { clientsTypes } from "../../../Backend/src/types/Clients/ClientsTypes";
import { Platform } from "react-native";

export type ClientPayload = {
  nome: string;
  tipo?: string;
  documento?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  endereco?: string;
  observacoes?: string;
  ativo?: boolean | number;
};

export type Client = clientsTypes & { id?: string };

const getBaseUrl = () =>
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "ios" ? "http://localhost:3333" : "http://10.0.2.2:3333");

export class ClienteService {
  static async createClient(payload: ClientPayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          nome_completo: payload.nome ?? null,
          tipo_de_cliente: payload.tipo ?? null,
          cpf_cnpj: payload.documento ?? null,
          email: payload.email ?? null,
          telefone: payload.telefone ?? null,
          cidade: payload.cidade ?? null,
          endereco: payload.endereco ?? null,
          obs: payload.observacoes ?? null,
          status:
            payload.ativo === true || payload.ativo === 1
              ? true
              : payload.ativo === false || payload.ativo === 0
                ? false
                : true,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao cadastrar cliente",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async getClients() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/clients`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar clientes",
          clients: [],
        };
      }

      return {
        success: true,
        message: data?.message ?? "Lista de clientes",
        clients: data?.clientes ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao listar clientes: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        clients: [],
      };
    }
  }

  static async updateClient(id: string, payload: ClientPayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          nome_completo: payload.nome ?? null,
          tipo_de_cliente: payload.tipo ?? null,
          cpf_cnpj: payload.documento ?? null,
          email: payload.email ?? null,
          telefone: payload.telefone ?? null,
          cidade: payload.cidade ?? null,
          endereco: payload.endereco ?? null,
          obs: payload.observacoes ?? null,
          status:
            payload.ativo === true || payload.ativo === 1
              ? true
              : payload.ativo === false || payload.ativo === 0
                ? false
                : true,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao atualizar cliente",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Erro ao atualizar cliente: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async deleteClient(id: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${getBaseUrl()}/clients/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao excluir cliente",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Erro ao excluir cliente: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }
}
