# 05. Проектирование UI и API

---

## 1. Список экранов

| # | Экран | Назначение |
|---|---|---|
| S-01 | **Онбординг / Загрузка меню** | Первичная настройка: загрузка меню и выбор типа кухни |
| S-02 | **Дашборд сезонности (главный экран)** | Визуальный тайм-лайн сезонности с фильтрами |
| S-03 | **Каталог продуктов** | Карточки продуктов с фильтрацией и сортировкой |
| S-04 | **Детальная карточка продукта** | Подробная информация о продукте + рекомендации по меню |
| S-05 | **Профиль ресторана** | Настройки: тип кухни, загруженное меню, история |

---

### Описание экранов

**S-01 Онбординг / Загрузка меню**
- Drag-and-drop зона для PDF или поле вставки текста
- Кнопка «Выбрать тип кухни вручную»
- Выпадающий список типов кухонь (из справочника)
- Индикатор прогресса обработки
- Кнопка «Перейти к дашборду»

**S-02 Дашборд сезонности**
- Заголовок с текущим месяцем и сезоном
- Горизонтальный тайм-лайн: продукты × 3 месяца
- Цветовые метки статуса (🟢🟡🔴⚫)
- Панель фильтров: категория / статус / тип (редкий, премиальный)
- Блок «Рекомендации к обновлению меню» (топ-5 продуктов)

**S-03 Каталог продуктов**
- Карточки продуктов (фото, название, категория, статус сезонности, бейджи, имя фермера)
- Сортировка: по сезону / по категории / по статусу
- Фильтры: категория, регион, статус, тип

**S-04 Детальная карточка продукта**
- Фото, название, категория, регион
- Статус сезонности + тайм-лайн конкретного продукта
- Бейджи: редкий / премиальный
- AI-объяснение совместимости с кухней ресторана
- Блок «Можно использовать в блюдах»: список блюд из меню шефа
- Кнопка «Перейти к фермеру» → svoe-rodnoe.ru

**S-05 Профиль ресторана**
- Название ресторана, тип кухни
- Загруженное меню (просмотр / замена)
- История просмотренных продуктов
- Кнопка «Обновить меню»

---

## 2. Таблица роутов

| Экран | URL | Описание | Переходы |
|---|---|---|---|
| S-01 | `/dashboard/onboarding` | Загрузка меню и выбор кухни | → S-02 после завершения |
| S-02 | `/dashboard/seasonality` | Главный дашборд сезонности | → S-03, S-04, S-05 |
| S-03 | `/dashboard/products` | Каталог продуктов с фильтрами | → S-04 |
| S-04 | `/dashboard/products/:productId` | Карточка конкретного продукта | → svoe-rodnoe.ru (новая вкладка), ← S-03 |
| S-05 | `/dashboard/profile` | Профиль ресторана | → S-01 (обновление меню), ← S-02 |

---

## 3. Таблицы endpoints по экранам

### S-01 Онбординг

| UI элемент | Действие | Метод | Endpoint | Описание |
|---|---|---|---|---|
| Загрузка PDF | Upload | `POST` | `/api/v1/menu/upload` | Парсинг PDF-меню |
| Вставка текста | Submit | `POST` | `/api/v1/menu/parse-text` | Парсинг текста меню |
| Получить список кухонь | Load | `GET` | `/api/v1/cuisine-types` | Справочник типов кухонь |
| Сохранить тип кухни | Submit | `PUT` | `/api/v1/restaurant/cuisine` | Обновление профиля |

### S-02 Дашборд

| UI элемент | Действие | Метод | Endpoint | Описание |
|---|---|---|---|---|
| Загрузка тайм-лайна | Load | `GET` | `/api/v1/seasonality/timeline?months=3` | Тайм-лайн на 3 месяца |
| Применить фильтр | Filter | `GET` | `/api/v1/products?category=&status=&type=` | Фильтрованный список |
| Блок рекомендаций | Load | `GET` | `/api/v1/recommendations?limit=5` | Топ-5 рекомендаций |

### S-03 Каталог

| UI элемент | Действие | Метод | Endpoint | Описание |
|---|---|---|---|---|
| Список продуктов | Load | `GET` | `/api/v1/products` | Все продукты с пагинацией |
| Фильтрация | Filter | `GET` | `/api/v1/products?category=&region=&status=` | Фильтрованный список |
| Сортировка | Sort | `GET` | `/api/v1/products?sort=season_status` | Сортированный список |

### S-04 Карточка продукта

| UI элемент | Действие | Метод | Endpoint | Описание |
|---|---|---|---|---|
| Загрузка карточки | Load | `GET` | `/api/v1/products/:id` | Детальные данные продукта |
| AI-объяснение | Generate | `POST` | `/api/v1/ai/explain-compatibility` | Генерация объяснения |
| Рекомендации по меню | Load | `GET` | `/api/v1/products/:id/menu-matches` | Блюда из меню для продукта |
| Переход к фермеру | Navigate | `GET` | `/api/v1/products/:id/farmer-link` | Ссылка на svoe-rodnoe.ru |

---

## 4. JSON-схемы ключевых сущностей

### Product (Продукт)

```json
{
  "id": "prod_123",
  "name": "Белый гриб",
  "category": "mushrooms",
  "subcategory": "forest_mushrooms",
  "images": ["https://cdn.svoe-rodnoe.ru/products/prod_123_1.jpg"],
  "season": {
    "start_month": 8,
    "end_month": 10,
    "is_year_round": false
  },
  "seasonality_status": "IN_SEASON",
  "badges": ["rare", "premium"],
  "farmer": {
    "id": "farm_456",
    "name": "Фермерское хозяйство Лесной край",
    "region": "Вологодская область",
    "profile_url": "https://svoe-rodnoe.ru/farmers/farm_456"
  },
  "price_per_kg": 850,
  "compatible_cuisines": ["russian", "european", "author"],
  "description": "Свежесобранные белые грибы из вологодских лесов",
  "source_url": "https://svoe-rodnoe.ru/products/prod_123"
}
```

### Menu (Меню ресторана)

```json
{
  "restaurant_id": "rest_789",
  "cuisine_type": "russian",
  "cuisine_confidence": 0.92,
  "dishes": [
    {
      "id": "dish_001",
      "name": "Суп из белых грибов",
      "category": "soups",
      "ingredients_hints": ["белый гриб", "сливки", "картофель"]
    },
    {
      "id": "dish_002",
      "name": "Пельмени с олениной",
      "category": "main_course",
      "ingredients_hints": ["оленина", "лук", "тесто"]
    }
  ],
  "uploaded_at": "2025-09-01T10:30:00Z",
  "raw_text_hash": "sha256:abc123..."
}
```

### Recommendation (Рекомендация)

```json
{
  "product_id": "prod_123",
  "product_name": "Белый гриб",
  "seasonality_status": "IN_SEASON",
  "ai_explanation": "Белый гриб идеально подходит для русской кухни: его насыщенный аромат традиционно используется в супах и соусах. Сейчас самый пик сезона — вологодские фермеры предлагают свежесобранные грибы.",
  "menu_matches": [
    {
      "dish_id": "dish_001",
      "dish_name": "Суп из белых грибов",
      "match_reason": "Прямое совпадение ингредиента"
    }
  ],
  "generated_at": "2025-09-01T11:00:00Z"
}
```

### SeasonalityTimeline (Тайм-лайн)

```json
{
  "current_month": 9,
  "current_season": "autumn",
  "months": [
    {
      "month": 9,
      "month_name": "Сентябрь",
      "products": [
        {
          "product_id": "prod_123",
          "name": "Белый гриб",
          "status": "IN_SEASON"
        }
      ]
    },
    {
      "month": 10,
      "month_name": "Октябрь",
      "products": [...]
    },
    {
      "month": 11,
      "month_name": "Ноябрь",
      "products": [...]
    }
  ]
}
```

---

## 5. OpenAPI спецификация (YAML)

```yaml
openapi: 3.0.3
info:
  title: Своё Шеф — Дашборд сезонности API
  version: 1.0.0
  description: API для дашборда сезонности ресторанов на платформе svoe-shef.ru

servers:
  - url: https://api.svoe-shef.ru/v1
    description: Production
  - url: https://api-dev.svoe-shef.ru/v1
    description: Development

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Product:
      type: object
      required: [id, name, category, season, seasonality_status]
      properties:
        id:
          type: string
          example: "prod_123"
        name:
          type: string
          example: "Белый гриб"
        category:
          type: string
          enum: [vegetables, fruits, berries, mushrooms, meat, fish, dairy, herbs, grains, honey]
        season:
          type: object
          properties:
            start_month: { type: integer, minimum: 1, maximum: 12 }
            end_month: { type: integer, minimum: 1, maximum: 12 }
            is_year_round: { type: boolean }
        seasonality_status:
          type: string
          enum: [IN_SEASON, ENDING_SOON, STARTING_SOON, OUT_OF_SEASON]
        badges:
          type: array
          items:
            type: string
            enum: [rare, premium]

    Recommendation:
      type: object
      properties:
        product_id: { type: string }
        ai_explanation: { type: string }
        menu_matches:
          type: array
          items:
            type: object
            properties:
              dish_name: { type: string }
              match_reason: { type: string }

paths:
  /menu/upload:
    post:
      summary: Загрузка PDF-меню
      tags: [Menu]
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        "200":
          description: Меню обработано успешно
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Menu'
        "422":
          description: Не удалось распознать текст

  /cuisine-types:
    get:
      summary: Справочник типов кухонь
      tags: [Reference]
      responses:
        "200":
          description: Список типов кухонь
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id: { type: string }
                    name: { type: string }

  /seasonality/timeline:
    get:
      summary: Получить тайм-лайн сезонности
      tags: [Seasonality]
      parameters:
        - name: months
          in: query
          schema: { type: integer, default: 3, minimum: 1, maximum: 6 }
        - name: cuisine_type
          in: query
          schema: { type: string }
      responses:
        "200":
          description: Тайм-лайн сезонности
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeasonalityTimeline'

  /products:
    get:
      summary: Список продуктов с фильтрацией
      tags: [Products]
      parameters:
        - name: category
          in: query
          schema: { type: string }
        - name: status
          in: query
          schema:
            type: string
            enum: [IN_SEASON, ENDING_SOON, STARTING_SOON]
        - name: type
          in: query
          schema:
            type: string
            enum: [rare, premium]
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
      responses:
        "200":
          description: Список продуктов
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/Product' }
                  total: { type: integer }
                  page: { type: integer }

  /products/{productId}:
    get:
      summary: Детальная карточка продукта
      tags: [Products]
      parameters:
        - name: productId
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Карточка продукта
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Product' }
        "404":
          description: Продукт не найден

  /ai/explain-compatibility:
    post:
      summary: Генерация AI-объяснения совместимости
      tags: [AI]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [product_id, cuisine_type]
              properties:
                product_id: { type: string }
                cuisine_type: { type: string }
      responses:
        "200":
          description: Объяснение совместимости
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Recommendation' }
        "429":
          description: Превышен лимит запросов (60/мин)

  /recommendations:
    get:
      summary: Топ-N рекомендаций для шефа
      tags: [Recommendations]
      parameters:
        - name: limit
          in: query
          schema: { type: integer, default: 5, maximum: 20 }
      responses:
        "200":
          description: Список рекомендаций
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/Recommendation' }
```