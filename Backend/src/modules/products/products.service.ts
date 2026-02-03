import { DB } from "../../../database/conn.js";
import { type ProductsTypes } from "../../types/Products/Products.types.js";

export class ProductsService {
  public async newProduct(produto: Partial<ProductsTypes>) {
    try {
      const pool = DB.connect();
      const {
        codigo,
        nome,
        categoria,
        sku,
        preco_venda,
        custo,
        estoque,
        unidade,
        descricao,
        imagem,
        ativo,
      } = produto;

      const normalizeNumber = (value: unknown) => {
        if (value === undefined || value === null || value === "") return null;
        if (typeof value === "number") {
          return Number.isFinite(value) ? value : null;
        }
        const raw = String(value).trim();
        if (!raw) return null;
        const normalized = raw.replace(/\./g, "").replace(",", ".");
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
      };

      const requiredNome = nome?.toString().trim();
      const requiredPrecoVenda = normalizeNumber(preco_venda);

      if (!requiredNome) {
        return {
          success: false,
          message: "Nome do produto é obrigatório",
        };
      }

      if (requiredPrecoVenda === null) {
        return {
          success: false,
          message: "Preço de venda é obrigatório",
        };
      }

      const query = `
        INSERT INTO produtos (
          codigo,
          nome,
          categoria,
          sku,
          preco_venda,
          custo,
          estoque,
          unidade,
          descricao,
          imagem,
          ativo
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        RETURNING *;
      `;

      const values = [
        codigo ?? null,
        requiredNome,
        categoria ?? null,
        sku ?? null,
        requiredPrecoVenda,
        normalizeNumber(custo),
        normalizeNumber(estoque),
        unidade ?? null,
        descricao ?? null,
        imagem ?? null,
        ativo ?? true,
      ];

      const result = await pool.query(query, values);

      return {
        success: true,
        message: "Produto cadastrado com sucesso",
        product: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.log("erro ao cadastrar produto: ", error);
      return {
        success: false,
        message: "Erro ao cadastrar produto",
        error,
        code: error?.code,
        constraint: error?.constraint,
      };
    }
  }
}
