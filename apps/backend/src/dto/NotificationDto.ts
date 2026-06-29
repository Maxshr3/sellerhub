export type NotificationTypeDto =
  | "LOW_STOCK"
  | "NEW_REVIEW"
  | "NEGATIVE_REVIEW"
  | "MARKETPLACE_SYNC"
  | "PROFILE"
  | "GENERAL";

export type NotificationSeverityDto =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "CRITICAL";

export type NotificationResponseDto = {
  id: string;
  type: NotificationTypeDto;
  severity: NotificationSeverityDto;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsListResponseDto = {
  data: NotificationResponseDto[];
  total: number;
  unreadCount: number;
};