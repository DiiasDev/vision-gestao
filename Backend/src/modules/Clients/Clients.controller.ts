import type { Request, Response } from "express";
import { ClientsService } from "./Clients.service.js";

export class ClientsController {
  private client = new ClientsService();

  public async newClient(req: Request, res: Response) {
    try {
      const novo_cliente = req.body ?? {};
      const result = await this.client.newClient(novo_cliente);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("erro ao cadastrar novo cliente", error);
      return res.status(500).json("Erro ao cadastrar novo cliente");
    }
  }
}
