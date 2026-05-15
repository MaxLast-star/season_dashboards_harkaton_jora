# Своё Шеф: Дашборд сезонности

**Решение команды «Пушистики»** для хакатона от РСХБ.Цифра × НИЯУ МИФИ  
Кейс №2 — интеллектуальный дашборд сезонности для шеф-поваров на платформе svoe-shef.ru

---

## О проекте

«Своё Шеф: Дашборд сезонности» — модуль внутри личного кабинета шеф-повара, который автоматически подбирает сезонные фермерские продукты под кухню ресторана.

**Ключевая ценность:** шеф за 15 минут получает список сезонных продуктов с AI-объяснениями вместо 2–3 часов ручного поиска.

---

## Структура репозитория

```
season_dashboards_harkaton_jora/
├── solution/               # Техническая документация
│   ├── 00 business requirements.md
│   ├── 01 functional requirements.md
│   ├── 02 non functional requirements.md
│   ├── 03 stakeholder analysis.md
│   ├── 04 bpmn process.md
│   ├── 05 ui and api.md
│   ├── 06 data storage.md
│   ├── 07 async interactions.md
│   ├── 08 erd.md
│   └── 09 platformization strategy.md
├── media/                  # Диаграммы, скриншоты, OpenAPI-спецификация
│   ├── api.yaml            # OpenAPI 3.0 спецификация
│   ├── BPMN process.jpg    # BPMN-диаграмма
│   ├── концептуальная модель.png
│   ├── логическая модель.png
│   └── *.png               # Wireframes экранов
└── my-website/             # Сайт документации (Docusaurus)
```

---

## Документация

Полная техническая документация доступна на GitHub Pages:

**[📖 Открыть документацию →](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/docs/intro)**

| Раздел | Ссылка |
|---|---|
| Обзор системы | [/docs/intro](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/docs/intro) |
| Бизнес-требования | [/docs/requirements/business](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/docs/requirements/business) |
| Функциональные требования | [/docs/requirements/functional](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/docs/requirements/functional) |
| Стейкхолдеры и RACI | [/docs/scenarios/stakeholders](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/docs/scenarios/stakeholders) |
| Архитектура | [/docs/architecture/bpmn-process](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/docs/architecture/bpmn-process) |
| UI и API | [/docs/design/ui-and-api](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/docs/design/ui-and-api) |
| ERD | [/docs/database/erd](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/docs/database/erd) |
| API Reference (Redoc) | [/api](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/api) |

---

## Интерактивный прототип

Кликабельный прототип всех 6 экранов с навигацией между страницами:

**[🖥️ Открыть прототип →](https://MaxLast-star.github.io/season_dashboards_harkaton_jora/wireframes/svoe_shef_wireframes.html)**

Экраны: Онбординг → Дашборд сезонности → Каталог продуктов → Карточка продукта → Профиль ресторана → Корзина

---

## Ключевые функции (MVP)

- 📄 Загрузка меню (PDF/текст) + AI-классификация типа кухни
- 📅 Визуальный тайм-лайн сезонности (текущий + 2 месяца)
- 🎯 Умный подбор: фильтрация по кухне, сезону, категории, типу
- 🤖 AI-объяснения совместимости продукта с кухней ресторана
- 🌱 Бейджи «Редкий» и «Премиум» для уникальных ингредиентов
- 👨‍🌾 Переход на карточку фермера на svoe-rodnoe.ru
- 🛒 Корзина с группировкой по фермерам

---

## Бизнес-цели

| KPI | Цель | Срок |
|---|---|---|
| Время поиска продуктов | Сократить с 2ч до 15 мин | MVP + 3 мес. |
| MAU шефов | 5 000+ пользователей модуля | MVP + 6 мес. |
| CTR к фермеру | Конверсия просмотр → переход от 25% | MVP + 3 мес. |
| Рост B2B-транзакций svoe-rodnoe.ru | +30% заказов от ресторанов | MVP + 6 мес. |

---

## Технологический стек

| Слой | Технология |
|---|---|
| Frontend | React + TypeScript |
| Backend | Node.js (Express) / Python (FastAPI) |
| База данных | PostgreSQL |
| Кэш | Redis (TTL 24ч для каталога, TTL 1ч для AI) |
| LLM | GigaChat API / YandexGPT |
| Аналитика | PostHog |
| Деплой прототипа | Railway / Render |

---

## Локальный запуск документации

```bash
cd my-website
npm install
npm install @docusaurus/faster @docusaurus/theme-mermaid redocusaurus
npm run start
```

Деплой на GitHub Pages:

```bash
GIT_USER=MaxLast-star npm run deploy
```

---

*Хакатон РСХБ.Цифра × НИЯУ МИФИ · 2025 · Команда «Пушистики»*
