import { Router } from "express";
import { OrderController } from "./Order.controller.js";
const router = Router();
const controller = new OrderController();
router.post("/orders", controller.createOrder.bind(controller));
router.get("/orders", controller.getOrders.bind(controller));
router.put("/orders/:id", controller.updateOrder.bind(controller));
router.delete("/orders/:id", controller.deleteOrder.bind(controller));
router.post("/orders/:id/realize", controller.convertToService.bind(controller));
router.post("/orders/:id/export", controller.exportOrder.bind(controller));
export const orderRoutes = router;
//# sourceMappingURL=Order.routes.js.map