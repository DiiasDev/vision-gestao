import { Router } from "express";
import { GraphicsController } from "./Grphics.controller.js";

const router = Router();
const controller = new GraphicsController();

router.get("/graphics/painel", controller.getVendasMensais.bind(controller));
router.get("/graphics/cards", controller.getValuesCards.bind(controller));

export const graphicRoutes = router;
