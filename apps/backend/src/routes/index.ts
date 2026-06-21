import { Router } from "express";
import analyticsRoutes from "./analytics.routes";
import healthRoutes from "./health.routes";
import productRoutes from "./product.routes";
import reviewRoutes from "./review.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/", productRoutes);
router.use("/", analyticsRoutes);
router.use("/", reviewRoutes);

export default router;