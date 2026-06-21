# Backend Setup Guide

## 1. Назначение backend

Backend SellerHUB отвечает за:

| Модуль | Назначение |
|---|---|
| Auth API | Регистрация, логин, JWT |
| Products API | Получение и фильтрация товаров |
| Analytics API | Расчёт dashboard-метрик |
| Reviews API | Работа с отзывами |
| AI Assistant API | Mock-AI рекомендации и ответы |
| Health API | Проверка сервера и подключения к БД |

---

## 2. Технологии backend

| Технология | Назначение |
|---|---|
| Node.js | Среда выполнения |
| TypeScript | Строгая типизация |
| Express | HTTP API |
| PostgreSQL | Реляционная база данных |
| Prisma 7 | ORM, миграции, типизированный доступ к БД |
| bcrypt | Хэширование паролей |
| jsonwebtoken | JWT access token |
| Vitest | Тестирование |
| Supertest | Интеграционные HTTP-тесты |
| dotenv | Переменные окружения |
| CORS | Доступ frontend к backend |

---

## 3. Требования

Перед запуском нужно установить:

| Инструмент | Версия / комментарий |
|---|---|
| Node.js | 20+ |
| npm | Устанавливается вместе с Node.js |
| PostgreSQL | Локальная база данных |
| Git | Для клонирования проекта |
| pgAdmin 4 | Необязательно, но удобно для просмотра БД |

---

## 4. Установка зависимостей

Перейти в backend:

```bash
cd apps/backend
```

Установить зависимости:

```bash
npm install
```

---

## 5. Настройка переменных окружения

Создать файл:

```txt
apps/backend/.env
```

Пример содержимого:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:password@localhost:5433/sellerhub_db?schema=public"

JWT_ACCESS_SECRET="sellerhub_super_secret_access_key"
JWT_ACCESS_EXPIRES_IN="7d"
```

Если PostgreSQL работает на порту `5432`, нужно заменить `5433` на `5432`.

---

## 6. Создание базы данных

В PostgreSQL нужно создать базу:

```txt
sellerhub_db
```

Через pgAdmin:

1. Открыть pgAdmin 4.
2. Раскрыть сервер PostgreSQL.
3. Нажать правой кнопкой на `Databases`.
4. Выбрать `Create → Database`.
5. Ввести название:

```txt
sellerhub_db
```

6. Нажать `Save`.

---

## 7. Prisma

Сгенерировать Prisma Client:

```bash
npm run prisma:generate
```

Выполнить миграции:

```bash
npm run prisma:migrate
```

Заполнить базу demo-данными:

```bash
npm run db:seed
```

Открыть Prisma Studio:

```bash
npm run prisma:studio
```

---

## 8. Запуск backend

Development-запуск:

```bash
npm run dev
```

Backend будет доступен по адресу:

```txt
http://localhost:5000
```

Проверка:

```txt
http://localhost:5000/api/health
```

---

## 9. Production-сборка

Собрать TypeScript:

```bash
npm run build
```

Запустить собранный backend:

```bash
npm start
```

---

## 10. Тесты

Запустить все тесты:

```bash
npm test
```

Тестируются:

| Файл | Что проверяет |
|---|---|
| `health.test.ts` | Health endpoint и подключение к БД |
| `products.test.ts` | Products API |
| `analytics.test.ts` | Analytics API |
| `reviews.test.ts` | Reviews API |
| `ai.test.ts` | AI Assistant API |
| `auth.test.ts` | Auth API |

---

## 11. Полная последовательность запуска с нуля

```bash
cd apps/backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm test
npm run build
npm run dev
```

После этого открыть:

```txt
http://localhost:5000/api/health
```

Ожидаемый ответ:

```json
{
  "status": "ok",
  "service": "sellerhub-backend",
  "database": "connected",
  "timestamp": "..."
}
```