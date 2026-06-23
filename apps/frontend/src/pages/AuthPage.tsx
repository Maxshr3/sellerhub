import { useState } from "react";
import type { FormEvent } from "react";
import { loginUser, registerUser } from "../api/authApi";
import type { AuthUser } from "../types/auth";
import "./AuthPage.css";

type AuthPageProps = {
  onAuthSuccess: (user: AuthUser, token: string) => void;
};

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("Demo Seller");
  const [email, setEmail] = useState("demo@sellerhub.ru");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.includes("@")) {
      setErrorText("Введите корректный email.");
      return;
    }

    if (password.length < 6) {
      setErrorText("Пароль должен быть не короче 6 символов.");
      return;
    }

    if (mode === "register" && name.trim().length < 2) {
      setErrorText("Имя должно содержать минимум 2 символа.");
      return;
    }

    setIsSubmitting(true);
    setErrorText("");

    const request =
      mode === "login"
        ? loginUser({
            email,
            password,
          })
        : registerUser({
            email,
            password,
            name,
          });

    request
      .then((response) => {
        onAuthSuccess(response.data.user, response.data.accessToken);
      })
      .catch(() => {
        setErrorText(
          mode === "login"
            ? "Не удалось войти. Проверь email и пароль."
            : "Не удалось зарегистрироваться. Возможно, email уже занят.",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__intro">
          <span className="auth-logo">S</span>
          <h1>SellerHUB</h1>
          <p>
            Единый кабинет селлера для аналитики, товаров, отзывов и
            marketplace-интеграций.
          </p>
        </div>

        <div className="auth-switch">
          <button
            className={mode === "login" ? "auth-switch__button--active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Вход
          </button>
          <button
            className={mode === "register" ? "auth-switch__button--active" : ""}
            onClick={() => setMode("register")}
            type="button"
          >
            Регистрация
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label>
              <span>Имя</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Введите имя"
              />
            </label>
          ) : null}

          <label>
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="demo@sellerhub.ru"
              type="email"
            />
          </label>

          <label>
            <span>Пароль</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символов"
              type="password"
            />
          </label>

          {errorText ? <p className="auth-error">{errorText}</p> : null}

          <button className="auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Отправка..."
              : mode === "login"
                ? "Войти"
                : "Создать аккаунт"}
          </button>
        </form>

        <div className="auth-note">
          <strong>Для demo:</strong>
          <p>
            Можно войти под seed-пользователем, если база заполнена через{" "}
            <code>npm run db:seed</code>.
          </p>
        </div>
      </section>
    </main>
  );
}