import { Router } from "express";
import { ServicesController } from "./Services.controller.js";

const router = Router();
const controller = new ServicesController();

router.post("/services", controller.newService.bind(controller));
router.get("/services", controller.getServices.bind(controller))

export const servicesRoutes = router