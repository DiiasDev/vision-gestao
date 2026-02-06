import { Router } from "express";
import { ServicesController } from "./Services.controller.js";

const router = Router();
const controller = new ServicesController();

router.post("/services", controller.newService.bind(controller));
router.get("/services", controller.getServices.bind(controller))
router.put("/services/:id", controller.updateService.bind(controller));
router.delete("/services/:id", controller.deleteService.bind(controller));
router.post("/services/realized", controller.createServiceRealized.bind(controller));
router.get("/services/realized", controller.getServicesRealized.bind(controller));
router.put("/services/realized/:id", controller.updateServiceRealized.bind(controller));
router.delete("/services/realized/:id", controller.deleteServiceRealized.bind(controller));
router.post("/services/realized/:id/settle", controller.settleServiceRealized.bind(controller));

export const servicesRoutes = router
