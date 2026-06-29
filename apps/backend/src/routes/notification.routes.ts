import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationService } from "../services/NotificationService";

const router = Router();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

router.get("/notifications", authMiddleware, notificationController.getNotifications);

router.post(
  "/notifications/generate",
  authMiddleware,
  notificationController.generateNotifications,
);

router.patch(
  "/notifications/:id/read",
  authMiddleware,
  notificationController.markAsRead,
);

router.patch(
  "/notifications/read-all",
  authMiddleware,
  notificationController.markAllAsRead,
);

export default router;