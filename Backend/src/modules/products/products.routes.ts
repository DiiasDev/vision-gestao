import { Router } from "express";
import { ProductsController } from "./products.controller.js";

const router = Router();
const controller = new ProductsController();

router.post("/products", controller.newProduct.bind(controller));
router.get("/products", controller.getProducts.bind(controller));
router.put("/products/:id", controller.updateProduct.bind(controller));
router.delete("/products/:id", controller.deleteProduct.bind(controller));

export const productsRoutes = router;
