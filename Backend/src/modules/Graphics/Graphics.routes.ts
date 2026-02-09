import { Router } from "express";
import { GraphicsController } from "./Grphics.controller.js";

const router = Router();
const controller = new GraphicsController();

router.get("/graphics/painel", controller.getVendasMensais.bind(controller));
router.get("/graphics/cards", controller.getValuesCards.bind(controller));
router.get("/graphics/custo-x-lucro", controller.getCustoXLucro.bind(controller));
router.get("/graphics/status-os", controller.getStatusOS.bind(controller));

export const graphicRoutes = router;
