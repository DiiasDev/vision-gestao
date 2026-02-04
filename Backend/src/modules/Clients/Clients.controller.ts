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

  public async getClientes(req: Request, res: Response) {
    try {
      const clientes = await this.client.getClients();

      return res.status(200).json(clientes);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao listar clientes",
      });
    }
  }

  public async updateClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cliente = req.body ?? {};
      const clientId = Array.isArray(id) ? id[0] : id;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: "Id do cliente é obrigatório",
        });
      }

      const result = await this.client.updateClient(clientId, cliente);
      const statusCode = result.success
        ? 200
        : result.message === "Cliente não encontrado"
          ? 404
          : 400;

      return res.status(statusCode).json(result);
    } catch (error: any) {
      console.error("erro ao atualizar cliente", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao atualizar cliente",
      });
    }
  }

  public async deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clientId = Array.isArray(id) ? id[0] : id;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: "Id do cliente é obrigatório",
        });
      }

      const result = await this.client.deleteClient(clientId);
      const statusCode = result.success
        ? 200
        : result.message === "Cliente não encontrado"
          ? 404
          : 400;

      return res.status(statusCode).json(result);
    } catch (error: any) {
      console.error("erro ao excluir cliente", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao excluir cliente",
      });
    }
  }
}
