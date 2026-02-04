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
}
