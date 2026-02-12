import { DB } from "../../database/conn.js";
import {
  type OrderPayload,
  type OrderItemPayload,
} from "../../types/Order/Order.types.js";
import PDFDocument from "pdfkit";
import { ProductsService } from "../products/products.service.js";

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

const normalizePhone = (value?: string | null) => {
  if (!value) return null;
  const digits = String(value).replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.startsWith("55")) return digits;
  if (digits.length === 11) return `55${digits}`;
  return digits;
};

const generateOrderPdf = async (order: any, items: any[]) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(18).text("Orçamento", { align: "left" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`ID: ${order.id}`);
  doc.text(`Cliente: ${order.cliente_nome ?? "-"}`);
  doc.text(`Contato: ${order.contato ?? "-"}`);
  doc.text(`Equipamento: ${order.equipamento ?? "-"}`);
  doc.text(`Problema: ${order.problema ?? "-"}`);
  doc.text(`Serviço: ${order.servico_descricao ?? "-"}`);
  doc.text(`Validade: ${order.validade ?? "-"}`);
  doc.text(`Status: ${order.status ?? "-"}`);
  doc.moveDown(0.5);
  doc.fontSize(12).text("Resumo financeiro");
  doc.fontSize(10).text(`Valor do serviço: R$ ${order.valor_servico ?? 0}`);
  doc.text(`Valor dos itens: R$ ${order.valor_itens ?? 0}`);
  doc.text(`Valor total: R$ ${order.valor_total ?? 0}`);

  doc.moveDown(0.5);
  doc.fontSize(12).text("Itens");
  items.forEach((item) => {
    doc
      .fontSize(10)
      .text(
        `${item.produto_nome ?? "Produto"} - Qtd: ${item.quantidade ?? 0} - R$ ${item.preco_unitario ?? 0} - Total: R$ ${item.total_item ?? 0}`,
      );
  });

  doc.end();
  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
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

const getApiErrorMessage = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const error = (value as { error?: unknown }).error;
  if (!error || typeof error !== "object") return null;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : null;
};

const getMediaId = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
};

const getFirstMessageId = (value: unknown) => {
  if (!value || typeof value !== "object") return null;
  const messages = (value as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const first = messages[0];
  if (!first || typeof first !== "object") return null;
  const id = (first as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
};

export class OrderService {
  public async createOrder(payload: OrderPayload) {
    const pool = DB.connect();
    try {
      const items = Array.isArray(payload.items)
        ? payload.items.map(buildItemPayload)
        : [];
      const itemsTotal = items.reduce((acc, item) => acc + item.total, 0);
      const shouldUseServiceFallbackPrice =
        (payload.service_value === null ||
          payload.service_value === undefined ||
          payload.service_value === "") &&
        !!payload.service_id;
      let serviceValue = normalizeNumber(payload.service_value);

      await pool.query("BEGIN");

      let serviceDescription = normalizeText(payload.service_description);
      if ((!serviceDescription || shouldUseServiceFallbackPrice) && payload.service_id) {
        try {
          const serviceResult = await pool.query(
            "SELECT nome_servico, preco FROM servicos WHERE id = $1",
            [payload.service_id],
          );
          serviceDescription = serviceResult.rows[0]?.nome_servico ?? null;
          if (shouldUseServiceFallbackPrice) {
            serviceValue = normalizeNumber(serviceResult.rows[0]?.preco);
          }
        } catch (error) {
          console.error("Erro ao buscar nome do serviço:", error);
        }
      }

      const calculatedTotal = serviceValue + itemsTotal;
      const estimatedValue =
        payload.estimated_value !== null &&
        payload.estimated_value !== undefined
          ? normalizeNumber(payload.estimated_value)
          : calculatedTotal;

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
        serviceDescription,
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
        "SELECT * FROM orcamentos ORDER BY criado_em DESC",
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
        [ids],
      );
      const items = itemsResult.rows ?? [];

      const itemsByOrder = items.reduce(
        (acc, item) => {
          const key = item.orcamento_id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        },
        {} as Record<string, typeof items>,
      );

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
      const shouldUseServiceFallbackPrice =
        (payload.service_value === null ||
          payload.service_value === undefined ||
          payload.service_value === "") &&
        !!payload.service_id;
      let serviceValue = normalizeNumber(payload.service_value);

      await pool.query("BEGIN");

      let updateServiceDescription = normalizeText(payload.service_description);
      if (
        (!updateServiceDescription || shouldUseServiceFallbackPrice) &&
        payload.service_id
      ) {
        try {
          const serviceResult = await pool.query(
            "SELECT nome_servico, preco FROM servicos WHERE id = $1",
            [payload.service_id],
          );
          updateServiceDescription =
            serviceResult.rows[0]?.nome_servico ?? null;
          if (shouldUseServiceFallbackPrice) {
            serviceValue = normalizeNumber(serviceResult.rows[0]?.preco);
          }
        } catch (error) {
          console.error("Erro ao buscar nome do serviço:", error);
        }
      }

      const calculatedTotal = serviceValue + itemsTotal;
      const estimatedValue =
        payload.estimated_value !== null &&
        payload.estimated_value !== undefined
          ? normalizeNumber(payload.estimated_value)
          : calculatedTotal;

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
        updateServiceDescription,
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
        [id],
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
        [id],
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
        [id],
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

      if (items.length) {
        const productsService = new ProductsService();
        const stockMovement = await productsService.movimentEstoque({
          items: items.map((item) => ({
            product_id: item.produto_id ?? null,
            product_name: item.produto_nome ?? null,
            quantity: item.quantidade ?? 0,
            description:
              normalizeText(order.observacoes) ??
              `Baixa de estoque na conversão do orçamento ${order.id}`,
          })),
          movementType: "saida",
          transactionClient: pool,
          origin: "orcamento",
          referenceId: id,
          createdBy: normalizeText(order.cliente_nome) ?? "Conversão de orçamento",
        });

        if (!stockMovement?.success) {
          await pool.query("ROLLBACK");
          return {
            success: false,
            message:
              stockMovement?.message ??
              "Erro ao movimentar estoque na conversão do orçamento",
          };
        }
      }

      await pool.query(
        "UPDATE orcamentos SET status = $1, atualizado_em = NOW() WHERE id = $2",
        ["convertido", id],
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

  public async exportOrderToWhatsapp(id: string) {
    try {
      const pool = DB.connect();
      const token = process.env.WHATSAPP_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!token || !phoneId) {
        return {
          success: false,
          message:
            "Configuração do WhatsApp ausente. Defina WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID.",
        };
      }

      const orderResult = await pool.query(
        "SELECT * FROM orcamentos WHERE id = $1",
        [id],
      );
      const order = orderResult.rows[0];
      if (!order) {
        return { success: false, message: "Orçamento não encontrado" };
      }

      const itemsResult = await pool.query(
        "SELECT * FROM orcamentos_itens WHERE orcamento_id = $1",
        [id],
      );
      const items = itemsResult.rows ?? [];

      const phone = normalizePhone(order.contato);
      if (!phone) {
        return {
          success: false,
          message: "Telefone do cliente não informado ou inválido",
        };
      }

      const pdfBuffer = await generateOrderPdf(order, items);
      const form = new FormData();
      form.append("messaging_product", "whatsapp");
      form.append(
        "file",
        new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
        `orcamento-${order.id}.pdf`,
      );
      form.append("type", "application/pdf");

      const mediaResponse = await fetch(
        `https://graph.facebook.com/v19.0/${phoneId}/media`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        },
      );

      const mediaData: unknown = await mediaResponse.json();
      if (!mediaResponse.ok) {
        return {
          success: false,
          message: getApiErrorMessage(mediaData) ?? "Falha ao enviar mídia",
        };
      }

      const mediaId = getMediaId(mediaData);
      if (!mediaId) {
        return {
          success: false,
          message: "Falha ao enviar mídia",
        };
      }

      const sendResponse = await fetch(
        `https://graph.facebook.com/v19.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone,
            type: "document",
            document: {
              id: mediaId,
              filename: `orcamento-${order.id}.pdf`,
            },
          }),
        },
      );

      const sendData: unknown = await sendResponse.json();
      if (!sendResponse.ok) {
        return {
          success: false,
          message: getApiErrorMessage(sendData) ?? "Falha ao enviar documento",
        };
      }

      return {
        success: true,
        message: "Orçamento enviado no WhatsApp",
        message_id: getFirstMessageId(sendData),
      };
    } catch (error: any) {
      console.error("Erro ao exportar orçamento:", error);
      return {
        success: false,
        message: "Erro ao exportar orçamento",
      };
    }
  }
}
