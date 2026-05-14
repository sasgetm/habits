# Habit Tracker — контекст проекта

## Обзор

Минималистичный трекер привычек (SPA) на Vue 3 + Vite. Позволяет отслеживать выполнение ежедневных привычек с несколькими уровнями выполнения. Данные хранятся в localStorage (автосохранение после каждого изменения). Синхронизация с Google Sheets реализована.

## Технологический стек

- **Vue 3.4** (Composition API, `<script setup>`)
- **Vite 5.4** (сборщик)
- **@vitejs/plugin-vue 5** (плагин Vue для Vite)
- **vue-router 4** (роутинг)
- Без Pinia — состояние в компонентах страниц

## Структура проекта

```
habits/
├── index.html                  # Точка входа: <div id="app"> + <script src="/src/main.js">
├── package.json                # Зависимости: vue 3.4, vue-router 4, vite 5.4, @vitejs/plugin-vue 5
├── vite.config.js              # Конфиг Vite: defineConfig({ plugins: [vue()] })
├── .gitignore                  # /node_modules
├── README.md                   # Описание проекта, установка, запуск
└── src/
    ├── main.js                 # createApp(App).use(router).mount('#app'), импорт main.css
    ├── App.vue                 # Корневой компонент: <router-view />
    ├── assets/
    │   └── main.css            # Глобальный reset (*), стили body, button
    ├── composables/
    │   ├── useHabits.js        # Общее реактивное состояние: habits (ref), completed (reactive), CRUD-методы, sync с API
    │   ├── useSettings.js     # Общее реактивное состояние настроек: dayStartHour, targetPoints, trackerName, loadFromBootstrap
    │   └── useApi.js          # Google Apps Script API: bootstrap, upsertHabit, deleteHabit, updateSettings
    ├── routes/
    │   └── routes.js           # Конфигурация маршрутов: createRouter(createWebHistory())
    ├── pages/
    │   ├── main.vue            # Главная страница: список привычек, состояние habits/completed/totalPoints
    │   ├── habit-form.vue      # Страница формы: добавление/редактирование привычки
    │   └── settings.vue        # Страница настроек: час начала дня, целевое кол-во баллов
    └── components/
        ├── HeaderBar.vue       # Шапка: дата (currentDate с учётом dayStartHour) + кнопка ✎ настройки + router-link «Добавить привычку»
        ├── GobackHeader.vue    # Шапка для страниц форм: стрелка назад ←, без даты и кнопки добавления
        ├── HabitList.vue       # Список привычек: v-for HabitItem, проброс props/events
        ├── HabitItem.vue       # Карточка привычки: radio-кнопки уровней, router-link «Редактировать» → /habit/:id/edit
        ├── FooterBar.vue       # Подвал: totalPoints/targetPoints + кнопка ✎ настройки + кнопка «Сброс»
        ├── HabitForm.vue       # Форма привычки: поля название/баллы, кнопки сохранить/удалить/добавить вариант
        ├── FormField.vue       # Поле формы: label, input, отображение ошибки, v-model
        └── FormButton.vue      # Кнопка формы: варианты primary/secondary/danger, поддержка hidden
```

## Роутинг

| Путь | Имя | Страница | Описание |
|------|-----|----------|----------|
| `/` | main | main.vue | Главная — список привычек |
| `/habit/new` | habit-new | habit-form.vue | Добавление новой привычки |
| `/habit/:id/edit` | habit-edit | habit-form.vue | Редактирование привычки (props: id) |
| `/settings` | settings | settings.vue | Общие настройки (ленивая загрузка) |
| `/init` | init | init.vue | Страница инициализации — ввод Google Apps Script Deployment ID |
| `/tracker-create` | tracker-create | tracker-create.vue | Создание трекера привычек — инструкция, код GAS, имя трекера, Deployment ID |

## Дерево компонентов и поток данных

```
App.vue
└── <router-view>
    ├── main.vue (путь: /)
    │   ├── HeaderBar.vue
    │   │   — Динамическая дата computed (toLocaleDateString ru-RU)
    │   │   — router-link «Добавить привычку» → /habit/new
    │   │
    │   ├── HabitList.vue
    │   │   Props: habits (Array), completed (Object)
    │   │   Emits: selectLevel(habitId, levelId)
    │   │   └── HabitItem.vue (v-for)
    │   │       Props: habit (Object), selectedLevelId (Number|null)
    │   │       Emits: selectLevel(habitId, levelId)
    │   │       — При клике на уже выбранный уровень — сбрасывает (emit null)
    │   │       — При клике на другой уровень — выбирает его
    │   │       — Уровни отображаются числами-баллами (level вместо level.label)
    │   │       — router-link «Редактировать» → /habit/:id/edit
    │   │
    │   └── FooterBar.vue
    │       Props: totalPoints (Number), targetPoints (Array)
    │       Emits: reset
    │       — Формат баллов: totalPoints/targetPoints[0](targetPoints[1]/.../targetPoints[n])
    │       — Кнопка «Сброс» сбрасывает все отметки через emit reset → main.handleReset
    │
    └── habit-form.vue (пути: /habit/new, /habit/:id/edit)
        ├── GobackHeader.vue (стрелка назад ←, без даты и кнопки добавления)
        └── HabitForm.vue
            Props: habitId (String|null)
            Emits: saved({ id, name, levels, order }), deleted(id)
            — isEdit = habitId != null
            — Заголовок: «Новая привычка» / «Редактирование привычки»
            — При редактировании загружает данные через useHabits().getHabitById(id)
            — При создании: order предзаполняется через getNextOrder()
            — Валидация: название (1-128 символов), порядковый номер (целое ≥1), баллы (≥1, ≤128)
            ├── FormField.vue (название)
            │   Props: label, type, required, minlength, maxlength, placeholder, error
            │   v-model: modelValue
            ├── FormField.vue (порядковый номер)
            ├── FormField.vue (баллы за выполнение, v-for levels)
            ├── FormButton.vue («Добавить вариант выполнения», variant=secondary)
            ├── FormButton.vue («Сохранить», variant=primary, type=submit)
            └── FormButton.vue («Удалить», variant=danger, v-if=isEdit)
    
    └── settings.vue (путь: /settings)
        ├── GobackHeader.vue (стрелка назад ←, без даты и кнопки добавления)
        └── Форма «Общие настройки»
            — Заголовок: «Общие настройки»
            — Поле «Час начала нового дня» (FormField: number, 0-23)
            — Динамический список полей «Целевое кол-во баллов» (FormField: number, 1-256, v-for)
            — Кнопка «Добавить целевое кол-во баллов» (FormButton, variant=secondary)
            — Кнопка «Сохранить» (FormButton, variant=primary, type=submit)
            — При сохранении: валидация → saveSettings(hour, pointsArray) → переход на главную
            ├── FormField.vue (час начала дня)
            ├── FormField.vue (целевые баллы, v-for)
            ├── FormButton.vue («Добавить целевое кол-во баллов», variant=secondary)
            └── FormButton.vue («Сохранить», variant=primary, type=submit)
```

### useHabits composable (src/composables/useHabits.js)

Модульный singleton — общее реактивное состояние привычек, доступное всем компонентам:
- `habits` — ref-массив объектов привычек
- `completed` — reactive-объект { [habitId]: levelIndex | undefined }
- `addHabit(name, levels, order)` — добавляет привычку с UUID, возвращает id, сохраняет в localStorage
- `updateHabit(id, name, levels, order)` — обновляет существующую привычку, сохраняет в localStorage
- `deleteHabit(id)` — удаляет привычку и её состояние completed, сохраняет в localStorage
- `getHabitById(id)` — возвращает привычку по id (UUID) или null
- `getNextOrder()` — возвращает следующий порядковый номер для авто-заполнения
- `updateOrder(id, newOrder)` — обновляет порядковый номер привычки
- `resetCompleted()` — очищает все отметки выполнения, сохраняет в localStorage
- `setLevel(habitId, levelId)` — устанавливает уровень выполнения привычки, сохраняет в localStorage

**Внутренние функции (не экспортируются):**
- `saveToLocalStorage()` — сериализует habits, completed, nextOrder в localStorage
- `loadFromLocalStorage()` — восстанавливает состояние из localStorage
- `migrateHabits(list)` — миграция старых данных: числовой id → строка, отсутствующий order → id
- `recalculateNextOrder()` — вычисляет nextOrder как max(order) + 1 из всех привычек, вызывается при загрузке и после любого изменения привычек

**Автоинициализация при загрузке модуля:**
- Если в localStorage есть данные — загружает их с миграцией
- Если localStorage пуст — заполняет `DEFAULT_HABITS` (6 привычек) и сохраняет в localStorage

### useSettings composable (src/composables/useSettings.js)

Модульный singleton — общее реактивное состояние настроек приложения:
- `dayStartHour` — ref(0), час начала нового дня (целое, 0–23)
- `targetPoints` — ref([30]), массив целевых количеств баллов (каждый элемент: целое, 1–256)
- `trackerName` — ref(''), имя трекера из Google Sheets
- `saveSettings(hour, pointsArray)` — валидирует и сохраняет оба значения в localStorage, возвращает true/false
- `loadFromBootstrap(settings)` — загружает настройки из API (trackerName, rewardLevels → targetPoints)

**Ключи localStorage:**
- `habits-settings-dayStartHour` — час начала нового дня
- `habits-settings-targetPoints` — JSON-массив целевых количеств баллов

**Автоинициализация при загрузке модуля:**
- Загружает значения из localStorage, если они есть и проходят валидацию
- Поддерживает старый формат (одиночное число → массив из одного элемента)
- Если данных нет — используются значения по умолчанию (dayStartHour=0, targetPoints=[30])

## Модель данных

### habit (объект привычки)
```ts
{
  id: string,       // UUID v4 (crypto.randomUUID())
  name: string,
  levels: number[], // массив баллов, индекс = идентификатор уровня
  order: number     // порядковый номер для сортировки
}
```

### completed (состояние выполнения)
```ts
// ref-объект, ключ — habit.id (UUID), значение — индекс уровня (number | null)
{ [habitId: string]: number | null }
```

### totalPoints (вычисляемое)
```ts
// Сумма points выбранных уровней по всем привычкам
computed: sum(habits[i].levels[completed[habits[i].id]] ?? 0)
```

### sortedHabits (вычисляемое, main.vue)
```ts
// Привычки, отсортированные по order
computed: [...habits.value].sort((a, b) => a.order - b.order)
```

## Ключевые паттерны

- **Composition API + `<script setup>`** во всех компонентах
- **Props + Emits** для передачи данных вниз и событий вверх (без provide/inject)
- **Scoped styles** во всех компонентах (кроме main.css — глобальный)
- **Radio inputs** для выбора уровня привычки (повторный клик сбрасывает выбор)
- **vue-router** с createWebHistory для навигации между страницами
- **router-link** для навигационных кнопок (вместо голых button)
- **useHabits composable** — модульный singleton для общего реактивного состояния (без Pinia)
- **localStorage** — полное сохранение состояния: habits, completed, nextOrder. Автосохранение после каждого изменения (addHabit, updateHabit, deleteHabit, setLevel, resetCompleted). При первом запуске (пустой localStorage) заполняется 6 дефолтными привычками.
- **UUID** — генерация уникальных id привычек через `crypto.randomUUID()`
- **Миграция данных** — старые привычки с числовым id и без order автоматически мигрируются при загрузке
- Кнопка «Сброс» в FooterBar — **реализована**: emit reset → main.vue handleReset → resetCompleted()
- CRUD привычек — **реализован**: добавление, редактирование, удаление через useHabits
- **Navigation guard** — при каждом переходе проверяется наличие `habits-settings-deploymentId` в localStorage. Если отсутствует — редирект на `/init`. Страницы `/init` и `/tracker-create` доступны без проверки.
- **Google Apps Script API** — синхронизация с Google Sheets через deployment ID. useApi.js содержит методы: bootstrap (загрузка данных при инициализации), upsertHabit, deleteHabit, updateSettings. Данные из API (CSV-строки levels) конвертируются в массивы через csvToArray, при отправке — arrayToCsv. При инициализации приложения данные из Google Sheets заменяют localStorage.

### Компоненты формы

- **FormField.vue** — переиспользуемое поле ввода:
  - Props: `label`, `modelValue` (v-model), `type`, `placeholder`, `required`, `minlength`, `maxlength`, `min`, `max`, `error`
  - Emits: `update:modelValue`
  - Отображает label, input и span с ошибкой при наличии

- **FormButton.vue** — переиспользуемая кнопка:
  - Props: `label`, `variant` (primary/secondary/danger), `type` (button по умолчанию), `hidden`
  - Emits: `click`
  - Скрывается через `v-if="!hidden"`
  - Три цветовых варианта: зелёный (primary), серый (secondary), красный (danger)

- **HabitForm.vue** — контейнер формы привычки:
  - Props: `habitId` (String|null) — если передан, форма в режиме редактирования
  - Emits: `saved({ id, name, levels, order })`, `deleted(id)`
  - Поле «Название» (FormField: text, required, 1-128 символов)
  - Поле «Порядковый номер» (FormField: number, required, min=1) — авто-заполнение при создании через `getNextOrder()`
  - Секция «Баллы за выполнение» (FormField: number, required, 1-128, v-for)
  - Кнопка «Добавить вариант выполнения» (FormButton, variant=secondary) — добавляет поле балла
  - Кнопка «Сохранить» (FormButton, variant=primary, type=submit) — валидация + emit saved
  - Кнопка «Удалить» (FormButton, variant=danger, v-if=isEdit) — emit deleted
  - При редактировании загружает данные привычки через `useHabits().getHabitById(id)`

## Скрипты (package.json)

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера Vite |
| `npm run build` | Production-сборка |
| `npm run preview` | Предпросмотр собранного проекта |

## Текущее состояние

Базовая структура, CRUD, localStorage и настройки реализованы. UI отображается, выбор уровней работает, баллы считаются, данные сохраняются между сессиями.
- ✅ Динамическая дата в HeaderBar с учётом часа начала нового дня (useSettings.dayStartHour)
- ✅ Кнопка «Сброс» в FooterBar (emit reset → resetCompleted())
- ✅ Модель данных: id = UUID (строка), levels = number[], order = number
- ✅ Роутинг: vue-router с четырьмя маршрутами (главная, новая привычка, редактирование, настройки)
- ✅ Страницы: main.vue (главная), habit-form.vue (форма), settings.vue (настройки)
- ✅ Компоненты формы: HabitForm, FormField, FormButton
- ✅ Навигация: router-link в HeaderBar («Добавить привычку», ✎ настройки) и HabitItem («Редактировать»)
- ✅ Composable useHabits.js — общее реактивное состояние, UUID, order, миграция старых данных
- ✅ Composable useSettings.js — настройки (dayStartHour, targetPoints[]), множественные целевые баллы
- ✅ Добавление привычки: форма без кнопки «Удалить», авто-заполнение order, сохранение → addHabit → переход на главную
- ✅ Редактирование привычки: поля заполнены данными (включая order), кнопка «Удалить» видна, сохранение → updateHabit → переход на главную
- ✅ Удаление привычки: кнопка «Удалить» → deleteHabit → переход на главную
- ✅ Валидация формы привычки: название (1-128 символов, обязательно), order (целое ≥1), баллы (≥1, ≤128, минимум один)
- ✅ Валидация формы настроек: час начала дня (целое 0-23), целевые баллы (массив, каждый 1-256)
- ✅ Сохранение в localStorage: habits, completed, nextOrder, dayStartHour, targetPoints[]. Автосохранение после каждого изменения.
- ✅ FooterBar: вывод totalPoints/targetPoints[0](targetPoints[1]/...), кнопка ✎ для перехода в настройки
- ✅ HeaderBar: дата с учётом часа начала дня, кнопка ✎ для перехода в настройки
- ✅ Сортировка привычек по order (computed sortedHabits в main.vue)
- ✅ Миграция старых данных: числовой id → UUID-строка, отсутствующий order → id
- ✅ Логика nextOrder: вычисляется как max(order) + 1 из всех привычек, пересчитывается при любом изменении (добавление, редактирование, удаление)
- ✅ GobackHeader: новый header для страниц форм (стрелка назад ←)
- ✅ Синхронизация с Google Sheets.
