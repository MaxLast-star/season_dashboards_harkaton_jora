---
title: ERD — модель данных
sidebar_position: 1
description: Концептуальная и физическая модель данных с паттернами проектирования
---

# ERD — Модель данных

## 1. Список сущностей (концептуальная модель)

| Сущность | Описание | Связи |
|---|---|---|
| **Restaurant** | Ресторан на svoe-shef.ru | Имеет одно Menu; относится к одному CuisineType |
| **Menu** | Загруженное меню ресторана | Принадлежит Restaurant; содержит Dish[] |
| **Dish** | Блюдо из меню | Принадлежит Menu |
| **CuisineType** | Тип кухни (справочник) | Характеризует Restaurant; влияет на подбор Product |
| **Product** | Фермерский продукт (кэш svoe-rodnoe.ru) | Принадлежит Farmer; имеет Season; совместим с CuisineType |
| **Season** | Сезонное окно продукта | Принадлежит Product |
| **Farmer** | Фермер (кэш svoe-rodnoe.ru) | Имеет много Product |
| **Recommendation** | AI-рекомендация продукта для ресторана | Связывает Restaurant + Product; содержит MenuMatch[] |
| **MenuMatch** | Блюдо, для которого рекомендован продукт | Связывает Recommendation + Dish |

---

## 2. Концептуальная модель

![Концептуальная модель данных](/media/conceptual-model.png)

---

## 3. Логическая модель

![Логическая модель данных](/media/logical-model.png)

---

## 4. Физическая модель (dbdiagram-нотация)

```sql
-- Справочник типов кухонь
Table cuisine_types {
  id          uuid [pk]
  name_ru     varchar(100) [not null]
  name_en     varchar(100)
  slug        varchar(50) [unique]
  created_at  timestamp
}

-- Рестораны
Table restaurants {
  id                uuid [pk]
  name              varchar(200) [not null]
  owner_user_id     uuid [not null]
  cuisine_type_id   uuid [ref: > cuisine_types.id]
  cuisine_confidence float
  created_at        timestamp
  updated_at        timestamp
}

-- История смены кухни
Table cuisine_type_history {
  id              uuid [pk]
  restaurant_id   uuid [ref: > restaurants.id]
  old_cuisine_id  uuid [ref: > cuisine_types.id]
  new_cuisine_id  uuid [ref: > cuisine_types.id]
  changed_at      timestamp
}

-- Меню
Table menus {
  id            uuid [pk]
  restaurant_id uuid [ref: > restaurants.id]
  raw_text      text
  dishes_json   jsonb
  file_hash     varchar(64)
  uploaded_at   timestamp
}

-- Блюда
Table dishes {
  id                  uuid [pk]
  menu_id             uuid [ref: > menus.id]
  name                varchar(300) [not null]
  category            varchar(100)
  ingredients_hints   text[]
}

-- Фермеры (кэш)
Table farmers {
  id          uuid [pk]
  source_id   varchar(100) [unique]
  name        varchar(200) [not null]
  region      varchar(100)
  profile_url text
  cached_at   timestamp
}

-- Продукты (кэш)
Table products {
  id          uuid [pk]
  source_id   varchar(100) [unique]
  name        varchar(200) [not null]
  category    varchar(100)
  subcategory varchar(100)
  description text
  images      text[]
  badges      text[]
  farmer_id   uuid [ref: > farmers.id]
  price_per_kg decimal(10,2)
  source_url  text
  cached_at   timestamp
}

-- Сезонные окна продуктов
Table seasons {
  id            uuid [pk]
  product_id    uuid [ref: > products.id]
  start_month   integer [not null]
  end_month     integer [not null]
  is_year_round boolean [default: false]
}

-- Совместимость продукт x кухня (M:N)
Table product_cuisine_compat {
  product_id          uuid [ref: > products.id]
  cuisine_type_id     uuid [ref: > cuisine_types.id]
  compatibility_score float
  indexes {
    (product_id, cuisine_type_id) [pk]
  }
}

-- AI-рекомендации
Table recommendations {
  id              uuid [pk]
  restaurant_id   uuid [ref: > restaurants.id]
  product_id      uuid [ref: > products.id]
  ai_explanation  text
  generated_at    timestamp
  expires_at      timestamp
}

-- Совпадения продукта с блюдами меню
Table menu_matches {
  id                uuid [pk]
  recommendation_id uuid [ref: > recommendations.id]
  dish_id           uuid [ref: > dishes.id]
  match_reason      text
}
```

---

## 5. Паттерны проектирования

### Таблица M:N (`product_cuisine_compat`)
Продукт может подходить нескольким кухням (белый гриб — и русской, и европейской). Прямая связь M:N невозможна в реляционной модели — используется junction table с атрибутом `compatibility_score`.

### Справочник типов кухонь — отдельная таблица
Вместо enum `cuisine_type varchar` в restaurants — отдельная таблица. Это позволяет расширять список кухонь без миграции схемы и добавлять мультиязычные названия.

### История изменений (`cuisine_type_history`)
Если шеф меняет тип кухни, старые рекомендации теряют контекст. История позволяет отследить причины изменений и реализовать «вернуть к прошлой кухне».

### ViewHistory — ClickHouse
Таблица хранится в ClickHouse (отдельная аналитическая БД). Физические FK не объявляются — логическая связь через `restaurant_id` и `product_id`.
