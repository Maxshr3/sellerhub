# Run SellerHUB Project

## 1. Назначение

SellerHUB — учебный fullstack-проект для селлеров маркетплейсов.

Проект состоит из двух частей:

| Часть | Папка | Назначение |
|---|---|---|
| Backend | `apps/backend` | REST API, PostgreSQL, Prisma, Auth, Analytics, Reviews, AI Assistant |
| Frontend | `apps/frontend` | React dashboard для работы с данными backend |

---

## 2. Требования

Для запуска нужны:

| Инструмент | Назначение |
|---|---|
| Node.js 20+ | Запуск backend/frontend |
| npm | Установка зависимостей |
| PostgreSQL | База данных |
| Git | Клонирование проекта |

---

## 3. Настройка PostgreSQL

Создать базу данных:

```txt
sellerhub_db
```

Пример подключения:

```txt
postgresql://postgres:password@localhost:5432/sellerhub_db?schema=public
```

Если PostgreSQL запущен на другом порту, нужно изменить порт в `DATABASE_URL`.

---

## 4. Настройка backend

Перейти в backend:

```bash
cd apps/backend
```

Установить зависимости:

```bash
npm install
```

Создать файл:

```txt
apps/backend/.env
```

Пример `.env`:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:password@localhost:5432/sellerhub_db?schema=public"

JWT_ACCESS_SECRET="sellerhub_super_secret_access_key"
JWT_ACCESS_EXPIRES_IN="7d"
```

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

Запустить backend:

```bash
npm run dev
```

Backend будет доступен:

```txt
http://localhost:5000
```

Проверка:

```txt
http://localhost:5000/api/health
```

---

## 5. Настройка frontend

Открыть второй терминал.

Перейти во frontend:

```bash
cd apps/frontend
```

Установить зависимости:

```bash
npm install
```

Создать файл:

```txt
apps/frontend/.env
```

Пример `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Запустить frontend:

```bash
npm run dev
```

Frontend будет доступен:

```txt
http://localhost:5173
```

---

## 6. Полный запуск

Терминал 1:

```bash
cd apps/backend
npm run dev
```

Терминал 2:

```bash
cd apps/frontend
npm run dev
```

Открыть:

```txt
http://localhost:5173
```

---

## 7. Проверка backend

```bash
cd apps/backend
npm test
npm run build
```

---

## 8. Проверка frontend

```bash
cd apps/frontend
npm run build
```

---

## 9. Основные страницы frontend

| Страница | Назначение |
|---|---|
| Dashboard | Общая аналитика |
| Products | Таблица товаров и поиск |
| Reviews | Работа с отзывами и ответами |
| AI Assistant | Mock-AI рекомендации и чат |

---

## 10. Основные backend endpoints

| Модуль | Endpoint |
|---|---|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Products | `GET /api/products` |
| Analytics | `GET /api/analytics/dashboard` |
| Reviews | `GET /api/reviews`, `PATCH /api/reviews/:id/answer` |
| AI Assistant | `GET /api/ai/recommendations`, `POST /api/ai/chat` |