import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ProductRepository } from "../repositories/ProductRepository";
import { ProductService } from "../services/ProductService";

const router = Router();

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", authMiddleware, productController.createProduct);
router.patch("/products/:id", authMiddleware, productController.updateProduct);

export default router;