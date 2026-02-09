import { GraphicsServices } from "./Graphics.services.js";
import type { Response, Request } from "express";

export class GraphicsController {
  public GraphicServices = new GraphicsServices();

  public async getVendasMensais(req: Request, res: Response) {
    try {
      const monthsRaw = req.query.months;
      const months =
        typeof monthsRaw === "string" ? Number(monthsRaw) : undefined;
      const data = await this.GraphicServices.vendasMensais(months ?? 6);

      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Erro ao pegar vendas mensais: ", error);
      return res.status(500).json({});
    }
  }

  public async getValuesCards(_req: Request, res: Response) {
    try {
      const data = await this.GraphicServices.valuesCards();

      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Erro ao pegar valores para os cards:", error);
      return res.status(500).json({
        success: false,
        data: {
          faturamento: 0,
          custo: 0,
          saldo: 0,
          faturamentoPercent: null,
          custoPercent: 0,
        },
      });
    }
  }

  public async getCustoXLucro(_req: Request, res: Response) {
    try {
      const data = await this.GraphicServices.custoXlucro();

      return res.status(200).json(data);
    } catch (error: any) {
      console.error("erro ao trazer dados para custoXlucro: ", error);
      return res.status(500).json({ data: {} });
    }
  }

  public async getStatusOS(req: Request, res: Response) {
    try {
      const data = await this.GraphicServices.statusOS();

      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json("");
    }
  }

  public async getServicosPorCategoria(_req: Request, res: Response) {
    try {
      const data = await this.GraphicServices.servicosPorCategoria();
      res.status(200).json(data);
    } catch (error: any) {
      console.error("erro ao trazer dados para servicos por categoria:", error);
      res.status(500).json({
        success: false,
        data: { total: 0, categorias: [], dias: 30 },
      });
    }
  }
}
