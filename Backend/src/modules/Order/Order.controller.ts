import type { Request, Response } from "express";
import { OrderService } from "./Order.services.js";

export class OrderController {
  private service = new OrderService();

  async createOrder(req: Request, res: Response) {
    try {
      const payload = req.body ?? {};
      const result = await this.service.createOrder(payload);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao registrar orçamento", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao registrar orçamento",
      });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const result = await this.service.getOrders();
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao listar orçamentos", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar orçamentos",
      });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Id do orçamento é obrigatório",
        });
      }
      const payload = req.body ?? {};
      const result = await this.service.updateOrder(id, payload);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao atualizar orçamento", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar orçamento",
      });
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Id do orçamento é obrigatório",
        });
      }
      const result = await this.service.deleteOrder(id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao excluir orçamento", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir orçamento",
      });
    }
  }

  async convertToService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.service.convertToServiceRealized(id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao converter orçamento", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao converter orçamento",
      });
    }
  }

  async exportOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.service.exportOrderToWhatsapp(id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao exportar orçamento", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao exportar orçamento",
      });
    }
  }
}
