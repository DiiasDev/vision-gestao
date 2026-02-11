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

type StockMovementItem = {
  product_id?: string | number | null;
  product_name?: string | null;
  quantity?: number | string | null;
  description?: string | null;
};

type QueryRunner = {
  query: (text: string, params?: any[]) => Promise<any>;
};

const normalizeQuantity = (value: unknown) => {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
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

  public async movimentEstoque(params: {
    items?: StockMovementItem[];
    movementType?: "saida" | "entrada";
    transactionClient?: QueryRunner;
    origin?: "manual" | "servico" | "orcamento" | "ajuste_sistema";
    referenceId?: string | number | null;
    createdBy?: string | null;
  }) {
    const pool = DB.connect();
    const runner = params.transactionClient ?? pool;
    const movementType = params.movementType ?? "saida";
    const items = Array.isArray(params.items) ? params.items : [];

    const groupedItems = items.reduce(
      (acc, item) => {
        const productId = item.product_id ? String(item.product_id) : null;
        const quantity = normalizeQuantity(item.quantity);
        if (!productId || quantity <= 0) return acc;
        acc[productId] = (acc[productId] ?? 0) + quantity;
        return acc;
      },
      {} as Record<string, number>,
    );
    const descriptionsByProduct = items.reduce(
      (acc, item) => {
        const productId = item.product_id ? String(item.product_id) : null;
        const description =
          typeof item.description === "string" ? item.description.trim() : "";
        if (!productId || !description) return acc;
        acc[productId] = description;
        return acc;
      },
      {} as Record<string, string>,
    );

    const productIds = Object.keys(groupedItems);
    if (!productIds.length) {
      return {
        success: true,
        message: "Nenhuma movimentação de estoque para processar",
        data: [],
      };
    }

    const startedTransaction = !params.transactionClient;

    try {
      if (startedTransaction) {
        await runner.query("BEGIN");
      }

      const updates: Array<{
        product_id: string;
        product_name: string;
        previous_stock: number;
        quantity: number;
        current_stock: number;
      }> = [];

      for (const productId of productIds) {
        const quantity = groupedItems[productId] ?? 0;
        if (quantity <= 0) continue;
        const productResult = await runner.query(
          "SELECT id, nome, estoque FROM produtos WHERE id = $1 FOR UPDATE",
          [productId],
        );

        const product = productResult.rows[0];
        if (!product) {
          if (startedTransaction) await runner.query("ROLLBACK");
          return {
            success: false,
            message: `Produto ${productId} não encontrado para movimentação de estoque`,
            data: [],
          };
        }

        const previousStock = normalizeQuantity(product.estoque);
        if (movementType === "saida" && previousStock < quantity) {
          if (startedTransaction) await runner.query("ROLLBACK");
          return {
            success: false,
            message: `Estoque insuficiente para ${product.nome ?? "produto"}: disponível ${previousStock}, solicitado ${quantity}`,
            data: [],
          };
        }

        const currentStock =
          movementType === "entrada"
            ? previousStock + quantity
            : previousStock - quantity;

        await runner.query(
          "UPDATE produtos SET estoque = $1 WHERE id = $2",
          [currentStock, productId],
        );

        await runner.query(
          `INSERT INTO estoque_movimentacoes (
            produto_id,
            tipo,
            quantidade,
            saldo_anterior,
            saldo_atual,
            descricao,
            origem,
            referencia_id,
            criado_por
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            Number(product.id),
            movementType,
            quantity,
            previousStock,
            currentStock,
            descriptionsByProduct[productId] ?? null,
            params.origin ?? "manual",
            params.referenceId ? String(params.referenceId) : null,
            params.createdBy ?? null,
          ],
        );

        updates.push({
          product_id: String(product.id),
          product_name: String(product.nome ?? "Produto"),
          previous_stock: previousStock,
          quantity,
          current_stock: currentStock,
        });
      }

      if (startedTransaction) {
        await runner.query("COMMIT");
      }

      return {
        success: true,
        message: "Movimentação de estoque processada com sucesso",
        data: updates,
      };
    } catch (error: any) {
      if (startedTransaction) {
        await runner.query("ROLLBACK");
      }
      console.error("erro ao gerar movimento de estoque: ", error);
      return {
        success: false,
        message: "Erro ao gerar movimento de estoque",
        data: [],
      };
    }
  }

  public async moveStockByProduct(payload: {
    product_id?: string | number | null;
    quantity?: number | string | null;
    movement_type?: "entrada" | "saida" | string | null;
    description?: string | null;
    created_by?: string | null;
  }) {
    try {
      const productId = payload.product_id ? String(payload.product_id) : null;
      const quantity = normalizeQuantity(payload.quantity);
      const movementType = payload.movement_type;

      if (!productId) {
        return {
          success: false,
          message: "Produto é obrigatório para movimentação",
        };
      }

      if (!quantity || quantity <= 0) {
        return {
          success: false,
          message: "Quantidade deve ser maior que zero",
        };
      }

      if (movementType !== "entrada" && movementType !== "saida") {
        return {
          success: false,
          message: "Tipo de movimentação inválido",
        };
      }

      const result = await this.movimentEstoque({
        items: [
          {
            product_id: productId,
            quantity,
            description: payload.description ?? null,
          },
        ],
        movementType,
        origin: "manual",
        createdBy: payload.created_by ?? null,
      });

      if (!result?.success) {
        return {
          success: false,
          message: result?.message ?? "Erro ao movimentar estoque",
        };
      }

      return {
        success: true,
        message: "Movimentação de estoque registrada com sucesso",
        movement: {
          ...(result.data?.[0] ?? {}),
          description:
            typeof payload.description === "string" && payload.description.trim()
              ? payload.description.trim()
              : null,
        },
      };
    } catch (error: any) {
      console.error("erro ao registrar movimentação avulsa de estoque: ", error);
      return {
        success: false,
        message: "Erro ao registrar movimentação de estoque",
      };
    }
  }

  public async getStockMovements(params?: {
    product_id?: string | number | null;
    limit?: string | number | null;
  }) {
    try {
      const pool = DB.connect();
      const clauses: string[] = [];
      const values: any[] = [];

      if (params?.product_id !== undefined && params?.product_id !== null) {
        values.push(Number(params.product_id));
        clauses.push(`m.produto_id = $${values.length}`);
      }

      const parsedLimit = Number(params?.limit ?? 50);
      const safeLimit = Number.isFinite(parsedLimit)
        ? Math.min(500, Math.max(1, parsedLimit))
        : 50;
      values.push(safeLimit);

      const query = `
        SELECT
          m.*,
          p.nome AS produto_nome,
          p.unidade AS produto_unidade,
          p.sku AS produto_sku
        FROM estoque_movimentacoes m
        LEFT JOIN produtos p ON p.id = m.produto_id
        ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
        ORDER BY m.criado_em DESC
        LIMIT $${values.length};
      `;

      const result = await pool.query(query, values);

      return {
        success: true,
        message: "Movimentações de estoque listadas com sucesso",
        movements: result.rows ?? [],
      };
    } catch (error: any) {
      console.error("erro ao listar movimentações de estoque: ", error);
      return {
        success: false,
        message: "Erro ao listar movimentações de estoque",
        movements: [],
      };
    }
  }
}
