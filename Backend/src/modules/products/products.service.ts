import { DB } from "../../../database/conn.js";
import { type ProductsTypes } from "../../types/Products/Products.types.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultImagePath = path.resolve(__dirname, "../../img/produtoImg.png");

const getDefaultProductImage = () => {
  try {
    const file = fs.readFileSync(defaultImagePath);
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch (error) {
    console.error("Erro ao carregar imagem padrão do produto:", error);
    return null;
  }
};

const defaultProductImage = getDefaultProductImage();

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

const normalizeBoolean = (value: unknown) => {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return null;
};

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

      const requiredNome = nome?.toString().trim();
      const requiredPrecoVenda = normalizeNumber(preco_venda);
      const normalizedImage =
        imagem && String(imagem).trim() ? imagem : defaultProductImage;

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
        normalizedImage,
        normalizeBoolean(ativo) ?? true,
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

  public async getProducts() {
    try {
      const pool = DB.connect();

      const query = `SELECT * FROM produtos ORDER BY created_at DESC`;

      const result = await pool.query(query);

      return {
        success: true,
        message: "Lista de produtos",
        products: result?.rows ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao exibir produtos: ", error);
      return {
        success: false,
        message: "erro ao buscar produtos",
      };
    }
  }

  public async updateProduct(id: string, produto: Partial<ProductsTypes>) {
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

      if (!id) {
        return {
          success: false,
          message: "Id do produto é obrigatório",
        };
      }

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
        UPDATE produtos
        SET
          codigo = $1,
          nome = $2,
          categoria = $3,
          sku = $4,
          preco_venda = $5,
          custo = $6,
          estoque = $7,
          unidade = $8,
          descricao = $9,
          imagem = $10,
          ativo = $11
        WHERE id = $12
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
        normalizeBoolean(ativo),
        id,
      ];

      const result = await pool.query(query, values);

      if (!result.rows[0]) {
        return {
          success: false,
          message: "Produto não encontrado",
        };
      }

      return {
        success: true,
        message: "Produto atualizado com sucesso",
        product: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.log("erro ao atualizar produto: ", error);
      return {
        success: false,
        message: "Erro ao atualizar produto",
        error,
        code: error?.code,
        constraint: error?.constraint,
      };
    }
  }

  public async deleteProduct(id: string) {
    try {
      const pool = DB.connect();

      if (!id) {
        return {
          success: false,
          message: "Id do produto é obrigatório",
        };
      }

      const query = `DELETE FROM produtos WHERE id = $1 RETURNING *;`;
      const result = await pool.query(query, [id]);

      if (!result.rows[0]) {
        return {
          success: false,
          message: "Produto não encontrado",
        };
      }

      return {
        success: true,
        message: "Produto excluído com sucesso",
        product: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.log("erro ao excluir produto: ", error);
      return {
        success: false,
        message: "Erro ao excluir produto",
        error,
        code: error?.code,
        constraint: error?.constraint,
      };
    }
  }
}
