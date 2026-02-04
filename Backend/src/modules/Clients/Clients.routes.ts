import { Router } from "express";
import { ClientsController } from "./Clients.controller.js";

const router = Router();
const controller = new ClientsController();

router.post("/clients", controller.newClient.bind(controller));

export const clientsRoutes = router;
