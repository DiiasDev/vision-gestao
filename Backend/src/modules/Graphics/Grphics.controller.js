import { GraphicsServices } from "./Graphics.services.js";
export class GraphicsController {
    GraphicServices = new GraphicsServices();
    getRangeParams(req) {
        const startRaw = req.query.startDate;
        const endRaw = req.query.endDate;
        const startDate = typeof startRaw === "string" ? startRaw : undefined;
        const endDate = typeof endRaw === "string" ? endRaw : undefined;
        const range = {};
        if (startDate)
            range.startDate = startDate;
        if (endDate)
            range.endDate = endDate;
        return range;
    }
    async getVendasMensais(req, res) {
        try {
            const monthsRaw = req.query.months;
            const months = typeof monthsRaw === "string" ? Number(monthsRaw) : undefined;
            const range = this.getRangeParams(req);
            const data = await this.GraphicServices.vendasMensais(months ?? 6, range);
            return res.status(200).json(data);
        }
        catch (error) {
            console.error("Erro ao pegar vendas mensais: ", error);
            return res.status(500).json({});
        }
    }
    async getValuesCards(req, res) {
        try {
            const range = this.getRangeParams(req);
            const data = await this.GraphicServices.valuesCards(range);
            return res.status(200).json(data);
        }
        catch (error) {
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
    async getCustoXLucro(req, res) {
        try {
            const range = this.getRangeParams(req);
            const data = await this.GraphicServices.custoXlucro(range);
            return res.status(200).json(data);
        }
        catch (error) {
            console.error("erro ao trazer dados para custoXlucro: ", error);
            return res.status(500).json({ data: {} });
        }
    }
    async getStatusOS(req, res) {
        try {
            const range = this.getRangeParams(req);
            const data = await this.GraphicServices.statusOS(range);
            res.status(200).json(data);
        }
        catch (error) {
            res.status(500).json("");
        }
    }
    async getServicosPorCategoria(req, res) {
        try {
            const range = this.getRangeParams(req);
            const data = await this.GraphicServices.servicosPorCategoria(range);
            res.status(200).json(data);
        }
        catch (error) {
            console.error("erro ao trazer dados para servicos por categoria:", error);
            res.status(500).json({
                success: false,
                data: { total: 0, categorias: [], dias: 30 },
            });
        }
    }
    async getEstoqueCritico(req, res) {
        try {
            const data = await this.GraphicServices.estoqueCritico();
            return res.status(200).json(data);
        }
        catch (error) {
            console.error("erro ao pegar dados de estoque baixo: ", error);
            return res.status(500).json("");
        }
    }
    async getRankingProdutos(req, res) {
        try {
            const range = this.getRangeParams(req);
            const data = await this.GraphicServices.rankingProdutos(range);
            return res.status(200).json(data);
        }
        catch (error) {
            console.error("erro ao pegar ranking de produtos: ", error);
            return res.status(500).json({
                success: false,
                message: "Erro ao pegar ranking de produtos",
                data: { totalSaidas: 0, produtos: [] },
            });
        }
    }
}
//# sourceMappingURL=Grphics.controller.js.map