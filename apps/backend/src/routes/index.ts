import { Router } from "express";
import aiRoutes from "./ai.routes";
import analyticsRoutes from "./analytics.routes";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import marketplaceRoutes from "./marketplace.routes";
import productRoutes from "./product.routes";
import profileRoutes from "./profile.routes";
import reviewRoutes from "./review.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/", authRoutes);
router.use("/", profileRoutes);
router.use("/", marketplaceRoutes);
router.use("/", productRoutes);
router.use("/", analyticsRoutes);
router.use("/", reviewRoutes);
router.use("/", aiRoutes);
router.use("/", notificationRoutes);

export default router;