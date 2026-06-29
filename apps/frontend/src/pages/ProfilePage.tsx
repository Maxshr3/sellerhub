import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { updateProfile } from "../api/profileApi";
import { PageSection } from "../components/PageSection";
import type { AuthUser } from "../types/auth";
import { MarketplacesPage } from "./MarketplacesPage";
import "./ProfilePage.css";

type ProfilePageProps = {
  user: AuthUser;
  onProfileUpdate: (user: AuthUser) => void;
  onLogout: () => void;
};

const accentColors = ["#38bdf8", "#0ea5e9", "#22c55e", "#f97316", "#a855f7"];

export function ProfilePage({
  user,
  onProfileUpdate,
  onLogout,
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "marketplaces">(
    "profile",
  );

  const [form, setForm] = useState({
    name: user.name,
    companyName: user.companyName ?? "",
    roleTitle: user.roleTitle ?? "",
    phone: user.phone ?? "",
    theme: user.theme as "LIGHT" | "DARK" | "SYSTEM",
    accentColor: user.accentColor,
    emailReports: user.emailReports,
    pushAlerts: user.pushAlerts,
    avatarUrl: user.avatarUrl,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  function handleChange(name: string, value: string | boolean | null) {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorText("Можно загрузить только изображение.");
      return;
    }

    if (file.size > 350_000) {
      setErrorText("Фото слишком большое. Выбери изображение до 350 KB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleChange("avatarUrl", reader.result);
        setErrorText("");
      }
    };

    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      setErrorText("Имя должно содержать минимум 2 символа.");
      return;
    }

    setIsSaving(true);
    setErrorText("");
    setSuccessText("");

    updateProfile({
      name: form.name.trim(),
      companyName: form.companyName.trim() || null,
      roleTitle: form.roleTitle.trim() || null,
      phone: form.phone.trim() || null,
      theme: form.theme,
      accentColor: form.accentColor,
      emailReports: form.emailReports,
      pushAlerts: form.pushAlerts,
      avatarUrl: form.avatarUrl,
    })
      .then((response) => {
        onProfileUpdate(response.data);
        setSuccessText("Профиль обновлён.");
      })
      .catch(() => {
        setErrorText("Не удалось обновить профиль.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  return (
    <>
      <PageSection
        title="Profile & Settings"
        description="Профиль, настройки аккаунта и подключение маркетплейсов."
      >
        <div className="profile-tabs">
          <button
            className={activeTab === "profile" ? "profile-tabs__active" : ""}
            onClick={() => setActiveTab("profile")}
            type="button"
          >
            Профиль
          </button>

          <button
            className={
              activeTab === "marketplaces" ? "profile-tabs__active" : ""
            }
            onClick={() => setActiveTab("marketplaces")}
            type="button"
          >
            Маркетплейсы
          </button>
        </div>
      </PageSection>

      {activeTab === "profile" ? (
        <>
          <PageSection
            title="Профиль"
            description="Настройка аккаунта, компании, аватара и внешнего вида SellerHUB."
          >
            {errorText ? <p className="error-text">{errorText}</p> : null}
            {successText ? <p className="success-text">{successText}</p> : null}

            <div className="profile-grid">
              <article
                className="profile-card"
                style={{
                  borderColor: form.accentColor,
                }}
              >
                <div
                  className="profile-avatar"
                  style={{
                    background: form.accentColor,
                  }}
                >
                  {form.avatarUrl ? (
                    <img alt="Аватар пользователя" src={form.avatarUrl} />
                  ) : (
                    form.name.slice(0, 1).toUpperCase()
                  )}
                </div>

                <h3>{form.name}</h3>
                <p>{user.email}</p>

                {form.companyName ? (
                  <span className="profile-chip">{form.companyName}</span>
                ) : null}

                {form.roleTitle ? (
                  <span className="profile-chip">{form.roleTitle}</span>
                ) : null}

                <button
                  className="danger-button"
                  onClick={onLogout}
                  type="button"
                >
                  Выйти из аккаунта
                </button>
              </article>

              <form className="profile-form" onSubmit={handleSubmit}>
                <h3>Редактирование профиля</h3>

                <label>
                  <span>Фото профиля</span>
                  <input
                    accept="image/*"
                    onChange={handleAvatarChange}
                    type="file"
                  />
                </label>

                {form.avatarUrl ? (
                  <button
                    className="secondary-button"
                    onClick={() => handleChange("avatarUrl", null)}
                    type="button"
                  >
                    Удалить фото
                  </button>
                ) : null}

                <label>
                  <span>Имя</span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Компания</span>
                  <input
                    value={form.companyName}
                    onChange={(event) =>
                      handleChange("companyName", event.target.value)
                    }
                    placeholder="Например: SellerHUB Store"
                  />
                </label>

                <label>
                  <span>Должность</span>
                  <input
                    value={form.roleTitle}
                    onChange={(event) =>
                      handleChange("roleTitle", event.target.value)
                    }
                    placeholder="Например: Marketplace Manager"
                  />
                </label>

                <label>
                  <span>Телефон</span>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    placeholder="+7..."
                  />
                </label>

                <div className="profile-form__row">
                  <label>
                    <span>Тема</span>
                    <select
                      value={form.theme}
                      onChange={(event) =>
                        handleChange("theme", event.target.value)
                      }
                    >
                      <option value="SYSTEM">Как в системе</option>
                      <option value="LIGHT">Светлая</option>
                      <option value="DARK">Тёмная</option>
                    </select>
                  </label>

                  <label>
                    <span>Акцентный цвет</span>
                    <input
                      value={form.accentColor}
                      onChange={(event) =>
                        handleChange("accentColor", event.target.value)
                      }
                      type="color"
                    />
                  </label>
                </div>

                <div className="accent-list">
                  {accentColors.map((color) => (
                    <button
                      aria-label={`Выбрать цвет ${color}`}
                      key={color}
                      onClick={() => handleChange("accentColor", color)}
                      style={{
                        background: color,
                      }}
                      type="button"
                    />
                  ))}
                </div>

                <label className="profile-checkbox">
                  <input
                    checked={form.emailReports}
                    onChange={(event) =>
                      handleChange("emailReports", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Получать email-отчёты</span>
                </label>

                <label className="profile-checkbox">
                  <input
                    checked={form.pushAlerts}
                    onChange={(event) =>
                      handleChange("pushAlerts", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Получать важные уведомления</span>
                </label>

                <button
                  className="primary-button"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Сохраняю..." : "Сохранить профиль"}
                </button>
              </form>
            </div>
          </PageSection>

          <PageSection
            title="Данные аккаунта"
            description="Служебная информация текущего пользователя."
          >
            <article className="profile-details">
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
                  <dt>Дата создания</dt>
                  <dd>{new Date(user.createdAt).toLocaleString("ru-RU")}</dd>
                </div>

                <div>
                  <dt>Последнее обновление</dt>
                  <dd>{new Date(user.updatedAt).toLocaleString("ru-RU")}</dd>
                </div>
              </dl>
            </article>
          </PageSection>
        </>
      ) : null}

      {activeTab === "marketplaces" ? <MarketplacesPage /> : null}
    </>
  );
}