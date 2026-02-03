import { Platform } from "react-native";
import type { ProductsTypes } from "../../../Backend/src/types/Products/Products.types";

export type ProductPayload = {
  codigo?: string;
  nome: string;
  categoria?: string;
  sku?: string;
  preco_venda: number | string;
  custo?: number | string;
  estoque?: number | string;
  unidade?: string;
  descricao?: string;
  imagem?: string | { base64?: string; uri?: string };
  ativo?: boolean | number;
};

export type Product = ProductsTypes;

const toNumberOrNull = (value: number | string | undefined) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeImage = (imagem?: ProductPayload["imagem"]) => {
  if (!imagem) return null;
  if (typeof imagem === "string") return imagem;
  if (imagem.base64) {
    return `data:image/jpeg;base64,${imagem.base64}`;
  }
  return imagem.uri ?? null;
};

export class ProductsService {
  private static baseUrl =
    process.env.EXPO_PUBLIC_API_URL ??
    (Platform.OS === "ios" ? "http://localhost:3333" : "http://10.0.2.2:3333");

  static async createProduct(payload: ProductPayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${ProductsService.baseUrl}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          codigo: payload.codigo ?? null,
          nome: payload.nome ?? null,
          categoria: payload.categoria ?? null,
          sku: payload.sku ?? null,
          preco_venda: toNumberOrNull(payload.preco_venda),
          custo: toNumberOrNull(payload.custo),
          estoque: toNumberOrNull(payload.estoque),
          unidade: payload.unidade ?? null,
          descricao: payload.descricao ?? null,
          imagem: normalizeImage(payload.imagem),
          ativo:
            payload.ativo === true || payload.ativo === 1
              ? true
              : payload.ativo === false || payload.ativo === 0
                ? false
                : null,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao cadastrar produto",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Erro ao cadastrar produto: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async getProducts() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${ProductsService.baseUrl}/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar produtos",
          products: [],
        };
      }

      return {
        success: true,
        message: data?.message ?? "Lista de produtos",
        products: data?.products ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao listar produtos: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        products: [],
      };
    }
  }

  static async updateProduct(id: string, payload: ProductPayload) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${ProductsService.baseUrl}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          codigo: payload.codigo ?? null,
          nome: payload.nome ?? null,
          categoria: payload.categoria ?? null,
          sku: payload.sku ?? null,
          preco_venda: toNumberOrNull(payload.preco_venda),
          custo: toNumberOrNull(payload.custo),
          estoque: toNumberOrNull(payload.estoque),
          unidade: payload.unidade ?? null,
          descricao: payload.descricao ?? null,
          imagem: normalizeImage(payload.imagem),
          ativo:
            payload.ativo === true || payload.ativo === 1
              ? true
              : payload.ativo === false || payload.ativo === 0
                ? false
                : null,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao atualizar produto",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Erro ao atualizar produto: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async deleteProduct(id: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${ProductsService.baseUrl}/products/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao excluir produto",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Erro ao excluir produto: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }
}
