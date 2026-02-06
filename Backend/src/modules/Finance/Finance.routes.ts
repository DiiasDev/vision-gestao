import { Router } from "express";
import { FinanceController } from "./Finance.controller.js";

const router = Router();
const controller = new FinanceController();

router.get("/finance/movements", controller.listMovements.bind(controller));
router.post("/finance/movements", controller.createMovement.bind(controller));

export const financeRoutes = router;
