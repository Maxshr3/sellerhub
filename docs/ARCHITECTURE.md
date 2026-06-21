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
---

## 13. База данных

В проекте используется PostgreSQL.  
Для работы с базой данных используется Prisma ORM.

Prisma выполняет несколько задач:

| Задача | Описание |
|---|---|
| Описание моделей | Модели описываются в `schema.prisma` |
| Миграции | Prisma создаёт SQL-миграции |
| Типизация | Prisma Client даёт типизированный доступ к БД |
| Связи | Связи между таблицами описываются на уровне схемы |
| Seed-данные | Prisma позволяет заполнять базу тестовыми данными |

---

## 14. Таблицы базы данных

| Таблица | Назначение |
|---|---|
| `users` | Пользователи платформы |
| `marketplaces` | Подключённые маркетплейсы пользователя |
| `products` | Товары селлера |
| `orders` | Заказы по товарам |
| `reviews` | Отзывы покупателей |
| `product_analytics` | Метрики по товарам |
| `ai_recommendations` | AI-рекомендации |
| `ai_assistant_logs` | История запросов к AI |

---

## 15. ERD-диаграмма базы данных

```txt
User
 ├── Marketplace
 │    ├── Product
 │    │    ├── Order
 │    │    ├── Review
 │    │    ├── ProductAnalytics
 │    │    └── AIRecommendation
 │    └── Order
 └── AIAssistantLog
```

---

## 16. Связи между таблицами

| Связь | Тип | Описание |
|---|---|---|
| `User → Marketplace` | One-to-Many | Один пользователь может подключить несколько маркетплейсов |
| `Marketplace → Product` | One-to-Many | Один маркетплейс содержит много товаров |
| `Marketplace → Order` | One-to-Many | Один маркетплейс содержит много заказов |
| `Product → Order` | One-to-Many | Один товар может быть в нескольких заказах |
| `Product → Review` | One-to-Many | Один товар может иметь много отзывов |
| `Product → ProductAnalytics` | One-to-Many | У одного товара может быть аналитика по разным датам |
| `Product → AIRecommendation` | One-to-Many | Для одного товара может быть много AI-рекомендаций |
| `User → AIAssistantLog` | One-to-Many | Один пользователь может иметь историю AI-запросов |

---

## 17. Почему используется Prisma

Prisma выбран потому что он:

| Причина | Польза для проекта |
|---|---|
| Даёт типизированный доступ к БД | Меньше ошибок при работе с данными |
| Поддерживает миграции | Можно версионировать изменения схемы |
| Удобно описывает связи | Видно структуру предметной области |
| Хорошо работает с TypeScript | Backend становится надёжнее |
| Упрощает тестирование | Можно быстро готовить тестовые данные |

---

## 18. Prisma 7 config

В проекте используется Prisma 7.

В Prisma 7 строка подключения к базе хранится не в `schema.prisma`, а в `prisma.config.ts`.

| Файл | Назначение |
|---|---|
| `prisma/schema.prisma` | Описание моделей и связей |
| `prisma.config.ts` | Конфигурация Prisma CLI |
| `.env` | Локальные переменные окружения |
| `.env.example` | Пример переменных окружения для GitHub |
| `prisma/migrations` | История изменений структуры БД |
| `prisma/seed.ts` | Скрипт заполнения базы демо-данными |

---

## 19. Работа backend с базой данных

```txt
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma Client
  ↓
PostgreSQL
```

На текущем этапе endpoint `/api/health` проверяет не только работу backend-сервера, но и подключение к PostgreSQL.

```txt
GET /api/health
  ↓
HealthController
  ↓
HealthService
  ↓
Prisma query SELECT 1
  ↓
PostgreSQL
```

---

## 20. Seed-данные

Для локальной разработки используется seed-скрипт:

```txt
apps/backend/prisma/seed.ts
```

Seed-скрипт создаёт демонстрационные данные:

| Сущность | Количество |
|---|---:|
| User | 1 |
| Marketplace | 1 |
| Product | 3 |
| Order | 4 |
| Review | 3 |
| ProductAnalytics | 3 |
| AIRecommendation | 3 |
| AIAssistantLog | 2 |

Seed нужен для того, чтобы после запуска проекта backend и frontend могли работать с готовыми демонстрационными данными.

Команда запуска:

```bash
npm run db:seed
```

Перед повторным заполнением seed очищает старые демо-данные, чтобы не создавать дубликаты.

---

## 21. Products API

Модуль Products реализован по слоистой архитектуре.

```txt
GET /api/products
  ↓
product.routes.ts
  ↓
ProductController
  ↓
ProductService
  ↓
ProductRepository
  ↓
Prisma Client
  ↓
PostgreSQL
```

---

## 22. Структура Products Module

| Файл | Назначение |
|---|---|
| `src/routes/product.routes.ts` | HTTP-маршруты товаров |
| `src/controllers/ProductController.ts` | Приём HTTP-запросов и формирование HTTP-ответов |
| `src/services/ProductService.ts` | Бизнес-логика товаров |
| `src/repositories/ProductRepository.ts` | Запросы к PostgreSQL через Prisma |
| `src/dto/ProductDto.ts` | Типы входных и выходных данных |
| `tests/products.test.ts` | Интеграционные тесты Products API |

---

## 23. Endpoints Products API

| Метод | URL | Назначение |
|---|---|---|
| `GET` | `/api/products` | Получить список товаров |
| `GET` | `/api/products?search=лампа` | Поиск товаров по названию |
| `GET` | `/api/products?isActive=true` | Фильтр активных товаров |
| `GET` | `/api/products/:id` | Получить товар по id |

---

## 24. Ответственность слоёв Products API

| Слой | Ответственность |
|---|---|
| Route | Описывает URL и HTTP-метод |
| Controller | Читает query params и path params |
| Service | Преобразует данные в формат API |
| Repository | Выполняет Prisma-запросы |
| Database | Хранит товары и связи с маркетплейсами |

---

## 25. Тестирование Products API

Для Products API написаны интеграционные тесты.

| Тест | Что проверяет |
|---|---|
| `should return products list` | API возвращает список товаров |
| `should filter products by search query` | Поиск по названию работает |
| `should return product by id` | Можно получить один товар |
| `should return 404 for missing product` | Для несуществующего товара возвращается 404 |

---

## 26. Analytics API

Модуль Analytics реализует расчёт показателей для dashboard.

```txt
GET /api/analytics/dashboard
  ↓
analytics.routes.ts
  ↓
AnalyticsController
  ↓
AnalyticsService
  ↓
AnalyticsRepository
  ↓
Prisma Client
  ↓
PostgreSQL
```

---

## 27. Структура Analytics Module

| Файл | Назначение |
|---|---|
| `src/routes/analytics.routes.ts` | HTTP-маршруты аналитики |
| `src/controllers/AnalyticsController.ts` | Приём HTTP-запросов и возврат аналитики |
| `src/services/AnalyticsService.ts` | Расчёт и подготовка показателей dashboard |
| `src/repositories/AnalyticsRepository.ts` | Агрегирующие запросы к PostgreSQL через Prisma |
| `src/dto/AnalyticsDto.ts` | Типы данных для ответа API |
| `tests/analytics.test.ts` | Интеграционный тест Analytics API |

---

## 28. Endpoint Analytics API

| Метод | URL | Назначение |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Получить сводную аналитику для dashboard |

---

## 29. Метрики dashboard

| Метрика | Описание |
|---|---|
| `totalRevenue` | Общая выручка по заказам |
| `totalOrders` | Общее количество заказов |
| `totalSoldItems` | Количество проданных единиц |
| `totalProducts` | Количество товаров |
| `activeProducts` | Количество активных товаров |
| `lowStockProducts` | Количество товаров с остатком 10 или меньше |
| `averageRating` | Средняя оценка по отзывам |
| `totalViews` | Общее количество просмотров товаров |
| `conversionRate` | Конверсия из просмотров в заказы |

---

## 30. Почему аналитика вынесена в отдельный модуль

Analytics API не должен смешиваться с Products API, потому что он решает другую задачу.

| Модуль | Ответственность |
|---|---|
| Products API | Получение и фильтрация товаров |
| Analytics API | Расчёт показателей и dashboard-метрик |

Такое разделение упрощает поддержку проекта и показывает модульную архитектуру.

---

## 31. Reviews API

Модуль Reviews отвечает за работу с отзывами покупателей.

```txt
GET /api/reviews
  ↓
review.routes.ts
  ↓
ReviewController
  ↓
ReviewService
  ↓
ReviewRepository
  ↓
Prisma Client
  ↓
PostgreSQL
```

---

## 32. Структура Reviews Module

| Файл | Назначение |
|---|---|
| `src/routes/review.routes.ts` | HTTP-маршруты отзывов |
| `src/controllers/ReviewController.ts` | Приём HTTP-запросов и возврат ответов |
| `src/services/ReviewService.ts` | Бизнес-логика отзывов |
| `src/repositories/ReviewRepository.ts` | Запросы к PostgreSQL через Prisma |
| `src/dto/ReviewDto.ts` | Типы данных для отзывов |
| `tests/reviews.test.ts` | Интеграционные тесты Reviews API |

---

## 33. Endpoints Reviews API

| Метод | URL | Назначение |
|---|---|---|
| `GET` | `/api/reviews` | Получить список отзывов |
| `GET` | `/api/reviews?status=NEW` | Получить отзывы по статусу |
| `GET` | `/api/reviews/:id` | Получить один отзыв |
| `PATCH` | `/api/reviews/:id/answer` | Ответить на отзыв |

---

## 34. Статусы отзывов

| Статус | Значение |
|---|---|
| `NEW` | Новый отзыв, ещё без ответа |
| `ANSWERED` | На отзыв уже дан ответ |
| `ARCHIVED` | Отзыв скрыт из активной обработки |

---

## 35. Ответ на отзыв

Endpoint `PATCH /api/reviews/:id/answer` принимает тело запроса:

```json
{
  "answerText": "Спасибо за отзыв!"
}
```

После ответа статус отзыва меняется на `ANSWERED`.

---

## 36. Валидация Reviews API

В `ReviewController` проверяются входные данные:

| Проверка | Поведение |
|---|---|
| Некорректный `status` | Возвращается `400 Bad Request` |
| Пустой `answerText` | Возвращается `400 Bad Request` |
| Несуществующий отзыв | Возвращается `404 Not Found` |
| Корректный ответ на отзыв | Отзыв обновляется и получает статус `ANSWERED` |

---

## 37. Тестирование Reviews API

Для Reviews API написаны интеграционные тесты.

| Тест | Что проверяет |
|---|---|
| `should return reviews list` | API возвращает список отзывов |
| `should filter reviews by status` | Фильтрация по статусу работает |
| `should return 400 for invalid review status` | Некорректный статус отклоняется |
| `should return review by id` | Можно получить один отзыв |
| `should answer review` | Можно ответить на отзыв |
| `should return 400 when answerText is empty` | Пустой ответ не принимается |
| `should return 404 for missing review` | Несуществующий отзыв возвращает 404 |

---

## 38. AI Assistant API

Модуль AI Assistant отвечает за рекомендации и помощь селлеру.

В текущей версии используется mock-AI. Это значит, что проект не зависит от внешнего AI-сервиса и стабильно запускается локально.

```txt
GET /api/ai/recommendations
  ↓
ai.routes.ts
  ↓
AIAssistantController
  ↓
AIAssistantService
  ↓
AIAssistantRepository
  ↓
Prisma Client
  ↓
PostgreSQL
```

---

## 39. Структура AI Assistant Module

| Файл | Назначение |
|---|---|
| `src/routes/ai.routes.ts` | HTTP-маршруты AI Assistant |
| `src/controllers/AIAssistantController.ts` | Приём HTTP-запросов |
| `src/services/AIAssistantService.ts` | Mock-AI логика и генерация ответов |
| `src/repositories/AIAssistantRepository.ts` | Работа с AI-рекомендациями и логами через Prisma |
| `src/dto/AIAssistantDto.ts` | Типы входных и выходных данных |
| `tests/ai.test.ts` | Интеграционные тесты AI Assistant API |

---

## 40. Endpoints AI Assistant API

| Метод | URL | Назначение |
|---|---|---|
| `GET` | `/api/ai/recommendations` | Получить список AI-рекомендаций |
| `GET` | `/api/ai/recommendations?type=SEO` | Фильтр рекомендаций по типу |
| `PATCH` | `/api/ai/recommendations/:id/apply` | Отметить рекомендацию применённой |
| `POST` | `/api/ai/review-answer` | Сгенерировать вариант ответа на отзыв |
| `POST` | `/api/ai/chat` | Получить mock-ответ AI Assistant |
| `GET` | `/api/ai/logs` | Получить историю AI-запросов |

---

## 41. Типы AI-рекомендаций

| Тип | Значение |
|---|---|
| `PRICE` | Рекомендации по цене |
| `STOCK` | Рекомендации по остаткам |
| `SEO` | Рекомендации по карточке и SEO |
| `REVIEW_REPLY` | Рекомендации по ответам на отзывы |
| `GENERAL` | Общие рекомендации |

---

## 42. Почему используется mock-AI

Mock-AI выбран на текущем этапе, потому что:

| Причина | Польза |
|---|---|
| Проект стабильно запускается | Не нужен внешний сервис |
| Легко проверять у преподавателя | Нет зависимости от API-ключей |
| Можно покрыть тестами | Ответы предсказуемые |
| Архитектура готова к замене | Позже mock можно заменить на Ollama/OpenAI |

---

## 43. Поток генерации ответа на отзыв

```txt
POST /api/ai/review-answer
  ↓
reviewId
  ↓
AIAssistantController
  ↓
AIAssistantService
  ↓
AIAssistantRepository.findReviewById()
  ↓
Mock answer generation
  ↓
suggestedAnswer
```

---

## 44. Тестирование AI Assistant API

Для AI Assistant API написаны интеграционные тесты.

| Тест | Что проверяет |
|---|---|
| `should return AI recommendations list` | API возвращает список рекомендаций |
| `should filter AI recommendations by type` | Фильтр по типу работает |
| `should return 400 for invalid AI recommendation type` | Некорректный тип отклоняется |
| `should apply AI recommendation` | Рекомендацию можно отметить применённой |
| `should generate review answer` | Генерируется ответ на отзыв |
| `should return 400 when reviewId is missing` | Пустой `reviewId` отклоняется |
| `should return mock chat response` | Chat endpoint возвращает mock-ответ |
| `should return AI logs` | История AI-запросов возвращается |

---

## 45. Auth API

Модуль Auth отвечает за регистрацию, вход пользователя и проверку JWT-токена.

```txt
POST /api/auth/register
  ↓
auth.routes.ts
  ↓
AuthController
  ↓
AuthService
  ↓
AuthRepository
  ↓
Prisma Client
  ↓
PostgreSQL
```

---

## 46. Структура Auth Module

| Файл | Назначение |
|---|---|
| `src/routes/auth.routes.ts` | HTTP-маршруты авторизации |
| `src/controllers/AuthController.ts` | Регистрация, логин и получение текущего пользователя |
| `src/services/AuthService.ts` | Хэширование пароля, проверка пароля, создание JWT |
| `src/repositories/AuthRepository.ts` | Работа с пользователями через Prisma |
| `src/dto/AuthDto.ts` | Типы входных и выходных данных |
| `src/middlewares/auth.middleware.ts` | Проверка Authorization Bearer token |
| `src/utils/jwt.ts` | Создание и проверка JWT |
| `tests/auth.test.ts` | Интеграционные тесты Auth API |

---

## 47. Endpoints Auth API

| Метод | URL | Назначение |
|---|---|---|
| `POST` | `/api/auth/register` | Регистрация пользователя |
| `POST` | `/api/auth/login` | Вход пользователя |
| `GET` | `/api/auth/me` | Получить текущего пользователя по JWT |

---

## 48. Безопасность Auth API

| Механизм | Назначение |
|---|---|
| `bcrypt` | Хэширование пароля перед сохранением в БД |
| `JWT` | Передача авторизованного состояния клиента |
| `Authorization: Bearer` | Формат передачи токена |
| `passwordHash` | Пароль не возвращается в API-ответах |

---

## 49. Поток регистрации

```txt
POST /api/auth/register
  ↓
Проверка email/password/name
  ↓
Проверка уникальности email
  ↓
bcrypt.hash(password)
  ↓
Создание пользователя в PostgreSQL
  ↓
Создание JWT access token
  ↓
Ответ user + accessToken
```

---

## 50. Поток логина

```txt
POST /api/auth/login
  ↓
Поиск пользователя по email
  ↓
bcrypt.compare(password, passwordHash)
  ↓
Создание JWT access token
  ↓
Ответ user + accessToken
```

---

## 51. Тестирование Auth API

Для Auth API написаны интеграционные тесты.

| Тест | Что проверяет |
|---|---|
| `should register user` | Пользователь может зарегистрироваться |
| `should not register duplicate email` | Нельзя зарегистрировать одинаковый email |
| `should login user` | Пользователь может войти |
| `should not login with wrong password` | Неверный пароль отклоняется |
| `should return current user by token` | `/me` работает с токеном |
| `should reject /me without token` | `/me` без токена возвращает 401 |


---

## 52. Frontend

Frontend реализован на React + Vite + TypeScript.

```txt
apps/frontend/src/
  api/
  components/
  layout/
  pages/
  styles/
  types/
  utils/
```

---

## 53. Frontend-архитектура

| Слой | Назначение |
|---|---|
| `api` | Функции запросов к backend |
| `components` | Переиспользуемые UI-компоненты |
| `layout` | Общая структура интерфейса |
| `pages` | Страницы приложения |
| `types` | TypeScript-типы данных |
| `styles` | Глобальные стили |

---

## 54. Frontend API Layer

Frontend не вызывает `fetch` напрямую внутри всех компонентов.  
Запросы вынесены в отдельный слой:

| Файл | Назначение |
|---|---|
| `api/client.ts` | Общие функции `GET`, `POST`, `PATCH` |
| `api/productsApi.ts` | Запросы Products API |
| `api/analyticsApi.ts` | Запросы Analytics API |
| `api/reviewsApi.ts` | Запросы Reviews API |
| `api/aiApi.ts` | Запросы AI Assistant API |

---

## 55. Dashboard Page

Dashboard page получает данные из backend endpoint:

```txt
GET /api/analytics/dashboard
```

и отображает:

| Блок | Данные |
|---|---|
| Summary cards | Выручка, заказы, товары, рейтинг, конверсия |
| Low stock table | Товары с низким остатком |
| Top products table | Топ товаров по выручке |