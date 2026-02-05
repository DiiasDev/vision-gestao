import type { Response, Request } from "express";
import { ServicesService } from "./Services.services.js";

export class ServicesController {
  private service = new ServicesService();

  async newService(req: Request, res: Response) {
    try {
      const new_service = req.body ?? {};

      const result = await this.service.newService(new_service);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao registrar serviço", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao cadastrar serviço",
      });
    }
  }

  async getServices(req: Request, res: Response) {
    try {
      const servicos = await this.service.getServices();

      return res.status(200).json(servicos);
    } catch (error: any) {
      console.error("erro ao listar servicos", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar serviços",
      });
    }
  }

  async updateService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
          success: false,
          message: "Id do serviço é obrigatório e deve ser uma string válida",
        });
      }
      const payload = req.body ?? {};
      const result = await this.service.updateService(id, payload);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao atualizar serviço", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar serviço",
      });
    }
  }

  async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
          success: false,
          message: "Id do serviço é obrigatório e deve ser uma string válida",
        });
      }
      const result = await this.service.deleteService(id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao excluir serviço", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir serviço",
      });
    }
  }

  async createServiceRealized(req: Request, res: Response) {
    try {
      const payload = req.body ?? {};
      const result = await this.service.createServiceRealized(payload);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao registrar serviço realizado", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao registrar serviço realizado",
      });
    }
  }

  async getServicesRealized(req: Request, res: Response) {
    try {
      const result = await this.service.getServicesRealized();
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao listar serviços realizados", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar serviços realizados",
      });
    }
  }

  async updateServiceRealized(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
          success: false,
          message: "Id do serviço realizado é obrigatório e deve ser uma string válida",
        });
      }
      const payload = req.body ?? {};
      const result = await this.service.updateServiceRealized(id, payload);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao atualizar serviço realizado", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar serviço realizado",
      });
    }
  }

  async deleteServiceRealized(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({
          success: false,
          message: "Id do serviço realizado é obrigatório e deve ser uma string válida",
        });
      }
      const result = await this.service.deleteServiceRealized(id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao excluir serviço realizado", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir serviço realizado",
      });
    }
  }
}
