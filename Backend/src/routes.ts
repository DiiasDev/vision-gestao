import { Router } from "express";
import { usersRoutes } from "./modules/users/users.routes.js";
import { productsRoutes } from "./modules/products/products.routes.js";
import { clientsRoutes } from "./modules/Clients/Clients.routes.js";

const router = Router();

router.use(usersRoutes);
router.use(productsRoutes);
router.use(clientsRoutes);

export class Routes {
  static routes = router;
}
