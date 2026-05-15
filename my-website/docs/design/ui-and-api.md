---
title: UI и API
sidebar_position: 1
description: Экраны, роуты, endpoints по экранам, JSON-схемы сущностей
---

# UI и API

:::tip Интерактивные wireframes
Все экраны доступны в виде живого HTML-прототипа — откройте файл в браузере или перейдите по ссылке из репозитория:
**[📐 Открыть wireframes →](pathname:///wireframes/svoe_shef_wireframes.html)**
:::

---

## 1. Список экранов

| # | Экран | URL | Назначение |
|---|---|---|---|
| S-01 | **Онбординг / Загрузка меню** | `/dashboard/onboarding` | Загрузка меню и выбор типа кухни |
| S-02 | **Дашборд сезонности** | `/dashboard/seasonality` | Визуальный тайм-лайн с фильтрами |
| S-03 | **Каталог продуктов** | `/dashboard/products` | Карточки с фильтрацией и сортировкой |
| S-04 | **Карточка продукта** | `/dashboard/products/:productId` | Детали + AI-объяснение + блюда из меню |
| S-05 | **Профиль ресторана** | `/dashboard/profile` | Настройки: кухня, меню, история |
| S-06 | **Корзина / Заказ** | `/dashboard/cart` | Сбор и оформление заказа |

---

## 2. Описание экранов

### S-01 — Онбординг / Загрузка меню

- Drag-and-drop зона для PDF или поле вставки текста
- Шаг-бар прогресса (4 шага: Аккаунт → Загрузка меню → Тип кухни → Дашборд готов)
- AI-классификатор кухни с вероятностями: топ-3 варианта
- Кнопки «Перейти к дашборду» / «Пропустить настройку»

![Wireframe S-01 — Онбординг](/media/onboarding.png)

---

### S-02 — Дашборд сезонности (главный экран)

- KPI-карточки: в сезоне / скоро / заканчивается / фермеров
- Тайм-лайн: продукты × 3 месяца, цветовые статусы ячеек
- Три независимых фильтра: **Кухня** / **Сезонность** (мультивыбор) / **Группа**
- Блок «Рекомендации к обновлению меню» (топ-3)
- Блок «Уведомления» о смене сезона
- Карточки топ-продуктов с AI-объяснением

![Wireframe S-02 — Дашборд сезонности](/media/dashboard.png)

---

### S-03 — Каталог продуктов

- Сетка карточек 3×N с пагинацией
- Фильтр-бар: сезон / группа / тип (Редкий, Премиум)
- Боковые фильтры: регион фермера / диапазон цены / совместимость с кухней
- Сортировка: по сезону / категории / цене

![Wireframe S-03 — Каталог продуктов](/media/catalog.png)

---

### S-04 — Детальная карточка продукта

- Мини-тайм-лайн по 12 месяцам (текущий выделен)
- AI-блок: объяснение совместимости с кухней ресторана
- Список блюд из меню шефа, для которых подходит продукт
- Карточка фермера: имя, регион, рейтинг, график поставок, минимальный заказ
- Виджет «В корзину»: выбор количества + итог

![Wireframe S-04 — Карточка продукта](/media/product.png)

---

### S-05 — Профиль ресторана

- Редактирование основных данных (название, город, email)
- Смена типа кухни (с предупреждением об обновлении рекомендаций)
- Просмотр загруженного меню + список распознанных блюд
- Статистика: просмотрено / переходов к фермерам / CTR / сессий
- История просмотров продуктов

![Wireframe S-05 — Профиль ресторана](/media/profile.png)

---

### S-06 — Корзина / Оформление заказа

- Позиции сгруппированы по фермерам
- Управление количеством + удаление позиций
- Итоговая сумма с разбивкой по фермерам
- Форма доставки: адрес, дата, комментарий

![Wireframe S-06 — Корзина](/media/cart.png)

---

## 3. Таблица роутов

| Экран | URL | Переходы |
|---|---|---|
| S-01 | `/dashboard/onboarding` | → S-02 после завершения |
| S-02 | `/dashboard/seasonality` | → S-03, S-04, S-05, S-06 |
| S-03 | `/dashboard/products` | → S-04 |
| S-04 | `/dashboard/products/:productId` | → svoe-rodnoe.ru (новая вкладка), → S-06, ← S-03 |
| S-05 | `/dashboard/profile` | → S-01 (обновление меню), ← S-02 |
| S-06 | `/dashboard/cart` | → подтверждение заказа, ← S-02/S-03/S-04 |

---

## 4. Endpoints по экранам

### S-01 — Онбординг

| Действие | Метод | Endpoint | Описание |
|---|---|---|---|
| Загрузить PDF | `POST` | `/api/v1/menu/upload` | Парсинг PDF-меню |
| Вставить текст | `POST` | `/api/v1/menu/parse-text` | Парсинг текста меню |
| Список кухонь | `GET` | `/api/v1/cuisine-types` | Справочник типов кухонь |
| Сохранить кухню | `PUT` | `/api/v1/restaurant/cuisine` | Обновление типа кухни |

### S-02 — Дашборд

| Действие | Метод | Endpoint | Описание |
|---|---|---|---|
| Тайм-лайн | `GET` | `/api/v1/seasonality/timeline?months=3` | Тайм-лайн на 3 месяца |
| Фильтр | `GET` | `/api/v1/products?category=&status=&type=&cuisine=` | Фильтрованный список |
| Рекомендации | `GET` | `/api/v1/recommendations?limit=5` | Топ-5 рекомендаций |

### S-03 — Каталог

| Действие | Метод | Endpoint | Описание |
|---|---|---|---|
| Список продуктов | `GET` | `/api/v1/products` | Все продукты с пагинацией |
| Фильтр | `GET` | `/api/v1/products?category=&region=&status=` | Фильтрованный список |
| Сортировка | `GET` | `/api/v1/products?sort=season_status` | Сортированный список |
| В корзину | `POST` | `/api/v1/cart/items` | Добавить продукт |

### S-04 — Карточка продукта

| Действие | Метод | Endpoint | Описание |
|---|---|---|---|
| Карточка продукта | `GET` | `/api/v1/products/:id` | Детальные данные |
| AI-объяснение | `POST` | `/api/v1/ai/explain-compatibility` | Генерация объяснения |
| Блюда из меню | `GET` | `/api/v1/products/:id/menu-matches` | Блюда шефа для продукта |
| Ссылка на фермера | `GET` | `/api/v1/products/:id/farmer-link` | URL на svoe-rodnoe.ru |
| В корзину | `POST` | `/api/v1/cart/items` | Добавить продукт |

### S-05 — Профиль ресторана

| Действие | Метод | Endpoint | Описание |
|---|---|---|---|
| Загрузить профиль | `GET` | `/api/v1/restaurant` | Данные ресторана |
| Обновить профиль | `PATCH` | `/api/v1/restaurant` | Обновление полей |
| Обновить меню | `POST` | `/api/v1/menu/upload` | Загрузка нового меню |

### S-06 — Корзина

| Действие | Метод | Endpoint | Описание |
|---|---|---|---|
| Загрузить корзину | `GET` | `/api/v1/cart` | Текущая корзина |
| Изменить количество | `PATCH` | `/api/v1/cart/items/:itemId` | Обновить позицию |
| Удалить позицию | `DELETE` | `/api/v1/cart/items/:itemId` | Удалить позицию |
| Оформить заказ | `POST` | `/api/v1/orders` | Создать заказ из корзины |

---

## 5. JSON-схемы ключевых сущностей

### Product

```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "subcategory": "string",
  "images": ["string"],
  "season": {
    "start_month": "integer",
    "end_month": "integer",
    "is_year_round": "boolean"
  },
  "seasonality_status": "enum(IN_SEASON, ENDING_SOON, STARTING_SOON, OUT_OF_SEASON)",
  "badges": ["RARE", "PREMIUM"],
  "farmer": {
    "id": "string",
    "name": "string",
    "region": "string",
    "profile_url": "string"
  },
  "price_per_kg": "float",
  "compatible_cuisines": ["string"],
  "description": "string",
  "source_url": "string"
}
```

### SeasonalityTimeline

```json
{
  "current_month": "integer",
  "current_season": "string",
  "restaurant_cuisine_type": "string",
  "months": [
    {
      "month": "integer",
      "month_name": "string",
      "products": [
        {
          "product_id": "string",
          "name": "string",
          "category": "string",
          "status": "enum(IN_SEASON, ENDING_SOON, STARTING_SOON, OUT_OF_SEASON)",
          "badges": ["string"]
        }
      ]
    }
  ]
}
```

### Recommendation

```json
{
  "product_id": "string",
  "product_name": "string",
  "seasonality_status": "string",
  "ai_explanation": "string",
  "menu_matches": [
    {
      "dish_id": "string",
      "dish_name": "string",
      "match_reason": "string"
    }
  ],
  "generated_at": "datetime"
}
```

### Cart

```json
{
  "id": "string",
  "restaurant_id": "string",
  "items": [
    {
      "id": "string",
      "product_id": "string",
      "product_name": "string",
      "farmer_id": "string",
      "farmer_name": "string",
      "quantity_kg": "integer",
      "price_per_kg": "float",
      "total_price": "float"
    }
  ],
  "total_price": "float",
  "items_count": "integer",
  "updated_at": "datetime"
}
```

### Order

```json
{
  "id": "string",
  "restaurant_id": "string",
  "status": "PENDING | CONFIRMED | DELIVERED",
  "items": ["..."],
  "total_price": "float",
  "delivery_address": "string",
  "comment": "string",
  "created_at": "datetime"
}
```
