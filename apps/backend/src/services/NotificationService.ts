import {
  NotificationResponseDto,
  NotificationsListResponseDto,
  NotificationSeverityDto,
  NotificationTypeDto,
} from "../dto/NotificationDto";
import { NotificationRepository } from "../repositories/NotificationRepository";

type NotificationFromDatabase = Awaited<
  ReturnType<NotificationRepository["findNotifications"]>
>[number];

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getNotifications(userId: string): Promise<NotificationsListResponseDto> {
    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepository.findNotifications(userId),
      this.notificationRepository.countUnreadNotifications(userId),
    ]);

    return {
      data: notifications.map((notification) =>
        this.mapNotificationToResponse(notification),
      ),
      total: notifications.length,
      unreadCount,
    };
  }

  async generateNotifications(
    userId: string,
  ): Promise<NotificationsListResponseDto> {
    const marketplaces =
      await this.notificationRepository.findUserSellerData(userId);

    if (marketplaces.length === 0) {
      await this.createNotificationIfNotExists({
        userId,
        type: "GENERAL",
        severity: "WARNING",
        title: "Маркетплейсы не подключены",
        message:
          "Подключи Яндекс Маркет, Wildberries или Avito, чтобы SellerHUB мог собирать товары, отзывы и аналитику.",
        actionUrl: "marketplaces",
      });
    }

    for (const marketplace of marketplaces) {
      if (marketplace.status === "NEEDS_ATTENTION") {
        await this.createNotificationIfNotExists({
          userId,
          type: "MARKETPLACE_SYNC",
          severity: "WARNING",
          title: `Проверь подключение ${marketplace.name}`,
          message:
            "Маркетплейс требует внимания. Возможны проблемы с синхронизацией данных.",
          actionUrl: "marketplaces",
        });
      }

      for (const product of marketplace.products) {
        if (product.stock <= 3) {
          await this.createNotificationIfNotExists({
            userId,
            type: "LOW_STOCK",
            severity: "CRITICAL",
            title: `Критический остаток: ${product.title}`,
            message: `Осталось ${product.stock} шт. Товар может закончиться и потерять позиции.`,
            actionUrl: "products",
          });
        } else if (product.stock <= 10) {
          await this.createNotificationIfNotExists({
            userId,
            type: "LOW_STOCK",
            severity: "WARNING",
            title: `Низкий остаток: ${product.title}`,
            message: `Осталось ${product.stock} шт. Лучше пополнить запас заранее.`,
            actionUrl: "products",
          });
        }

        for (const review of product.reviews) {
          if (review.status === "NEW") {
            await this.createNotificationIfNotExists({
              userId,
              type: "NEW_REVIEW",
              severity: "INFO",
              title: `Новый отзыв: ${product.title}`,
              message: `Покупатель ${review.authorName} оставил новый отзыв. Стоит ответить.`,
              actionUrl: "reviews",
            });
          }

          if (review.status === "NEW" && review.rating <= 3) {
            await this.createNotificationIfNotExists({
              userId,
              type: "NEGATIVE_REVIEW",
              severity: "CRITICAL",
              title: `Негативный отзыв: ${product.title}`,
              message: `Оценка ${review.rating}/5. Нужно быстро ответить и проверить карточку товара.`,
              actionUrl: "reviews",
            });
          }
        }
      }
    }

    return this.getNotifications(userId);
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationResponseDto | null> {
    const notification =
      await this.notificationRepository.markNotificationAsRead(
        userId,
        notificationId,
      );

    if (!notification) {
      return null;
    }

    return this.mapNotificationToResponse(notification);
  }

  async markAllAsRead(userId: string): Promise<NotificationsListResponseDto> {
    await this.notificationRepository.markAllNotificationsAsRead(userId);

    return this.getNotifications(userId);
  }

  private async createNotificationIfNotExists(data: {
    userId: string;
    type: NotificationTypeDto;
    severity: NotificationSeverityDto;
    title: string;
    message: string;
    actionUrl?: string | null;
  }) {
    const existingNotification =
      await this.notificationRepository.findExistingUnreadNotification(
        data.userId,
        data.title,
      );

    if (existingNotification) {
      return existingNotification;
    }

    return this.notificationRepository.createNotification(data);
  }

  private mapNotificationToResponse(
    notification: NotificationFromDatabase,
  ): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      severity: notification.severity,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    };
  }
}