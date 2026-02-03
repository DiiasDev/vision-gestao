import { Router } from "express";
import { usersRoutes } from "./modules/users/users.routes.js";

const router = Router();

router.use(usersRoutes);

export class Routes {
  static routes = router;
}
