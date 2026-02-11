import { DB } from "../../database/conn.js";
import {
  type ServicesTypes,
  type ServiceRealizedPayload,
  type ServiceRealizedItem,
} from "../../types/Services/Services.types.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ProductsService } from "../products/products.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultImagePath = path.resolve(__dirname, "../../img/serviceImg.png");

const getDefaultServiceImage = () => {
  try {
    const file = fs.readFileSync(defaultImagePath);
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch (error) {
    console.error("Erro ao carregar imagem padrão de serviço:", error);
    return null;
  }
};

const defaultServiceImage = getDefaultServiceImage();

const normalizeNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const raw = String(value).trim();
  if (!raw) return 0;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeDbNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeBoolean = (value: unknown) => {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return null;
};

const normalizeText = (value: unknown) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const buildItemPayload = (item: ServiceRealizedItem) => {
  const quantity = normalizeNumber(item.quantity);
  const price = normalizeNumber(item.price);
  const cost = normalizeNumber(item.cost);
  return {
    product_id: item.product_id ?? null,
    product_name: normalizeText(item.product_name),
    quantity,
    price,
    total: quantity * price,
    cost,
    total_cost: quantity * cost,
  };
};

const sumQuantityByProduct = (
  items: Array<{
    product_id?: string | number | null;
    quantity?: number | string | null;
  }>,
) => {
  return items.reduce(
    (acc, item) => {
      const productId =
        item.product_id !== undefined && item.product_id !== null
          ? String(item.product_id)
          : null;
      const quantity = normalizeNumber(item.quantity);
      if (!productId || quantity <= 0) return acc;
      acc[productId] = (acc[productId] ?? 0) + quantity;
      return acc;
    },
    {} as Record<string, number>,
  );
};

export class ServicesService {
  public async newService(novo_servico: Partial<ServicesTypes>) {
    try {
      const pool = DB.connect();

      const {
        nome_servico,
        categoria,
        preco,
        prazo,
        descricao,
        imagem,
        status,
      } = novo_servico;
      const normalizedImage =
        imagem && String(imagem).trim() ? imagem : defaultServiceImage;

      const query = `INSERT INTO servicos ( 
      nome_servico,
        categoria,
        preco,
        prazo,
        descricao,
        imagem,
        status) VALUES 
        ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;

      const values = [
        nome_servico,
        categoria,
        preco,
        prazo,
        descricao,
        normalizedImage,
        status,
      ];

      const result = await pool.query(query, values);

      return {
        sucess: true,
        message: "Serviço registrado com sucesso",
        novo_servico: result.rows[0] ?? [],
      };
    } catch (error: any) {
      console.error("Erro ao cadastrar Serviço", error);
      return {
        success: false,
        message: "erro ao cadastrar serviço",
        novo_servico: [],
      };
    }
  }

  public async updateService(id: string, servico: Partial<ServicesTypes>) {
    try {
      const pool = DB.connect();
      if (!id) {
        return {
          success: false,
          message: "Id do serviço é obrigatório",
        };
      }

      const {
        nome_servico,
        categoria,
        preco,
        prazo,
        descricao,
        imagem,
        status,
      } = servico;

      const normalizedImage =
        imagem && String(imagem).trim() ? imagem : defaultServiceImage;

      const query = `
        UPDATE servicos
        SET
          nome_servico = $1,
          categoria = $2,
          preco = $3,
          prazo = $4,
          descricao = $5,
          imagem = $6,
          status = $7
        WHERE id = $8
        RETURNING *;
      `;

      const values = [
        nome_servico ?? null,
        categoria ?? null,
        preco ?? null,
        prazo ?? null,
        descricao ?? null,
        normalizedImage,
        normalizeBoolean(status) ?? true,
        id,
      ];

      const result = await pool.query(query, values);

      return {
        success: true,
        message: "Serviço atualizado com sucesso",
        service: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao atualizar serviço:", error);
      return {
        success: false,
        message: "Erro ao atualizar serviço",
      };
    }
  }

  public async deleteService(id: string) {
    try {
      const pool = DB.connect();
      if (!id) {
        return {
          success: false,
          message: "Id do serviço é obrigatório",
        };
      }

      const result = await pool.query(
        "DELETE FROM servicos WHERE id = $1 RETURNING *",
        [id],
      );

      return {
        success: true,
        message: "Serviço excluído com sucesso",
        service: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao excluir serviço:", error);
      return {
        success: false,
        message: "Erro ao excluir serviço",
      };
    }
  }

  public async getServices() {
    try {
      const pool = DB.connect();

      const query = `SELECT * FROM servicos`;

      const servicos = await pool.query(query);

      return {
        success: true,
        message: "serviços listados",
        servicos: servicos.rows ?? [],
      };
    } catch (error: any) {
      console.error("erro ao listar serviços: ", error);
      return {
        success: false,
        message: "erro ao listar serviços",
        servicos: [],
      };
    }
  }

  public async createServiceRealized(payload: ServiceRealizedPayload) {
    const pool = DB.connect();
    try {
      const items = Array.isArray(payload.items)
        ? payload.items.map(buildItemPayload)
        : [];

      const valueService = normalizeNumber(payload.value);
      const valueProducts = items.reduce((acc, item) => acc + item.total, 0);
      const valueTotal = valueService + valueProducts;

      const costService = normalizeNumber(payload.cost);
      const costProducts = items.reduce(
        (acc, item) => acc + item.total_cost,
        0,
      );
      const costTotal = costService + costProducts;
      const status = normalizeText(payload.status) ?? "concluido";

      await pool.query("BEGIN");

      const insertService = `
        INSERT INTO servicos_realizados (
          cliente_id,
          cliente_nome,
          contato,
          servico_id,
          servico_nome,
          equipamento,
          descricao,
          data_servico,
          status,
          valor_servico,
          valor_produtos,
          valor_total,
          custo_servico,
          custo_produtos,
          custo_total,
          observacoes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
        RETURNING *;
      `;

      const serviceValues = [
        normalizeText(payload.client_id),
        normalizeText(payload.client_name),
        normalizeText(payload.client_contact),
        normalizeText(payload.service_id),
        normalizeText(payload.service_name) ?? "Serviço realizado",
        normalizeText(payload.equipment),
        normalizeText(payload.description),
        normalizeText(payload.service_date),
        status,
        valueService,
        valueProducts,
        valueTotal,
        costService,
        costProducts,
        costTotal,
        normalizeText(payload.notes),
      ];

      const serviceResult = await pool.query(insertService, serviceValues);
      const realized = serviceResult.rows[0];

      if (items.length) {
        const insertItem = `
          INSERT INTO servicos_realizados_itens (
            servico_realizado_id,
            produto_id,
            produto_nome,
            quantidade,
            preco_unitario,
            total_item,
            custo_unitario,
            total_custo_item
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          );
        `;

        for (const item of items) {
          await pool.query(insertItem, [
            realized.id,
            item.product_id,
            item.product_name ?? "Produto",
            item.quantity,
            item.price,
            item.total,
            item.cost,
            item.total_cost,
          ]);
        }
      }

      if (items.length) {
        const productsService = new ProductsService();
        const stockMovement = await productsService.movimentEstoque({
          items: items.map((item) => ({
            product_id: item.product_id ?? null,
            product_name: item.product_name ?? null,
            quantity: item.quantity,
            description:
              normalizeText(payload.notes) ??
              `Baixa de estoque do serviço ${normalizeText(payload.service_name) ?? "realizado"}`,
          })),
          movementType: "saida",
          transactionClient: pool,
          origin: "servico",
          referenceId: realized.id,
          createdBy: normalizeText(payload.client_name) ?? "Serviço realizado",
        });

        if (!stockMovement?.success) {
          await pool.query("ROLLBACK");
          return {
            success: false,
            message:
              stockMovement?.message ??
              "Erro ao movimentar estoque para o serviço realizado",
          };
        }
      }

      if (status === "concluido") {
        const alreadyBilled = await pool.query(
          "SELECT id FROM finance_movements WHERE service_realized_id = $1 LIMIT 1",
          [realized.id],
        );

        if (!alreadyBilled.rows.length) {
          const insertMovement = `
            INSERT INTO finance_movements (
              title,
              category,
              movement_date,
              value,
              status,
              type,
              channel,
              notes,
              service_realized_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *;
          `;

          const title =
            normalizeText(realized.descricao) ??
            normalizeText(realized.servico_nome) ??
            "Serviço realizado";

          const movementDate =
            normalizeText(payload.service_date) ?? new Date().toISOString();

          await pool.query(insertMovement, [
            `Faturamento - ${title}`,
            "Serviço técnico",
            movementDate,
            valueTotal ?? 0,
            "Pago",
            "in",
            null,
            normalizeText(payload.notes),
            realized.id,
          ]);
        }
      }

      await pool.query("COMMIT");

      return {
        success: true,
        message: "Serviço realizado registrado com sucesso",
        service_realized: realized,
        items: items,
      };
    } catch (error: any) {
      await pool.query("ROLLBACK");
      console.error("Erro ao registrar serviço realizado:", error);
      return {
        success: false,
        message: "Erro ao registrar serviço realizado",
      };
    }
  }

  public async updateServiceRealized(
    id: string,
    payload: ServiceRealizedPayload,
  ) {
    const pool = DB.connect();
    try {
      if (!id) {
        return {
          success: false,
          message: "Id do serviço realizado é obrigatório",
        };
      }

      const items = Array.isArray(payload.items)
        ? payload.items.map(buildItemPayload)
        : [];

      const valueService = normalizeNumber(payload.value);
      const valueProducts = items.reduce((acc, item) => acc + item.total, 0);
      const valueTotal = valueService + valueProducts;

      const costService = normalizeNumber(payload.cost);
      const costProducts = items.reduce(
        (acc, item) => acc + item.total_cost,
        0,
      );
      const costTotal = costService + costProducts;
      const status = normalizeText(payload.status) ?? "concluido";

      await pool.query("BEGIN");

      const previousItemsResult = await pool.query(
        `SELECT produto_id, quantidade
         FROM servicos_realizados_itens
         WHERE servico_realizado_id = $1`,
        [id],
      );
      const previousItems = (previousItemsResult.rows ?? []).map((item) => ({
        product_id: item.produto_id,
        quantity: item.quantidade,
      }));

      const updateService = `
        UPDATE servicos_realizados
        SET
          cliente_id = $1,
          cliente_nome = $2,
          contato = $3,
          servico_id = $4,
          servico_nome = $5,
          equipamento = $6,
          descricao = $7,
          data_servico = $8,
          status = $9,
          valor_servico = $10,
          valor_produtos = $11,
          valor_total = $12,
          custo_servico = $13,
          custo_produtos = $14,
          custo_total = $15,
          observacoes = $16,
          atualizado_em = NOW()
        WHERE id = $17
        RETURNING *;
      `;

      const serviceValues = [
        normalizeText(payload.client_id),
        normalizeText(payload.client_name),
        normalizeText(payload.client_contact),
        normalizeText(payload.service_id),
        normalizeText(payload.service_name) ?? "Serviço realizado",
        normalizeText(payload.equipment),
        normalizeText(payload.description),
        normalizeText(payload.service_date),
        status,
        valueService,
        valueProducts,
        valueTotal,
        costService,
        costProducts,
        costTotal,
        normalizeText(payload.notes),
        id,
      ];

      const serviceResult = await pool.query(updateService, serviceValues);
      const realized = serviceResult.rows[0];

      await pool.query(
        "DELETE FROM servicos_realizados_itens WHERE servico_realizado_id = $1",
        [id],
      );

      if (items.length) {
        const insertItem = `
          INSERT INTO servicos_realizados_itens (
            servico_realizado_id,
            produto_id,
            produto_nome,
            quantidade,
            preco_unitario,
            total_item,
            custo_unitario,
            total_custo_item
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          );
        `;

        for (const item of items) {
          await pool.query(insertItem, [
            realized.id,
            item.product_id,
            item.product_name ?? "Produto",
            item.quantity,
            item.price,
            item.total,
            item.cost,
            item.total_cost,
          ]);
        }
      }

      const oldByProduct = sumQuantityByProduct(previousItems);
      const newByProduct = sumQuantityByProduct(
        items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      );

      const allProductIds = new Set<string>([
        ...Object.keys(oldByProduct),
        ...Object.keys(newByProduct),
      ]);

      const outputAdjustments: Array<{ product_id: string; quantity: number }> = [];
      const inputAdjustments: Array<{ product_id: string; quantity: number }> = [];

      for (const productId of allProductIds) {
        const oldQuantity = oldByProduct[productId] ?? 0;
        const newQuantity = newByProduct[productId] ?? 0;
        const delta = newQuantity - oldQuantity;

        if (delta > 0) {
          outputAdjustments.push({
            product_id: productId,
            quantity: delta,
          });
        } else if (delta < 0) {
          inputAdjustments.push({
            product_id: productId,
            quantity: Math.abs(delta),
          });
        }
      }

      if (outputAdjustments.length || inputAdjustments.length) {
        const productsService = new ProductsService();

        if (outputAdjustments.length) {
          const outputResult = await productsService.movimentEstoque({
            items: outputAdjustments.map((item) => ({
              ...item,
              description:
                normalizeText(payload.notes) ??
                "Ajuste de saída por edição de serviço realizado",
            })),
            movementType: "saida",
            transactionClient: pool,
            origin: "servico",
            referenceId: realized.id,
            createdBy: normalizeText(payload.client_name) ?? "Serviço realizado",
          });

          if (!outputResult?.success) {
            await pool.query("ROLLBACK");
            return {
              success: false,
              message:
                outputResult?.message ??
                "Erro ao ajustar saída de estoque na edição do serviço",
            };
          }
        }

        if (inputAdjustments.length) {
          const inputResult = await productsService.movimentEstoque({
            items: inputAdjustments.map((item) => ({
              ...item,
              description:
                normalizeText(payload.notes) ??
                "Ajuste de entrada por edição de serviço realizado",
            })),
            movementType: "entrada",
            transactionClient: pool,
            origin: "servico",
            referenceId: realized.id,
            createdBy: normalizeText(payload.client_name) ?? "Serviço realizado",
          });

          if (!inputResult?.success) {
            await pool.query("ROLLBACK");
            return {
              success: false,
              message:
                inputResult?.message ??
                "Erro ao ajustar entrada de estoque na edição do serviço",
            };
          }
        }
      }

      if (status === "concluido") {
        const alreadyBilled = await pool.query(
          "SELECT id FROM finance_movements WHERE service_realized_id = $1 LIMIT 1",
          [realized.id],
        );

        if (!alreadyBilled.rows.length) {
          const insertMovement = `
            INSERT INTO finance_movements (
              title,
              category,
              movement_date,
              value,
              status,
              type,
              channel,
              notes,
              service_realized_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *;
          `;

          const title =
            normalizeText(realized.descricao) ??
            normalizeText(realized.servico_nome) ??
            "Serviço realizado";

          const movementDate =
            normalizeText(payload.service_date) ?? new Date().toISOString();

          await pool.query(insertMovement, [
            `Faturamento - ${title}`,
            "Serviço técnico",
            movementDate,
            valueTotal ?? 0,
            "Pago",
            "in",
            null,
            normalizeText(payload.notes),
            realized.id,
          ]);
        }
      }

      await pool.query("COMMIT");

      return {
        success: true,
        message: "Serviço realizado atualizado com sucesso",
        service_realized: realized,
        items,
      };
    } catch (error: any) {
      await pool.query("ROLLBACK");
      console.error("Erro ao atualizar serviço realizado:", error);
      return {
        success: false,
        message: "Erro ao atualizar serviço realizado",
      };
    }
  }

  public async deleteServiceRealized(id: string) {
    try {
      const pool = DB.connect();
      if (!id) {
        return {
          success: false,
          message: "Id do serviço realizado é obrigatório",
        };
      }

      await pool.query("BEGIN");

      await pool.query(
        "DELETE FROM servicos_realizados_itens WHERE servico_realizado_id = $1",
        [id],
      );

      await pool.query(
        "DELETE FROM finance_movements WHERE service_realized_id = $1",
        [id],
      );

      const result = await pool.query(
        "DELETE FROM servicos_realizados WHERE id = $1 RETURNING *",
        [id],
      );

      await pool.query("COMMIT");

      return {
        success: true,
        message: "Serviço realizado excluído com sucesso",
        service_realized: result.rows[0] ?? null,
      };
    } catch (error: any) {
      try {
        const pool = DB.connect();
        await pool.query("ROLLBACK");
      } catch {}
      console.error("Erro ao excluir serviço realizado:", error);
      return {
        success: false,
        message: "Erro ao excluir serviço realizado",
      };
    }
  }

  public async getServicesRealized() {
    try {
      const pool = DB.connect();
      const servicesResult = await pool.query(
        `SELECT * FROM servicos_realizados ORDER BY criado_em DESC`,
      );
      const services = servicesResult.rows ?? [];

      if (!services.length) {
        return {
          success: true,
          message: "Serviços realizados listados",
          services_realized: [],
        };
      }

      const ids = services.map((service) => service.id);
      const itemsResult = await pool.query(
        `SELECT * FROM servicos_realizados_itens WHERE servico_realizado_id = ANY($1::uuid[])`,
        [ids],
      );
      const items = itemsResult.rows ?? [];

      const itemsByService = items.reduce(
        (acc, item) => {
          const key = item.servico_realizado_id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        },
        {} as Record<string, typeof items>,
      );

      const enriched = services.map((service) => ({
        ...service,
        items: itemsByService[service.id] ?? [],
      }));

      return {
        success: true,
        message: "Serviços realizados listados",
        services_realized: enriched,
      };
    } catch (error: any) {
      console.error("Erro ao listar serviços realizados:", error);
      return {
        success: false,
        message: "Erro ao listar serviços realizados",
        services_realized: [],
      };
    }
  }

  public async settleServiceRealized(
    id: string,
    payload?: {
      channel?: string | null;
      date?: string | null;
      notes?: string | null;
    },
  ) {
    const pool = DB.connect();
    try {
      if (!id) {
        return {
          success: false,
          message: "Id do serviço realizado é obrigatório",
        };
      }

      await pool.query("BEGIN");

      const serviceResult = await pool.query(
        "SELECT * FROM servicos_realizados WHERE id = $1 FOR UPDATE",
        [id],
      );
      const service = serviceResult.rows[0];

      if (!service) {
        await pool.query("ROLLBACK");
        return {
          success: false,
          message: "Serviço realizado não encontrado",
        };
      }

      const alreadyBilled = await pool.query(
        "SELECT id FROM finance_movements WHERE service_realized_id = $1 LIMIT 1",
        [id],
      );

      const totalValue =
        normalizeDbNumber(service.valor_total) ??
        (normalizeDbNumber(service.valor_servico) ?? 0) +
          (normalizeDbNumber(service.valor_produtos) ?? 0);

      const movementDate =
        normalizeText(payload?.date) ?? new Date().toISOString();

      let createdMovement = null;

      if (!alreadyBilled.rows.length) {
        const insertMovement = `
          INSERT INTO finance_movements (
            title,
            category,
            movement_date,
            value,
            status,
            type,
            channel,
            notes,
            service_realized_id
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING *;
        `;

        const title =
          normalizeText(service.descricao) ??
          normalizeText(service.servico_nome) ??
          "Serviço realizado";

        const movementResult = await pool.query(insertMovement, [
          `Faturamento - ${title}`,
          "Serviço técnico",
          movementDate,
          totalValue ?? 0,
          "Pago",
          "in",
          normalizeText(payload?.channel),
          normalizeText(payload?.notes),
          id,
        ]);

        createdMovement = movementResult.rows[0] ?? null;
      }

      const updatedServiceResult = await pool.query(
        `UPDATE servicos_realizados
         SET status = $1, atualizado_em = NOW()
         WHERE id = $2
         RETURNING *`,
        ["concluido", id],
      );

      await pool.query("COMMIT");

      return {
        success: true,
        message: alreadyBilled.rows.length
          ? "Serviço já estava faturado. Status atualizado."
          : "Serviço faturado com sucesso",
        service_realized: updatedServiceResult.rows[0] ?? service,
        movement: createdMovement,
        already_billed: alreadyBilled.rows.length > 0,
      };
    } catch (error: any) {
      await pool.query("ROLLBACK");
      console.error("Erro ao faturar serviço realizado:", error);
      return {
        success: false,
        message: "Erro ao faturar serviço realizado",
      };
    }
  }
}
