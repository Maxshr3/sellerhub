import { Router } from "express";
import { HealthController } from "../controllers/HealthController";
import { HealthService } from "../services/HealthService";

const router = Router();

const healthService = new HealthService();
const healthController = new HealthController(healthService);

router.get("/health", healthController.getHealth);

export default router;