import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { ProductRepository } from "../repositories/ProductRepository";
import { ProductService } from "../services/ProductService";

const router = Router();

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProductById);

export default router;