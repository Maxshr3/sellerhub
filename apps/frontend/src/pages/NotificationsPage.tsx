import { useEffect, useState } from "react";
import {
  generateNotifications,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationsApi";
import { PageSection } from "../components/PageSection";
import type { SellerNotification } from "../types/notification";
import "./NotificationsPage.css";

const severityLabels = {
  INFO: "Информация",
  SUCCESS: "Успех",
  WARNING: "Важно",
  CRITICAL: "Критично",
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  function loadNotifications() {
    setErrorText("");

    getNotifications()
      .then((response) => {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить уведомления.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getNotifications()
      .then((response) => {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      })
      .catch(() => {
        setErrorText("Не удалось загрузить уведомления.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function handleGenerate() {
    setIsGenerating(true);
    setErrorText("");
    setSuccessText("");

    generateNotifications()
      .then((response) => {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
        setSuccessText("Уведомления обновлены.");
      })
      .catch(() => {
        setErrorText("Не удалось сгенерировать уведомления.");
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }

  function handleMarkAsRead(id: string) {
    markNotificationAsRead(id)
      .then(() => {
        loadNotifications();
      })
      .catch(() => {
        setErrorText("Не удалось отметить уведомление прочитанным.");
      });
  }

  function handleMarkAllAsRead() {
    markAllNotificationsAsRead()
      .then((response) => {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
        setSuccessText("Все уведомления прочитаны.");
      })
      .catch(() => {
        setErrorText("Не удалось прочитать все уведомления.");
      });
  }

  return (
    <>
      <PageSection
        title="Notification Center"
        description="Центр уведомлений по остаткам, отзывам, маркетплейсам и важным событиям SellerHUB."
      >
        {errorText ? <p className="error-text">{errorText}</p> : null}
        {successText ? <p className="success-text">{successText}</p> : null}

        <div className="notifications-toolbar">
          <article>
            <span>Непрочитанные</span>
            <strong>{unreadCount}</strong>
          </article>

          <article>
            <span>Всего</span>
            <strong>{notifications.length}</strong>
          </article>

          <div className="notifications-actions">
            <button
              className="primary-button"
              disabled={isGenerating}
              onClick={handleGenerate}
              type="button"
            >
              {isGenerating ? "Обновляю..." : "Обновить уведомления"}
            </button>

            <button
              className="secondary-button"
              onClick={handleMarkAllAsRead}
              type="button"
            >
              Прочитать все
            </button>
          </div>
        </div>
      </PageSection>

      <PageSection title="Список уведомлений">
        {isLoading ? <p>Загрузка уведомлений...</p> : null}

        <div className="notifications-list">
          {notifications.map((notification) => (
            <article
              className={
                notification.isRead
                  ? "notification-card notification-card--read"
                  : `notification-card notification-card--${notification.severity.toLowerCase()}`
              }
              key={notification.id}
            >
              <div className="notification-card__top">
                <div>
                  <span>{severityLabels[notification.severity]}</span>
                  <h3>{notification.title}</h3>
                </div>

                {!notification.isRead ? (
                  <button
                    className="secondary-button"
                    onClick={() => handleMarkAsRead(notification.id)}
                    type="button"
                  >
                    Прочитано
                  </button>
                ) : (
                  <span className="read-badge">Прочитано</span>
                )}
              </div>

              <p>{notification.message}</p>

              <footer>
                <span>{notification.type}</span>
                <time>
                  {new Date(notification.createdAt).toLocaleString("ru-RU")}
                </time>
              </footer>
            </article>
          ))}

          {!isLoading && notifications.length === 0 ? (
            <div className="empty-state">
              <strong>Уведомлений пока нет</strong>
              <p>Нажми “Обновить уведомления”, чтобы SellerHUB проверил данные.</p>
            </div>
          ) : null}
        </div>
      </PageSection>
    </>
  );
}