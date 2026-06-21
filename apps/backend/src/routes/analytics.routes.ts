import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";
import { AnalyticsService } from "../services/AnalyticsService";

const router = Router();

const analyticsRepository = new AnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepository);
const analyticsController = new AnalyticsController(analyticsService);

router.get("/analytics/dashboard", analyticsController.getDashboardAnalytics);

export default router;