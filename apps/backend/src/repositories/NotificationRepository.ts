import { prisma } from "../database/prisma";
import {
  NotificationSeverityDto,
  NotificationTypeDto,
} from "../dto/NotificationDto";

export class NotificationRepository {
  async findNotifications(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          isRead: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 50,
    });
  }

  async countUnreadNotifications(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async findExistingUnreadNotification(userId: string, title: string) {
    return prisma.notification.findFirst({
      where: {
        userId,
        title,
        isRead: false,
      },
    });
  }

  async createNotification(data: {
    userId: string;
    type: NotificationTypeDto;
    severity: NotificationSeverityDto;
    title: string;
    message: string;
    actionUrl?: string | null;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl ?? null,
      },
    });
  }

  async findUserSellerData(userId: string) {
    return prisma.marketplace.findMany({
      where: {
        userId,
      },
      include: {
        products: {
          include: {
            reviews: true,
          },
        },
      },
    });
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return null;
    }

    return prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllNotificationsAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return this.findNotifications(userId);
  }
}