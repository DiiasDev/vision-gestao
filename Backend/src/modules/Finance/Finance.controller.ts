import type { Request, Response } from "express";
import { FinanceService } from "./Finance.services.js";

export class FinanceController {
  private finance = new FinanceService();

  public async createMovement(req: Request, res: Response) {
    try {
      const payload = req.body ?? {};
      const result = await this.finance.createMovement(payload);
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      console.error("erro ao registrar movimentação", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao registrar movimentação",
      });
    }
  }

  public async listMovements(req: Request, res: Response) {
    try {
      const { type, status, category, channel, dateFrom, dateTo, serviceRealizedId } =
        req.query ?? {};

      const filters = {
        type: typeof type === "string" ? type : undefined,
        status: typeof status === "string" ? status : undefined,
        category: typeof category === "string" ? category : undefined,
        channel: typeof channel === "string" ? channel : undefined,
        dateFrom: typeof dateFrom === "string" ? dateFrom : undefined,
        dateTo: typeof dateTo === "string" ? dateTo : undefined,
        serviceRealizedId:
          typeof serviceRealizedId === "string" ? serviceRealizedId : undefined,
      };

      // Remove undefined properties
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined)
      );

      const result = await this.finance.listMovements(cleanedFilters);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao listar movimentações", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar movimentações",
      });
    }
  }

  public async updateMovement(req: Request, res: Response) {
    try {
      const id = typeof req.params?.id === "string" ? req.params.id : "";
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Id da movimentação é obrigatório",
        });
      }

      const payload = req.body ?? {};
      const result = await this.finance.updateMovement(id, payload);
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      console.error("erro ao atualizar movimentação", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar movimentação",
      });
    }
  }

  public async deleteMovement(req: Request, res: Response) {
    try {
      const id = typeof req.params?.id === "string" ? req.params.id : "";
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Id da movimentação é obrigatório",
        });
      }

      const result = await this.finance.deleteMovement(id);
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      console.error("erro ao excluir movimentação", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir movimentação",
      });
    }
  }
}
