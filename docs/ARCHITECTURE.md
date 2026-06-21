# Архитектура SellerHUB

## 1. Назначение проекта

SellerHUB — аналитическая платформа для продавцов маркетплейсов.  
Система собирает данные о товарах, заказах, продажах, отзывах и показывает их в едином интерфейсе.

Главная цель проекта — дать селлеру удобный dashboard для анализа продаж и принятия решений.

---

## 2. Основные модули системы

| Модуль | Назначение |
|---|---|
| Auth Module | Регистрация, авторизация, JWT |
| Users Module | Работа с пользователями |
| Marketplaces Module | Подключение маркетплейсов |
| Products Module | Работа с товарами |
| Orders Module | Работа с заказами |
| Analytics Module | Расчёт KPI, выручки, конверсии |
| Reviews Module | Работа с отзывами |
| AI Assistant Module | Генерация ответов и рекомендаций |
| Mock Integration Module | Имитация внешних API маркетплейсов |

---

## 3. Архитектурный подход

Проект использует слоистую архитектуру.

```txt
Client UI
   ↓
HTTP API
   ↓
Controllers
   ↓
Use Cases / Services
   ↓
Repositories
   ↓
Database

Backend-слои
| Слой               | Что делает                                    | Что нельзя делать               |
| ------------------ | --------------------------------------------- | ------------------------------- |
| Controller         | Принимает HTTP-запрос и возвращает HTTP-ответ | Нельзя писать бизнес-логику     |
| Service / Use Case | Выполняет бизнес-логику                       | Нельзя напрямую работать с HTTP |
| Repository         | Работает с базой данных                       | Нельзя принимать req/res        |
| Database           | PostgreSQL через Prisma                       | Нельзя хранить бизнес-логику    |
| DTO / Validation   | Проверяет входные данные                      | Нельзя обращаться к базе        |


Frontend-слои
| Слой       | Что делает                     |
| ---------- | ------------------------------ |
| Pages      | Страницы приложения            |
| Components | Переиспользуемые UI-компоненты |
| API Layer  | Запросы к backend              |
| Context    | Глобальное состояние           |
| Hooks      | Переиспользуемая логика        |
| Utils      | Вспомогательные функции        |


Основные сущности
| Сущность         | Описание                 |
| ---------------- | ------------------------ |
| User             | Пользователь системы     |
| Marketplace      | Подключенный маркетплейс |
| Product          | Товар продавца           |
| Order            | Заказ                    |
| Analytics        | Метрики товара           |
| Review           | Отзыв покупателя         |
| AIRecommendation | AI-рекомендация          |
| AIAssistantLog   | История запросов к AI    |


Связи между сущностями
User 1 ─── * Marketplace
Marketplace 1 ─── * Product
Product 1 ─── * Order
Product 1 ─── * Review
Product 1 ─── * Analytics
Product 1 ─── * AIRecommendation
User 1 ─── * AIAssistantLog

---

## 9. Backend-структура проекта

```txt
apps/backend/src/
  config/
  controllers/
  database/
  dto/
  middlewares/
  repositories/
  routes/
  services/
  utils/
  app.ts
  main.ts
```

| Папка | Назначение |
|---|---|
| `config` | Конфигурация приложения и переменные окружения |
| `controllers` | Обработка HTTP-запросов |
| `services` | Бизнес-логика приложения |
| `repositories` | Работа с базой данных |
| `routes` | Описание API-маршрутов |
| `middlewares` | Промежуточная обработка запросов |
| `database` | Подключение к базе данных |
| `dto` | Описание входных и выходных данных |
| `utils` | Вспомогательные функции |

---

## 10. Принцип разделения ответственности на backend

```txt
Request
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

| Слой | Ответственность |
|---|---|
| Route | Направляет запрос в нужный controller |
| Controller | Получает HTTP-запрос и возвращает HTTP-ответ |
| Service | Выполняет бизнес-логику |
| Repository | Получает и сохраняет данные |
| Database | Хранит данные |

---

## 11. Пример работы endpoint `/api/health`

```txt
GET /api/health
  ↓
health.routes.ts
  ↓
HealthController.getHealth()
  ↓
HealthService.getStatus()
  ↓
JSON response
```

Endpoint `/api/health` используется для проверки работоспособности backend-сервера.

---

## 12. TypeScript-конфигурация backend

В backend используются два TypeScript-конфига.

| Файл | Назначение |
|---|---|
| `tsconfig.json` | Основная конфигурация для разработки и тестов |
| `tsconfig.build.json` | Конфигурация production-сборки |
| `tests` | Используются только для проверки кода |
| `dist` | Скомпилированный JavaScript-код для запуска |

Разделение нужно для того, чтобы тестовые файлы не попадали в production-сборку.

```txt
Development:
src + tests
  ↓
tsconfig.json
  ↓
npm test

Production build:
src
  ↓
tsconfig.build.json
  ↓
dist
  ↓
npm start
```