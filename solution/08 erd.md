# 08. Проектирование ERD

---

## Уровень 1: Концептуальная модель

### Список сущностей

| Сущность | Описание | Связи |
|---|---|---|
| **Restaurant** | Ресторан, зарегистрированный на svoe-shef.ru | Имеет одно Menu; относится к одному CuisineType |
| **Menu** | Загруженное меню ресторана | Принадлежит Restaurant; содержит Dish |
| **Dish** | Блюдо из меню ресторана | Принадлежит Menu |
| **CuisineType** | Тип кухни (справочник) | Характеризует Restaurant; влияет на подбор Product |
| **Product** | Фермерский продукт (кэш из svoe-rodnoe.ru) | Принадлежит Farmer; имеет Season; совместим с CuisineType |
| **Season** | Сезонное окно продукта | Принадлежит Product |
| **Farmer** | Фермер (кэш из svoe-rodnoe.ru) | Имеет много Product |
| **Recommendation** | AI-рекомендация продукта для ресторана | Связывает Restaurant + Product; содержит MenuMatch |
| **MenuMatch** | Конкретное блюдо, для которого рекомендован продукт | Связывает Recommendation + Dish |
| **ViewHistory** | Факт просмотра продукта шефом | Связывает Restaurant + Product |

### Концептуальная диаграмма (текстовое описание)

```
Restaurant ──(1:1)── Menu ──(1:N)── Dish
     │
     └──(N:1)── CuisineType

Product ──(N:1)── Farmer
     │
     └──(1:N)── Season
     │
     └──(N:M)── CuisineType  [через ProductCuisineCompat]

Restaurant ──(1:N)── Recommendation ──(N:1)── Product
                          │
                          └──(1:N)── MenuMatch ──(N:1)── Dish

Restaurant ──(1:N)── ViewHistory ──(N:1)── Product
```

---

## Уровень 2: Логическая модель

### dbdiagram-нотация

```sql
Table restaurants {
  id          uuid [pk]
  name        varchar(200) [not null]
  owner_user_id varchar(100) [not null]
  cuisine_type_id int [ref: > cuisine_types.id]
  cuisine_confidence decimal(3,2)
  created_at  timestamp
  updated_at  timestamp
}

Table menus {
  id          uuid [pk]
  restaurant_id uuid [ref: > restaurants.id, not null]
  raw_text    text
  dishes_json jsonb
  file_hash   varchar(64)
  uploaded_at timestamp
}

Table dishes {
  id          uuid [pk]
  menu_id     uuid [ref: > menus.id, not null]
  name        varchar(300) [not null]
  category    varchar(100)
  ingredients_hints jsonb
}

Table cuisine_types {
  id          serial [pk]
  name_ru     varchar(100) [not null, unique]
  name_en     varchar(100) [not null, unique]
  description text
}

Table farmers {
  id          varchar(100) [pk]  // ID из svoe-rodnoe.ru
  name        varchar(300) [not null]
  region      varchar(200)
  profile_url varchar(500)
  cached_at   timestamp
}

Table products {
  id          varchar(100) [pk]  // ID из svoe-rodnoe.ru
  name        varchar(300) [not null]
  category    varchar(100)
  subcategory varchar(100)
  description text
  images      jsonb
  badges      jsonb   // ["rare", "premium"]
  farmer_id   varchar(100) [ref: > farmers.id]
  price_per_kg decimal(10,2)
  source_url  varchar(500)
  cached_at   timestamp
}

Table seasons {
  id          serial [pk]
  product_id  varchar(100) [ref: > products.id, not null]
  start_month int [not null]  // 1-12
  end_month   int [not null]  // 1-12
  is_year_round boolean [default: false]
}

// L1: Связь M:N между Product и CuisineType вынесена в отдельную таблицу
Table product_cuisine_compat {
  product_id  varchar(100) [ref: > products.id]
  cuisine_type_id int [ref: > cuisine_types.id]
  compatibility_score decimal(3,2)  // 0.0 - 1.0
  
  indexes {
    (product_id, cuisine_type_id) [pk]
  }
}

Table recommendations {
  id          uuid [pk]
  restaurant_id uuid [ref: > restaurants.id, not null]
  product_id  varchar(100) [ref: > products.id, not null]
  ai_explanation text
  generated_at timestamp
  expires_at  timestamp
}

Table menu_matches {
  id          uuid [pk]
  recommendation_id uuid [ref: > recommendations.id, not null]
  dish_id     uuid [ref: > dishes.id, not null]
  match_reason text
  match_score decimal(3,2)
}

// L3: История изменений типа кухни ресторана
Table cuisine_type_history {
  id          uuid [pk]
  restaurant_id uuid [ref: > restaurants.id, not null]
  old_cuisine_type_id int [ref: > cuisine_types.id]
  new_cuisine_type_id int [ref: > cuisine_types.id]
  changed_at  timestamp
  changed_by  varchar(100)  // user_id
}

// Для аналитики (ClickHouse — отдельная БД)
Table view_history {
  id          uuid [pk]
  restaurant_id uuid
  product_id  varchar(100)
  event_type  varchar(50)  // viewed / clicked_farmer / applied_filter
  session_id  varchar(100)
  metadata    jsonb
  created_at  timestamp
}
```

### Обоснование паттернов

**L1 — Вынос связи M:N в отдельную таблицу (`product_cuisine_compat`):**
Продукт может подходить нескольким кухням (белый гриб — и для русской, и для европейской). Тип кухни — для многих продуктов. Прямая связь M:N невозможна в реляционной модели → junction table с дополнительным атрибутом `compatibility_score`.

**L2 — Вынос справочника типов кухонь в отдельную таблицу (`cuisine_types`):**
Вместо enum `cuisine_type varchar` в restaurants — отдельная таблица. Это позволяет: расширять список кухонь без миграции схемы, добавлять мультиязычные названия, строить аналитику по типам кухонь.

**L3 — История изменений (`cuisine_type_history`):**
Если шеф меняет тип кухни, старые рекомендации теряют контекст. История позволяет: понять почему рекомендации изменились, реализовать функцию «вернуть к прошлой кухне», построить аналитику популярных кухонь в динамике.

---

## Уровень 3: Физическая модель

### DDL с конкретными типами данных и индексами

```sql
-- Справочник типов кухонь
CREATE TABLE cuisine_types (
    id          SERIAL PRIMARY KEY,
    name_ru     VARCHAR(100) NOT NULL UNIQUE,
    name_en     VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Рестораны
CREATE TABLE restaurants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    owner_user_id       VARCHAR(100) NOT NULL,
    cuisine_type_id     INTEGER REFERENCES cuisine_types(id),
    cuisine_confidence  DECIMAL(3,2) CHECK (cuisine_confidence BETWEEN 0 AND 1),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- P4: Индекс для быстрого поиска ресторанов по пользователю
CREATE INDEX idx_restaurants_owner ON restaurants(owner_user_id);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type_id);

-- Меню
CREATE TABLE menus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    raw_text        TEXT,
    dishes_json     JSONB,
    file_hash       VARCHAR(64),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- P1: Горячие данные — только последнее меню ресторана нужно часто
-- Партиционирование не нужно при малом объёме; индекс по restaurant_id достаточен
CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX idx_menus_uploaded ON menus(uploaded_at DESC);

-- Блюда
CREATE TABLE dishes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id             UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    name                VARCHAR(300) NOT NULL,
    category            VARCHAR(100),
    ingredients_hints   JSONB  -- ["белый гриб", "сливки"]
);

CREATE INDEX idx_dishes_menu ON dishes(menu_id);
-- P4: GIN-индекс для поиска по ингредиентам
CREATE INDEX idx_dishes_ingredients ON dishes USING gin(ingredients_hints);

-- Фермеры (кэш)
CREATE TABLE farmers (
    id          VARCHAR(100) PRIMARY KEY,  -- ID из svoe-rodnoe.ru
    name        VARCHAR(300) NOT NULL,
    region      VARCHAR(200),
    profile_url VARCHAR(500),
    cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Продукты (кэш каталога)
CREATE TABLE products (
    id          VARCHAR(100) PRIMARY KEY,  -- ID из svoe-rodnoe.ru
    name        VARCHAR(300) NOT NULL,
    category    VARCHAR(100),
    subcategory VARCHAR(100),
    description TEXT,
    images      JSONB,
    badges      JSONB,  -- ["rare", "premium"]
    farmer_id   VARCHAR(100) REFERENCES farmers(id),
    price_per_kg DECIMAL(10,2),
    source_url  VARCHAR(500),
    cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- P4: Индексы для фильтрации по категории и бейджам
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_products_cached ON products(cached_at DESC);
-- GIN для поиска по бейджам (JSONB)
CREATE INDEX idx_products_badges ON products USING gin(badges);

-- Сезоны продуктов
CREATE TABLE seasons (
    id              SERIAL PRIMARY KEY,
    product_id      VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    start_month     SMALLINT NOT NULL CHECK (start_month BETWEEN 1 AND 12),
    end_month       SMALLINT NOT NULL CHECK (end_month BETWEEN 1 AND 12),
    is_year_round   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_seasons_product ON seasons(product_id);
-- P4: Индекс для запросов «что в сезоне в месяц X»
CREATE INDEX idx_seasons_months ON seasons(start_month, end_month);

-- Совместимость продукт × кухня (junction table L1)
CREATE TABLE product_cuisine_compat (
    product_id          VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    cuisine_type_id     INTEGER REFERENCES cuisine_types(id) ON DELETE CASCADE,
    compatibility_score DECIMAL(3,2) DEFAULT 1.0,
    PRIMARY KEY (product_id, cuisine_type_id)
);

CREATE INDEX idx_pcc_cuisine ON product_cuisine_compat(cuisine_type_id);

-- Рекомендации (с TTL через expires_at)
CREATE TABLE recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    product_id      VARCHAR(100) NOT NULL REFERENCES products(id),
    ai_explanation  TEXT,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour'
);

-- P1: Горячие данные — часто запрашиваются по restaurant_id + product_id
CREATE INDEX idx_recommendations_restaurant ON recommendations(restaurant_id);
CREATE INDEX idx_recommendations_expires ON recommendations(expires_at);
-- Составной уникальный индекс: один актуальный ответ для пары ресторан+продукт
CREATE UNIQUE INDEX idx_recommendations_pair 
    ON recommendations(restaurant_id, product_id) 
    WHERE expires_at > NOW();

-- Совпадения рекомендаций с блюдами
CREATE TABLE menu_matches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id   UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    dish_id             UUID NOT NULL REFERENCES dishes(id),
    match_reason        TEXT,
    match_score         DECIMAL(3,2)
);

CREATE INDEX idx_menu_matches_rec ON menu_matches(recommendation_id);

-- История изменений кухни (L3)
CREATE TABLE cuisine_type_history (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id           UUID NOT NULL REFERENCES restaurants(id),
    old_cuisine_type_id     INTEGER REFERENCES cuisine_types(id),
    new_cuisine_type_id     INTEGER NOT NULL REFERENCES cuisine_types(id),
    changed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by              VARCHAR(100)
);

CREATE INDEX idx_cth_restaurant ON cuisine_type_history(restaurant_id, changed_at DESC);
```

### Обоснование паттернов физического уровня

**P1 — Разделение горячих и холодных данных:**
- `recommendations` — горячие данные (запрашиваются часто, TTL 1ч). Индекс по `expires_at` позволяет эффективно удалять устаревшие записи (`DELETE WHERE expires_at < NOW()`).
- `cuisine_type_history` — холодные данные (только для аудита и аналитики). Без агрессивного индексирования.
- Продукты кэшируются из Redis, в PostgreSQL — только как fallback.

**P4 — Индексация часто запрашиваемых полей:**
- `idx_seasons_months` — ключевой запрос дашборда: "дай все продукты, у которых `start_month ≤ 9 AND end_month ≥ 9`"
- `idx_products_badges` (GIN на JSONB) — фильтрация по `badges @> '["premium"]'`
- `idx_dishes_ingredients` (GIN на JSONB) — поиск блюд, содержащих конкретный ингредиент
- `idx_recommendations_pair` (partial unique) — гарантия одного актуального ответа + быстрый lookup