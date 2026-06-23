import { PageSection } from "../components/PageSection";
import type { AuthUser } from "../types/auth";
import "./ProfilePage.css";

type ProfilePageProps = {
  user: AuthUser;
  onLogout: () => void;
};

export function ProfilePage({ user, onLogout }: ProfilePageProps) {
  return (
    <PageSection
      title="Профиль"
      description="Информация об аккаунте селлера и текущей сессии."
    >
      <div className="profile-grid">
        <article className="profile-card">
          <div className="profile-avatar">
            {user.name.slice(0, 1).toUpperCase()}
          </div>

          <h3>{user.name}</h3>
          <p>{user.email}</p>

          <button className="danger-button" onClick={onLogout} type="button">
            Выйти из аккаунта
          </button>
        </article>

        <article className="profile-details">
          <h3>Данные аккаунта</h3>

          <dl>
            <div>
              <dt>User ID</dt>
              <dd>{user.id}</dd>
            </div>

            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>

            <div>
              <dt>Имя</dt>
              <dd>{user.name}</dd>
            </div>

            <div>
              <dt>Дата создания</dt>
              <dd>{new Date(user.createdAt).toLocaleString("ru-RU")}</dd>
            </div>

            <div>
              <dt>Последнее обновление</dt>
              <dd>{new Date(user.updatedAt).toLocaleString("ru-RU")}</dd>
            </div>
          </dl>
        </article>
      </div>
    </PageSection>
  );
}