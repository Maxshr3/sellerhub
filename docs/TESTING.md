# Testing Guide

## 1. Назначение тестов

В проекте используются интеграционные тесты backend API.

Тесты проверяют не отдельные функции, а полный путь запроса:

```txt
HTTP request
  ↓
Express route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

---

## 2. Используемые инструменты

| Инструмент | Назначение |
|---|---|
| Vitest | Запуск тестов |
| Supertest | HTTP-запросы к Express app |
| Prisma | Работа с тестовыми данными |
| PostgreSQL | Реальная база данных |

---

## 3. Запуск тестов

Перейти в backend:

```bash
cd apps/backend
```

Запустить тесты:

```bash
npm test
```

---

## 4. Структура тестов

```txt
apps/backend/tests/
  health.test.ts
  products.test.ts
  analytics.test.ts
  reviews.test.ts
  ai.test.ts
  auth.test.ts
```

---

## 5. Что проверяется

| Тестовый файл | Проверяемый модуль |
|---|---|
| `health.test.ts` | Health API |
| `products.test.ts` | Products API |
| `analytics.test.ts` | Analytics API |
| `reviews.test.ts` | Reviews API |
| `ai.test.ts` | AI Assistant API |
| `auth.test.ts` | Auth API |

---

## 6. Подход к тестовым данным

В тестах используется подход:

```txt
beforeAll
  ↓
создать тестовые данные
  ↓
запустить HTTP-запросы
  ↓
afterAll
  ↓
удалить тестовые данные
```

Так тесты не зависят от ручного состояния базы данных.

---

## 7. Почему тесты интеграционные

Интеграционные тесты выбраны потому что проект учебный и важно показать работу всего backend-потока.

| Unit tests | Integration tests |
|---|---|
| Проверяют отдельную функцию | Проверяют работу API целиком |
| Быстрее | Реалистичнее |
| Не требуют БД | Используют реальную PostgreSQL |
| Лучше для маленькой логики | Лучше для демонстрации backend API |

---

## 8. Частые ошибки

### Ошибка `Unique constraint failed`

Причина: тестовые данные остались в базе после неудачного запуска.

Решение:

```bash
npm run db:seed
npm test
```

---

### Ошибка подключения к базе

Проверить:

| Что | Где |
|---|---|
| PostgreSQL запущен | Windows Services / pgAdmin |
| Порт правильный | `.env` |
| База создана | pgAdmin |
| `DATABASE_URL` правильный | `.env` |

---

### Ошибка Prisma Client

Решение:

```bash
npm run prisma:generate
npm run build
```