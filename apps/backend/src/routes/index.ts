import { Router } from "express";
import aiRoutes from "./ai.routes";
import analyticsRoutes from "./analytics.routes";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import productRoutes from "./product.routes";
import reviewRoutes from "./review.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/", authRoutes);
router.use("/", productRoutes);
router.use("/", analyticsRoutes);
router.use("/", reviewRoutes);
router.use("/", aiRoutes);

export default router;