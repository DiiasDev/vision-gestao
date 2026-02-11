import { Router } from "express";
import { UserController } from "./users.controller.js";
const router = Router();
const controller = new UserController();
router.post("/login", (req, res) => controller.login(req, res));
export { router as usersRoutes };
//# sourceMappingURL=users.routes.js.map