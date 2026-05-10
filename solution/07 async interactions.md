# 07. Асинхронные взаимодействия


## Сценарий 1: Синхронизация каталога svoe-rodnoe.ru

### 1.1 Контекст взаимодействия

**Описание:** Каталог продуктов svoe-rodnoe.ru не должен запрашиваться при каждом открытии дашборда (это бы создавало зависимость от внешнего API в realtime). Вместо этого фоновый job синхронизирует данные раз в 24 часа.

**Шаги:**
1. Планировщик (cron/scheduler) запускает job раз в 24 часа в 03:00 МСК (минимум трафика)
2. Job запрашивает полный список продуктов с каталога svoe-rodnoe.ru (пагинированно)
3. Job обновляет данные в PostgreSQL (upsert по `source_id`)
4. Job инвалидирует кэш Redis для обновлённых продуктов
5. Job записывает метаданные синхронизации: timestamp, количество обновлённых записей, ошибки

**Особенности:**
- Операция занимает 5–15 минут (100K продуктов с пагинацией по 500)
- Должна быть идемпотентной (повторный запуск не создаёт дубликаты)
- Не должна блокировать пользовательские запросы во время работы

---

### 1.2 Сравнение технологий

| Технология | Плюсы | Минусы |
|---|---|---|
| **Celery + Redis** (Python) | Готовый стек для Python; retry-логика из коробки; мониторинг через Flower | Требует отдельного Redis-брокера; сложность для хакатона |
| **PostgreSQL pg_cron** | Не нужен внешний брокер; всё внутри БД | Ограниченные возможности; нет retry; сложно масштабировать |
| **Node-cron / Bull** (Node.js) | Простая интеграция в Node-приложение; Bull — мощная очередь | Bull требует Redis; более сложен, чем node-cron |
| **Простой cron (системный)** | Максимальная простота; не требует зависимостей | Нет retry, нет мониторинга, нет graceful shutdown |
| **AWS EventBridge / GCP Cloud Scheduler** | Managed service; надёжность; нет сервера планировщика | Привязка к облаку; стоимость; избыточность для MVP |

### 1.3 Вывод с обоснованием

**Выбор: node-cron (для MVP) → Celery + Redis (для production)**

Обоснование: Для хакатона node-cron минимизирует зависимости и сложность. Job запускается раз в сутки и не требует сложной retry-логики (достаточно простого try-catch с алертом). В production переход на Celery обеспечит: мониторинг через Flower, автоматические retry, распределённое выполнение.

---

### 1.4 Контракт (AsyncAPI YAML)

```yaml
asyncapi: 2.6.0
info:
  title: Svoe-Shef Catalog Sync
  version: 1.0.0

channels:
  catalog/sync/started:
    subscribe:
      summary: Запуск синхронизации каталога
      message:
        payload:
          type: object
          properties:
            job_id:
              type: string
            started_at:
              type: string
              format: date-time
            source:
              type: string
              example: "svoe-rodnoe.ru"

  catalog/sync/completed:
    subscribe:
      summary: Завершение синхронизации каталога
      message:
        payload:
          type: object
          properties:
            job_id:
              type: string
            completed_at:
              type: string
              format: date-time
            stats:
              type: object
              properties:
                total_fetched:
                  type: integer
                updated:
                  type: integer
                created:
                  type: integer
                errors:
                  type: integer
            status:
              type: string
              enum: [success, partial_failure, failure]

  catalog/sync/failed:
    subscribe:
      summary: Ошибка синхронизации
      message:
        payload:
          type: object
          properties:
            job_id:
              type: string
            error:
              type: string
            retry_count:
              type: integer
```

### 1.5 Сценарии работы и краевые случаи

| Сценарий | Поведение |
|---|---|
| **Нормальный запуск** | Job выполняется за 10 мин, обновляет 100K записей, инвалидирует Redis кэш |
| **API svoe-rodnoe.ru недоступен** | Job логирует ошибку, не обновляет данные, кэш остаётся актуальным (предыдущая синхронизация) |
| **Частичная ошибка** (timeout на 10% запросов) | Записывается `partial_failure`; успешно обновлённые данные сохраняются; следующий запуск завершит обновление |
| **Повторный запуск (дубль)** | Upsert по `source_id` — идемпотентно; дубликатов не создаётся |
| **Redis недоступен** | Job обновляет только PostgreSQL; инвалидация кэша — через TTL |

---

## Сценарий 2: Генерация AI-объяснений совместимости

### 2.1 Контекст взаимодействия

**Описание:** При открытии карточки продукта шеф запрашивает AI-объяснение совместимости продукта с типом кухни. Генерация через LLM API занимает 1–3 секунды. Чтобы не блокировать UI и оптимизировать стоимость, используется кэширование и очередь.

**Шаги:**
1. Шеф открывает карточку продукта
2. Frontend запрашивает `/api/v1/ai/explain-compatibility`
3. Backend проверяет кэш Redis по ключу `explanation:{product_id}:{cuisine_type}`
4. **Cache HIT:** возвращает кэшированный результат немедленно
5. **Cache MISS:** ставит задачу в очередь генерации
6. LLM-worker берёт задачу, делает запрос к LLM API (OpenAI/YandexGPT)
7. Результат сохраняется в Redis (TTL 1ч) и PostgreSQL (персистентно)
8. Frontend получает ответ (sync для MVP, WebSocket для v2.0)

**Особенности:**
- Rate limit: 60 запросов/мин на пользователя (NFR-SEC-003)
- LLM API — внешний платный сервис; кэш критичен для экономии

---

### 2.2 Сравнение технологий

| Технология | Плюсы | Минусы |
|---|---|---|
| **Прямой синхронный HTTP-запрос к LLM** | Простота; нет дополнительной инфраструктуры | Блокирует пользователя на 1–3 сек; нет retry; нет rate-limit управления |
| **Redis + Bull Queue (Node.js)** | Очередь с retry; rate limiting; приоритизация | Дополнительная инфраструктура; сложность для хакатона |
| **WebSocket + фоновая генерация** | UX: шеф видит «загрузку» и не ждёт | Сложность реализации для MVP |
| **Server-Sent Events (SSE)** | Проще WebSocket; поддержка streaming LLM ответов | Сложнее прямого HTTP |

### 2.3 Вывод

**Выбор для MVP: Синхронный HTTP с кэшем Redis**

Обоснование: Для хакатона и MVP достаточно прямого запроса с кэшированием. Время ответа 1–3 сек приемлемо, если показать skeleton/spinner. Кэш Redis по ключу `{product_id}:{cuisine_type}` с TTL 1ч гарантирует, что повторный запрос вернёт результат за <10мс. В v2.0 — переход на SSE для streaming-отображения генерации.

### 2.4 Контракт

```yaml
asyncapi: 2.6.0
info:
  title: AI Explanation Generation
  version: 1.0.0

channels:
  ai/explanation/requested:
    subscribe:
      summary: Запрос на генерацию объяснения
      message:
        payload:
          type: object
          required: [product_id, cuisine_type, restaurant_id]
          properties:
            request_id:
              type: string
            product_id:
              type: string
            cuisine_type:
              type: string
            restaurant_id:
              type: string
            requested_at:
              type: string
              format: date-time

  ai/explanation/completed:
    subscribe:
      summary: Объяснение сгенерировано
      message:
        payload:
          type: object
          properties:
            request_id:
              type: string
            product_id:
              type: string
            cuisine_type:
              type: string
            explanation:
              type: string
            source:
              type: string
              enum: [cache, generated]
            generated_at:
              type: string
              format: date-time
            ttl_seconds:
              type: integer
```

### 2.5 Краевые случаи

| Сценарий | Поведение |
|---|---|
| **LLM API недоступен** | Показывается шаблонное объяснение из справочника (fallback) |
| **Rate limit превышен** | HTTP 429 + сообщение «Слишком много запросов, подождите 1 мин» |
| **Кэш-хит** | Ответ за <10мс; в ответе поле `source: "cache"` |
| **Токены LLM закончились** | Алерт команде; fallback на шаблонные тексты |
| **Нецензурный/нерелевантный ответ LLM** | Валидация длины (50–300 симв.) и ключевых слов; при провале — шаблон |

---

## Сценарий 3: Отслеживание действий пользователя (аналитика)

### 3.1 Контекст

**Описание:** Каждый просмотр карточки продукта, переход к фермеру и применение фильтра должен логироваться для аналитики KPI (CTR, MAU, популярные продукты). Запись аналитики не должна блокировать основной UX.

**Шаги:** Frontend → fire-and-forget POST → `/api/v1/events` → append в ClickHouse через буфер.

### 3.2 Вывод

**Выбор: fire-and-forget HTTP + ClickHouse buffer**

Для MVP достаточно прямой записи в ClickHouse через HTTP-интерфейс. В production (v2.0) — Kafka как буфер между приложением и ClickHouse для гарантии доставки.

### 3.3 Контракт события

```json
{
  "event_type": "product_viewed",
  "restaurant_id": "rest_789",
  "user_id": "user_456",
  "product_id": "prod_123",
  "session_id": "sess_abc",
  "timestamp": "2025-09-01T12:30:00Z",
  "metadata": {
    "source_screen": "dashboard",
    "filter_applied": "mushrooms"
  }
}
```