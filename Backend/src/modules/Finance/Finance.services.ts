import { DB } from "../../database/conn.js";

type FinanceMovementPayload = {
  title?: string | null;
  category?: string | null;
  date?: string | null;
  value?: number | string | null;
  status?: string | null;
  type?: string | null;
  channel?: string | null;
  notes?: string | null;
  service_realized_id?: string | null;
};

const normalizeText = (value: unknown) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const normalizeNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeType = (value: unknown) => {
  const raw = normalizeText(value);
  if (!raw) return null;
  return raw === "in" || raw === "out" ? raw : null;
};

const normalizeStatus = (value: unknown) => {
  const raw = normalizeText(value);
  if (!raw) return null;
  return raw === "Pago" || raw === "Pendente" || raw === "Agendado"
    ? raw
    : null;
};

const normalizeChannel = (value: unknown) => {
  const raw = normalizeText(value);
  if (!raw) return null;
  return raw === "PIX" ||
    raw === "Cartao" ||
    raw === "Dinheiro" ||
    raw === "Boleto" ||
    raw === "Transferencia"
    ? raw
    : null;
};

export class FinanceService {
  public async createMovement(payload: FinanceMovementPayload) {
    try {
      const pool = DB.connect();

      const title = normalizeText(payload.title);
      const type = normalizeType(payload.type);
      const value = normalizeNumber(payload.value);
      const movementDate = normalizeText(payload.date) ?? new Date().toISOString();

      if (!title) {
        return { success: false, message: "Título é obrigatório" };
      }
      if (!type) {
        return { success: false, message: "Tipo de movimentação é obrigatório" };
      }
      if (value === null) {
        return { success: false, message: "Valor é obrigatório" };
      }

      const insert = `
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

      const result = await pool.query(insert, [
        title,
        normalizeText(payload.category),
        movementDate,
        value,
        normalizeStatus(payload.status) ?? "Pago",
        type,
        normalizeChannel(payload.channel),
        normalizeText(payload.notes),
        normalizeText(payload.service_realized_id),
      ]);

      return {
        success: true,
        message: "Movimentação registrada",
        movement: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao registrar movimentação:", error);
      return {
        success: false,
        message: "Erro ao registrar movimentação",
      };
    }
  }

  public async listMovements(filters?: {
    type?: string;
    status?: string;
    category?: string;
    channel?: string;
    dateFrom?: string;
    dateTo?: string;
    serviceRealizedId?: string;
  }) {
    try {
      const pool = DB.connect();
      const conditions: string[] = [];
      const values: any[] = [];

      if (filters?.type) {
        values.push(filters.type);
        conditions.push(`type = $${values.length}`);
      }
      if (filters?.status) {
        values.push(filters.status);
        conditions.push(`status = $${values.length}`);
      }
      if (filters?.category) {
        values.push(filters.category);
        conditions.push(`category = $${values.length}`);
      }
      if (filters?.channel) {
        values.push(filters.channel);
        conditions.push(`channel = $${values.length}`);
      }
      if (filters?.dateFrom) {
        values.push(filters.dateFrom);
        conditions.push(`movement_date >= $${values.length}`);
      }
      if (filters?.dateTo) {
        values.push(filters.dateTo);
        conditions.push(`movement_date <= $${values.length}`);
      }
      if (filters?.serviceRealizedId) {
        values.push(filters.serviceRealizedId);
        conditions.push(`service_realized_id = $${values.length}`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

      const query = `
        SELECT
          fm.id,
          fm.title,
          fm.category,
          fm.movement_date AS date,
          fm.value,
          fm.status,
          fm.type,
          fm.channel,
          fm.notes,
          fm.service_realized_id,
          fm.created_at,
          fm.updated_at,
          sr.valor_total AS service_total
        FROM finance_movements fm
        LEFT JOIN servicos_realizados sr
          ON sr.id = fm.service_realized_id
        ${where}
        ORDER BY fm.movement_date DESC;
      `;

      const result = await pool.query(query, values);
      const filteredRows = (result.rows ?? []).filter((row) => {
        if (!row.service_realized_id) return true;
        return row.service_total !== null && row.service_total !== undefined;
      });
      const movements = filteredRows.map((row) => {
        const rawValue = row.value;
        const value =
          typeof rawValue === "number" ? rawValue : normalizeNumber(rawValue) ?? 0;

        const serviceTotal = normalizeNumber(row.service_total);
        if (
          serviceTotal !== null &&
          serviceTotal > 0 &&
          value > 0 &&
          Math.abs(value - serviceTotal * 100) < 0.01
        ) {
          return { ...row, value: serviceTotal };
        }

        return { ...row, value };
      });

      return {
        success: true,
        message: "Movimentações listadas",
        movements,
      };
    } catch (error: any) {
      console.error("Erro ao listar movimentações:", error);
      return {
        success: false,
        message: "Erro ao listar movimentações",
        movements: [],
      };
    }
  }

  public async updateMovement(
    id: string,
    payload: Partial<FinanceMovementPayload>,
  ) {
    try {
      const pool = DB.connect();
      if (!id) {
        return { success: false, message: "Id da movimentação é obrigatório" };
      }

      const existingResult = await pool.query(
        "SELECT * FROM finance_movements WHERE id = $1",
        [id],
      );
      const existing = existingResult.rows[0];
      if (!existing) {
        return { success: false, message: "Movimentação não encontrada" };
      }

      const title = normalizeText(payload.title) ?? existing.title;
      const type = normalizeType(payload.type) ?? existing.type;
      const value =
        payload.value === undefined
          ? existing.value
          : normalizeNumber(payload.value);
      if (value === null) {
        return { success: false, message: "Valor é obrigatório" };
      }

      const movementDate =
        normalizeText(payload.date) ?? existing.movement_date ?? new Date().toISOString();

      const update = `
        UPDATE finance_movements
        SET
          title = $1,
          category = $2,
          movement_date = $3,
          value = $4,
          status = $5,
          type = $6,
          channel = $7,
          notes = $8,
          updated_at = NOW()
        WHERE id = $9
        RETURNING *;
      `;

      const result = await pool.query(update, [
        title,
        normalizeText(payload.category) ?? existing.category,
        movementDate,
        value,
        normalizeStatus(payload.status) ?? existing.status,
        type,
        normalizeChannel(payload.channel) ?? existing.channel,
        normalizeText(payload.notes) ?? existing.notes,
        id,
      ]);

      return {
        success: true,
        message: "Movimentação atualizada",
        movement: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao atualizar movimentação:", error);
      return {
        success: false,
        message: "Erro ao atualizar movimentação",
      };
    }
  }

  public async deleteMovement(id: string) {
    try {
      const pool = DB.connect();
      if (!id) {
        return { success: false, message: "Id da movimentação é obrigatório" };
      }

      const result = await pool.query(
        "DELETE FROM finance_movements WHERE id = $1 RETURNING *",
        [id],
      );

      return {
        success: true,
        message: "Movimentação excluída",
        movement: result.rows[0] ?? null,
      };
    } catch (error: any) {
      console.error("Erro ao excluir movimentação:", error);
      return {
        success: false,
        message: "Erro ao excluir movimentação",
      };
    }
  }
}
