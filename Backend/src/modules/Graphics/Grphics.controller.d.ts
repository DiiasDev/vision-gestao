import { GraphicsServices } from "./Graphics.services.js";
import type { Response, Request } from "express";
export declare class GraphicsController {
    GraphicServices: GraphicsServices;
    private getRangeParams;
    getVendasMensais(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getValuesCards(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCustoXLucro(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getStatusOS(req: Request, res: Response): Promise<void>;
    getServicosPorCategoria(req: Request, res: Response): Promise<void>;
    getEstoqueCritico(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getRankingProdutos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=Grphics.controller.d.ts.map