import { Router } from "express";
import { ProductsController } from "./products.controller.js";

const router = Router();
const controller = new ProductsController();

router.post("/products", controller.newProduct.bind(controller));

export const productsRoutes = router;
