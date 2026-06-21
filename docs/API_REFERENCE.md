# SellerHUB API Reference

## Base URL

```txt
http://localhost:5000/api
```

---

# 1. Health API

## GET `/health`

Проверяет работу backend и подключение к PostgreSQL.

### Response 200

```json
{
  "status": "ok",
  "service": "sellerhub-backend",
  "database": "connected",
  "timestamp": "2026-06-21T12:00:00.000Z"
}
```

---

# 2. Auth API

## POST `/auth/register`

Регистрация пользователя.

### Request body

```json
{
  "email": "user@sellerhub.ru",
  "password": "password123",
  "name": "User Name"
}
```

### Response 201

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@sellerhub.ru",
      "name": "User Name",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "jwt-token"
  }
}
```

---

## POST `/auth/login`

Вход пользователя.

### Request body

```json
{
  "email": "user@sellerhub.ru",
  "password": "password123"
}
```

### Response 200

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@sellerhub.ru",
      "name": "User Name",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "jwt-token"
  }
}
```

---

## GET `/auth/me`

Получение текущего пользователя по JWT.

### Headers

```txt
Authorization: Bearer jwt-token
```

### Response 200

```json
{
  "data": {
    "id": "uuid",
    "email": "user@sellerhub.ru",
    "name": "User Name",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

# 3. Products API

## GET `/products`

Получить список товаров.

### Query params

| Параметр | Тип | Описание |
|---|---|---|
| `search` | string | Поиск по названию |
| `marketplaceId` | string | Фильтр по маркетплейсу |
| `isActive` | boolean | Фильтр активных товаров |

### Example

```txt
GET /products?search=лампа&isActive=true
```

### Response 200

```json
{
  "data": [
    {
      "id": "uuid",
      "marketplaceId": "uuid",
      "marketplaceName": "Demo Ozon Store",
      "marketplaceType": "OZON",
      "title": "Умная настольная лампа RGB",
      "sku": "LAMP-RGB-001",
      "price": "2490",
      "stock": 42,
      "rating": "4.7",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1
}
```

---

## GET `/products/:id`

Получить товар по id.

### Response 200

```json
{
  "data": {
    "id": "uuid",
    "title": "Умная настольная лампа RGB",
    "sku": "LAMP-RGB-001",
    "price": "2490"
  }
}
```

### Response 404

```json
{
  "message": "Product not found"
}
```

---

# 4. Analytics API

## GET `/analytics/dashboard`

Получить данные для dashboard.

### Response 200

```json
{
  "data": {
    "summary": {
      "totalRevenue": "21030",
      "totalOrders": 4,
      "totalSoldItems": 7,
      "totalProducts": 3,
      "activeProducts": 3,
      "lowStockProducts": 1,
      "averageRating": "4.33",
      "totalViews": 2740,
      "conversionRate": "0.26"
    },
    "lowStockProducts": [],
    "topProducts": []
  }
}
```

---

# 5. Reviews API

## GET `/reviews`

Получить список отзывов.

### Query params

| Параметр | Тип | Описание |
|---|---|---|
| `status` | `NEW` / `ANSWERED` / `ARCHIVED` | Фильтр по статусу |
| `productId` | string | Фильтр по товару |

### Example

```txt
GET /reviews?status=NEW
```

---

## GET `/reviews/:id`

Получить отзыв по id.

---

## PATCH `/reviews/:id/answer`

Ответить на отзыв.

### Request body

```json
{
  "answerText": "Спасибо за отзыв!"
}
```

### Response 200

```json
{
  "data": {
    "id": "uuid",
    "status": "ANSWERED",
    "answerText": "Спасибо за отзыв!"
  }
}
```

---

# 6. AI Assistant API

## GET `/ai/recommendations`

Получить список AI-рекомендаций.

### Query params

| Параметр | Тип | Описание |
|---|---|---|
| `type` | `PRICE` / `STOCK` / `SEO` / `REVIEW_REPLY` / `GENERAL` | Тип рекомендации |
| `productId` | string | Фильтр по товару |
| `isApplied` | boolean | Применена ли рекомендация |

---

## PATCH `/ai/recommendations/:id/apply`

Отметить рекомендацию применённой.

---

## POST `/ai/review-answer`

Сгенерировать mock-ответ на отзыв.

### Request body

```json
{
  "reviewId": "uuid"
}
```

### Response 200

```json
{
  "data": {
    "reviewId": "uuid",
    "rating": 5,
    "reviewText": "Товар отличный",
    "suggestedAnswer": "Спасибо за высокую оценку!"
  }
}
```

---

## POST `/ai/chat`

Получить mock-ответ AI Assistant.

### Request body

```json
{
  "prompt": "Что делать с остатками на складе?"
}
```

### Response 200

```json
{
  "data": {
    "prompt": "Что делать с остатками на складе?",
    "response": "Я вижу, что нужно проверить товары с низкими остатками..."
  }
}
```

---

## GET `/ai/logs`

Получить историю AI-запросов.

---

# 7. Error responses

## 400 Bad Request

```json
{
  "message": "Validation error message"
}
```

## 401 Unauthorized

```json
{
  "message": "Authorization token is required"
}
```

## 404 Not Found

```json
{
  "message": "Resource not found"
}
```

## 409 Conflict

```json
{
  "message": "User with this email already exists"
}
```