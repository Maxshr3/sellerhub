export type NotificationType =
  | "LOW_STOCK"
  | "NEW_REVIEW"
  | "NEGATIVE_REVIEW"
  | "MARKETPLACE_SYNC"
  | "PROFILE"
  | "GENERAL";

export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

export type SellerNotification = {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = {
  data: SellerNotification[];
  total: number;
  unreadCount: number;
};

export type NotificationResponse = {
  data: SellerNotification;
};