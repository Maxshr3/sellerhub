import { apiGet, apiPatch, apiPost } from "./client";
import type {
  NotificationResponse,
  NotificationsResponse,
} from "../types/notification";

export function getNotifications() {
  return apiGet<NotificationsResponse>("/notifications");
}

export function generateNotifications() {
  return apiPost<NotificationsResponse>("/notifications/generate");
}

export function markNotificationAsRead(id: string) {
  return apiPatch<NotificationResponse>(`/notifications/${id}/read`);
}

export function markAllNotificationsAsRead() {
  return apiPatch<NotificationsResponse>("/notifications/read-all");
}