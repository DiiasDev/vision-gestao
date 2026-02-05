import { DB } from "../../../database/conn.js";
import { type OrderPayload, type OrderItemPayload } from "../../types/Order/Order.types.js";

const normalizeNumber = (value: unknown) => {
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

const normalizeText = (value: unknown) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const buildItemPayload = (item: OrderItemPayload) => {
  const quantity = normalizeNumber(item.quantity);
  const price = normalizeNumber(item.price);
  return {
    product_id: item.product_id ?? null,
    product_name: normalizeText(item.product_name),
    quantity,
    price,
    total: quantity * price,
  };
};

export class OrderService {
  public async createOrder(payload: OrderPayload) {
    const pool = DB.connect();
    try {
      const items = Array.isArray(payload.items)
        ? payload.items.map(buildItemPayload)
        : [];
      const itemsTotal = items.reduce((acc, item) => acc + item.total, 0);
      const serviceValue = normalizeNumber(payload.service_value);
      const calculatedTotal = serviceValue + itemsTotal;
      const estimatedValue =
        payload.estimated_value !== null && payload.estimated_value !== undefined
          ? normalizeNumber(payload.estimated_value)
          : calculatedTotal;

      await pool.query("BEGIN");

      const insertOrder = `
        INSERT INTO orcamentos (
          cliente_id,
          cliente_nome,
          contato,
          equipamento,
          problema,
          servico_id,
          servico_descricao,
          valor_servico,
          valor_itens,
          valor_total,
          validade,
          status,
          observacoes
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )
        RETURNING *;
      `;

      const orderValues = [
        normalizeText(payload.client_id),
        normalizeText(payload.client_name),
        normalizeText(payload.client_contact),
        normalizeText(payload.equipment),
        normalizeText(payload.problem),
        normalizeText(payload.service_id),
        normalizeText(payload.service_description),
        serviceValue,
        itemsTotal,
        estimatedValue,
        normalizeText(payload.validity),
        normalizeText(payload.status) ?? "em_analise",
        normalizeText(payload.notes),
      ];

      const orderResult = await pool.query(insertOrder, orderValues);
      const order = orderResult.rows[0];

      if (items.length) {
        const insertItem = `
          INSERT INTO orcamentos_itens (
            orcamento_id,
            produto_id,
            produto_nome,
            quantidade,
            preco_unitario,
            total_item
          ) VALUES (
            $1,$2,$3,$4,$5,$6
          );
        `;

        for (const item of items) {
          await pool.query(insertItem, [
            order.id,
            item.product_id,
            item.product_name ?? "Produto",
            item.quantity,
            item.price,
            item.total,
          ]);
        }
      }

      await pool.query("COMMIT");

      return {
        success: true,
        message: "Orçamento registrado com sucesso",
        order,
        items,
      };
    } catch (error: any) {
      await pool.query("ROLLBACK");
      console.error("Erro ao registrar orçamento:", error);
      return {
        success: false,
        message: "Erro ao registrar orçamento",
      };
    }
  }

  public async getOrders() {
    try {
      const pool = DB.connect();
      const ordersResult = await pool.query(
        "SELECT * FROM orcamentos ORDER BY criado_em DESC"
      );
      const orders = ordersResult.rows ?? [];

      if (!orders.length) {
        return {
          success: true,
          message: "Orçamentos listados",
          orders: [],
        };
      }

      const ids = orders.map((order) => order.id);
      const itemsResult = await pool.query(
        "SELECT * FROM orcamentos_itens WHERE orcamento_id = ANY($1::uuid[])",
        [ids]
      );
      const items = itemsResult.rows ?? [];

      const itemsByOrder = items.reduce((acc, item) => {
        const key = item.orcamento_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      const enriched = orders.map((order) => ({
        ...order,
        items: itemsByOrder[order.id] ?? [],
      }));

      return {
        success: true,
        message: "Orçamentos listados",
        orders: enriched,
      };
    } catch (error: any) {
      console.error("Erro ao listar orçamentos:", error);
      return {
        success: false,
        message: "Erro ao listar orçamentos",
        orders: [],
      };
    }
  }

  public async updateOrder(id: string, payload: OrderPayload) {
    const pool = DB.connect();
    try {
      if (!id) {
        return {
          success: false,
          message: "Id do orçamento é obrigatório",
        };
      }

      const items = Array.isArray(payload.items)
        ? payload.items.map(buildItemPayload)
        : [];
      const itemsTotal = items.reduce((acc, item) => acc + item.total, 0);
      const serviceValue = normalizeNumber(payload.service_value);
      const calculatedTotal = serviceValue + itemsTotal;
      const estimatedValue =
        payload.estimated_value !== null && payload.estimated_value !== undefined
          ? normalizeNumber(payload.estimated_value)
          : calculatedTotal;

      await pool.query("BEGIN");

      const updateOrder = `
        UPDATE orcamentos
        SET
          cliente_id = $1,
          cliente_nome = $2,
          contato = $3,
          equipamento = $4,
          problema = $5,
          servico_id = $6,
          servico_descricao = $7,
          valor_servico = $8,
          valor_itens = $9,
          valor_total = $10,
          validade = $11,
          status = $12,
          observacoes = $13,
          atualizado_em = NOW()
        WHERE id = $14
        RETURNING *;
      `;

      const orderValues = [
        normalizeText(payload.client_id),
        normalizeText(payload.client_name),
        normalizeText(payload.client_contact),
        normalizeText(payload.equipment),
        normalizeText(payload.problem),
        normalizeText(payload.service_id),
        normalizeText(payload.service_description),
        serviceValue,
        itemsTotal,
        estimatedValue,
        normalizeText(payload.validity),
        normalizeText(payload.status) ?? "em_analise",
        normalizeText(payload.notes),
        id,
      ];

      const orderResult = await pool.query(updateOrder, orderValues);
      const order = orderResult.rows[0];

      await pool.query("DELETE FROM orcamentos_itens WHERE orcamento_id = $1", [
        id,
      ]);

      if (items.length) {
        const insertItem = `
          INSERT INTO orcamentos_itens (
            orcamento_id,
            produto_id,
            produto_nome,
            quantidade,
            preco_unitario,
            total_item
          ) VALUES (
            $1,$2,$3,$4,$5,$6
          );
        `;

        for (const item of items) {
          await pool.query(insertItem, [
            order.id,
            item.product_id,
            item.product_name ?? "Produto",
            item.quantity,
            item.price,
            item.total,
          ]);
        }
      }

      await pool.query("COMMIT");

      return {
        success: true,
        message: "Orçamento atualizado com sucesso",
        order,
        items,
      };
    } catch (error: any) {
      await pool.query("ROLLBACK");
      console.error("Erro ao atualizar orçamento:", error);
      return {
        success: false,
        message: "Erro ao atualizar orçamento",
      };
    }
  }

  public async deleteOrder(id: string) {
    try {
      const pool = DB.connect();
      if (!id) {
        return {
          success: false,
          message: "Id do orçamento é obrigatório",
        };
      }

      const result = await pool.query(
        "DELETE FROM orcamentos WHERE id = $1 RETURNING *",
        [id]
      );

      return {
        success: true,
        message: "Orçamento excluído com sucesso",
        order: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao excluir orçamento:", error);
      return {
        success: false,
        message: "Erro ao excluir orçamento",
      };
    }
  }

  public async convertToServiceRealized(id: string) {
    const pool = DB.connect();
    try {
      if (!id) {
        return {
          success: false,
          message: "Id do orçamento é obrigatório",
        };
      }

      await pool.query("BEGIN");

      const orderResult = await pool.query(
        "SELECT * FROM orcamentos WHERE id = $1",
        [id]
      );
      const order = orderResult.rows[0];
      if (!order) {
        await pool.query("ROLLBACK");
        return {
          success: false,
          message: "Orçamento não encontrado",
        };
      }

      const itemsResult = await pool.query(
        "SELECT * FROM orcamentos_itens WHERE orcamento_id = $1",
        [id]
      );
      const items = itemsResult.rows ?? [];

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
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )
        RETURNING *;
      `;

      const serviceValues = [
        order.cliente_id ?? null,
        order.cliente_nome ?? null,
        order.contato ?? null,
        order.servico_id ?? null,
        order.servico_descricao ?? "Serviço realizado",
        order.equipamento ?? null,
        order.problema ?? null,
        new Date().toISOString().split("T")[0],
        "em_execucao",
        normalizeNumber(order.valor_servico),
        normalizeNumber(order.valor_itens),
        normalizeNumber(order.valor_total),
        0,
        0,
        0,
        order.observacoes ?? null,
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
            $1,$2,$3,$4,$5,$6,$7,$8
          );
        `;

        for (const item of items) {
          await pool.query(insertItem, [
            realized.id,
            item.produto_id,
            item.produto_nome ?? "Produto",
            item.quantidade ?? 0,
            item.preco_unitario ?? 0,
            item.total_item ?? 0,
            0,
            0,
          ]);
        }
      }

      await pool.query(
        "UPDATE orcamentos SET status = $1, atualizado_em = NOW() WHERE id = $2",
        ["convertido", id]
      );

      await pool.query("COMMIT");

      return {
        success: true,
        message: "Orçamento convertido em serviço realizado",
        service_realized: realized,
      };
    } catch (error: any) {
      await pool.query("ROLLBACK");
      console.error("Erro ao converter orçamento:", error);
      return {
        success: false,
        message: "Erro ao converter orçamento",
      };
    }
  }
}
