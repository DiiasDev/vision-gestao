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

export class ServicesService {
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
