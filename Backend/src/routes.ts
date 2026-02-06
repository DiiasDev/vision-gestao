import { Router } from "express";
import { usersRoutes } from "./modules/users/users.routes.js";
import { productsRoutes } from "./modules/products/products.routes.js";
import { clientsRoutes } from "./modules/Clients/Clients.routes.js";
import { servicesRoutes } from "./modules/services/Services.routes.js";
import { orderRoutes } from "./modules/Order/Order.routes.js";
import { financeRoutes } from "./modules/Finance/Finance.routes.js";

const router = Router();

router.use(usersRoutes);
router.use(productsRoutes);
router.use(clientsRoutes);
router.use(servicesRoutes);
router.use(orderRoutes);
router.use(financeRoutes);

export class Routes {
  static routes = router;
}
