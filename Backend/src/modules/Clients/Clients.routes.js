import { Router } from "express";
import { ClientsController } from "./Clients.controller.js";
const router = Router();
const controller = new ClientsController();
router.post("/clients", controller.newClient.bind(controller));
router.get("/clients", controller.getClientes.bind(controller));
router.put("/clients/:id", controller.updateClient.bind(controller));
router.delete("/clients/:id", controller.deleteClient.bind(controller));
export const clientsRoutes = router;
//# sourceMappingURL=Clients.routes.js.map