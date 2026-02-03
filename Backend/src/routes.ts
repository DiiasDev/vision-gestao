import { Router } from "express";
import { usersRoutes } from "./modules/users/users.routes.js";
import { productsRoutes } from "./modules/products/products.routes.js";

const router = Router();

router.use(usersRoutes);
router.use(productsRoutes);

export class Routes {
  static routes = router;
}
