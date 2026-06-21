# 🚀 SellerHub 
SellerHUB - это единая аналитическая платформа для продавцов маркетплейсов (Ozon, Wildberries, Яндекс Маркет и др.), которая собирает ключевые данные о товарах, заказах, продажах и отзывах в одном интерфейсе.

Платформа помогает селлерам анализировать эффективность товаров, отслеживать прибыль, работать с отзывами и получать AI-рекомендации по улучшению продаж.

# 📦 Стек технологий
| Слой | Технологии |
| --- | --- |
| Frontend | React 18, Vite, JavaScript, React Router v6, Context API, Axios, Recharts, React Hook Form  |
| Backend | Node.js, Express.js, JWT, bcrypt, CORS, dotenv |
| Database | PostgreSQL, Prisma ORMd |
| Integrations | Ozon Seller API, Mock APIs для других маркетплейсов |
| Tools | Postman, ESLint / Prettier |
| AI Модуль | Ollama (локальные LLM модели) |


# 📋 Описание проекта

Сегодня селлеры вынуждены постоянно переключаться между личными кабинетами Ozon, Wildberries и других платформ для анализа продаж, работы с отзывами и отслеживания эффективности товаров. 
Это усложняет управление бизнесом и отнимает большое количество времени. 
SellerHUB решает эту проблему, предоставляя единый dashboard с аналитикой, AI-инструментами для генерации ответов на отзывы клиентов и рекомендациями по улучшению карточек товаров и повышению продаж.

### Целевая аудитория

- **Продавцы на маркетплейсах, мылый бизнес** - Главные пользователи продукта

### 🖥 Ключевые экраны и функциональность

#### Для пользователя (роль: `seller`)

| Экран                   | Что можно делать                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| **Главная (Dashboard)** | Общая аналитика: выручка, заказы, просмотры, конверсия, графики динамики продаж                     |
| **Товары (Products)**   | Список всех товаров из маркетплейсов, сортировка и фильтрация, базовая статистика по каждому товару |
| **Карточка товара**     | Детальная аналитика: просмотры, клики, заказы, прибыль, динамика продаж, отзывы                     |
| **AI Assistant**        | Генерация ответов на отзывы клиентов + рекомендации по улучшению карточки товара                    |
| **Отзывы (Reviews)**    | Список отзывов по товарам, фильтрация по рейтингу и товарам, быстрые AI-ответы                      |
| **Маркетплейсы**        | Подключение и управление аккаунтами (Ozon / WB / mock-интеграции)                                   |
| **Настройки профиля**   | Управление аккаунтом, смена данных, настройки уведомлений                                           |



#### 📊 Для аналитики (внутренняя логика системы)

| Экран / модуль                | Что происходит                                                    |
| ----------------------------- | ----------------------------------------------------------------- |
| **Analytics Engine (логика)** | Агрегация данных по товарам, расчет KPI (выручка, конверсия, ROI) |
| **Data Sync (интеграции)**    | Получение данных из маркетплейсов (Ozon API или mock data)        |
| **AI Processing**             | Обработка отзывов и генерация рекомендаций через LLM              |


#### AI-функциональность

| Экран            | Что можно делать                                                      |
| ---------------- | --------------------------------------------------------------------- |
| **AI Assistant** | Генерация ответов на отзывы клиентов                                  |
|                  | Анализ товара и выявление проблем (низкая конверсия, плохое описание) |
|                  | Генерация рекомендаций по улучшению продаж                            |
|                  | Помощь в формировании продающих описаний                              |

---

### ✨ Уникальные фичи

1. **Unified Dashboard** — все маркетплейсы в одном месте
2. **AI Seller Assistant** — генерация ответов и рекомендаций
3. **Product Performance Analytics** — аналитика товаров
4. **Review Intelligence** — работа с отзывами через AI
5. **Marketplace Aggregation** — объединение данных из разных источников

---

## 🗂 Сущности системы

| Сущность           | Ключевые поля                                     |
| ------------------ | ------------------------------------------------- |
| `User`             | id, name, email, password_hash, role              |
| `Marketplace`      | id, name, api_key, user_id                        |
| `Product`          | id, marketplace_id, title, price, image, category |
| `Order`            | id, product_id, quantity, total_price, created_at |
| `Analytics`        | id, product_id, views, clicks, orders, revenue    |
| `Review`           | id, product_id, rating, text, created_at          |
| `AIRecommendation` | id, product_id, type, message, created_at         |
| `AIAssistantLog`   | id, input_text, output_text, created_at           |

# Связи между сущностями
`User → Marketplace`
`Marketplace → Product`
`Product → Order`
`Product → Analytics`
`Product → Review`
`Review → AIRecommendation`
`User → AIAssistantLog`


## 👤 User Stories
```
Как селлер, я хочу видеть всю аналитику продаж в одном дашборде,
  чтобы не переключаться между разными маркетплейсами.

Как селлер, я хочу отслеживать показатели товаров (просмотры, заказы, прибыль),
  чтобы понимать, какие товары приносят больше денег.

Как селлер, я хочу видеть динамику продаж по времени,
  чтобы анализировать рост или падение спроса.

Как селлер, я хочу фильтровать и сортировать товары по прибыли и продажам,
  чтобы быстро находить самые эффективные позиции.

Как селлер, я хочу получать AI-рекомендации по улучшению карточек товаров,
  чтобы увеличивать конверсию и продажи.

Как селлер, я хочу автоматически генерировать ответы на отзывы клиентов,
  чтобы экономить время на поддержку покупателей.

Как селлер, я хочу видеть список отзывов по товарам,
  чтобы понимать проблемы клиентов и улучшать продукт.

Как селлер, я хочу подключать разные маркетплейсы в одном месте,
  чтобы управлять всеми продажами из единого интерфейса.

Как селлер, я хочу получать уведомления о снижении продаж или плохих отзывах,
  чтобы быстро реагировать на проблемы.
```


# 🧭 План по блокам

## 🟦 ЭТАП 1 - ИДЕЯ И ПРОЕКТИРОВАНИЕ (12.05)
Сформировать понимание продукта, пользователей, архитектуры и плана разработки

---

## 🟨 ЭТАП 2 - СТАРТ РАЗРАБОТКИ (26.05)
Запустить frontend и базовую структуру приложения.

- [ ] Инициализация React (Vite)
- [ ] Настройка backend (Node.js + Express)
- [ ] Создание layout (Header / Sidebar / Pages)
- [ ] Реализация Dashboard UI
- [ ] Подключение mock данных

---

## 🟩 ЭТАП 3 - ФУНКЦИОНАЛЬНОСТЬ (10.06)

- [ ] Products page + фильтры
- [ ] Product details page
- [ ] Reviews page
- [ ] Базовая аналитика (charts)
- [ ] Имитация маркетплейсов

---

## 🟥 ЭТАП 4 - AI И ФИНИШ (20.06)

- [ ] AI Assistant (ответы на отзывы)
- [ ] AI рекомендации товаров
- [ ] Финальная стилизация UI
- [ ] Подготовка демо
- [ ] Финальная проверка MVP



---

# Development Guide

## Project structure

```txt
sellerhub/
  apps/
    backend/
    frontend/
  docs/
  README.md
```

---

## Backend

Backend находится в папке:

```txt
apps/backend
```

Основные команды backend:

| Команда | Назначение |
|---|---|
| `npm install` | Установить зависимости |
| `npm run dev` | Запустить backend в development-режиме |
| `npm run build` | Собрать TypeScript |
| `npm start` | Запустить собранный backend |
| `npm test` | Запустить тесты |
| `npm run prisma:generate` | Сгенерировать Prisma Client |
| `npm run prisma:migrate` | Выполнить миграции |
| `npm run db:seed` | Заполнить БД demo-данными |
| `npm run prisma:studio` | Открыть Prisma Studio |

---

## Backend quick start

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

Backend запускается на:

```txt
http://localhost:5000
```

Health check:

```txt
http://localhost:5000/api/health
```

---

## Backend API modules

| Модуль | Endpoints |
|---|---|
| Health API | `/api/health` |
| Auth API | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` |
| Products API | `/api/products`, `/api/products/:id` |
| Analytics API | `/api/analytics/dashboard` |
| Reviews API | `/api/reviews`, `/api/reviews/:id`, `/api/reviews/:id/answer` |
| AI Assistant API | `/api/ai/recommendations`, `/api/ai/review-answer`, `/api/ai/chat`, `/api/ai/logs` |

---

## Documentation

| Документ | Назначение |
|---|---|
| `docs/ARCHITECTURE.md` | Архитектура проекта |
| `docs/BACKEND_SETUP.md` | Инструкция запуска backend |
| `docs/API_REFERENCE.md` | Документация API |
| `docs/TESTING.md` | Документация тестирования |
| `docs/PROJECT_PLAN.md` | План разработки |

---

## Current backend status

| Модуль | Статус |
|---|---|
| Node.js + TypeScript | Done |
| Express API | Done |
| PostgreSQL | Done |
| Prisma migrations | Done |
| Seed data | Done |
| Health API | Done |
| Auth API | Done |
| Products API | Done |
| Analytics API | Done |
| Reviews API | Done |
| AI Assistant API | Done |
| Integration tests | Done |