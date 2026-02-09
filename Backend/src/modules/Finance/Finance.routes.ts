import { Router } from "express";
import { FinanceController } from "./Finance.controller.js";

const router = Router();
const controller = new FinanceController();

router.get("/finance/movements", controller.listMovements.bind(controller));
router.post("/finance/movements", controller.createMovement.bind(controller));
router.put("/finance/movements/:id", controller.updateMovement.bind(controller));
router.delete(
  "/finance/movements/:id",
  controller.deleteMovement.bind(controller),
);

export const financeRoutes = router;
