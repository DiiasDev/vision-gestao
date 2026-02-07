import { Router } from "express";
import { GraphicsController } from "./Grphics.controller.js";

const router = Router();
const controller = new GraphicsController();

router.get("/graphics/painel", controller.getVendasMensais.bind(controller));

export const graphicRoutes = router;
