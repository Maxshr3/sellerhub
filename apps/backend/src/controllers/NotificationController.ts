import { Request, Response } from "express";
import { AuthLocals } from "../middlewares/auth.middleware";
import { NotificationService } from "../services/NotificationService";

type NotificationParams = {
  id: string;
};

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  getNotifications = async (
    _req: Request,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const notifications = await this.notificationService.getNotifications(
      authUser.userId,
    );

    return res.status(200).json(notifications);
  };

  generateNotifications = async (
    _req: Request,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const notifications = await this.notificationService.generateNotifications(
      authUser.userId,
    );

    return res.status(200).json(notifications);
  };

  markAsRead = async (
    req: Request<NotificationParams>,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const notification = await this.notificationService.markAsRead(
      authUser.userId,
      req.params.id,
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      data: notification,
    });
  };

  markAllAsRead = async (
    _req: Request,
    res: Response<unknown, AuthLocals>,
  ) => {
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const notifications = await this.notificationService.markAllAsRead(
      authUser.userId,
    );

    return res.status(200).json(notifications);
  };
}