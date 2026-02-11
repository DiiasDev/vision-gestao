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

export type StockMovement = {
  id: string | number;
  produto_id: number;
  produto_nome?: string | null;
  produto_unidade?: string | null;
  produto_sku?: string | null;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  saldo_anterior?: number | null;
  saldo_atual?: number | null;
  descricao?: string | null;
  origem?: "manual" | "servico" | "orcamento" | "ajuste_sistema" | string | null;
  referencia_id?: string | null;
  criado_por?: string | null;
  criado_em?: string | null;
};

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

      const normalizedProducts = (data?.products ?? []).map((product: Product) => ({
        ...product,
        imagem: normalizeImageData(product?.imagem ?? null),
      }));

      return {
        success: true,
        message: data?.message ?? "Lista de produtos",
        products: normalizedProducts,
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

  static async moveStock(payload: {
    product_id?: string | number | null;
    quantity?: number | string | null;
    movement_type?: "entrada" | "saida";
    description?: string | null;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${ProductsService.baseUrl}/products/stock/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          product_id: payload.product_id ?? null,
          quantity:
            payload.quantity === null
              ? null
              : toNumberOrNull(payload.quantity as number | string | undefined),
          movement_type: payload.movement_type ?? null,
          description: payload.description ?? null,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao movimentar estoque",
        };
      }

      return data;
    } catch (error: any) {
      console.error("Erro ao movimentar estoque: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
      };
    }
  }

  static async getStockMovements(params?: {
    product_id?: string | number | null;
    limit?: number;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const query = new URLSearchParams();
      if (params?.product_id !== undefined && params?.product_id !== null) {
        query.append("product_id", String(params.product_id));
      }
      if (params?.limit) {
        query.append("limit", String(params.limit));
      }

      const response = await fetch(
        `${ProductsService.baseUrl}/products/stock/movements${
          query.toString() ? `?${query.toString()}` : ""
        }`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data?.message ?? "Falha ao carregar movimentações de estoque",
          movements: [],
        };
      }

      return {
        success: true,
        message: data?.message ?? "Movimentações de estoque",
        movements: data?.movements ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao listar movimentações de estoque: ", error);
      const isAbort = error?.name === "AbortError";
      return {
        success: false,
        message: isAbort ? "Tempo de conexão esgotado" : "Erro de conexão",
        movements: [],
      };
    }
  }
}
